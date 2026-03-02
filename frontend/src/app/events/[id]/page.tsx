/* ═══════════════════════════════════════════════════════════
   Gaya — Event Detail Page
   Full event detail with capacity ring, booking flow,
   coach sidebar, schedule, and related events
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatPrice, formatPercent, timeAgo } from '@/lib/utils';
import {
  MapPin, Calendar, Clock, Users, Star, Shield,
  ChevronRight, ArrowLeft, Heart, Share2, CheckCircle,
  AlertTriangle, Zap, Tag, BookOpen, Award, Globe,
  ArrowUpRight, BadgeCheck
} from 'lucide-react';
import type { TrainingEvent, Coach, EventType } from '@/types';

// ─── Mock Event Data ──────────────────────────────────────

const EVENT: TrainingEvent & {
  amenities: string[];
  requirements: string[];
  schedule_notes: string;
} = {
  id: 'e1',
  coach_id: 'c1',
  organization_id: 'org1',
  title: 'Spring Elite Camp 2026',
  description: `An intensive 5-day camp designed for competitive players looking to take their game to the next level. Each day features a carefully structured progression from technical fundamentals in the morning to tactical game scenarios in the afternoon.

Day 1: Ball mastery & first touch
Day 2: 1v1 attacking & defending  
Day 3: Combination play & movement
Day 4: Set pieces & game management
Day 5: Full match day with video review

Every player receives a personalized performance report and video highlights at the end of the week.`,
  event_type: 'camp',
  sport: 'soccer',
  skill_levels: ['advanced', 'elite'],
  age_min: 12,
  age_max: 17,
  latitude: 43.7525,
  longitude: -79.4740,
  address: 'Downsview Park, 70 Canuck Ave, North York, ON M3K 2C5',
  capacity: 24,
  enrolled: 21,
  price_cents: 34900,
  start_date: '2026-04-14T09:00:00Z',
  end_date: '2026-04-18T16:00:00Z',
  status: 'published',
  amenities: ['Indoor turf facility', 'Video analysis sessions', 'Performance report', 'Training kit included', 'Lunch provided', 'Free parking'],
  requirements: ['Soccer cleats (turf or indoor)', 'Shin guards', 'Water bottle', 'Positive attitude!'],
  schedule_notes: 'Monday-Friday, 9:00 AM - 4:00 PM with lunch break 12:00-1:00 PM',
  created_at: '2026-01-15T10:00:00Z',
};

const COACH: Coach = {
  id: 'c1', user_id: 'u1', organization_id: 'org1',
  display_name: 'Marcus Thompson', bio: 'Former MLS academy coach',
  sport: 'soccer', specialties: ['Technical Skills', 'Tactical Awareness'],
  certifications: ['UEFA B License', 'Canada Soccer C License'],
  rating: 4.9, review_count: 127, hourly_rate_cents: 12500,
  verified: true, locations: [], created_at: '2023-01-15T10:00:00Z',
};

const RELATED = [
  { id: 'e2', title: 'Technical Skills Clinic', event_type: 'clinic' as EventType, price_cents: 8900, spots: 0, date: 'Mar 22', zone: 'Centennial Park' },
  { id: 'e3', title: 'Goalkeeper Masterclass', event_type: 'clinic' as EventType, price_cents: 12900, spots: 3, date: 'Mar 29', zone: 'L\'Amoreaux' },
  { id: 'e5', title: 'Summer Super Camp', event_type: 'camp' as EventType, price_cents: 44900, spots: 18, date: 'Jul 7', zone: 'Downsview Park' },
];

const typeEmoji: Record<EventType, string> = { camp: '🏕️', clinic: '⚡', private: '👤' };

// ─── Capacity Ring ────────────────────────────────────────

function CapacityRing({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const pct = enrolled / capacity;
  const spotsLeft = capacity - enrolled;
  const data = [
    { value: enrolled, fill: pct >= 1 ? '#ff4d6a' : pct > 0.85 ? '#ffb84d' : '#3b82f6' },
    { value: spotsLeft, fill: 'rgba(255,255,255,0.04)' },
  ];

  return (
    <div className="relative w-36 h-36 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" startAngle={90} endAngle={-270}
            innerRadius="78%" outerRadius="95%" paddingAngle={2} dataKey="value" stroke="none">
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-text-primary">{enrolled}</span>
        <span className="text-[10px] text-text-muted">of {capacity}</span>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────

export default function EventDetailPage() {
  const [saved, setSaved] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const spotsLeft = EVENT.capacity - EVENT.enrolled;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft <= 3 && !isFull;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Breadcrumb ─── */}
      <div className="border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/map" className="hover:text-atlas-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Map
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>Events</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-secondary">{EVENT.title}</span>
          </div>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-blue-500/3 rounded-full blur-[100px]" />

        <div className="relative max-w-[1100px] mx-auto px-6 pt-8 pb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="info">{typeEmoji[EVENT.event_type]} {EVENT.event_type}</Badge>
                {EVENT.skill_levels.map((sl) => (
                  <Badge key={sl} variant="default" size="sm">{sl}</Badge>
                ))}
                {isFull && <Badge variant="danger">SOLD OUT</Badge>}
                {isAlmostFull && <Badge variant="warning" dot>Almost Full</Badge>}
              </div>
              <h1 className="font-display font-bold text-3xl text-text-primary mb-2">{EVENT.title}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
                  {new Date(EVENT.start_date).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })} – {new Date(EVENT.end_date).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {EVENT.address.split(',')[0]}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Ages {EVENT.age_min}–{EVENT.age_max}</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setSaved(!saved)}
                className={cn('w-10 h-10 rounded-xl border flex items-center justify-center transition-all',
                  saved ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-100/50 border-slate-300 text-text-muted hover:text-text-secondary')}>
                <Heart className={cn('w-4 h-4', saved && 'fill-red-400')} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-100/50 border border-slate-300 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h2 className="font-display font-semibold text-lg text-text-primary mb-4">About This Event</h2>
              <div className="prose-sm text-text-secondary leading-relaxed whitespace-pre-line">{EVENT.description}</div>
            </Card>

            {/* Schedule */}
            <Card>
              <h2 className="font-display font-semibold text-lg text-text-primary mb-3">Schedule</h2>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Clock className="w-4 h-4 text-atlas-500 shrink-0" />
                <p className="text-sm text-text-secondary">{EVENT.schedule_notes}</p>
              </div>
            </Card>

            {/* Amenities & Requirements */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h2 className="font-display font-semibold text-text-primary mb-3">What&apos;s Included</h2>
                <div className="space-y-2">
                  {EVENT.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle className="w-3.5 h-3.5 text-atlas-500 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h2 className="font-display font-semibold text-text-primary mb-3">What to Bring</h2>
                <div className="space-y-2">
                  {EVENT.requirements.map((r) => (
                    <div key={r} className="flex items-center gap-2 text-sm text-text-secondary">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {r}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Location */}
            <Card>
              <h2 className="font-display font-semibold text-lg text-text-primary mb-3">Location</h2>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Downsview Park</p>
                  <p className="text-xs text-text-muted">{EVENT.address}</p>
                  <a href={`https://maps.google.com/?q=${EVENT.latitude},${EVENT.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-atlas-400 hover:underline mt-1 inline-block">
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </Card>

            {/* Related Events */}
            <div>
              <h2 className="font-display font-semibold text-lg text-text-primary mb-4">More from This Coach</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {RELATED.map((rel) => (
                  <Card key={rel.id} hover padding="sm">
                    <Badge variant={
                      rel.event_type === 'camp' ? 'info' :
                      rel.event_type === 'clinic' ? 'warning' : 'premium'
                    } size="sm" className="mb-2">
                      {typeEmoji[rel.event_type]} {rel.event_type}
                    </Badge>
                    <h4 className="text-sm font-medium text-text-primary mb-1">{rel.title}</h4>
                    <p className="text-xs text-text-muted mb-3">{rel.date} · {rel.zone}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-display font-bold text-atlas-400">{formatPrice(rel.price_cents)}</span>
                      <span className={cn('text-xs font-medium',
                        rel.spots === 0 ? 'text-red-400' : rel.spots <= 3 ? 'text-amber-400' : 'text-atlas-400')}>
                        {rel.spots === 0 ? 'Full' : `${rel.spots} left`}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="!border-atlas-500/15 relative overflow-hidden sticky top-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-atlas-500/5 rounded-full blur-[40px]" />
              <div className="relative">
                {/* Price */}
                <div className="text-center mb-4">
                  <p className="text-3xl font-display font-bold text-text-primary">{formatPrice(EVENT.price_cents)}</p>
                  <p className="text-xs text-text-muted">per athlete · 5 days</p>
                </div>

                {/* Capacity ring */}
                <CapacityRing enrolled={EVENT.enrolled} capacity={EVENT.capacity} />

                <div className="text-center mt-2 mb-5">
                  {isFull ? (
                    <p className="text-sm text-red-400 font-medium">Sold out — join waitlist below</p>
                  ) : isAlmostFull ? (
                    <p className="text-sm text-amber-400 font-medium">Only {spotsLeft} spots remaining!</p>
                  ) : (
                    <p className="text-sm text-text-muted">{spotsLeft} spots available</p>
                  )}
                </div>

                {/* CTA */}
                <Button size="lg" className="w-full mb-2" disabled={false}>
                  <Zap className="w-4 h-4" />
                  {isFull ? 'Join Waitlist' : 'Book Now'}
                </Button>
                <Button variant="secondary" size="md" className="w-full">
                  Request Info
                </Button>

                {isAlmostFull && (
                  <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <p className="text-[10px] text-amber-400">12 people viewed this event in the last 24 hours</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Coach Card */}
            <Card>
              <Link href={`/coaches/${COACH.id}`} className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-lg font-bold text-atlas-400">
                      {COACH.display_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {COACH.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-atlas-500 flex items-center justify-center">
                        <BadgeCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-atlas-400 transition-colors">{COACH.display_name}</p>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-text-secondary">{COACH.rating} ({COACH.review_count})</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted ml-auto group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
              <div className="flex flex-wrap gap-1.5">
                {COACH.certifications.slice(0, 2).map((c) => (
                  <span key={c} className="text-[10px] px-2 py-1 rounded-md bg-white border border-slate-200/60 shadow-sm text-text-muted">
                    <Award className="w-2.5 h-2.5 inline mr-0.5" /> {c}
                  </span>
                ))}
              </div>
            </Card>

            {/* Quick Info */}
            <Card padding="sm">
              <div className="space-y-3">
                {[
                  { label: 'Type', value: EVENT.event_type, icon: Tag },
                  { label: 'Ages', value: `${EVENT.age_min}–${EVENT.age_max} years`, icon: Users },
                  { label: 'Skill Level', value: EVENT.skill_levels.join(', '), icon: Zap },
                  { label: 'Capacity', value: `${EVENT.capacity} athletes`, icon: Users },
                  { label: 'Created', value: timeAgo(EVENT.created_at), icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-text-muted">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </span>
                    <span className="text-xs font-medium text-text-primary capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
