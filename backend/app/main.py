"""
Tenpo Atlas — FastAPI Application
Training Discovery Map + Geospatial Intelligence Layer
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.v1.router import api_router

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.APP_NAME} starting up ({settings.ENV})")
    yield
    logger.info(f"👋 {settings.APP_NAME} shutting down")


app = FastAPI(
    title="Tenpo Atlas API",
    description="Training Discovery Map + Geospatial Intelligence Layer. "
                "Find coaches, camps, clinics, and private training by location. "
                "Powered by PostGIS + H3 hex indexing + ML-driven expansion intelligence.",
    version="1.0.0",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME, "version": "1.0.0"}


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "Tenpo Atlas API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
