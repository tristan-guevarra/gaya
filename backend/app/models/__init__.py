"""All models imported here so Alembic can discover them."""
from app.models.user import User, Organization, Membership
from app.models.coach import Coach, CoachLocation
from app.models.event import Event, EventOccurrence
from app.models.lead import Lead, Booking, SearchLog, Favorite
from app.models.geo import GeoCellMetric, Recommendation, FeatureFlag, AuditLog

__all__ = [
    "User", "Organization", "Membership",
    "Coach", "CoachLocation",
    "Event", "EventOccurrence",
    "Lead", "Booking", "SearchLog", "Favorite",
    "GeoCellMetric", "Recommendation", "FeatureFlag", "AuditLog",
]
