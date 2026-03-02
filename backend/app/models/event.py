"""
Event (camp/clinic/private) + EventOccurrence models.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer, Date, Time, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(30), nullable=False, index=True)  # camp | clinic | private
    sport = Column(String(50), default="soccer", index=True)
    # Location
    venue_name = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    province = Column(String(50), nullable=True)
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    h3_index_r8 = Column(String(20), index=True)
    h3_index_r7 = Column(String(20), index=True)
    # Scheduling
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)
    # Capacity + pricing
    capacity = Column(Integer, nullable=False, default=20)
    spots_filled = Column(Integer, default=0)
    price_cents = Column(Integer, nullable=False, default=0)  # price in cents
    currency = Column(String(3), default="CAD")
    # Filters
    age_min = Column(Integer, nullable=True)
    age_max = Column(Integer, nullable=True)
    skill_levels = Column(ARRAY(String), default=list)
    tags = Column(ARRAY(String), default=list)
    # Images
    cover_image_url = Column(Text, nullable=True)
    # Status
    is_published = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    metadata_json = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="events")
    coach = relationship("Coach", back_populates="events")
    occurrences = relationship("EventOccurrence", back_populates="event", lazy="selectin", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="event", lazy="selectin")


class EventOccurrence(Base):
    """Individual sessions within a recurring event."""
    __tablename__ = "event_occurrences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_cancelled = Column(Boolean, default=False)

    event = relationship("Event", back_populates="occurrences")
