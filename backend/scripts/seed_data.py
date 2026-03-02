"""
Seed data generator: realistic soccer training ecosystem across Toronto / GTA.
Generates orgs, coaches, events, leads, searches, bookings, and pre-computed geo metrics.
"""
import uuid
import random
import h3
from datetime import datetime, date, time, timedelta, timezone
from sqlalchemy import func
from app.core.database import SyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, Organization, Membership
from app.models.coach import Coach, CoachLocation
from app.models.event import Event, EventOccurrence
from app.models.lead import Lead, Booking, SearchLog
from app.models.geo import GeoCellMetric, Recommendation, FeatureFlag
from app.services.geo_service import lat_lng_to_h3, compute_cell_metrics_sync

random.seed(42)

# toronto / gta neighborhoods with approximate centroids
NEIGHBORHOODS = [
    {"name": "Downtown Toronto", "lat": 43.6532, "lng": -79.3832, "density": "high"},
    {"name": "North York", "lat": 43.7615, "lng": -79.4111, "density": "high"},
    {"name": "Scarborough", "lat": 43.7731, "lng": -79.2577, "density": "medium"},
    {"name": "Etobicoke", "lat": 43.6205, "lng": -79.5132, "density": "medium"},
    {"name": "Mississauga", "lat": 43.5890, "lng": -79.6441, "density": "high"},
    {"name": "Brampton", "lat": 43.7315, "lng": -79.7624, "density": "medium"},
    {"name": "Vaughan", "lat": 43.8361, "lng": -79.4983, "density": "low"},
    {"name": "Markham", "lat": 43.8561, "lng": -79.3370, "density": "medium"},
    {"name": "Richmond Hill", "lat": 43.8828, "lng": -79.4403, "density": "low"},
    {"name": "Oakville", "lat": 43.4675, "lng": -79.6877, "density": "low"},
    {"name": "Ajax", "lat": 43.8509, "lng": -79.0204, "density": "low"},
    {"name": "Pickering", "lat": 43.8354, "lng": -79.0868, "density": "low"},
    {"name": "Thornhill", "lat": 43.8100, "lng": -79.4200, "density": "low"},
    {"name": "East York", "lat": 43.6910, "lng": -79.3278, "density": "medium"},
    {"name": "The Beaches", "lat": 43.6763, "lng": -79.2957, "density": "medium"},
]

VENUES = [
    "Sports Complex", "Athletic Centre", "Recreation Centre", "Soccer Dome",
    "Training Academy", "Community Park", "Turf Field", "Indoor Facility",
    "Sports Pavilion", "Athletic Park", "Soccer Centre", "Field House",
]

FIRST_NAMES = [
    "Marcus", "Sofia", "David", "Priya", "Ahmed", "Jessica", "Carlos", "Mei",
    "Jamal", "Olivia", "Raj", "Emma", "Diego", "Aisha", "Lucas", "Sarah",
    "Andre", "Fatima", "Kevin", "Hannah", "Mohamed", "Isabella", "Yuki", "Alex",
]

LAST_NAMES = [
    "Silva", "Chen", "Patel", "Williams", "Rodriguez", "Kim", "Singh", "Johnson",
    "Santos", "Lee", "Martinez", "Brown", "Ali", "Garcia", "Taylor", "Nguyen",
    "Thompson", "Khan", "Wilson", "Anderson", "Costa", "Park", "Evans", "Wright",
]

SPECIALTIES = [
    "Goalkeeping", "Speed & Agility", "Ball Control", "Tactical Play",
    "Set Pieces", "Defensive Skills", "Attacking Play", "Fitness Conditioning",
    "Youth Development", "Position-Specific", "Game Intelligence", "First Touch",
]

CERTIFICATIONS = [
    "UEFA B License", "UEFA A License", "USSF C License", "USSF B License",
    "CSA Youth License", "CSA National B", "Ontario Soccer License",
    "AFC C License", "KNVB Youth", "Coerver Certified",
]

CAMP_NAMES = [
    "Elite Summer Camp", "Spring Skills Intensive", "Holiday Training Camp",
    "Winter Indoor Academy", "March Break Soccer Blast", "Pre-Season Prep Camp",
    "All-Star Summer Series", "Technical Development Camp", "Striker Academy Camp",
    "Goalkeeper Specialist Week", "Girls Elite Program", "Fall Development Series",
]

