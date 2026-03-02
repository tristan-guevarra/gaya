# gaya

**geospatial intelligence platform for sports training**

discover. analyze. expand.

---

## why i built this

i kept seeing the same gap in youth sports — parents have no easy way to find quality coaches, camps, and clinics nearby, and training academies have zero data on where demand actually is. coaches are setting up in oversaturated areas while entire neighborhoods go underserved.

gaya solves both sides. for families, it's a discovery map — search by sport, age, skill level, distance, and find verified coaches instantly. for academies and operators, it's a full geospatial intelligence layer — hex-grid supply/demand analysis, underserved zone detection, expansion recommendations with confidence scores, demand forecasting, and a what-if simulator to model the impact of launching at a new location before committing.

the goal was to build something that feels like google maps meets a business intelligence tool, purpose-built for the sports training market.

---

## what it does

### discovery map
- interactive map with clustered markers and h3 hexagonal heatmap overlays
- advanced filters: sport, type, age group, skill level, price range, distance, availability
- coach profiles with verification badges, ratings, certifications
- event pages with schedule, capacity, pricing, waitlist
- save favorites, share map views via url
- lead capture with "request info" and "join waitlist"

### geospatial intelligence (admin)
- supply vs demand hex-grid analysis
- underserved zone identification with confidence scores
- high-conversion corridor mapping
- top expansion zone recommendations with "why" explanations
- territory management and assignment
- competitive intel tracking
- daily automated metric recomputation via celery

### ai/ml layer
- demand forecasting with seasonal rolling averages by h3 cell
- fill-rate prediction using gradient boosting with feature importance
- what-if simulator — model the impact of adding a camp at any location
- ai coach matching with weighted scoring algorithm

### crm & growth
- kanban lead pipeline
- customer health scoring and nps tracking
- cohort analysis with retention heatmaps and ltv
- parent portal with athlete profiles

### revenue & finance
- mrr waterfall and revenue attribution
- unit economics and runway projections
- a/b testing lab with statistical confidence
- investor data room with redact toggle

### operational features
- smart calendar with ai scheduling suggestions
- qr check-in for sessions
- content studio with ai-powered generation
- gamification hub (xp, levels, achievements)
- real-time collaboration with live cursors
- automated workflows builder
- 40+ dashboard pages total

---

## tech stack

| layer | tech |
|-------|------|
| frontend | next.js 14 (app router), typescript, tailwind css |
| maps | mapbox gl js (with leaflet/osm fallback) |
| charts | recharts |
| forms | react hook form + zod |
| data fetching | tanstack query |
| backend | fastapi (python 3.11) |
| database | postgresql 16 + postgis 3.4 |
| geo indexing | h3 (uber's hexagonal grid) |
| cache/queue | redis 7 |
| workers | celery |
| auth | jwt + refresh tokens (bcrypt) |
| migrations | alembic |
| infra | docker compose |

---

## getting started

### prerequisites
- docker & docker compose

### 1. clone and configure

```bash
git clone https://github.com/tristan-guevarra/gaya.git
cd gaya
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 2. start everything

```bash
make up
make migrate
make seed
```

### 3. open it up

| service | url |
|---------|-----|
| frontend | http://localhost:3000 |
| api | http://localhost:8000 |
| api docs | http://localhost:8000/docs |
| celery monitor | http://localhost:5555 |

**demo logins:**

| role | email | password |
|------|-------|----------|
| super admin | admin@tenpo.com | TenpoAdmin2024! |
| academy owner | coach@academy.com | CoachPass2024! |
| athlete/parent | athlete@example.com | AthletePass2024! |

---

## project structure

```
gaya/
├── frontend/                      # next.js app
│   └── src/
│       ├── app/                   # pages (app router)
│       │   ├── (auth)/            # login, onboarding
│       │   ├── (dashboard)/       # all dashboard views (40+ pages)
│       │   ├── (public)/          # discovery map, pricing, changelog
│       │   ├── coaches/           # coach detail pages
│       │   └── events/            # event detail pages
│       ├── components/            # map, ui, shared, collaboration
│       ├── hooks/                 # custom react hooks
│       ├── lib/                   # api client, auth, utils
│       └── types/                 # typescript definitions
│
├── backend/                       # fastapi app
│   ├── app/
│   │   ├── api/v1/endpoints/      # route handlers
│   │   ├── core/                  # config, security, database
│   │   ├── models/                # sqlalchemy + postgis models
│   │   ├── schemas/               # pydantic schemas
│   │   ├── services/              # geo service, ml service
│   │   ├── workers/               # celery tasks
│   │   └── tests/                 # unit + integration tests
│   ├── alembic/                   # database migrations
│   └── scripts/                   # seed data generator
│
├── docker/                        # init scripts (postgis)
├── docker-compose.yml
├── Makefile
└── docs/                          # product + technical docs
```

---

## useful commands

```bash
make up          # start all services
make down        # stop all services
make logs        # tail logs
make migrate     # run database migrations
make seed        # generate demo data
make test        # run all tests
```

---

## api overview

| method | path | what it does |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | login with email/password |
| POST | `/api/v1/auth/register` | create account |
| GET | `/api/v1/map/tiles` | geojson map tiles |
| GET | `/api/v1/map/heatmap` | h3 heatmap data |
| GET | `/api/v1/coaches` | list coaches with filters |
| GET | `/api/v1/coaches/{id}` | coach detail + analytics |
| GET | `/api/v1/events` | list events |
| GET | `/api/v1/events/{id}` | event detail |
| GET | `/api/v1/intelligence/zones` | zone intelligence data |
| GET | `/api/v1/intelligence/recommendations` | expansion recommendations |
| POST | `/api/v1/intelligence/simulate` | what-if simulator |

full swagger docs at `/docs` when the backend is running.

---

## architecture

```
┌─────────────────────────────────────────────────────────┐
│                    next.js frontend                       │
│  discovery map  |  coach profiles  |  admin intelligence  │
├─────────────────────────────────────────────────────────┤
│                    fastapi backend                        │
│  rest api  |  jwt auth  |  rbac  |  geojson  |  ml       │
├──────────────┬──────────────┬───────────────────────────┤
│  postgresql  │    redis     │   celery workers           │
│  + postgis   │   cache/q    │   nightly aggregation      │
│  + h3 index  │              │   ml recomputation         │
└──────────────┴──────────────┴───────────────────────────┘
```

---

## license

proprietary. all rights reserved.
