"""Pydantic schemas for coach, event, lead, and map endpoints."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date, time


# ─── Coach Schemas ────────────────────────────────────────
class CoachLocationSchema(BaseModel):
    id: Optional[UUID] = None
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: float
    longitude: float
    is_primary: bool = False

    model_config = {"from_attributes": True}


class CoachResponse(BaseModel):
    id: UUID
    organization_id: UUID
    display_name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    sport: str
    specialties: List[str] = []
    certifications: List[str] = []
    rating: float = 0.0
    review_count: int = 0
    is_verified: bool = False
    hourly_rate_min: Optional[float] = None
    hourly_rate_max: Optional[float] = None
    age_groups: List[str] = []
    skill_levels: List[str] = []
    locations: List[CoachLocationSchema] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class CoachCreate(BaseModel):
    display_name: str = Field(min_length=1, max_length=255)
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    sport: str = "soccer"
    specialties: List[str] = []
    certifications: List[str] = []
    hourly_rate_min: Optional[float] = None
    hourly_rate_max: Optional[float] = None
    age_groups: List[str] = []
    skill_levels: List[str] = []
    locations: List[CoachLocationSchema] = []


class CoachUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    sport: Optional[str] = None
    specialties: Optional[List[str]] = None
    hourly_rate_min: Optional[float] = None
    hourly_rate_max: Optional[float] = None
    age_groups: Optional[List[str]] = None
    skill_levels: Optional[List[str]] = None


# ─── Event Schemas ────────────────────────────────────────
class EventOccurrenceSchema(BaseModel):
    id: Optional[UUID] = None
    date: date
    start_time: time
    end_time: time
    is_cancelled: bool = False

    model_config = {"from_attributes": True}


class EventResponse(BaseModel):
    id: UUID
    organization_id: UUID
    coach_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    event_type: str
    sport: str
    venue_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: float
    longitude: float
    start_date: date
    end_date: Optional[date] = None
    capacity: int
    spots_filled: int
    spots_available: int = 0
    price_cents: int
    currency: str = "CAD"
    price_display: str = ""
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    skill_levels: List[str] = []
    tags: List[str] = []
    cover_image_url: Optional[str] = None
    is_published: bool = True
    occurrences: List[EventOccurrenceSchema] = []
    coach: Optional[CoachResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("spots_available", mode="before")
    @classmethod
    def compute_spots(cls, v, info):
        data = info.data
        return max(0, data.get("capacity", 0) - data.get("spots_filled", 0))

    @field_validator("price_display", mode="before")
    @classmethod
    def format_price(cls, v, info):
        cents = info.data.get("price_cents", 0)
        currency = info.data.get("currency", "CAD")
        return f"${cents / 100:.2f} {currency}"


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    event_type: str = Field(pattern="^(camp|clinic|private)$")
    sport: str = "soccer"
    venue_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: float
    longitude: float
    start_date: date
    end_date: Optional[date] = None
    capacity: int = Field(ge=1, le=500)
    price_cents: int = Field(ge=0)
    currency: str = "CAD"
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    skill_levels: List[str] = []
    tags: List[str] = []
    cover_image_url: Optional[str] = None
    coach_id: Optional[UUID] = None
    occurrences: List[EventOccurrenceSchema] = []


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    price_cents: Optional[int] = None
    is_published: Optional[bool] = None


# ─── Lead Schemas ─────────────────────────────────────────
class LeadCreate(BaseModel):
    event_id: Optional[UUID] = None
    coach_id: Optional[UUID] = None
    name: str = Field(min_length=1, max_length=255)
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    lead_type: str = "request_info"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_sport: Optional[str] = None
    preferred_type: Optional[str] = None
    preferred_age_group: Optional[str] = None
    preferred_skill_level: Optional[str] = None
    preferred_max_price: Optional[int] = None


class LeadResponse(BaseModel):
    id: UUID
    name: str
    email: str
    lead_type: str
    status: str
    event_id: Optional[UUID] = None
    coach_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Map / Search Schemas ────────────────────────────────
class MapSearchParams(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 25.0
    sport: Optional[str] = None
    event_type: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    skill_level: Optional[str] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    has_availability: Optional[bool] = None
    page: int = 1
    page_size: int = 50


class MapMarker(BaseModel):
    """Lightweight marker for map display."""
    id: UUID
    type: str  # "coach" | "event"
    latitude: float
    longitude: float
    title: str
    subtitle: Optional[str] = None
    event_type: Optional[str] = None
    price_cents: Optional[int] = None
    rating: Optional[float] = None
    spots_available: Optional[int] = None
    cover_image_url: Optional[str] = None


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


# ─── Intelligence Schemas ─────────────────────────────────
class HexMetricResponse(BaseModel):
    h3_index: str
    center_lat: float
    center_lng: float
    supply_score: float
    demand_score: float
    underserved_score: float
    hotspot_score: float
    conversion_rate: float
    coach_count: int
    event_count: int
    search_count: int
    lead_count: int


class RecommendationResponse(BaseModel):
    id: UUID
    rank: int
    h3_index: str
    center_lat: float
    center_lng: float
    recommended_event_type: str
    recommended_sport: str
    recommended_age_group: Optional[str] = None
    ideal_days: Optional[str] = None
    ideal_time_start: Optional[str] = None
    ideal_time_end: Optional[str] = None
    suggested_capacity: Optional[int] = None
    suggested_price_cents: Optional[int] = None
    predicted_fill_rate: float
    confidence_score: float
    expected_revenue_cents: Optional[int] = None
    explanation: dict
    generated_at: datetime

    model_config = {"from_attributes": True}


class WhatIfRequest(BaseModel):
    """What-if simulator input."""
    latitude: float
    longitude: float
    event_type: str = "camp"
    sport: str = "soccer"
    capacity: int = 20
    price_cents: int = 5000
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    skill_level: Optional[str] = None


class WhatIfResponse(BaseModel):
    predicted_fill_rate: float
    confidence: float
    predicted_signups: int
    predicted_revenue_cents: int
    nearby_competition: int
    demand_score: float
    factors: List[dict]
    recommendation: str
