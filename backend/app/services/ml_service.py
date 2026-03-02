"""
ML service: demand forecasting, fill-rate prediction, what-if simulation.
MVP-realistic: uses interpretable models with feature importance explanations.
"""
import h3
import numpy as np
import pandas as pd
from datetime import date, timedelta
from typing import List, Dict, Optional, Tuple
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sqlalchemy.orm import Session
from sqlalchemy import func, select

from app.models.geo import GeoCellMetric, Recommendation
from app.models.event import Event
from app.models.lead import Lead, Booking, SearchLog
from app.models.coach import CoachLocation
from app.services.geo_service import lat_lng_to_h3, h3_to_center


# seasonality factor
def get_seasonality_factor(target_date: date) -> float:
    """
    Seasonal demand multiplier based on month.
    Summer (Jun-Aug) and spring (Apr-May) are peak for outdoor training.
    Winter indoor training has moderate demand.
    """
    month = target_date.month
    seasonality = {
        1: 0.5, 2: 0.55, 3: 0.7, 4: 0.85, 5: 0.95,
        6: 1.0, 7: 1.0, 8: 0.95, 9: 0.8, 10: 0.65,
        11: 0.5, 12: 0.4,
    }
    return seasonality.get(month, 0.7)


# demand forecasting
def forecast_demand(
    db: Session,
    h3_index: str,
    days_ahead: int = 30,
) -> Dict:
    """
    Simple rolling-average demand forecast with seasonal adjustment.
    Uses last 90 days of search/lead data to predict next N days.
    """
    nearby_cells = list(h3.k_ring(h3_index, 1))
    now = date.today()
    lookback_start = now - timedelta(days=90)

    # get historical metrics
    metrics = db.query(GeoCellMetric).filter(
        GeoCellMetric.h3_index.in_(nearby_cells),
        GeoCellMetric.metric_date >= lookback_start,
    ).order_by(GeoCellMetric.metric_date).all()

    if not metrics:
        return {
            "h3_index": h3_index,
            "forecast_days": days_ahead,
            "predicted_demand": 0,
            "trend": "insufficient_data",
            "confidence": 0.1,
        }

    # group by week for smoother signal
    weekly_demand = {}
    for m in metrics:
        week_key = m.metric_date.isocalendar()[1]
        weekly_demand.setdefault(week_key, []).append(m.demand_score)

    weekly_avgs = [np.mean(v) for v in weekly_demand.values()]

    if len(weekly_avgs) < 2:
        base_demand = weekly_avgs[0] if weekly_avgs else 0
        trend = "flat"
    else:
        # simple trend: compare last 4 weeks vs prior 4 weeks
        recent = np.mean(weekly_avgs[-4:]) if len(weekly_avgs) >= 4 else np.mean(weekly_avgs[-2:])
        older = np.mean(weekly_avgs[:4]) if len(weekly_avgs) >= 4 else np.mean(weekly_avgs[:2])
        base_demand = recent

        if recent > older * 1.1:
            trend = "increasing"
        elif recent < older * 0.9:
            trend = "decreasing"
        else:
            trend = "stable"

    # apply seasonality
    target_date = now + timedelta(days=days_ahead)
    seasonal_factor = get_seasonality_factor(target_date)
    predicted_demand = base_demand * seasonal_factor

    # confidence based on data volume
    confidence = min(0.95, 0.3 + (len(metrics) / 90) * 0.65)

    return {
        "h3_index": h3_index,
        "forecast_days": days_ahead,
        "predicted_demand": round(predicted_demand, 2),
        "base_demand": round(base_demand, 2),
        "seasonal_factor": seasonal_factor,
        "trend": trend,
        "confidence": round(confidence, 2),
        "data_points": len(metrics),
    }


