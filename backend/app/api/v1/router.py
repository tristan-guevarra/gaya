"""Aggregate all v1 routers."""
from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.map_api import router as map_router
from app.api.v1.endpoints.coaches import router as coaches_router
from app.api.v1.endpoints.events import router as events_router
from app.api.v1.endpoints.intelligence import router as intel_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(map_router)
api_router.include_router(coaches_router)
api_router.include_router(events_router)
api_router.include_router(intel_router)
