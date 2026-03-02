"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Organizations
    op.create_table('organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('website', sa.String(500), nullable=True),
        sa.Column('primary_sport', sa.String(50), server_default='soccer'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index('ix_organizations_slug', 'organizations', ['slug'])

    # Users
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='athlete'),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('is_verified', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Memberships
    op.create_table('memberships',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('org_role', sa.String(20), nullable=False, server_default='member'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )

    # Coaches
    op.create_table('coaches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('display_name', sa.String(255), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('sport', sa.String(50), server_default='soccer'),
        sa.Column('specialties', postgresql.ARRAY(sa.String()), server_default='{}'),
        sa.Column('certifications', postgresql.ARRAY(sa.String()), server_default='{}'),
        sa.Column('rating', sa.Float(), server_default='0.0'),
        sa.Column('review_count', sa.Integer(), server_default='0'),
        sa.Column('is_verified', sa.Boolean(), server_default='false'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('hourly_rate_min', sa.Float(), nullable=True),
        sa.Column('hourly_rate_max', sa.Float(), nullable=True),
        sa.Column('age_groups', postgresql.ARRAY(sa.String()), server_default='{}'),
        sa.Column('skill_levels', postgresql.ARRAY(sa.String()), server_default='{}'),
        sa.Column('metadata_json', postgresql.JSONB(), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_coaches_sport', 'coaches', ['sport'])

    # Coach Locations
    op.create_table('coach_locations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('province', sa.String(50), nullable=True),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('is_primary', sa.Boolean(), server_default='false'),
        sa.Column('h3_index_r8', sa.String(20), nullable=True),
        sa.Column('h3_index_r7', sa.String(20), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['coach_id'], ['coaches.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_coach_locations_h3_r8', 'coach_locations', ['h3_index_r8'])
    op.create_index('ix_coach_locations_city', 'coach_locations', ['city'])

    # Events
    op.create_table('events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('event_type', sa.String(30), nullable=False),
        sa.Column('sport', sa.String(50), server_default='soccer'),
        sa.Column('venue_name', sa.String(255), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('province', sa.String(50), nullable=True),
        sa.Column('geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('h3_index_r8', sa.String(20), nullable=True),
        sa.Column('h3_index_r7', sa.String(20), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('capacity', sa.Integer(), server_default='20'),
        sa.Column('spots_filled', sa.Integer(), server_default='0'),
        sa.Column('price_cents', sa.Integer(), server_default='0'),
        sa.Column('currency', sa.String(3), server_default='CAD'),
        sa.Column('age_min', sa.Integer(), nullable=True),
        sa.Column('age_max', sa.Integer(), nullable=True),
        sa.Column('skill_levels', postgresql.ARRAY(sa.String()), server_default='{}'),
        sa.Column('tags', postgresql.ARRAY(sa.String()), server_default='{}'),
        sa.Column('cover_image_url', sa.Text(), nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default='true'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('metadata_json', postgresql.JSONB(), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['coach_id'], ['coaches.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_events_type', 'events', ['event_type'])
    op.create_index('ix_events_sport', 'events', ['sport'])
    op.create_index('ix_events_h3_r8', 'events', ['h3_index_r8'])
    op.create_index('ix_events_start_date', 'events', ['start_date'])

    # Event Occurrences
    op.create_table('event_occurrences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('is_cancelled', sa.Boolean(), server_default='false'),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
    )

    # Leads
    op.create_table('leads',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('lead_type', sa.String(30), server_default='request_info'),
        sa.Column('geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('h3_index_r8', sa.String(20), nullable=True),
        sa.Column('preferred_sport', sa.String(50), nullable=True),
        sa.Column('preferred_type', sa.String(30), nullable=True),
        sa.Column('preferred_age_group', sa.String(20), nullable=True),
        sa.Column('preferred_skill_level', sa.String(20), nullable=True),
        sa.Column('preferred_max_price', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(20), server_default='new'),
        sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['coach_id'], ['coaches.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_leads_h3_r8', 'leads', ['h3_index_r8'])

    # Bookings
    op.create_table('bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(20), server_default='confirmed'),
        sa.Column('amount_cents', sa.Integer(), server_default='0'),
        sa.Column('booked_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
    )

    # Search Logs
    op.create_table('search_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('query_text', sa.String(500), nullable=True),
        sa.Column('sport', sa.String(50), nullable=True),
        sa.Column('event_type', sa.String(30), nullable=True),
        sa.Column('age_group', sa.String(20), nullable=True),
        sa.Column('skill_level', sa.String(20), nullable=True),
        sa.Column('geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('h3_index_r8', sa.String(20), nullable=True),
        sa.Column('search_radius_km', sa.Float(), nullable=True),
        sa.Column('results_count', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_search_logs_h3_r8', 'search_logs', ['h3_index_r8'])

    # Favorites
    op.create_table('favorites',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['coach_id'], ['coaches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
    )

    # Geo Cell Metrics
    op.create_table('geo_cell_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('h3_index', sa.String(20), nullable=False),
        sa.Column('resolution', sa.Integer(), server_default='8'),
        sa.Column('metric_date', sa.Date(), nullable=False),
        sa.Column('center_lat', sa.Float(), nullable=False),
        sa.Column('center_lng', sa.Float(), nullable=False),
        sa.Column('coach_count', sa.Integer(), server_default='0'),
        sa.Column('event_count', sa.Integer(), server_default='0'),
        sa.Column('total_capacity', sa.Integer(), server_default='0'),
        sa.Column('supply_score', sa.Float(), server_default='0.0'),
        sa.Column('search_count', sa.Integer(), server_default='0'),
        sa.Column('lead_count', sa.Integer(), server_default='0'),
        sa.Column('waitlist_count', sa.Integer(), server_default='0'),
        sa.Column('demand_score', sa.Float(), server_default='0.0'),
        sa.Column('underserved_score', sa.Float(), server_default='0.0'),
        sa.Column('hotspot_score', sa.Float(), server_default='0.0'),
        sa.Column('conversion_rate', sa.Float(), server_default='0.0'),
        sa.Column('booking_count', sa.Integer(), server_default='0'),
        sa.Column('fill_rate', sa.Float(), server_default='0.0'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_geo_cells_h3', 'geo_cell_metrics', ['h3_index'])
    op.create_index('ix_geo_cells_date', 'geo_cell_metrics', ['metric_date'])

    # Recommendations
    op.create_table('recommendations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('h3_index', sa.String(20), nullable=False),
        sa.Column('resolution', sa.Integer(), server_default='8'),
        sa.Column('center_lat', sa.Float(), nullable=False),
        sa.Column('center_lng', sa.Float(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('recommended_event_type', sa.String(30), nullable=False),
        sa.Column('recommended_sport', sa.String(50), server_default='soccer'),
        sa.Column('recommended_age_group', sa.String(20), nullable=True),
        sa.Column('ideal_days', sa.String(100), nullable=True),
        sa.Column('ideal_time_start', sa.String(10), nullable=True),
        sa.Column('ideal_time_end', sa.String(10), nullable=True),
        sa.Column('suggested_capacity', sa.Integer(), nullable=True),
        sa.Column('suggested_price_cents', sa.Integer(), nullable=True),
        sa.Column('predicted_fill_rate', sa.Float(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('expected_revenue_cents', sa.Integer(), nullable=True),
        sa.Column('explanation', postgresql.JSONB(), server_default='{}'),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_recommendations_h3', 'recommendations', ['h3_index'])

    # Feature Flags
    op.create_table('feature_flags',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('flag_key', sa.String(100), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), server_default='false'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_feature_flags_key', 'feature_flags', ['flag_key'])

    # Audit Logs
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('changes', postgresql.JSONB(), server_default='{}'),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('feature_flags')
    op.drop_table('recommendations')
    op.drop_table('geo_cell_metrics')
    op.drop_table('favorites')
    op.drop_table('search_logs')
    op.drop_table('bookings')
    op.drop_table('leads')
    op.drop_table('event_occurrences')
    op.drop_table('events')
    op.drop_table('coach_locations')
    op.drop_table('coaches')
    op.drop_table('memberships')
    op.drop_table('users')
    op.drop_table('organizations')
