"""
Lead (waitlist/request info), Booking, Search log, Favorite models.
These power the demand-side of the intelligence layer.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer, Date, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

from app.core.database import Base


class Lead(Base):
    """Captured from 'Request Info' / 'Join Waitlist' actions."""
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id", ondelete="SET NULL"), nullable=True)
    # Contact
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    message = Column(Text, nullable=True)
    lead_type = Column(String(30), default="request_info")  # request_info | waitlist | callback
    # Geo (where the person searched from)
    geom = Column(Geometry("POINT", srid=4326), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    h3_index_r8 = Column(String(20), index=True)
    # Preferences captured
    preferred_sport = Column(String(50), nullable=True)
    preferred_type = Column(String(30), nullable=True)
    preferred_age_group = Column(String(20), nullable=True)
    preferred_skill_level = Column(String(20), nullable=True)
    preferred_max_price = Column(Integer, nullable=True)
    # Status
    status = Column(String(20), default="new")  # new | contacted | converted | lost
    converted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="leads")


class Booking(Base):
    """Confirmed enrollment in an event (partially mocked for MVP)."""
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="confirmed")  # confirmed | cancelled | completed
    amount_cents = Column(Integer, default=0)
    booked_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    event = relationship("Event", back_populates="bookings")


class SearchLog(Base):
    """Anonymized search queries — powers demand proxy."""
    __tablename__ = "search_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Anonymized: no user_id stored
    query_text = Column(String(500), nullable=True)
    sport = Column(String(50), nullable=True)
    event_type = Column(String(30), nullable=True)
    age_group = Column(String(20), nullable=True)
    skill_level = Column(String(20), nullable=True)
    # Geo: where they searched
    geom = Column(Geometry("POINT", srid=4326), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    h3_index_r8 = Column(String(20), index=True)
    search_radius_km = Column(Float, nullable=True)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Favorite(Base):
    """User's saved coaches or events."""
    __tablename__ = "favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id", ondelete="CASCADE"), nullable=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="favorites")
