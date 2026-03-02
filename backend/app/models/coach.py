"""
Coach + CoachLocation models.
A coach belongs to an org and can operate at multiple locations.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

from app.core.database import Base


class Coach(Base):
    __tablename__ = "coaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    display_name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    sport = Column(String(50), default="soccer", index=True)
    specialties = Column(ARRAY(String), default=list)  # e.g., ["goalkeeping", "speed training"]
    certifications = Column(ARRAY(String), default=list)  # e.g., ["UEFA B", "USSF C"]
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    hourly_rate_min = Column(Float, nullable=True)  # price range
    hourly_rate_max = Column(Float, nullable=True)
    age_groups = Column(ARRAY(String), default=list)  # ["U8", "U10", "U12", "U14", "U16", "U18", "Adult"]
    skill_levels = Column(ARRAY(String), default=list)  # ["beginner", "intermediate", "elite"]
    metadata_json = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="coaches")
    locations = relationship("CoachLocation", back_populates="coach", lazy="selectin", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="coach", lazy="selectin")


class CoachLocation(Base):
    """A coach can train at multiple venues/locations."""
    __tablename__ = "coach_locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)  # e.g., "Scarborough Sports Complex"
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    province = Column(String(50), nullable=True)
    postal_code = Column(String(20), nullable=True)
    # PostGIS point geometry: SRID 4326 (WGS84)
    geom = Column(Geometry("POINT", srid=4326), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_primary = Column(Boolean, default=False)
    h3_index_r8 = Column(String(20), index=True)  # precomputed H3 cell at resolution 8
    h3_index_r7 = Column(String(20), index=True)  # precomputed H3 cell at resolution 7

    coach = relationship("Coach", back_populates="locations")
