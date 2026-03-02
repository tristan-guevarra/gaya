"""
Background tasks for nightly geo metric aggregation and recommendation generation.
These run via Celery Beat on a schedule.
"""
import logging
from datetime import date
from app.workers.celery_app import celery_app
from app.core.database import SyncSessionLocal
from app.services.geo_service import compute_cell_metrics_sync, lat_lng_to_h3, h3_to_center
from app.services.ml_service import generate_recommendations
from app.models.geo import GeoCellMetric, Recommendation
from app.models.coach import CoachLocation
from app.models.event import Event
from app.models.lead import Lead, SearchLog
import h3 as h3lib

logger = logging.getLogger(__name__)


@celery_app.task(name="app.workers.tasks.nightly_geo_aggregation")
def nightly_geo_aggregation():
    """
    Nightly job: compute supply/demand/hotspot metrics for every active H3 cell.
    Stores results in geo_cell_metrics table for fast GeoJSON serving.
    """
    logger.info("🌍 Starting nightly geo aggregation...")
    db = SyncSessionLocal()
    today = date.today()

    try:
        # Collect all active H3 cells from coaches, events, leads, searches
        all_cells = set()

        coach_cells = db.query(CoachLocation.h3_index_r8).distinct().filter(
            CoachLocation.h3_index_r8.isnot(None)
        ).all()
        for (cell,) in coach_cells:
            all_cells.add(cell)
            for n in h3lib.k_ring(cell, 1):
                all_cells.add(n)

        event_cells = db.query(Event.h3_index_r8).distinct().filter(
            Event.h3_index_r8.isnot(None)
        ).all()
        for (cell,) in event_cells:
            all_cells.add(cell)
            for n in h3lib.k_ring(cell, 1):
                all_cells.add(n)

        lead_cells = db.query(Lead.h3_index_r8).distinct().filter(
            Lead.h3_index_r8.isnot(None)
        ).all()
        for (cell,) in lead_cells:
            all_cells.add(cell)

        search_cells = db.query(SearchLog.h3_index_r8).distinct().filter(
            SearchLog.h3_index_r8.isnot(None)
        ).all()
        for (cell,) in search_cells:
            all_cells.add(cell)

        logger.info(f"Processing {len(all_cells)} H3 cells")

        # Delete today's metrics if re-running
        db.query(GeoCellMetric).filter(
            GeoCellMetric.metric_date == today
        ).delete()
        db.commit()

        # Compute metrics for each cell
        count = 0
        for h3_index in all_cells:
            metrics = compute_cell_metrics_sync(db, h3_index, today)
            metric = GeoCellMetric(**metrics)
            db.add(metric)
            count += 1

            # Batch commit every 100
            if count % 100 == 0:
                db.commit()
                logger.info(f"  Processed {count} cells...")

        db.commit()
        logger.info(f"✅ Geo aggregation complete: {count} cells processed")
        return {"status": "success", "cells_processed": count}

    except Exception as e:
        logger.error(f"❌ Geo aggregation failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.regenerate_recommendations_task")
def regenerate_recommendations_task():
    """
    Nightly job: generate fresh expansion recommendations based on latest metrics.
    """
    logger.info("🤖 Starting recommendation generation...")
    db = SyncSessionLocal()

    try:
        # Deactivate old recommendations
        db.query(Recommendation).filter(
            Recommendation.is_active == True
        ).update({"is_active": False})
        db.commit()

        # Generate new ones
        recs = generate_recommendations(db, top_n=10)

        for rec_data in recs:
            rec = Recommendation(**rec_data)
            db.add(rec)

        db.commit()
        logger.info(f"✅ Generated {len(recs)} recommendations")
        return {"status": "success", "recommendations": len(recs)}

    except Exception as e:
        logger.error(f"❌ Recommendation generation failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()