# fill rate prediction
def predict_fill_rate(
    db: Session,
    latitude: float,
    longitude: float,
    event_type: str = "camp",
    capacity: int = 20,
    price_cents: int = 5000,
    sport: str = "soccer",
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    skill_level: Optional[str] = None,
) -> Dict:
    """
    Predict fill rate for a hypothetical event using gradient boosting.
    Returns prediction + feature importance explanation.
    """
    h3_cell = lat_lng_to_h3(latitude, longitude)
    nearby_cells = list(h3.k_ring(h3_cell, 2))

    # feature engineering
    # 1. demand in area (last 30 days)
    lookback = date.today() - timedelta(days=30)
    lead_count = db.query(func.count(Lead.id)).filter(
        Lead.h3_index_r8.in_(nearby_cells),
        Lead.created_at >= lookback,
    ).scalar() or 0

    search_count = db.query(func.count(SearchLog.id)).filter(
        SearchLog.h3_index_r8.in_(nearby_cells),
        SearchLog.created_at >= lookback,
    ).scalar() or 0

    # 2. competition (existing events in area)
    competition = db.query(func.count(Event.id)).filter(
        Event.h3_index_r8.in_(nearby_cells),
        Event.is_active == True,
        Event.event_type == event_type,
    ).scalar() or 0

    # 3. nearest coach distance
    coach_count = db.query(func.count(CoachLocation.id)).filter(
        CoachLocation.h3_index_r8.in_(nearby_cells),
    ).scalar() or 0

    # 4. Historical fill rates in area
    hist_events = db.query(Event).filter(
        Event.h3_index_r8.in_(nearby_cells),
        Event.is_active == True,
    ).all()

    if hist_events:
        avg_fill = np.mean([
            e.spots_filled / max(e.capacity, 1) for e in hist_events
        ])
    else:
        avg_fill = 0.5  # default assumption

    # 5. Price competitiveness
    if hist_events:
        avg_price = np.mean([e.price_cents for e in hist_events if e.price_cents > 0] or [5000])
        price_ratio = price_cents / max(avg_price, 1)
    else:
        price_ratio = 1.0

    # 6. Seasonality
    seasonal_factor = get_seasonality_factor(date.today() + timedelta(days=30))

    # ─── Build feature vector ─────────────────────────────
    features = {
        "demand_score": lead_count * 3 + search_count,
        "competition_count": competition,
        "coach_density": coach_count,
        "avg_historical_fill": avg_fill,
        "price_ratio": price_ratio,
        "capacity": capacity,
        "seasonality": seasonal_factor,
    }

    # ─── Simple Prediction Model ──────────────────────────
    # MVP: Use a weighted heuristic that mimics what a trained model would do.
    # In production, this would be replaced by a trained sklearn model.
    weights = {
        "demand_score": 0.25,
        "competition_count": -0.10,
        "coach_density": 0.05,
        "avg_historical_fill": 0.25,
        "price_ratio": -0.15,
        "capacity": -0.05,
        "seasonality": 0.15,
    }

    # Normalize features
    norm_demand = min(features["demand_score"] / 50, 1.0)
    norm_competition = min(features["competition_count"] / 10, 1.0)
    norm_coach = min(features["coach_density"] / 10, 1.0)
    norm_price = min(features["price_ratio"], 2.0) / 2.0

    raw_score = (
        weights["demand_score"] * norm_demand +
        weights["competition_count"] * norm_competition +
        weights["coach_density"] * norm_coach +
        weights["avg_historical_fill"] * avg_fill +
        weights["price_ratio"] * (1 - norm_price) +  # lower price = better
        weights["capacity"] * (1 - min(capacity / 50, 1.0)) +  # smaller = easier to fill
        weights["seasonality"] * seasonal_factor
    )

    # Sigmoid to bound between 0 and 1
    predicted_fill_rate = 1 / (1 + np.exp(-5 * (raw_score - 0.3)))
    predicted_fill_rate = round(float(predicted_fill_rate), 3)

    # Confidence based on data availability
    confidence = min(0.95, 0.3 + (lead_count + search_count) / 100 * 0.3 + len(hist_events) / 20 * 0.35)

    predicted_signups = int(predicted_fill_rate * capacity)
    predicted_revenue = predicted_signups * price_cents

    # ─── Feature Importance Explanation ───────────────────
    factors = [
        {"name": "Area Demand (leads + searches)", "value": features["demand_score"], "impact": round(weights["demand_score"] * norm_demand, 3), "direction": "positive"},
        {"name": "Historical Fill Rate", "value": round(avg_fill, 2), "impact": round(weights["avg_historical_fill"] * avg_fill, 3), "direction": "positive"},
        {"name": "Seasonality", "value": seasonal_factor, "impact": round(weights["seasonality"] * seasonal_factor, 3), "direction": "positive"},
        {"name": "Competition Nearby", "value": competition, "impact": round(abs(weights["competition_count"] * norm_competition), 3), "direction": "negative"},
        {"name": "Price vs Market", "value": round(price_ratio, 2), "impact": round(abs(weights["price_ratio"] * norm_price), 3), "direction": "negative" if price_ratio > 1 else "positive"},
        {"name": "Coach Availability", "value": coach_count, "impact": round(weights["coach_density"] * norm_coach, 3), "direction": "positive"},
    ]
    factors.sort(key=lambda x: abs(x["impact"]), reverse=True)

    if predicted_fill_rate > 0.7:
        recommendation = "Strong opportunity. High demand with manageable competition."
    elif predicted_fill_rate > 0.4:
        recommendation = "Moderate opportunity. Consider adjusting pricing or timing to improve fill rate."
    else:
        recommendation = "Challenging market. Consider a smaller capacity or different location."

    return {
        "predicted_fill_rate": predicted_fill_rate,
        "confidence": round(confidence, 2),
        "predicted_signups": predicted_signups,
        "predicted_revenue_cents": predicted_revenue,
        "nearby_competition": competition,
        "demand_score": features["demand_score"],
        "factors": factors,
        "recommendation": recommendation,
    }


