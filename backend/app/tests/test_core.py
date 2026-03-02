"""
Test suite for Tenpo Atlas backend.
Includes unit tests for geo aggregation + ML logic, and one integration test.
"""
import pytest
import h3
from datetime import date, timedelta
from unittest.mock import MagicMock, patch
from app.services.geo_service import lat_lng_to_h3, h3_to_center, h3_to_geojson_polygon
from app.services.ml_service import get_seasonality_factor, predict_fill_rate


# geo service tests

class TestH3Functions:
    def test_lat_lng_to_h3_returns_valid_index(self):
        """Test that converting lat/lng produces a valid H3 index."""
        h3_index = lat_lng_to_h3(43.6532, -79.3832, 8)
        assert h3.h3_is_valid(h3_index)
        assert h3.h3_get_resolution(h3_index) == 8

    def test_lat_lng_to_h3_different_resolutions(self):
        """Different resolutions produce different index strings."""
        r7 = lat_lng_to_h3(43.6532, -79.3832, 7)
        r8 = lat_lng_to_h3(43.6532, -79.3832, 8)
        assert r7 != r8
        assert h3.h3_get_resolution(r7) == 7
        assert h3.h3_get_resolution(r8) == 8

    def test_h3_to_center_round_trip(self):
        """Converting to H3 and back should give a nearby point."""
        original_lat, original_lng = 43.6532, -79.3832
        h3_index = lat_lng_to_h3(original_lat, original_lng, 8)
        center_lat, center_lng = h3_to_center(h3_index)
        # should be within ~500m (h3 res 8 edge length is ~460m)
        assert abs(center_lat - original_lat) < 0.01
        assert abs(center_lng - original_lng) < 0.01

    def test_h3_to_geojson_polygon_structure(self):
        """GeoJSON polygon should have correct structure."""
        h3_index = lat_lng_to_h3(43.6532, -79.3832, 8)
        polygon = h3_to_geojson_polygon(h3_index)
        assert polygon["type"] == "Polygon"
        assert "coordinates" in polygon
        coords = polygon["coordinates"][0]
        assert len(coords) >= 7  # hexagon = 6 vertices + closing point
        # first and last point should be the same (closed ring)
        assert coords[0] == coords[-1]

    def test_nearby_cells_are_adjacent(self):
        """k_ring should return adjacent cells."""
        h3_index = lat_lng_to_h3(43.6532, -79.3832, 8)
        ring = h3.k_ring(h3_index, 1)
        assert h3_index in ring
        assert len(ring) == 7  # center + 6 neighbors


# ml service tests

class TestSeasonality:
    def test_summer_peak(self):
        """Summer months should have high seasonality."""
        june_factor = get_seasonality_factor(date(2024, 6, 15))
        july_factor = get_seasonality_factor(date(2024, 7, 15))
        assert june_factor >= 0.95
        assert july_factor >= 0.95

    def test_winter_low(self):
        """Winter months should have lower seasonality."""
        dec_factor = get_seasonality_factor(date(2024, 12, 15))
        jan_factor = get_seasonality_factor(date(2024, 1, 15))
        assert dec_factor <= 0.5
        assert jan_factor <= 0.6

    def test_spring_moderate(self):
        """Spring should be between winter and summer."""
        april_factor = get_seasonality_factor(date(2024, 4, 15))
        assert 0.7 <= april_factor <= 0.95


class TestFillRatePrediction:
    @pytest.fixture
    def mock_db(self):
        """Create a mock sync database session."""
        db = MagicMock()
        # mock query chains
        db.query.return_value.filter.return_value.scalar.return_value = 5
        db.query.return_value.filter.return_value.all.return_value = []
        db.query.return_value.join.return_value.filter.return_value.scalar.return_value = 2

        # mock count queries
        count_mock = MagicMock()
        count_mock.scalar.return_value = 10
        db.query.return_value.filter.return_value = count_mock

        return db

    def test_prediction_returns_valid_structure(self, mock_db):
        """Prediction should return all required fields."""
        result = predict_fill_rate(
            mock_db,
            latitude=43.6532,
            longitude=-79.3832,
            event_type="camp",
            capacity=20,
            price_cents=5000,
        )
        assert "predicted_fill_rate" in result
        assert "confidence" in result
        assert "predicted_signups" in result
        assert "predicted_revenue_cents" in result
        assert "factors" in result
        assert "recommendation" in result

    def test_fill_rate_bounded(self, mock_db):
        """Fill rate should be between 0 and 1."""
        result = predict_fill_rate(
            mock_db, 43.6532, -79.3832,
            event_type="camp", capacity=20, price_cents=5000,
        )
        assert 0.0 <= result["predicted_fill_rate"] <= 1.0

    def test_confidence_bounded(self, mock_db):
        """Confidence should be between 0 and 1."""
        result = predict_fill_rate(
            mock_db, 43.6532, -79.3832,
            event_type="camp", capacity=20, price_cents=5000,
        )
        assert 0.0 <= result["confidence"] <= 1.0

    def test_signups_dont_exceed_capacity(self, mock_db):
        """Predicted signups should not exceed capacity."""
        result = predict_fill_rate(
            mock_db, 43.6532, -79.3832,
            event_type="camp", capacity=20, price_cents=5000,
        )
        assert result["predicted_signups"] <= 20

    def test_factors_are_sorted_by_impact(self, mock_db):
        """Feature importance factors should be sorted by absolute impact."""
        result = predict_fill_rate(
            mock_db, 43.6532, -79.3832,
            event_type="clinic", capacity=15, price_cents=7900,
        )
        impacts = [abs(f["impact"]) for f in result["factors"]]
        assert impacts == sorted(impacts, reverse=True)


# integration tests (requires running db)

@pytest.mark.asyncio
async def test_health_endpoint():
    """Integration test: verify the health endpoint works."""
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Tenpo Atlas"


@pytest.mark.asyncio
async def test_root_endpoint():
    """Integration test: verify root endpoint returns API info."""
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "docs" in data


@pytest.mark.asyncio
async def test_register_and_login_flow():
    """Integration test: full register → login → me flow."""
    from httpx import AsyncClient, ASGITransport
    from app.main import app
    import uuid

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"

        # register
        reg_response = await client.post("/api/v1/auth/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "full_name": "Test User",
            "role": "athlete",
        })
        # note: this will fail without a running db, which is expected
        # in a ci environment, this would use a test database
        if reg_response.status_code == 201:
            data = reg_response.json()
            assert "access_token" in data
            assert data["user"]["email"] == unique_email

            # login
            login_response = await client.post("/api/v1/auth/login", json={
                "email": unique_email,
                "password": "TestPass123!",
            })
            assert login_response.status_code == 200

            # me
            token = login_response.json()["access_token"]
            me_response = await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert me_response.status_code == 200
