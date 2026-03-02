"""
Geospatial intelligence models:
- GeoCellMetric: daily aggregated supply/demand/hotspot scores per H3 cell
- Recommendation: expansion zone recommendations with explanations
- FeatureFlag: org-level feature toggles
- AuditLog: full edit trail
"""
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class GeoCellMetric(Base):
    """
    Precomputed daily metrics per H3 cell.
    Recomputed nightly by Celery worker.
    """
    __tablename__ = "geo_cell_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    h3_index = Column(String(20), nullable=False, index=True)
    resolution = Column(Integer, nullable=False, default=8)
    metric_date = Column(Date, nullable=False, index=True)
    # Cell center for quick lookups
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    # Supply metrics
    coach_count = Column(Integer, default=0)
    event_count = Column(Integer, default=0)
    total_capacity = Column(Integer, default=0)
    supply_score = Column(Float, default=0.0)
    # Demand metrics
    search_count = Column(Integer, default=0)
    lead_count = Column(Integer, default=0)
    waitlist_count = Column(Integer, default=0)
    demand_score = Column(Float, default=0.0)
    # Derived scores
    underserved_score = Column(Float, default=0.0)  # demand - supply (normalized)
    hotspot_score = Column(Float, default=0.0)       # demand * conversion_rate or demand-only
    conversion_rate = Column(Float, default=0.0)     # bookings / leads
    # Bookings
    booking_count = Column(Integer, default=0)
    fill_rate = Column(Float, default=0.0)  # spots_filled / total_capacity

    class Config:
        # Composite unique constraint
        pass

    __table_args__ = (
        # Unique per cell per day
        {"schema": None},
    )


class Recommendation(Base):
    """
    AI-generated expansion recommendations.
    Each row = one recommended zone + event type + timing.
    """
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    h3_index = Column(String(20), nullable=False, index=True)
    resolution = Column(Integer, default=8)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False)  # 1 = top recommendation
    # Recommendation details
    recommended_event_type = Column(String(30), nullable=False)  # camp | clinic | private
    recommended_sport = Column(String(50), default="soccer")
    recommended_age_group = Column(String(20), nullable=True)
    ideal_days = Column(String(100), nullable=True)  # e.g., "Sat,Sun"
    ideal_time_start = Column(String(10), nullable=True)  # "09:00"
    ideal_time_end = Column(String(10), nullable=True)    # "12:00"
    suggested_capacity = Column(Integer, nullable=True)
    suggested_price_cents = Column(Integer, nullable=True)
    # Predictions
    predicted_fill_rate = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0–1.0
    expected_revenue_cents = Column(Integer, nullable=True)
    # Explanation (structured)
    explanation = Column(JSONB, default=dict)
    """
    Example explanation:
    {
        "factors": [
            {"name": "lead_volume", "value": 45, "weight": 0.3, "contribution": 13.5},
            {"name": "distance_to_supply", "value": 3.2, "weight": 0.25, "contribution": 8.0},
            {"name": "historical_conversion", "value": 0.32, "weight": 0.2, "contribution": 6.4},
            {"name": "seasonality", "value": 0.85, "weight": 0.15, "contribution": 12.75},
            {"name": "competition_density", "value": 0.1, "weight": 0.1, "contribution": 1.0}
        ],
        "summary": "High demand with minimal nearby supply. Strong seasonal timing for summer camps."
    }
    """
    # Meta
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    # If organization_id is NULL, it's a global flag
    flag_key = Column(String(100), nullable=False, index=True)
    is_enabled = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="feature_flags")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., "event.created", "coach.updated"
    entity_type = Column(String(50), nullable=True)  # "event", "coach", "user"
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    changes = Column(JSONB, default=dict)  # {"field": {"old": ..., "new": ...}}
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