CLINIC_NAMES = [
    "Speed & Agility Clinic", "First Touch Masterclass", "Tactical IQ Workshop",
    "Set Piece Specialist", "Defensive Skills Lab", "Finishing Clinic",
    "Goalkeeping Intensive", "Ball Mastery Session", "Game Day Preparation",
    "Position Play Workshop", "Advanced Dribbling Clinic", "Headers & Volleys",
]


def jitter(lat: float, lng: float, km: float = 3.0) -> tuple:
    """Add random offset to coordinates (~km radius)."""
    lat_offset = random.uniform(-km / 111, km / 111)
    lng_offset = random.uniform(-km / 78, km / 78)
    return round(lat + lat_offset, 6), round(lng + lng_offset, 6)


def run_seed():
    db = SyncSessionLocal()
    print("🌱 Seeding Tenpo Atlas database with Toronto/GTA data...")

    try:
        # demo users
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@tenpo.com",
            hashed_password=hash_password("TenpoAdmin2024!"),
            full_name="Tenpo Admin",
            role="superadmin",
            is_active=True,
            is_verified=True,
        )
        coach_user = User(
            id=uuid.uuid4(),
            email="coach@academy.com",
            hashed_password=hash_password("CoachPass2024!"),
            full_name="Demo Coach",
            role="coach",
            is_active=True,
            is_verified=True,
        )
        athlete_user = User(
            id=uuid.uuid4(),
            email="athlete@example.com",
            hashed_password=hash_password("AthletePass2024!"),
            full_name="Demo Athlete",
            role="athlete",
            is_active=True,
        )
        db.add_all([admin_user, coach_user, athlete_user])
        db.flush()
        print("  ✅ Created 3 demo users")

        # organizations
        orgs = []
        org_names = [
            ("Toronto FC Academy", "tfc-academy"),
            ("Mississauga Soccer Club", "mississauga-sc"),
            ("GTA Elite Training", "gta-elite"),
            ("North York Football Academy", "north-york-fa"),
            ("Scarborough United FC", "scarborough-united"),
            ("Brampton City Soccer", "brampton-city"),
            ("Oakville Soccer Academy", "oakville-sa"),
        ]
        for name, slug in org_names:
            org = Organization(
                id=uuid.uuid4(), name=name, slug=slug,
                description=f"Premier soccer training at {name}",
                primary_sport="soccer", is_active=True,
            )
            orgs.append(org)
            db.add(org)

        db.flush()
        print(f"  ✅ Created {len(orgs)} organizations")

        # link demo coach to first org
        db.add(Membership(user_id=coach_user.id, organization_id=orgs[0].id, org_role="admin"))

        # coaches (40 across gta)
        coaches = []
        for i in range(40):
            org = random.choice(orgs)
            neighborhood = random.choice(NEIGHBORHOODS)
            lat, lng = jitter(neighborhood["lat"], neighborhood["lng"], km=2.5)

            # create user for this coach
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            coach_u = User(
                id=uuid.uuid4(),
                email=f"{fname.lower()}.{lname.lower()}{i}@example.com",
                hashed_password=hash_password("CoachPass123!"),
                full_name=f"{fname} {lname}",
                role="coach",
                is_active=True,
                is_verified=random.random() > 0.3,
            )
            db.add(coach_u)
            db.flush()

            db.add(Membership(user_id=coach_u.id, organization_id=org.id, org_role="member"))

            num_specialties = random.randint(2, 4)
            num_certs = random.randint(1, 3)
            age_groups = random.sample(["U6", "U8", "U10", "U12", "U14", "U16", "U18", "Adult"], k=random.randint(2, 5))
            skill_levels = random.sample(["beginner", "intermediate", "elite"], k=random.randint(1, 3))

            coach = Coach(
                id=uuid.uuid4(),
                user_id=coach_u.id,
                organization_id=org.id,
                display_name=f"{fname} {lname}",
                bio=f"Experienced soccer coach specializing in youth development. Based in {neighborhood['name']}.",
                sport="soccer",
                specialties=random.sample(SPECIALTIES, num_specialties),
                certifications=random.sample(CERTIFICATIONS, num_certs),
                rating=round(random.uniform(3.5, 5.0), 1),
                review_count=random.randint(5, 120),
                is_verified=random.random() > 0.3,
                is_active=True,
                hourly_rate_min=random.choice([40, 50, 60, 75]),
                hourly_rate_max=random.choice([80, 100, 120, 150]),
                age_groups=sorted(age_groups),
                skill_levels=skill_levels,
            )
            db.add(coach)
            db.flush()

            # primary location
            h3_r8 = lat_lng_to_h3(lat, lng, 8)
            h3_r7 = lat_lng_to_h3(lat, lng, 7)
            venue = f"{neighborhood['name']} {random.choice(VENUES)}"
            loc = CoachLocation(
                coach_id=coach.id,
                name=venue,
                address=f"{random.randint(100, 9999)} {neighborhood['name']} Rd",
                city=neighborhood["name"],
                province="ON",
                latitude=lat, longitude=lng,
                is_primary=True,
                h3_index_r8=h3_r8, h3_index_r7=h3_r7,
                geom=f"SRID=4326;POINT({lng} {lat})",
            )
            db.add(loc)

            # some coaches have 2nd location
            if random.random() > 0.6:
                nb2 = random.choice(NEIGHBORHOODS)
                lat2, lng2 = jitter(nb2["lat"], nb2["lng"], km=2)
                loc2 = CoachLocation(
                    coach_id=coach.id,
                    name=f"{nb2['name']} {random.choice(VENUES)}",
                    city=nb2["name"], province="ON",
                    latitude=lat2, longitude=lng2,
                    is_primary=False,
                    h3_index_r8=lat_lng_to_h3(lat2, lng2, 8),
                    h3_index_r7=lat_lng_to_h3(lat2, lng2, 7),
                    geom=f"SRID=4326;POINT({lng2} {lat2})",
                )
                db.add(loc2)

            coaches.append(coach)

        db.flush()
        print(f"  ✅ Created {len(coaches)} coaches across GTA")

        # events (80 camps/clinics/privates)
        events = []
        today = date.today()

        for i in range(80):
            org = random.choice(orgs)
            coach = random.choice(coaches)
            nb = random.choice(NEIGHBORHOODS)
            lat, lng = jitter(nb["lat"], nb["lng"], km=2)
            event_type = random.choice(["camp", "camp", "clinic", "clinic", "private"])

            if event_type == "camp":
                title = random.choice(CAMP_NAMES)
                capacity = random.choice([15, 20, 25, 30, 40])
                price = random.choice([9900, 14900, 19900, 24900, 29900])
                days_ahead = random.randint(-30, 90)
            elif event_type == "clinic":
                title = random.choice(CLINIC_NAMES)
                capacity = random.choice([10, 12, 15, 20])
                price = random.choice([4900, 5900, 7900, 9900])
                days_ahead = random.randint(-14, 60)
            else:
                title = f"Private Session with {coach.display_name}"
                capacity = random.choice([1, 2, 3])
                price = random.choice([7500, 10000, 12500, 15000])
                days_ahead = random.randint(-7, 30)

            start = today + timedelta(days=days_ahead)
            end = start + timedelta(days=random.choice([1, 3, 5, 7]) if event_type == "camp" else 0)

            spots_filled = min(capacity, int(capacity * random.uniform(0.2, 1.0)))
            age_min = random.choice([5, 6, 7, 8, 10, 12])
            age_max = age_min + random.choice([2, 3, 4, 6])

            h3_r8 = lat_lng_to_h3(lat, lng, 8)
            h3_r7 = lat_lng_to_h3(lat, lng, 7)

            event = Event(
                id=uuid.uuid4(),
                organization_id=org.id,
                coach_id=coach.id,
                title=f"{title} — {nb['name']}",
                description=f"Join us for an exciting {event_type} experience in {nb['name']}. "
                            f"Professional coaching for ages {age_min}-{age_max}.",
                event_type=event_type,
                sport="soccer",
                venue_name=f"{nb['name']} {random.choice(VENUES)}",
                address=f"{random.randint(100, 9999)} {nb['name']} Ave",
                city=nb["name"],
                province="ON",
                latitude=lat, longitude=lng,
                h3_index_r8=h3_r8, h3_index_r7=h3_r7,
                geom=f"SRID=4326;POINT({lng} {lat})",
                start_date=start,
                end_date=end,
                capacity=capacity,
                spots_filled=spots_filled,
                price_cents=price,
                currency="CAD",
                age_min=age_min,
                age_max=age_max,
                skill_levels=random.sample(["beginner", "intermediate", "elite"], k=random.randint(1, 3)),
                tags=random.sample(["outdoor", "indoor", "weekend", "weekday", "summer", "spring"], k=2),
                is_published=True,
                is_active=True,
            )
            db.add(event)
            events.append(event)

        db.flush()
        print(f"  ✅ Created {len(events)} events")

        # leads (200 across gta)
        for i in range(200):
            nb = random.choice(NEIGHBORHOODS)
            lat, lng = jitter(nb["lat"], nb["lng"], km=4)
            h3_idx = lat_lng_to_h3(lat, lng, 8)

            days_ago = random.randint(0, 60)
            lead = Lead(
                id=uuid.uuid4(),
                event_id=random.choice(events).id if random.random() > 0.3 else None,
                coach_id=random.choice(coaches).id if random.random() > 0.5 else None,
                name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                email=f"lead{i}@example.com",
                phone=f"+1416{random.randint(1000000, 9999999)}",
                lead_type=random.choice(["request_info", "request_info", "waitlist", "callback"]),
                latitude=lat, longitude=lng,
                h3_index_r8=h3_idx,
                geom=f"SRID=4326;POINT({lng} {lat})",
                preferred_sport="soccer",
                preferred_type=random.choice(["camp", "clinic", "private"]),
                preferred_age_group=random.choice(["U8", "U10", "U12", "U14"]),
                preferred_skill_level=random.choice(["beginner", "intermediate", "elite"]),
                preferred_max_price=random.choice([5000, 10000, 15000, 20000, 30000]),
                status=random.choice(["new", "new", "contacted", "converted", "lost"]),
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            )
            db.add(lead)

        db.flush()
        print("  ✅ Created 200 leads")

        # bookings (120 mocked)
        for i in range(120):
            event = random.choice(events)
            days_ago = random.randint(0, 45)
            booking = Booking(
                id=uuid.uuid4(),
                user_id=athlete_user.id if random.random() > 0.5 else None,
                event_id=event.id,
                status=random.choice(["confirmed", "confirmed", "completed", "cancelled"]),
                amount_cents=event.price_cents,
                booked_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            )
            db.add(booking)

        db.flush()
        print("  ✅ Created 120 bookings")

        # search logs (500 anonymous)
        for i in range(500):
            nb = random.choice(NEIGHBORHOODS)
            lat, lng = jitter(nb["lat"], nb["lng"], km=5)
            h3_idx = lat_lng_to_h3(lat, lng, 8)
            days_ago = random.randint(0, 30)

            search = SearchLog(
                id=uuid.uuid4(),
                sport="soccer",
                event_type=random.choice(["camp", "clinic", "private", None]),
                age_group=random.choice(["U8", "U10", "U12", "U14", None]),
                skill_level=random.choice(["beginner", "intermediate", "elite", None]),
                latitude=lat, longitude=lng,
                h3_index_r8=h3_idx,
                geom=f"SRID=4326;POINT({lng} {lat})",
                search_radius_km=random.choice([5, 10, 15, 25]),
                results_count=random.randint(0, 30),
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23)),
            )
            db.add(search)

        db.flush()
        print("  ✅ Created 500 search logs")

        # compute geo metrics
        print("  🌍 Computing geo cell metrics...")
        all_cells = set()
        for coach in coaches:
            for loc in db.query(CoachLocation).filter(CoachLocation.coach_id == coach.id).all():
                if loc.h3_index_r8:
                    all_cells.add(loc.h3_index_r8)
                    for n in h3.k_ring(loc.h3_index_r8, 1):
                        all_cells.add(n)

        for event in events:
            if event.h3_index_r8:
                all_cells.add(event.h3_index_r8)
                for n in h3.k_ring(event.h3_index_r8, 1):
                    all_cells.add(n)

        today_date = date.today()
        count = 0
        for cell in all_cells:
            metrics = compute_cell_metrics_sync(db, cell, today_date)
            db.add(GeoCellMetric(**metrics))
            count += 1

        db.flush()
        print(f"  ✅ Computed metrics for {count} H3 cells")

        # feature flags
        flags = [
            ("heatmap_overlay", True, "Enable heatmap overlays on public map"),
            ("what_if_simulator", True, "Enable what-if simulator for admins"),
            ("ai_recommendations", True, "Enable AI-powered expansion recommendations"),
            ("public_search_logging", True, "Log anonymous search queries for demand analysis"),
            ("waitlist_alerts", False, "Enable email alerts for waitlist spots"),
            ("coach_verification_badge", True, "Show verification badges on coach profiles"),
        ]
        for key, enabled, desc in flags:
            db.add(FeatureFlag(flag_key=key, is_enabled=enabled, description=desc))

        db.commit()
        print("  ✅ Created feature flags")
        print("\n🎉 Seed complete! Database is populated with realistic Toronto/GTA data.")
        print("   Demo login: admin@tenpo.com / TenpoAdmin2024!")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
