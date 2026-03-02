"""
Geospatial intelligence service.
Handles H3 cell aggregation, supply/demand scoring, and GeoJSON generation.
"""
import h3
import math
from datetime import date, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.models.coach import CoachLocation
from app.models.event import Event
from app.models.lead import Lead, SearchLog, Booking
from app.models.geo import GeoCellMetric, Recommendation
from app.core.config import settings


def lat_lng_to_h3(lat: float, lng: float, resolution: int = None) -> str:
    """Convert lat/lng to H3 hex index."""
    res = resolution or settings.H3_RESOLUTION
    return h3.geo_to_h3(lat, lng, res)


def h3_to_center(h3_index: str) -> Tuple[float, float]:
    """Get center lat/lng of an H3 cell."""
    lat, lng = h3.h3_to_geo(h3_index)
    return lat, lng


def h3_to_boundary(h3_index: str) -> List[List[float]]:
    """Get boundary polygon of an H3 cell as [[lat, lng], ...]."""
    boundary = h3.h3_to_geo_boundary(h3_index, geo_json=True)
    return [[coord[1], coord[0]] for coord in boundary]  # flip to [lat, lng]


def h3_to_geojson_polygon(h3_index: str) -> dict:
    """Convert H3 cell to GeoJSON polygon geometry."""
    boundary = h3.h3_to_geo_boundary(h3_index, geo_json=True)
    return {
        "type": "Polygon",
        "coordinates": [list(boundary) + [boundary[0]]]  # close the ring
    }


async def get_active_h3_cells(db: AsyncSession, resolution: int = 8) -> List[str]:
    """Get all H3 cells that have any coach locations or events."""
    coach_cells = await db.execute(
        select(CoachLocation.h3_index_r8).distinct().where(CoachLocation.h3_index_r8.isnot(None))
    )
    event_cells = await db.execute(
        select(Event.h3_index_r8).distinct().where(Event.h3_index_r8.isnot(None))
    )
    lead_cells = await db.execute(
        select(Lead.h3_index_r8).distinct().where(Lead.h3_index_r8.isnot(None))
    )
    search_cells = await db.execute(
        select(SearchLog.h3_index_r8).distinct().where(SearchLog.h3_index_r8.isnot(None))
    )

    all_cells = set()
    for result in [coach_cells, event_cells, lead_cells, search_cells]:
        for row in result.scalars().all():
            all_cells.add(row)
            # also add neighboring cells for smoother heatmaps
            for neighbor in h3.k_ring(row, 1):
                all_cells.add(neighbor)

    return list(all_cells)


def compute_cell_metrics_sync(db: Session, h3_index: str, metric_date: date) -> dict:
    """
    Compute supply/demand/hotspot metrics for a single H3 cell on a given date.
    Uses sync session (called from Celery worker).
    """
    # include neighboring cells for "fuzzy" supply counting
    nearby_cells = list(h3.k_ring(h3_index, 1))
    center_lat, center_lng = h3_to_center(h3_index)

    # supply
    coach_count = db.query(func.count(CoachLocation.id)).filter(
        CoachLocation.h3_index_r8.in_(nearby_cells)
    ).scalar() or 0

    event_query = db.query(
        func.count(Event.id),
        func.coalesce(func.sum(Event.capacity), 0)
    ).filter(
        Event.h3_index_r8.in_(nearby_cells),
        Event.is_active == True,
        Event.start_date >= metric_date - timedelta(days=30),
        Event.start_date <= metric_date + timedelta(days=60),
    )
    event_result = event_query.one()
    event_count = event_result[0] or 0
    total_capacity = int(event_result[1] or 0)

    # normalize supply: weighted sum
    supply_score = (coach_count * 2.0) + (event_count * 3.0) + (total_capacity * 0.1)

    # demand (last 30 days)
    lookback = metric_date - timedelta(days=30)

    search_count = db.query(func.count(SearchLog.id)).filter(
        SearchLog.h3_index_r8.in_(nearby_cells),
        SearchLog.created_at >= lookback,
    ).scalar() or 0

    lead_count = db.query(func.count(Lead.id)).filter(
        Lead.h3_index_r8.in_(nearby_cells),
        Lead.created_at >= lookback,
    ).scalar() or 0

    waitlist_count = db.query(func.count(Lead.id)).filter(
        Lead.h3_index_r8.in_(nearby_cells),
        Lead.lead_type == "waitlist",
        Lead.created_at >= lookback,
    ).scalar() or 0

    demand_score = (search_count * 1.0) + (lead_count * 3.0) + (waitlist_count * 5.0)

    # conversions
    booking_count = db.query(func.count(Booking.id)).join(Event).filter(
        Event.h3_index_r8.in_(nearby_cells),
        Booking.booked_at >= lookback,
    ).scalar() or 0

    conversion_rate = (booking_count / lead_count) if lead_count > 0 else 0.0
    fill_rate = (booking_count / total_capacity) if total_capacity > 0 else 0.0

    # derived scores
    # normalize scores to 0-100 range (approx)
    max_score = max(supply_score, demand_score, 1.0)
    norm_supply = (supply_score / max_score) * 100
    norm_demand = (demand_score / max_score) * 100

    underserved_score = max(0, norm_demand - norm_supply)
    hotspot_score = demand_score * max(conversion_rate, 0.1)  # boost areas with conversions

    return {
        "h3_index": h3_index,
        "resolution": 8,
        "metric_date": metric_date,
        "center_lat": center_lat,
        "center_lng": center_lng,
        "coach_count": coach_count,
        "event_count": event_count,
        "total_capacity": total_capacity,
        "supply_score": round(supply_score, 2),
        "search_count": search_count,
        "lead_count": lead_count,
        "waitlist_count": waitlist_count,
        "demand_score": round(demand_score, 2),
        "underserved_score": round(underserved_score, 2),
        "hotspot_score": round(hotspot_score, 2),
        "conversion_rate": round(conversion_rate, 4),
        "booking_count": booking_count,
        "fill_rate": round(fill_rate, 4),
    }


async def get_hex_metrics_geojson(
    db: AsyncSession,
    layer: str = "demand",  # supply | demand | underserved | hotspot
    bounds: Optional[dict] = None,
    metric_date: Optional[date] = None,
) -> dict:
    """
    Return GeoJSON FeatureCollection of hex cells with metric values.
    Used for map overlay rendering.
    """
    target_date = metric_date or date.today()

    query = select(GeoCellMetric).where(
        GeoCellMetric.metric_date == target_date,
        GeoCellMetric.resolution == 8,
    )

    result = await db.execute(query)
    metrics = result.scalars().all()

    # map layer name to score field
    score_field_map = {
        "supply": "supply_score",
        "demand": "demand_score",
        "underserved": "underserved_score",
        "hotspot": "hotspot_score",
    }
    score_field = score_field_map.get(layer, "demand_score")

    features = []
    for m in metrics:
        score = getattr(m, score_field, 0)
        if score <= 0:
            continue

        features.append({
            "type": "Feature",
            "geometry": h3_to_geojson_polygon(m.h3_index),
            "properties": {
                "h3_index": m.h3_index,
                "score": round(score, 2),
                "supply_score": round(m.supply_score, 2),
                "demand_score": round(m.demand_score, 2),
                "underserved_score": round(m.underserved_score, 2),
                "hotspot_score": round(m.hotspot_score, 2),
                "coach_count": m.coach_count,
                "event_count": m.event_count,
                "lead_count": m.lead_count,
                "search_count": m.search_count,
                "conversion_rate": round(m.conversion_rate, 4),
                "fill_rate": round(m.fill_rate, 4),
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }
