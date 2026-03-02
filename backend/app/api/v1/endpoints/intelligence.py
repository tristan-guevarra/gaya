"""
Intelligence endpoints (admin only): geo metrics, recommendations, what-if, feature flags, audit.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.core.database import get_db, SyncSessionLocal
from app.core.security import get_current_user, require_org_admin, require_superadmin
from app.models.user import User
from app.models.geo import GeoCellMetric, Recommendation, FeatureFlag, AuditLog
from app.schemas.models import (
    HexMetricResponse, RecommendationResponse,
    WhatIfRequest, WhatIfResponse,
)
from app.services.ml_service import predict_fill_rate, generate_recommendations

router = APIRouter(tags=["Intelligence & Admin"])


# geo metrics
@router.get("/intelligence/metrics", response_model=List[HexMetricResponse])
async def get_geo_metrics(
    metric_date: Optional[date] = None,
    min_demand: float = 0,
    current_user: User = Depends(require_org_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all H3 cell metrics for a given date."""
    target_date = metric_date or date.today()
    query = select(GeoCellMetric).where(
        GeoCellMetric.metric_date == target_date,
    )
    if min_demand > 0:
        query = query.where(GeoCellMetric.demand_score >= min_demand)

    query = query.order_by(desc(GeoCellMetric.demand_score))
    result = await db.execute(query)
    return [HexMetricResponse(
        h3_index=m.h3_index,
        center_lat=m.center_lat,
        center_lng=m.center_lng,
        supply_score=m.supply_score,
        demand_score=m.demand_score,
        underserved_score=m.underserved_score,
        hotspot_score=m.hotspot_score,
        conversion_rate=m.conversion_rate,
        coach_count=m.coach_count,
        event_count=m.event_count,
        search_count=m.search_count,
        lead_count=m.lead_count,
    ) for m in result.scalars().all()]


# recommendations
@router.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    top_n: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_org_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get top N expansion recommendations."""
    result = await db.execute(
        select(Recommendation)
        .where(Recommendation.is_active == True)
        .order_by(Recommendation.rank)
        .limit(top_n)
    )
    recs = result.scalars().all()
    return [RecommendationResponse.model_validate(r) for r in recs]


@router.post("/recommendations/regenerate")
async def regenerate_recommendations(
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """Trigger recommendation regeneration (superadmin only)."""
    # use sync session for ml service
    sync_db = SyncSessionLocal()
    try:
        # deactivate old recommendations
        await db.execute(
            select(Recommendation).where(Recommendation.is_active == True)
        )
        # generate new ones
        recs = generate_recommendations(sync_db, top_n=10)

        # store in async db
        for rec_data in recs:
            rec = Recommendation(**rec_data)
            db.add(rec)

        await db.flush()
        return {"status": "success", "count": len(recs)}
    finally:
        sync_db.close()


# what-if simulator
@router.post("/simulator/what-if", response_model=WhatIfResponse)
async def what_if_simulation(
    req: WhatIfRequest,
    current_user: User = Depends(require_org_admin),
):
    """
    Simulate: 'If we add a camp here with capacity X, price Y, what happens?'
    Returns predicted fill rate, revenue, and factor breakdown.
    """
    sync_db = SyncSessionLocal()
    try:
        result = predict_fill_rate(
            sync_db,
            latitude=req.latitude,
            longitude=req.longitude,
            event_type=req.event_type,
            capacity=req.capacity,
            price_cents=req.price_cents,
            sport=req.sport,
            age_min=req.age_min,
            age_max=req.age_max,
            skill_level=req.skill_level,
        )
        return WhatIfResponse(**result)
    finally:
        sync_db.close()


# feature flags
@router.get("/admin/feature-flags")
async def list_feature_flags(
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FeatureFlag).order_by(FeatureFlag.flag_key))
    return [
        {
            "id": str(f.id),
            "organization_id": str(f.organization_id) if f.organization_id else None,
            "flag_key": f.flag_key,
            "is_enabled": f.is_enabled,
            "description": f.description,
        }
        for f in result.scalars().all()
    ]


@router.post("/admin/feature-flags")
async def create_feature_flag(
    flag_key: str,
    is_enabled: bool = False,
    description: Optional[str] = None,
    organization_id: Optional[UUID] = None,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    flag = FeatureFlag(
        flag_key=flag_key,
        is_enabled=is_enabled,
        description=description,
        organization_id=organization_id,
    )
    db.add(flag)
    await db.flush()
    return {"id": str(flag.id), "flag_key": flag.flag_key, "is_enabled": flag.is_enabled}


@router.patch("/admin/feature-flags/{flag_id}")
async def toggle_feature_flag(
    flag_id: UUID,
    is_enabled: bool,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.id == flag_id))
    flag = result.scalar_one_or_none()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    flag.is_enabled = is_enabled
    return {"id": str(flag.id), "flag_key": flag.flag_key, "is_enabled": flag.is_enabled}


# audit logs
@router.get("/admin/audit-logs")
async def list_audit_logs(
    entity_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    current_user: User = Depends(require_org_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLog).order_by(desc(AuditLog.created_at))
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return [
        {
            "id": str(a.id),
            "user_id": str(a.user_id) if a.user_id else None,
            "action": a.action,
            "entity_type": a.entity_type,
            "entity_id": str(a.entity_id) if a.entity_id else None,
            "changes": a.changes,
            "created_at": a.created_at.isoformat(),
        }
        for a in result.scalars().all()
    ]
