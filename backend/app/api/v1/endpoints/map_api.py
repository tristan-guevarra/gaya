"""
Map endpoints: markers, search, GeoJSON tiles for heatmaps.
Public endpoints with rate limiting.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, cast, Float
from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID
from datetime import date
from typing import Optional, List
from uuid import UUID

from app.core.database import get_db
from app.models.coach import Coach, CoachLocation
from app.models.event import Event
from app.models.lead import SearchLog
from app.schemas.models import MapMarker, MapSearchParams
from app.services.geo_service import lat_lng_to_h3, get_hex_metrics_geojson

router = APIRouter(prefix="/map", tags=["Discovery Map"])


@router.get("/markers", response_model=List[MapMarker])
async def get_map_markers(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(25.0, ge=1, le=100),
    sport: Optional[str] = None,
    event_type: Optional[str] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    skill_level: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    has_availability: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get map markers (coaches + events) within radius of a point.
    Uses PostGIS ST_DWithin for efficient spatial query.
    """
    markers: List[MapMarker] = []
    radius_meters = radius_km * 1000
    search_point = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)

    # ─── Coach markers ────────────────────────────────────
    coach_query = (
        select(Coach, CoachLocation)
        .join(CoachLocation, Coach.id == CoachLocation.coach_id)
        .where(
            Coach.is_active == True,
            func.ST_DWithin(
                cast(CoachLocation.geom, func.Geography),
                cast(search_point, func.Geography),
                radius_meters,
            ),
        )
    )
    if sport:
        coach_query = coach_query.where(Coach.sport == sport)
    if skill_level:
        coach_query = coach_query.where(Coach.skill_levels.contains([skill_level]))
    if price_max is not None:
        coach_query = coach_query.where(
            or_(Coach.hourly_rate_min <= price_max / 100, Coach.hourly_rate_min.is_(None))
        )

    coach_result = await db.execute(coach_query)
    for coach, loc in coach_result.all():
        markers.append(MapMarker(
            id=coach.id,
            type="coach",
            latitude=loc.latitude,
            longitude=loc.longitude,
            title=coach.display_name,
            subtitle=f"{coach.sport} • {'★' * int(coach.rating)}" if coach.rating else coach.sport,
            rating=coach.rating,
            cover_image_url=coach.photo_url,
        ))

    # ─── Event markers ────────────────────────────────────
    event_query = (
        select(Event)
        .where(
            Event.is_active == True,
            Event.is_published == True,
            func.ST_DWithin(
                cast(Event.geom, func.Geography),
                cast(search_point, func.Geography),
                radius_meters,
            ),
        )
    )
    if sport:
        event_query = event_query.where(Event.sport == sport)
    if event_type:
        event_query = event_query.where(Event.event_type == event_type)
    if age_min is not None:
        event_query = event_query.where(or_(Event.age_max >= age_min, Event.age_max.is_(None)))
    if age_max is not None:
        event_query = event_query.where(or_(Event.age_min <= age_max, Event.age_min.is_(None)))
    if skill_level:
        event_query = event_query.where(Event.skill_levels.contains([skill_level]))
    if price_min is not None:
        event_query = event_query.where(Event.price_cents >= price_min)
    if price_max is not None:
        event_query = event_query.where(Event.price_cents <= price_max)
    if date_from:
        event_query = event_query.where(Event.start_date >= date_from)
    if date_to:
        event_query = event_query.where(Event.start_date <= date_to)
    if has_availability:
        event_query = event_query.where(Event.spots_filled < Event.capacity)

    event_result = await db.execute(event_query)
    for event in event_result.scalars().all():
        markers.append(MapMarker(
            id=event.id,
            type="event",
            latitude=event.latitude,
            longitude=event.longitude,
            title=event.title,
            subtitle=f"{event.event_type.title()} • {event.city or ''}",
            event_type=event.event_type,
            price_cents=event.price_cents,
            spots_available=max(0, event.capacity - event.spots_filled),
            cover_image_url=event.cover_image_url,
        ))

    # ─── Log search (anonymized) ──────────────────────────
    h3_idx = lat_lng_to_h3(latitude, longitude)
    search_log = SearchLog(
        sport=sport,
        event_type=event_type,
        age_group=f"{age_min or ''}-{age_max or ''}",
        skill_level=skill_level,
        latitude=latitude,
        longitude=longitude,
        h3_index_r8=h3_idx,
        search_radius_km=radius_km,
        results_count=len(markers),
        geom=func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326),
    )
    db.add(search_log)

    return markers


@router.get("/heatmap/{layer}")
async def get_heatmap_geojson(
    layer: str,  # supply | demand | underserved | hotspot
    metric_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Return GeoJSON FeatureCollection for hex-grid overlay.
    Each feature is an H3 hex polygon with a score property.
    """
    if layer not in ("supply", "demand", "underserved", "hotspot"):
        layer = "demand"

    return await get_hex_metrics_geojson(db, layer=layer, metric_date=metric_date)


@router.get("/coaches/{coach_id}")
async def get_coach_detail(coach_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get full coach profile with locations."""
    from app.schemas.models import CoachResponse
    result = await db.execute(select(Coach).where(Coach.id == coach_id, Coach.is_active == True))
    coach = result.scalar_one_or_none()
    if not coach:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Coach not found")
    return CoachResponse.model_validate(coach)


@router.get("/events/{event_id}")
async def get_event_detail(event_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get full event details with occurrences."""
    from app.schemas.models import EventResponse
    result = await db.execute(select(Event).where(Event.id == event_id, Event.is_active == True))
    event = result.scalar_one_or_none()
    if not event:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse.model_validate(event)
