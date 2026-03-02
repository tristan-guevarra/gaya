"""Celery app configuration."""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "tenpo_atlas",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Toronto",
    enable_utc=True,
    beat_schedule={
        "nightly-geo-aggregation": {
            "task": "app.workers.tasks.nightly_geo_aggregation",
            "schedule": crontab(hour=2, minute=0),  # 2 AM nightly
        },
        "regenerate-recommendations": {
            "task": "app.workers.tasks.regenerate_recommendations_task",
            "schedule": crontab(hour=3, minute=0),  # 3 AM nightly
        },
    },
)
