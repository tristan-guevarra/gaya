"""Event + Lead endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user, require_coach
from app.models.user import User, Membership
from app.models.event import Event, EventOccurrence
from app.models.lead import Lead, Favorite
from app.models.geo import AuditLog
from app.schemas.models import (
    EventResponse, EventCreate, EventUpdate,
    LeadCreate, LeadResponse,
)
from app.services.geo_service import lat_lng_to_h3

router = APIRouter(tags=["Events & Leads"])


# events
@router.get("/events", response_model=List[EventResponse])
async def list_events(
    sport: Optional[str] = None,
    event_type: Optional[str] = None,
    city: Optional[str] = None,
    date_from: Optional[date] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    query = select(Event).where(Event.is_active == True, Event.is_published == True)
    if sport:
        query = query.where(Event.sport == sport)
    if event_type:
        query = query.where(Event.event_type == event_type)
    if city:
        query = query.where(Event.city.ilike(f"%{city}%"))
    if date_from:
        query = query.where(Event.start_date >= date_from)
    query = query.order_by(Event.start_date).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return [EventResponse.model_validate(e) for e in result.scalars().all()]


@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse.model_validate(event)


@router.post("/events", response_model=EventResponse, status_code=201)
async def create_event(
    req: EventCreate,
    current_user: User = Depends(require_coach),
    db: AsyncSession = Depends(get_db),
):
    membership = await db.execute(
        select(Membership).where(Membership.user_id == current_user.id)
    )
    mem = membership.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=403, detail="No organization membership")

    h3_r8 = lat_lng_to_h3(req.latitude, req.longitude, 8)
    h3_r7 = lat_lng_to_h3(req.latitude, req.longitude, 7)

    event = Event(
        organization_id=mem.organization_id,
        coach_id=req.coach_id,
        title=req.title,
        description=req.description,
        event_type=req.event_type,
        sport=req.sport,
        venue_name=req.venue_name,
        address=req.address,
        city=req.city,
        latitude=req.latitude,
        longitude=req.longitude,
        h3_index_r8=h3_r8,
        h3_index_r7=h3_r7,
        geom=func.ST_SetSRID(func.ST_MakePoint(req.longitude, req.latitude), 4326),
        start_date=req.start_date,
        end_date=req.end_date,
        capacity=req.capacity,
        price_cents=req.price_cents,
        currency=req.currency,
        age_min=req.age_min,
        age_max=req.age_max,
        skill_levels=req.skill_levels,
        tags=req.tags,
        cover_image_url=req.cover_image_url,
    )
    db.add(event)
    await db.flush()

    # add occurrences
    for occ in req.occurrences:
        db.add(EventOccurrence(
            event_id=event.id,
            date=occ.date,
            start_time=occ.start_time,
            end_time=occ.end_time,
        ))

    db.add(AuditLog(
        user_id=current_user.id,
        organization_id=mem.organization_id,
        action="event.created",
        entity_type="event",
        entity_id=event.id,
    ))

    await db.flush()
    return EventResponse.model_validate(event)


@router.patch("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    req: EventUpdate,
    current_user: User = Depends(require_coach),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    changes = {}
    for field, value in req.model_dump(exclude_unset=True).items():
        old_val = getattr(event, field)
        setattr(event, field, value)
        changes[field] = {"old": str(old_val), "new": str(value)}

    db.add(AuditLog(
        user_id=current_user.id,
        action="event.updated",
        entity_type="event",
        entity_id=event.id,
        changes=changes,
    ))

    await db.flush()
    return EventResponse.model_validate(event)


# leads
@router.post("/leads", response_model=LeadResponse, status_code=201)
async def create_lead(req: LeadCreate, db: AsyncSession = Depends(get_db)):
    """Public: submit a lead (request info / join waitlist)."""
    h3_idx = lat_lng_to_h3(req.latitude, req.longitude) if req.latitude and req.longitude else None

    lead = Lead(
        event_id=req.event_id,
        coach_id=req.coach_id,
        name=req.name,
        email=req.email,
        phone=req.phone,
        message=req.message,
        lead_type=req.lead_type,
        latitude=req.latitude,
        longitude=req.longitude,
        h3_index_r8=h3_idx,
        preferred_sport=req.preferred_sport,
        preferred_type=req.preferred_type,
        preferred_age_group=req.preferred_age_group,
        preferred_skill_level=req.preferred_skill_level,
        preferred_max_price=req.preferred_max_price,
    )
    if req.latitude and req.longitude:
        lead.geom = func.ST_SetSRID(func.ST_MakePoint(req.longitude, req.latitude), 4326)

    db.add(lead)
    await db.flush()
    return LeadResponse.model_validate(lead)


# favorites
@router.post("/favorites/{entity_type}/{entity_id}", status_code=201)
async def add_favorite(
    entity_type: str,  # coach | event
    entity_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fav = Favorite(user_id=current_user.id)
    if entity_type == "coach":
        fav.coach_id = entity_id
    elif entity_type == "event":
        fav.event_id = entity_id
    else:
        raise HTTPException(status_code=400, detail="Invalid entity type")

    db.add(fav)
    await db.flush()
    return {"status": "saved", "id": str(fav.id)}


@router.delete("/favorites/{favorite_id}", status_code=204)
async def remove_favorite(
    favorite_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Favorite).where(Favorite.id == favorite_id, Favorite.user_id == current_user.id)
    )
    fav = result.scalar_one_or_none()
    if fav:
        await db.delete(fav)


@router.get("/favorites", response_model=List[dict])
async def list_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Favorite).where(Favorite.user_id == current_user.id)
    )
    return [
        {
            "id": str(f.id),
            "coach_id": str(f.coach_id) if f.coach_id else None,
            "event_id": str(f.event_id) if f.event_id else None,
            "created_at": f.created_at.isoformat(),
        }
        for f in result.scalars().all()
    ]
