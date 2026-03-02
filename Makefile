.PHONY: up down build migrate seed test test-backend test-frontend logs shell-backend shell-db

# ─── Launch ───────────────────────────────────────────────
up:
	docker compose up -d --build
	@echo "✅ Tenpo Atlas running at http://localhost:3000"
	@echo "📡 API docs at http://localhost:8000/docs"

down:
	docker compose down -v

build:
	docker compose build --no-cache

restart:
	docker compose restart

# ─── Database ─────────────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head

migrate-create:
	docker compose exec backend alembic revision --autogenerate -m "$(msg)"

seed:
	docker compose exec backend python -m scripts.seed_data

reset-db:
	docker compose down -v
	docker compose up -d postgres redis
	sleep 3
	docker compose up -d backend
	sleep 2
	$(MAKE) migrate
	$(MAKE) seed

# ─── Testing ──────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	docker compose exec backend pytest app/tests/ -v --tb=short

test-frontend:
	cd frontend && npm test -- --watchAll=false

# ─── Utilities ────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U tenpo -d tenpo_atlas

# ─── Workers ──────────────────────────────────────────────
worker-logs:
	docker compose logs -f celery-worker

trigger-aggregation:
	docker compose exec backend python -c "from app.workers.tasks import nightly_geo_aggregation; nightly_geo_aggregation.delay()"
