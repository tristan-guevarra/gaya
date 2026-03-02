"""Coach CRUD endpoints — org-scoped with RBAC."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user, require_coach
from app.models.user import User, Membership
from app.models.coach import Coach, CoachLocation
from app.models.geo import AuditLog
from app.schemas.models import CoachResponse, CoachCreate, CoachUpdate
from app.services.geo_service import lat_lng_to_h3

router = APIRouter(prefix="/coaches", tags=["Coaches"])


@router.get("/", response_model=List[CoachResponse])
async def list_coaches(
    sport: Optional[str] = None,
    city: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List coaches (public)."""
    query = select(Coach).where(Coach.is_active == True)
    if sport:
        query = query.where(Coach.sport == sport)
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return [CoachResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/", response_model=CoachResponse, status_code=201)
async def create_coach(
    req: CoachCreate,
    current_user: User = Depends(require_coach),
    db: AsyncSession = Depends(get_db),
):
    """Create a coach profile (requires coach+ role)."""
    # Get user's org
    membership = await db.execute(
        select(Membership).where(Membership.user_id == current_user.id)
    )
    mem = membership.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=403, detail="No organization membership found")

    coach = Coach(
        user_id=current_user.id,
        organization_id=mem.organization_id,
        display_name=req.display_name,
        bio=req.bio,
        photo_url=req.photo_url,
        sport=req.sport,
        specialties=req.specialties,
        certifications=req.certifications,
        hourly_rate_min=req.hourly_rate_min,
        hourly_rate_max=req.hourly_rate_max,
        age_groups=req.age_groups,
        skill_levels=req.skill_levels,
    )
    db.add(coach)
    await db.flush()

    # Add locations
    for loc_data in req.locations:
        h3_r8 = lat_lng_to_h3(loc_data.latitude, loc_data.longitude, 8)
        h3_r7 = lat_lng_to_h3(loc_data.latitude, loc_data.longitude, 7)
        loc = CoachLocation(
            coach_id=coach.id,
            name=loc_data.name,
            address=loc_data.address,
            city=loc_data.city,
            latitude=loc_data.latitude,
            longitude=loc_data.longitude,
            is_primary=loc_data.is_primary,
            h3_index_r8=h3_r8,
            h3_index_r7=h3_r7,
            geom=func.ST_SetSRID(func.ST_MakePoint(loc_data.longitude, loc_data.latitude), 4326),
        )
        db.add(loc)

    # Audit log
    db.add(AuditLog(
        user_id=current_user.id,
        organization_id=mem.organization_id,
        action="coach.created",
        entity_type="coach",
        entity_id=coach.id,
    ))

    await db.flush()
    return CoachResponse.model_validate(coach)


@router.patch("/{coach_id}", response_model=CoachResponse)
async def update_coach(
    coach_id: UUID,
    req: CoachUpdate,
    current_user: User = Depends(require_coach),
    db: AsyncSession = Depends(get_db),
):
    """Update a coach profile."""
    result = await db.execute(select(Coach).where(Coach.id == coach_id))
    coach = result.scalar_one_or_none()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    # Org isolation check
    if current_user.role != "superadmin":
        membership = await db.execute(
            select(Membership).where(
                Membership.user_id == current_user.id,
                Membership.organization_id == coach.organization_id,
            )
        )
        if not membership.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Not in this organization")

    changes = {}
    for field, value in req.model_dump(exclude_unset=True).items():
        old_val = getattr(coach, field)
        setattr(coach, field, value)
        changes[field] = {"old": str(old_val), "new": str(value)}

    db.add(AuditLog(
        user_id=current_user.id,
        organization_id=coach.organization_id,
        action="coach.updated",
        entity_type="coach",
        entity_id=coach.id,
        changes=changes,
    ))

    await db.flush()
    return CoachResponse.model_validate(coach)
