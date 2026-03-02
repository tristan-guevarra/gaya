/* ═══════════════════════════════════════════════════════════════
   Gaya — Zone Deep-Dive
   Full analytics breakdown for a single H3 zone.
   Supply/demand curves, coach directory, event timeline,
   ML-powered insights, and competitive positioning.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatPrice, formatPercent } from '@/lib/utils';
import {
  MapPin, Users, TrendingUp, TrendingDown, Calendar, Clock,
  Star, ArrowLeft, ChevronRight, Zap, Target, Activity,
  BarChart3, Brain, Layers, Globe, Shield, Award,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  BookOpen, DollarSign, Flame, Eye, BadgeCheck, Sparkles
} from 'lucide-react';

// ─── Mock Zone Data ─────────────────────────────────────────

const ZONE = {
  id: 'z_scarborough',
  name: 'Scarborough East',
  h3_index: '882a8a2c53fffff',
  center: { lat: 43.7731, lng: -79.2576 },
  population: 185_000,
  youth_population: 32_400,
  area_km2: 24.8,
  opportunity_score: 92,
  demand_index: 87,
  supply_index: 34,
  trend: 'rising' as const,
  top_sport: 'Soccer',
  coaches: 7,
  events_active: 12,
  avg_fill_rate: 0.64,
  avg_price: 9900,
  leads_30d: 186,
  searches_30d: 2340,
  bookings_30d: 48,
  conversion_rate: 0.258,
  underserved_score: 0.86,
  coach_density: 2.8,
  event_density: 4.8,
};

// Monthly metrics (12 months)
const MONTHLY_METRICS = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2025, i).toLocaleString('default', { month: 'short' });
  const seasonality = 1 + 0.4 * Math.sin((i - 2) * Math.PI / 6);
  return {
    month,
    demand: Math.round(60 + 30 * seasonality + (Math.random() - 0.5) * 10),
    supply: Math.round(25 + 8 * Math.sin((i - 1) * Math.PI / 6) + (Math.random() - 0.5) * 5 + i * 1.2),
    leads: Math.round(120 * seasonality + (Math.random() - 0.5) * 20),
    bookings: Math.round(35 * seasonality + (Math.random() - 0.5) * 8),
    searches: Math.round(1800 * seasonality + (Math.random() - 0.5) * 200),
    revenue: Math.round(4200 * seasonality + (Math.random() - 0.5) * 600),
  };
});

// Event type breakdown
const EVENT_BREAKDOWN = [
  { type: 'Camps', count: 4, fill_rate: 0.72, avg_price: 29900, trend: 'up' },
  { type: 'Clinics', count: 6, fill_rate: 0.58, avg_price: 8900, trend: 'up' },
  { type: 'Private', count: 2, fill_rate: 0.91, avg_price: 12500, trend: 'stable' },
];

// Top coaches in zone
const ZONE_COACHES = [
  { id: 'c1', name: 'Amira Hassan', rating: 4.8, reviews: 34, verified: true, events: 5, fill: 0.74, specialty: 'Technical Skills' },
  { id: 'c2', name: 'James Park', rating: 4.6, reviews: 22, verified: true, events: 3, fill: 0.62, specialty: 'Fitness & Conditioning' },
  { id: 'c3', name: 'David Okafor', rating: 5.0, reviews: 43, verified: true, events: 2, fill: 0.91, specialty: 'Position-Specific' },
  { id: 'c4', name: 'Priya Sharma', rating: 4.5, reviews: 18, verified: false, events: 2, fill: 0.55, specialty: 'Youth Development' },
];

// Radar comparison data
const RADAR_DATA = [
  { metric: 'Demand', zone: 87, city_avg: 55 },
  { metric: 'Supply', zone: 34, city_avg: 52 },
  { metric: 'Fill Rate', zone: 64, city_avg: 71 },
  { metric: 'Conversion', zone: 78, city_avg: 62 },
  { metric: 'Growth', zone: 85, city_avg: 48 },
  { metric: 'Coaches', zone: 28, city_avg: 50 },
];

// ML Insights
const INSIGHTS = [
  { type: 'opportunity' as const, title: 'High-demand gap detected', desc: 'Demand 2.5× supply. Adding 2 clinics could capture 60+ leads/month.', confidence: 0.91 },
  { type: 'timing' as const, title: 'Peak window: Apr–Jun', desc: 'Spring camps see 40% higher fill rates. Launch before April 1 for max impact.', confidence: 0.87 },
  { type: 'pricing' as const, title: 'Price sensitivity low', desc: 'Zone tolerates 15% above avg ($114 vs $99). Premium positioning viable.', confidence: 0.82 },
  { type: 'warning' as const, title: 'Goalkeeper clinics oversupplied', desc: 'GK clinics at 42% fill — shift to field player skills or speed training.', confidence: 0.78 },
];

const insightIcons: Record<string, { icon: React.ElementType; color: string }> = {
  opportunity: { icon: Flame, color: 'text-atlas-400 bg-atlas-500/10' },
  timing: { icon: Calendar, color: 'text-blue-400 bg-blue-500/10' },
  pricing: { icon: DollarSign, color: 'text-amber-400 bg-amber-500/10' },
  warning: { icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' },
};

// ─── Custom Tooltip ─────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-100/95 backdrop-blur-xl border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xl">
      <p className="text-xs font-medium text-text-primary mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted">{p.name}:</span>
          <span className="font-medium text-text-primary">{typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({ label, value, subtitle, trend, icon: Icon, accent }: {
  label: string; value: string; subtitle?: string;
  trend?: { value: number; label: string };
  icon: React.ElementType; accent?: string;
}) {
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', accent || 'bg-slate-100/50 text-text-muted')}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className={cn('text-[11px] font-medium flex items-center gap-0.5',
            trend.value >= 0 ? 'text-atlas-400' : 'text-red-400')}>
            {trend.value >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-xl font-display font-bold text-text-primary">{value}</p>
      <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
      {subtitle && <p className="text-[10px] text-text-muted/60 mt-0.5">{subtitle}</p>}
    </Card>
  );
}

// ─── Page Component ─────────────────────────────────────────

export default function ZoneDeepDivePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'coaches' | 'events' | 'insights'>('overview');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-atlas-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 right-0 w-[500px] h-[250px] bg-atlas-500/3 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-6 pt-6 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
            <Link href="/intelligence" className="hover:text-atlas-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Intelligence
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>Zones</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-secondary">{ZONE.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-atlas-400" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl text-text-primary">{ZONE.name}</h1>
                  <p className="text-xs text-text-muted font-mono">{ZONE.h3_index}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant="success" dot>Opportunity Score: {ZONE.opportunity_score}</Badge>
                <Badge variant="info">📈 Rising Demand</Badge>
                <Badge variant="warning">⚠️ Low Supply</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <BarChart3 className="w-3.5 h-3.5" /> Compare Zone
              </Button>
              <Button size="sm">
                <Zap className="w-3.5 h-3.5" /> Run Simulator
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard label="Opportunity Score" value={`${ZONE.opportunity_score}/100`} icon={Target} accent="bg-atlas-500/10 text-atlas-400" trend={{ value: 8, label: 'vs last month' }} />
          <StatCard label="Demand Index" value={`${ZONE.demand_index}`} icon={TrendingUp} accent="bg-blue-500/10 text-blue-400" trend={{ value: 12, label: '' }} />
          <StatCard label="Supply Index" value={`${ZONE.supply_index}`} icon={Layers} accent="bg-amber-500/10 text-amber-400" trend={{ value: 3, label: '' }} />
          <StatCard label="Active Coaches" value={`${ZONE.coaches}`} icon={Users} accent="bg-purple-500/10 text-purple-400" subtitle={`${ZONE.coach_density}/km²`} />
          <StatCard label="Avg Fill Rate" value={`${Math.round(ZONE.avg_fill_rate * 100)}%`} icon={Activity} accent="bg-cyan-500/10 text-cyan-400" trend={{ value: -2, label: '' }} />
          <StatCard label="Leads (30d)" value={`${ZONE.leads_30d}`} icon={Flame} accent="bg-red-500/10 text-red-400" trend={{ value: 18, label: '' }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {(['overview', 'coaches', 'events', 'insights'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-all border-b-2 capitalize',
                activeTab === tab
                  ? 'text-atlas-400 border-atlas-400'
                  : 'text-text-muted border-transparent hover:text-text-secondary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-12 gap-6 pb-16 animate-fade-in">
            {/* Supply vs Demand Trend */}
            <div className="lg:col-span-8">
              <Card>
                <h3 className="font-display font-semibold text-text-primary mb-4">Supply vs Demand (12 Months)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={MONTHLY_METRICS}>
                    <defs>
                      <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff4d6a" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ff4d6a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="demand" stroke="#ff4d6a" fill="url(#demandGrad)" strokeWidth={2} name="Demand" />
                    <Area type="monotone" dataKey="supply" stroke="#3b82f6" fill="url(#supplyGrad)" strokeWidth={2} name="Supply" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-text-muted/50 mt-2 text-center">
                  Gap between demand and supply represents opportunity · Wider gap = higher opportunity score
                </p>
              </Card>
            </div>

            {/* Radar Comparison */}
            <div className="lg:col-span-4">
              <Card>
                <h3 className="font-display font-semibold text-text-primary mb-4">vs City Average</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="rgba(0,0,0,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#8892a4', fontSize: 10 }} />
                    <Radar name={ZONE.name} dataKey="zone" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="City Avg" dataKey="city_avg" stroke="#4d9fff" fill="#4d9fff" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <div className="w-3 h-1 rounded bg-atlas-500" /> {ZONE.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <div className="w-3 h-1 rounded bg-blue-500 opacity-60" /> City Average
                  </span>
                </div>
              </Card>
            </div>

            {/* Leads & Conversions */}
            <div className="lg:col-span-6">
              <Card>
                <h3 className="font-display font-semibold text-text-primary mb-4">Leads vs Bookings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MONTHLY_METRICS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="leads" fill="#4d9fff" radius={[3, 3, 0, 0]} name="Leads" />
                    <Bar dataKey="bookings" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Event Type Breakdown */}
            <div className="lg:col-span-6">
              <Card>
                <h3 className="font-display font-semibold text-text-primary mb-4">Event Type Performance</h3>
                <div className="space-y-3">
                  {EVENT_BREAKDOWN.map((evt) => (
                    <div key={evt.type} className="p-3 rounded-xl bg-white/40 border border-white/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text-primary">{evt.type}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-muted">{evt.count} active</span>
                          <Badge variant={evt.fill_rate > 0.7 ? 'success' : evt.fill_rate > 0.5 ? 'warning' : 'danger'} size="sm">
                            {Math.round(evt.fill_rate * 100)}% fill
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100/50 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all',
                            evt.fill_rate > 0.7 ? 'bg-atlas-500' : evt.fill_rate > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${evt.fill_rate * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-muted">Avg price: {formatPrice(evt.avg_price)}</span>
                        <span className={cn('text-xs flex items-center gap-1',
                          evt.trend === 'up' ? 'text-atlas-400' : 'text-text-muted')}>
                          {evt.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : '→'} {evt.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Coaches Tab ── */}
        {activeTab === 'coaches' && (
          <div className="space-y-4 pb-16 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">{ZONE_COACHES.length} coaches operating in {ZONE.name}</p>
              <Badge variant="info">{ZONE.coach_density}/km² density</Badge>
            </div>
            {ZONE_COACHES.map((coach, i) => (
              <Link key={coach.id} href={`/coaches/${coach.id}`}>
                <Card hover className="group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-lg font-bold text-atlas-400">
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {coach.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-atlas-500 flex items-center justify-center">
                          <BadgeCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-text-muted">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary group-hover:text-atlas-400 transition-colors">{coach.name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100/50 text-text-muted">{coach.specialty}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {coach.rating} ({coach.reviews})
                        </span>
                        <span className="text-xs text-text-muted">{coach.events} events</span>
                        <span className="text-xs text-text-muted">{Math.round(coach.fill * 100)}% fill rate</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
            <Card className="!border-atlas-500/15">
              <div className="text-center py-4">
                <p className="text-sm text-text-muted mb-2">Zone needs more coaches to meet demand</p>
                <Button size="sm"><Zap className="w-3.5 h-3.5" /> Recruit Coach to Zone</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Insights Tab ── */}
        {activeTab === 'insights' && (
          <div className="space-y-4 pb-16 animate-fade-in">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-6">
              <Brain className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-xs text-purple-300">
                Insights generated by ARIMA + Gradient Boosting ensemble trained on 18 months of zone data.
                Confidence scores reflect model certainty.
              </p>
            </div>
            {INSIGHTS.map((insight, i) => {
              const { icon: Icon, color } = insightIcons[insight.type];
              return (
                <Card key={i} hover>
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-text-primary">{insight.title}</h4>
                        <Badge variant={insight.confidence > 0.85 ? 'success' : 'warning'} size="sm">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Recommended Actions */}
            <Card className="!border-atlas-500/15 mt-6">
              <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-atlas-400" /> Recommended Actions
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'Launch 2x weekend clinics (U12 technical skills)', impact: 'High', leads: '+45/month' },
                  { action: 'Recruit 1 verified coach specializing in speed & agility', impact: 'High', leads: '+30/month' },
                  { action: 'Price camps at $379 (15% premium) — demand supports it', impact: 'Medium', leads: '+$2.1K/month' },
                  { action: 'Reduce GK clinic frequency from 2x/month to 1x', impact: 'Low', leads: 'Improve fill +18%' },
                ].map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
                    <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0',
                      rec.impact === 'High' ? 'bg-atlas-500/15 text-atlas-400' :
                      rec.impact === 'Medium' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-100/50 text-text-muted')}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-text-secondary flex-1">{rec.action}</p>
                    <Badge variant={rec.impact === 'High' ? 'success' : rec.impact === 'Medium' ? 'info' : 'default'} size="sm">
                      {rec.leads}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── Events Tab (Placeholder) ── */}
        {activeTab === 'events' && (
          <div className="space-y-4 pb-16 animate-fade-in">
            <p className="text-sm text-text-muted">{ZONE.events_active} active events in {ZONE.name}</p>
            {[
              { id: 'e1', title: 'Spring Elite Camp', type: 'camp', coach: 'Amira Hassan', date: 'Apr 14–18', fill: 0.72, price: 34900 },
              { id: 'e2', title: 'U12 Technical Clinic', type: 'clinic', coach: 'James Park', date: 'Mar 22', fill: 0.55, price: 8900 },
              { id: 'e3', title: 'Speed & Agility Session', type: 'clinic', coach: 'Amira Hassan', date: 'Mar 29', fill: 0.80, price: 7500 },
              { id: 'e4', title: '1-on-1 Position Training', type: 'private', coach: 'David Okafor', date: 'Flexible', fill: 0.91, price: 12500 },
            ].map(evt => (
              <Link key={evt.id} href={`/events/${evt.id}`}>
                <Card hover className="group">
                  <div className="flex items-center gap-4">
                    <Badge variant={evt.type === 'camp' ? 'info' : evt.type === 'clinic' ? 'warning' : 'premium'}>
                      {evt.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-atlas-400 transition-colors">{evt.title}</p>
                      <p className="text-xs text-text-muted">{evt.coach} · {evt.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display font-bold text-atlas-400">{formatPrice(evt.price)}</p>
                      <p className={cn('text-[10px] font-medium',
                        evt.fill > 0.8 ? 'text-amber-400' : 'text-text-muted'
                      )}>{Math.round(evt.fill * 100)}% full</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
