// type definitions for the entire platform

// auth & users

export type UserRole = 'athlete' | 'coach' | 'org_admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; full_name: string; role: UserRole; }

// organizations

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  feature_flags: Record<string, boolean>;
  created_at: string;
}

// coaches

export interface Coach {
  id: string;
  user_id: string;
  organization_id: string;
  display_name: string;
  bio?: string;
  sport: string;
  specialties: string[];
  certifications: string[];
  rating: number;
  review_count: number;
  hourly_rate_cents: number;
  verified: boolean;
  profile_image_url?: string;
  locations: CoachLocation[];
  created_at: string;
}

export interface CoachLocation {
  id: string;
  coach_id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
}

export interface CoachReview {
  id: string;
  coach_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  title: string;
  body: string;
  verified_booking: boolean;
  helpful_count: number;
  created_at: string;
}

// events

export type EventType = 'camp' | 'clinic' | 'private';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type EventStatus = 'draft' | 'published' | 'full' | 'cancelled';

export interface TrainingEvent {
  id: string;
  coach_id: string;
  organization_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  sport: string;
  skill_levels: SkillLevel[];
  age_min?: number;
  age_max?: number;
  latitude: number;
  longitude: number;
  address: string;
  capacity: number;
  enrolled: number;
  price_cents: number;
  start_date: string;
  end_date: string;
  schedule_notes?: string;
  amenities?: string[];
  requirements?: string[];
  status: EventStatus;
  coach?: Coach;
  created_at: string;
}

// map & geo

export interface MapMarker {
  id: string;
  type: 'coach' | 'event';
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
  event_type?: EventType;
  rating?: number;
  price_cents?: number;
  spots_left?: number;
  image_url?: string;
}

export interface MapFilters {
  sport?: string;
  event_type?: EventType | 'all';
  skill_level?: SkillLevel;
  age_min?: number;
  age_max?: number;
  price_min?: number;
  price_max?: number;
  date_from?: string;
  date_to?: string;
  radius_km?: number;
  has_availability?: boolean;
}

export interface HeatmapCell {
  h3_index: string;
  polygon: GeoJSON.Polygon;
  supply_score: number;
  demand_score: number;
  underserved_score: number;
  hotspot_score: number;
}

export type HeatmapLayer = 'supply' | 'demand' | 'underserved' | 'hotspot';

export interface GeoMetrics {
  cell_key: string;
  date: string;
  supply_score: number;
  demand_score: number;
  underserved_score: number;
  hotspot_score: number;
  coach_count: number;
  event_count: number;
  total_capacity: number;
  search_count: number;
  lead_count: number;
}

// intelligence

export interface Recommendation {
  id: string;
  rank: number;
  cell_key: string;
  latitude: number;
  longitude: number;
  area_name: string;
  recommended_event_type: EventType;
  recommended_day: string;
  recommended_time: string;
  predicted_fill_rate: number;
  confidence: number;
  opportunity_score: number;
  explanation: RecommendationFactor[];
  created_at: string;
}

export interface RecommendationFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface WhatIfRequest {
  latitude: number;
  longitude: number;
  event_type: EventType;
  capacity: number;
  price_cents: number;
}

export interface WhatIfResult {
  predicted_fill_rate: number;
  confidence: number;
  predicted_signups: number;
  predicted_revenue_cents: number;
  factors: RecommendationFactor[];
  recommendation: string;
}

// leads

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  preferred_sport: string;
  preferred_event_type?: EventType;
  preferred_age_range?: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  created_at: string;
}

// activity feed / pulse

export type ActivityType =
  | 'booking_created'
  | 'lead_submitted'
  | 'event_published'
  | 'coach_joined'
  | 'review_posted'
  | 'milestone_reached'
  | 'alert_triggered'
  | 'recommendation_generated'
  | 'zone_status_change';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata: Record<string, any>;
  actor_name?: string;
  actor_avatar?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  severity?: 'info' | 'success' | 'warning' | 'critical';
  created_at: string;
}

// admin / feature flags

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  percentage_rollout?: number;
  target_orgs?: string[];
  updated_by?: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, { old: any; new: any }>;
  ip_address?: string;
  created_at: string;
}

export interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  uptime_percent: number;
  last_check: string;
  details?: string;
}

// revenue & forecasting

export interface RevenueForecastPoint {
  date: string;
  actual?: number;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ZoneRevenue {
  zone: string;
  revenue: number;
  bookings: number;
  avg_ticket: number;
  growth: number;
  fill_rate: number;
}

// competitive landscape

export interface ZoneBenchmark {
  zone: string;
  latitude: number;
  longitude: number;
  coach_density: number;
  event_density: number;
  avg_price: number;
  avg_fill_rate: number;
  demand_index: number;
  supply_index: number;
  opportunity_score: number;
  trend: 'rising' | 'stable' | 'declining';
  top_event_type: EventType;
}

// dashboard analytics

export interface DashboardStats {
  total_coaches: number;
  total_events: number;
  total_leads: number;
  total_bookings: number;
  avg_fill_rate: number;
  revenue_this_month: number;
  coaches_trend: number;
  events_trend: number;
  leads_trend: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

// api response wrappers

export interface ApiResponse<T> { data: T; message?: string; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; per_page: number; pages: number; }
export interface ApiError { detail: string; status_code: number; }
