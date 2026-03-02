/* ═══════════════════════════════════════════════════════════
   Gaya — Coach Profile Page
   SEO-friendly coach detail with reviews, schedule grid,
   location map, stats, certification badges, and booking CTA
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, StatCard } from '@/components/ui';
import { cn, formatPrice, formatPercent, renderStars, timeAgo } from '@/lib/utils';
import {
  MapPin, Star, Shield, Calendar, Clock, Users, Award, Heart,
  MessageSquare, Share2, ChevronRight, CheckCircle, ThumbsUp,
  Briefcase, Target, TrendingUp, Mail, Phone, Globe,
  ArrowLeft, Bookmark, Zap, BadgeCheck
} from 'lucide-react';
import type { Coach, CoachReview, TrainingEvent, EventType } from '@/types';

// ─── Mock Coach Data ──────────────────────────────────────

const MOCK_COACH: Coach & {
  tagline: string;
  experience_years: number;
  athletes_trained: number;
  completion_rate: number;
  response_time: string;
  languages: string[];
  social: { instagram?: string; twitter?: string; website?: string };
} = {
  id: 'c1',
  user_id: 'u1',
  organization_id: 'org1',
  display_name: 'Marcus Thompson',
  bio: `Former MLS academy coach with 12+ years developing elite youth talent across the GTA. Specialized in technical skills development, tactical awareness, and mental performance coaching.

My philosophy centers on building confident, creative players who can read the game. Every session is designed with progressive overload — we build skills in layers, from fundamental technique to match-realistic scenarios.

I've worked with players who went on to play at NCAA D1, Canadian Premier League, and national youth teams. But I'm equally passionate about helping recreational players fall in love with the beautiful game.`,
  tagline: 'Building confident, creative players since 2012',
  sport: 'soccer',
  specialties: ['Technical Skills', 'Tactical Awareness', 'Speed & Agility', 'Goalkeeping', 'Set Pieces', 'Mental Performance'],
  certifications: ['UEFA B License', 'Canada Soccer C License', 'First Aid Certified', 'Criminal Background Check'],
  rating: 4.9,
  review_count: 127,
  hourly_rate_cents: 12500,
  verified: true,
  profile_image_url: undefined,
  experience_years: 12,
  athletes_trained: 450,
  completion_rate: 0.96,
  response_time: '< 2 hours',
  languages: ['English', 'French', 'Spanish'],
  social: { instagram: '@marcusthompsonfc', website: 'marcusthompson.ca' },
  locations: [
    { id: 'l1', coach_id: 'c1', label: 'Downsview Park', address: '70 Canuck Ave, North York, ON', latitude: 43.7525, longitude: -79.4740, is_primary: true },
    { id: 'l2', coach_id: 'c1', label: 'Centennial Park', address: '256 Centennial Park Rd, Etobicoke, ON', latitude: 43.6476, longitude: -79.5931, is_primary: false },
    { id: 'l3', coach_id: 'c1', label: 'L\'Amoreaux Sports Complex', address: '155 Birchmount Rd, Scarborough, ON', latitude: 43.8025, longitude: -79.2847, is_primary: false },
  ],
  created_at: '2023-01-15T10:00:00Z',
};

const MOCK_REVIEWS: CoachReview[] = [
  {
    id: 'r1', coach_id: 'c1', reviewer_name: 'Sarah M.', rating: 5,
    title: 'Best coach my son has ever had',
    body: 'Marcus has completely transformed my son\'s confidence on the field. After just 8 sessions, his touch and vision improved dramatically. The way Marcus explains concepts makes it click for kids. Highly recommend for anyone looking to level up their game.',
    verified_booking: true, helpful_count: 24, created_at: '2026-02-15T14:30:00Z',
  },
  {
    id: 'r2', coach_id: 'c1', reviewer_name: 'David K.', rating: 5,
    title: 'Professional, knowledgeable, patient',
    body: 'I trained with Marcus as an adult beginner and never once felt out of place. He adapts his coaching style perfectly. Sessions are always well-structured with clear progressions. Worth every penny.',
    verified_booking: true, helpful_count: 18, created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'r3', coach_id: 'c1', reviewer_name: 'Jennifer T.', rating: 5,
    title: 'Game-changer for our daughter',
    body: 'Our daughter was selected for provincial team tryouts after working with Marcus for 3 months. His attention to detail on technique is unmatched. He also does a great job building mental resilience — our daughter handles pressure so much better now.',
    verified_booking: true, helpful_count: 31, created_at: '2026-01-20T16:00:00Z',
  },
  {
    id: 'r4', coach_id: 'c1', reviewer_name: 'Mike R.', rating: 4,
    title: 'Great sessions, hard to book',
    body: 'Quality of coaching is top-tier, no question. Only reason for 4 stars is availability — Marcus is in very high demand so booking can be tricky. Plan ahead!',
    verified_booking: true, helpful_count: 12, created_at: '2026-01-05T11:00:00Z',
  },
  {
    id: 'r5', coach_id: 'c1', reviewer_name: 'Lisa W.', rating: 5,
    title: 'Camp was incredible',
    body: 'Enrolled both kids (ages 8 and 12) in the summer camp. Both had an amazing time and came home excited every day. Marcus and his assistant coaches created such a positive, high-energy environment. Already signed up for spring.',
    verified_booking: true, helpful_count: 22, created_at: '2025-12-18T13:00:00Z',
  },
];

const MOCK_EVENTS: TrainingEvent[] = [
  {
    id: 'e1', coach_id: 'c1', organization_id: 'org1', title: 'Spring Elite Camp',
    description: '5-day intensive for competitive players', event_type: 'camp', sport: 'soccer',
    skill_levels: ['advanced', 'elite'], age_min: 12, age_max: 17,
    latitude: 43.7525, longitude: -79.4740, address: 'Downsview Park',
    capacity: 24, enrolled: 21, price_cents: 34900,
    start_date: '2026-04-14T09:00:00Z', end_date: '2026-04-18T16:00:00Z',
    status: 'published', created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'e2', coach_id: 'c1', organization_id: 'org1', title: 'Technical Skills Clinic',
    description: 'Focused 3hr session on ball mastery and 1v1 moves', event_type: 'clinic', sport: 'soccer',
    skill_levels: ['intermediate', 'advanced'], age_min: 10, age_max: 15,
    latitude: 43.6476, longitude: -79.5931, address: 'Centennial Park',
    capacity: 16, enrolled: 16, price_cents: 8900,
    start_date: '2026-03-22T10:00:00Z', end_date: '2026-03-22T13:00:00Z',
    status: 'full', created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'e3', coach_id: 'c1', organization_id: 'org1', title: 'Goalkeeper Masterclass',
    description: 'Specialized GK training with video analysis', event_type: 'clinic', sport: 'soccer',
    skill_levels: ['intermediate', 'advanced', 'elite'], age_min: 11, age_max: 18,
    latitude: 43.8025, longitude: -79.2847, address: 'L\'Amoreaux Sports Complex',
    capacity: 8, enrolled: 5, price_cents: 12900,
    start_date: '2026-03-29T09:00:00Z', end_date: '2026-03-29T12:00:00Z',
    status: 'published', created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'e4', coach_id: 'c1', organization_id: 'org1', title: 'Private 1-on-1 Session',
    description: 'Personalized training tailored to your goals', event_type: 'private', sport: 'soccer',
    skill_levels: ['beginner', 'intermediate', 'advanced', 'elite'],
    latitude: 43.7525, longitude: -79.4740, address: 'Downsview Park (or your location)',
    capacity: 1, enrolled: 0, price_cents: 12500,
    start_date: '2026-03-15T00:00:00Z', end_date: '2026-12-31T00:00:00Z',
    status: 'published', created_at: '2026-01-01T00:00:00Z',
  },
];

// ─── Schedule Grid ────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCHEDULE: Record<string, { time: string; label: string; type: EventType }[]> = {
  Mon: [{ time: '4:00 PM', label: 'Private', type: 'private' }],
  Tue: [{ time: '4:00 PM', label: 'Private', type: 'private' }, { time: '6:00 PM', label: 'Clinic', type: 'clinic' }],
  Wed: [],
  Thu: [{ time: '4:00 PM', label: 'Private', type: 'private' }, { time: '6:00 PM', label: 'Clinic', type: 'clinic' }],
  Fri: [{ time: '4:00 PM', label: 'Private', type: 'private' }],
  Sat: [{ time: '9:00 AM', label: 'Camp', type: 'camp' }, { time: '1:00 PM', label: 'Clinic', type: 'clinic' }],
  Sun: [{ time: '10:00 AM', label: 'Camp', type: 'camp' }],
};

// ─── Rating Distribution ─────────────────────────────────

const RATING_DIST = [
  { stars: 5, count: 108, pct: 0.85 },
  { stars: 4, count: 14, pct: 0.11 },
  { stars: 3, count: 4, pct: 0.03 },
  { stars: 2, count: 1, pct: 0.01 },
  { stars: 1, count: 0, pct: 0 },
];

// ─── Type Color Map ───────────────────────────────────────

const typeColors: Record<EventType, string> = {
  camp: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  clinic: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  private: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

// ─── Page Component ───────────────────────────────────────

export default function CoachProfilePage() {
  const coach = MOCK_COACH;
  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'reviews'>('about');
  const [saved, setSaved] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const avgRating = useMemo(() => {
    const total = RATING_DIST.reduce((sum, r) => sum + r.stars * r.count, 0);
    const count = RATING_DIST.reduce((sum, r) => sum + r.count, 0);
    return (total / count).toFixed(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Breadcrumb ─── */}
      <div className="border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/map" className="hover:text-atlas-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Map
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>Coaches</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-secondary">{coach.display_name}</span>
          </div>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-atlas-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-atlas-500/3 rounded-full blur-[120px]" />

        <div className="relative max-w-[1200px] mx-auto px-6 pt-10 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-5xl font-display font-bold text-atlas-400 border border-slate-200">
                  {coach.display_name.split(' ').map(n => n[0]).join('')}
                </div>
                {coach.verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-atlas-500 flex items-center justify-center shadow-lg shadow-atlas-500/30">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display font-bold text-3xl text-text-primary">
                      {coach.display_name}
                    </h1>
                    {coach.verified && (
                      <Badge variant="success" size="sm">
                        <Shield className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-text-secondary mb-3">{coach.tagline}</p>

                  {/* Rating + Meta */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-text-primary">{coach.rating}</span>
                      <span className="text-text-muted">({coach.review_count} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <MapPin className="w-3.5 h-3.5" /> {coach.locations.length} locations
                    </span>
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <Briefcase className="w-3.5 h-3.5" /> {coach.experience_years} years experience
                    </span>
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <Users className="w-3.5 h-3.5" /> {coach.athletes_trained}+ athletes trained
                    </span>
                  </div>
                </div>

                {/* Action buttons (desktop) */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={cn(
                      'w-10 h-10 rounded-xl border flex items-center justify-center transition-all',
                      saved
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-slate-100/50 border-slate-300 text-text-muted hover:text-text-secondary'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', saved && 'fill-red-400')} />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-slate-100/50 border border-slate-300 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Specialties */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {coach.specialties.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/60 shadow-sm text-xs text-text-secondary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Bar ─── */}
      <div className="border-y border-slate-200 bg-slate-50/30">
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'Rating', value: coach.rating.toString(), sub: 'out of 5.0', icon: Star },
              { label: 'Reviews', value: coach.review_count.toString(), sub: 'verified', icon: MessageSquare },
              { label: 'Rate', value: formatPrice(coach.hourly_rate_cents), sub: 'per session', icon: Zap },
              { label: 'Response', value: coach.response_time, sub: 'avg reply', icon: Clock },
              { label: 'Completion', value: formatPercent(coach.completion_rate), sub: 'session rate', icon: Target },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-atlas-500/5 flex items-center justify-center text-atlas-500/60">
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-text-primary leading-none">{stat.value}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="border-b border-slate-200 sticky top-0 bg-gray-50/80 backdrop-blur-xl z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-0">
            {(['about', 'events', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-4 text-sm font-medium capitalize transition-all border-b-2 -mb-px',
                  activeTab === tab
                    ? 'text-atlas-400 border-atlas-500'
                    : 'text-text-muted hover:text-text-secondary border-transparent'
                )}
              >
                {tab}
                {tab === 'events' && (
                  <span className="ml-1.5 text-[10px] bg-atlas-500/10 text-atlas-400 px-1.5 py-0.5 rounded-md">
                    {MOCK_EVENTS.length}
                  </span>
                )}
                {tab === 'reviews' && (
                  <span className="ml-1.5 text-[10px] bg-slate-100/50 text-text-muted px-1.5 py-0.5 rounded-md">
                    {coach.review_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'about' && (
              <>
                {/* Bio */}
                <Card>
                  <h2 className="font-display font-semibold text-lg text-text-primary mb-4">About</h2>
                  <div className="prose-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {coach.bio}
                  </div>
                </Card>

                {/* Certifications */}
                <Card>
                  <h2 className="font-display font-semibold text-lg text-text-primary mb-4">Certifications & Credentials</h2>
                  <div className="space-y-3">
                    {coach.certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-atlas-500/10 flex items-center justify-center">
                          <Award className="w-4 h-4 text-atlas-500" />
                        </div>
                        <span className="text-sm text-text-primary font-medium">{cert}</span>
                        <CheckCircle className="w-4 h-4 text-atlas-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Weekly Schedule */}
                <Card>
                  <h2 className="font-display font-semibold text-lg text-text-primary mb-4">Weekly Schedule</h2>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS.map((day) => (
                      <div key={day} className="text-center">
                        <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">{day}</div>
                        <div className="space-y-1.5 min-h-[80px]">
                          {SCHEDULE[day]?.length ? SCHEDULE[day].map((slot, i) => (
                            <div
                              key={i}
                              className={cn(
                                'px-1.5 py-2 rounded-lg border text-[10px] font-medium',
                                typeColors[slot.type]
                              )}
                            >
                              <div>{slot.time}</div>
                              <div className="opacity-70">{slot.label}</div>
                            </div>
                          )) : (
                            <div className="h-full flex items-center justify-center text-[10px] text-text-muted/50">—</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Locations */}
                <Card>
                  <h2 className="font-display font-semibold text-lg text-text-primary mb-4">Training Locations</h2>
                  <div className="space-y-3">
                    {coach.locations.map((loc) => (
                      <div key={loc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{loc.label}</p>
                          <p className="text-xs text-text-muted truncate">{loc.address}</p>
                        </div>
                        {loc.is_primary && (
                          <Badge variant="info" size="sm">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {MOCK_EVENTS.map((event) => {
                  const spotsLeft = event.capacity - event.enrolled;
                  const isFull = spotsLeft <= 0;
                  const fillPct = (event.enrolled / event.capacity) * 100;
                  
                  return (
                    <Card key={event.id} hover className="relative overflow-hidden">
                      {isFull && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="danger" size="sm">SOLD OUT</Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={
                          event.event_type === 'camp' ? 'info' :
                          event.event_type === 'clinic' ? 'warning' : 'premium'
                        } size="sm">
                          {event.event_type === 'camp' ? '🏕️' : event.event_type === 'clinic' ? '⚡' : '👤'} {event.event_type}
                        </Badge>
                        {event.skill_levels.map((sl) => (
                          <Badge key={sl} variant="default" size="sm">{sl}</Badge>
                        ))}
                      </div>

                      <h3 className="font-display font-semibold text-lg text-text-primary mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-text-muted mb-4">{event.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Date</p>
                          <p className="text-sm font-medium text-text-primary">
                            {new Date(event.start_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Location</p>
                          <p className="text-sm font-medium text-text-primary">{event.address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Ages</p>
                          <p className="text-sm font-medium text-text-primary">
                            {event.age_min && event.age_max ? `${event.age_min}-${event.age_max}` : 'All ages'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Price</p>
                          <p className="text-sm font-display font-bold text-atlas-400">{formatPrice(event.price_cents)}</p>
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-muted">
                            {event.enrolled}/{event.capacity} spots filled
                          </span>
                          <span className={cn(
                            'text-xs font-medium',
                            isFull ? 'text-red-400' : spotsLeft <= 3 ? 'text-amber-400' : 'text-atlas-400'
                          )}>
                            {isFull ? 'Full' : `${spotsLeft} left`}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isFull ? 'bg-red-500' : fillPct > 80 ? 'bg-amber-500' : 'bg-atlas-500'
                            )}
                            style={{ width: `${Math.min(fillPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="md" className="flex-1" disabled={isFull}>
                          {isFull ? 'Join Waitlist' : 'Book Now'}
                        </Button>
                        <Button variant="ghost" size="md">Details →</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {activeTab === 'reviews' && (
              <>
                {/* Rating Summary */}
                <Card>
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Big rating */}
                    <div className="flex flex-col items-center justify-center md:border-r md:border-slate-200 md:pr-10">
                      <p className="text-5xl font-display font-bold text-text-primary mb-1">{avgRating}</p>
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn(
                            'w-4 h-4',
                            s <= Math.round(Number(avgRating))
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-white/10'
                          )} />
                        ))}
                      </div>
                      <p className="text-xs text-text-muted">{coach.review_count} reviews</p>
                    </div>

                    {/* Distribution bars */}
                    <div className="flex-1 space-y-2">
                      {RATING_DIST.map((r) => (
                        <div key={r.stars} className="flex items-center gap-3">
                          <span className="text-xs text-text-muted w-3 text-right">{r.stars}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-2 bg-slate-100/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-700"
                              style={{ width: `${r.pct * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted w-8 text-right">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Reviews */}
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((review) => (
                    <Card key={review.id}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-atlas-400">
                            {review.reviewer_name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary">{review.reviewer_name}</span>
                              {review.verified_booking && (
                                <Badge variant="success" size="sm">
                                  <CheckCircle className="w-2.5 h-2.5" /> Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-text-muted">{timeAgo(review.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn(
                              'w-3.5 h-3.5',
                              s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                            )} />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-medium text-text-primary mb-2">{review.title}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>

                      <div className="mt-4 flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.helpful_count})
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ─── Sidebar (1/3) ─── */}
          <div className="space-y-6">
            {/* Booking CTA */}
            <Card className="!border-atlas-500/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-atlas-500/5 rounded-full blur-[40px]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-display font-bold text-text-primary">
                      {formatPrice(coach.hourly_rate_cents)}
                    </p>
                    <p className="text-xs text-text-muted">per session</p>
                  </div>
                  <Badge variant="success" dot>Available</Badge>
                </div>

                <Button size="lg" className="w-full mb-2">
                  <Mail className="w-4 h-4" />
                  Request Session
                </Button>
                <Button variant="secondary" size="md" className="w-full">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>

                <p className="text-[10px] text-text-muted text-center mt-3">
                  Usually responds within {coach.response_time}
                </p>
              </div>
            </Card>

            {/* Languages */}
            <Card padding="sm">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Languages</h3>
              <div className="flex flex-wrap gap-1.5">
                {coach.languages.map((lang) => (
                  <span key={lang} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/60 shadow-sm text-xs text-text-secondary">
                    {lang}
                  </span>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card padding="sm">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Quick Facts</h3>
              <div className="space-y-3">
                {[
                  { label: 'Experience', value: `${coach.experience_years} years`, icon: Briefcase },
                  { label: 'Athletes', value: `${coach.athletes_trained}+`, icon: Users },
                  { label: 'Completion', value: formatPercent(coach.completion_rate), icon: Target },
                  { label: 'Member since', value: new Date(coach.created_at).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' }), icon: Calendar },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-text-muted">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </span>
                    <span className="text-xs font-medium text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Social */}
            {(coach.social.instagram || coach.social.website) && (
              <Card padding="sm">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Connect</h3>
                <div className="space-y-2">
                  {coach.social.instagram && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Globe className="w-3.5 h-3.5" /> {coach.social.instagram}
                    </div>
                  )}
                  {coach.social.website && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Globe className="w-3.5 h-3.5" /> {coach.social.website}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Report */}
            <div className="text-center">
              <button className="text-[10px] text-text-muted hover:text-text-secondary transition-colors">
                Report this profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