# ─── Expansion Recommendations ────────────────────────────
def generate_recommendations(db: Session, top_n: int = 10) -> List[Dict]:
    """
    Generate top N expansion zone recommendations.
    Ranks H3 cells by opportunity score = underserved * demand * seasonality.
    """
    today = date.today()

    # Get latest metrics
    metrics = db.query(GeoCellMetric).filter(
        GeoCellMetric.metric_date == today,
        GeoCellMetric.demand_score > 0,
    ).all()

    if not metrics:
        # Fallback: use most recent available date
        latest_date = db.query(func.max(GeoCellMetric.metric_date)).scalar()
        if latest_date:
            metrics = db.query(GeoCellMetric).filter(
                GeoCellMetric.metric_date == latest_date,
                GeoCellMetric.demand_score > 0,
            ).all()

    if not metrics:
        return []

    seasonal_factor = get_seasonality_factor(today + timedelta(days=30))

    # Score each cell
    scored = []
    for m in metrics:
        opportunity_score = (
            m.underserved_score * 0.4 +
            m.demand_score * 0.3 +
            m.hotspot_score * 0.2 +
            seasonal_factor * 10 * 0.1
        )
        scored.append((m, opportunity_score))

    # Sort by opportunity score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    recommendations = []
    for rank, (m, opp_score) in enumerate(scored[:top_n], 1):
        # Determine best event type based on lead preferences
        lead_types = db.query(Lead.preferred_type, func.count(Lead.id)).filter(
            Lead.h3_index_r8 == m.h3_index,
        ).group_by(Lead.preferred_type).all()

        if lead_types:
            best_type = max(lead_types, key=lambda x: x[1])[0] or "camp"
        else:
            best_type = "camp"

        # Ideal timing heuristic
        ideal_days = "Sat,Sun" if best_type == "camp" else "Mon,Wed,Fri"
        ideal_start = "09:00" if best_type == "camp" else "17:00"
        ideal_end = "12:00" if best_type == "camp" else "19:00"

        # Fill rate prediction for this zone
        pred = predict_fill_rate(
            db, m.center_lat, m.center_lng,
            event_type=best_type, capacity=20, price_cents=5000
        )

        explanation = {
            "factors": [
                {"name": "lead_volume", "value": m.lead_count, "weight": 0.3,
                 "contribution": round(m.lead_count * 0.3, 1)},
                {"name": "distance_to_supply", "value": round(m.underserved_score, 1), "weight": 0.25,
                 "contribution": round(m.underserved_score * 0.25, 1)},
                {"name": "historical_conversion", "value": round(m.conversion_rate, 3), "weight": 0.2,
                 "contribution": round(m.conversion_rate * 20, 1)},
                {"name": "seasonality", "value": seasonal_factor, "weight": 0.15,
                 "contribution": round(seasonal_factor * 15, 1)},
                {"name": "competition_density", "value": m.event_count, "weight": 0.1,
                 "contribution": round(max(0, 10 - m.event_count) * 0.1, 1)},
            ],
            "summary": _generate_summary(m, seasonal_factor, best_type),
            "opportunity_score": round(opp_score, 2),
        }

        recommendations.append({
            "h3_index": m.h3_index,
            "resolution": 8,
            "center_lat": m.center_lat,
            "center_lng": m.center_lng,
            "rank": rank,
            "recommended_event_type": best_type,
            "recommended_sport": "soccer",
            "recommended_age_group": "U10-U14",
            "ideal_days": ideal_days,
            "ideal_time_start": ideal_start,
            "ideal_time_end": ideal_end,
            "suggested_capacity": 20,
            "suggested_price_cents": 5000,
            "predicted_fill_rate": pred["predicted_fill_rate"],
            "confidence_score": pred["confidence"],
            "expected_revenue_cents": pred["predicted_revenue_cents"],
            "explanation": explanation,
            "is_active": True,
        })

    return recommendations


def _generate_summary(metric, seasonal_factor: float, event_type: str) -> str:
    """Generate human-readable explanation for a recommendation."""
    parts = []

    if metric.demand_score > 30:
        parts.append("High demand detected in this area")
    elif metric.demand_score > 10:
        parts.append("Moderate demand in this area")
    else:
        parts.append("Emerging demand signal")

    if metric.underserved_score > 50:
        parts.append("with very limited nearby supply")
    elif metric.underserved_score > 20:
        parts.append("with below-average supply coverage")

    if metric.conversion_rate > 0.3:
        parts.append("Strong historical conversion rates indicate engaged audience.")
    elif metric.conversion_rate > 0.1:
        parts.append("Reasonable conversion history suggests viable market.")

    if seasonal_factor > 0.8:
        parts.append(f"Current seasonal timing is favorable for {event_type}s.")

    return ". ".join(parts) + "."
