"""
Application configuration — loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # ─── App ──────────────────────────────────────────────
    APP_NAME: str = "Tenpo Atlas"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ─── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://tenpo:tenpo_secret_2024@localhost:5432/tenpo_atlas"
    DATABASE_URL_SYNC: str = "postgresql://tenpo:tenpo_secret_2024@localhost:5432/tenpo_atlas"

    # ─── Redis ────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── Auth ─────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production"
    JWT_REFRESH_SECRET: str = "change-me-refresh-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS ─────────────────────────────────────────────
    CORS_ORIGINS: str = '["http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    # ─── Geo ──────────────────────────────────────────────
    H3_RESOLUTION: int = 8  # ~460m edge length — good for city-level analysis
    H3_RESOLUTION_COARSE: int = 7  # ~1.2km for broader heatmaps
    DEFAULT_SEARCH_RADIUS_KM: float = 25.0

    # ─── Rate Limiting ────────────────────────────────────
    RATE_LIMIT_PUBLIC: str = "60/minute"
    RATE_LIMIT_AUTH: str = "120/minute"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
