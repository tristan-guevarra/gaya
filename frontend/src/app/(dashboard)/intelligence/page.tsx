/* ═══════════════════════════════════════════════════════════
   Gaya — Intelligence Dashboard
   Admin-only geo analytics with charts, metrics cards,
   expansion recommendations, and interactive heatmap
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell
} from 'recharts';
import { Card, Badge, Button, StatCard, Spinner } from '@/components/ui';
import { cn, formatPercent, confidenceLabel, getEventTypeInfo } from '@/lib/utils';
import {
  BarChart3, TrendingUp, MapPin, Users, Zap, Brain,
  RefreshCw, ArrowUpRight, Target, Activity, Layers,
  ChevronRight, Flame, AlertTriangle
} from 'lucide-react';

// ─── Mock Intelligence Data ───────────────────────────────

const MOCK_STATS = {
  total_coaches: 40,
  total_events: 80,
  total_leads: 200,
  total_bookings: 120,
  avg_fill_rate: 0.73,
  revenue_this_month: 4250000,
  coaches_trend: 12,
  events_trend: 8,
  leads_trend: 23,
};

// Seeded pseudo-random to avoid hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const DEMAND_TIMESERIES = Array.from({ length: 30 }, (_, i) => ({
  date: `Feb ${i + 1}`,
  demand: 15 + Math.floor(seededRandom(i * 3 + 1) * 35) + (i > 15 ? 10 : 0),
  supply: 20 + Math.floor(seededRandom(i * 3 + 2) * 15),
  leads: 3 + Math.floor(seededRandom(i * 3 + 3) * 12),
}));

const ZONE_METRICS = [
  { zone: 'Downtown', supply: 85, demand: 92, gap: 7, conversion: 0.68 },
  { zone: 'North York', supply: 62, demand: 78, gap: 16, conversion: 0.55 },
  { zone: 'Scarborough', supply: 35, demand: 71, gap: 36, conversion: 0.42 },
  { zone: 'Etobicoke', supply: 41, demand: 58, gap: 17, conversion: 0.51 },
  { zone: 'Mississauga', supply: 55, demand: 83, gap: 28, conversion: 0.61 },
  { zone: 'Brampton', supply: 28, demand: 65, gap: 37, conversion: 0.38 },
  { zone: 'Vaughan', supply: 32, demand: 45, gap: 13, conversion: 0.47 },
  { zone: 'Markham', supply: 38, demand: 52, gap: 14, conversion: 0.53 },
];

const RECOMMENDATIONS = [
  {
    id: '1', rank: 1, area_name: 'Scarborough East',
    recommended_event_type: 'camp' as const,
    predicted_fill_rate: 0.87, confidence: 0.82, opportunity_score: 94,
    recommended_day: 'Saturday', recommended_time: '9:00 AM',
    latitude: 43.7731, longitude: -79.2572,
    explanation: [
      { factor: 'Lead Volume', impact: 0.35, description: '42 leads within 3km in last 90 days' },
      { factor: 'Supply Gap', impact: 0.28, description: 'No camps within 5km radius' },
      { factor: 'Conversion Rate', impact: 0.20, description: 'Nearby zones show 68% lead-to-booking' },
      { factor: 'Seasonality', impact: 0.12, description: 'Summer peak approaching (1.0x multiplier)' },
      { factor: 'Competition', impact: 0.05, description: 'Only 2 coaches in area vs 8 avg' },
    ],
  },
  {
    id: '2', rank: 2, area_name: 'Brampton North',
    recommended_event_type: 'clinic' as const,
    predicted_fill_rate: 0.81, confidence: 0.75, opportunity_score: 88,
    recommended_day: 'Sunday', recommended_time: '10:00 AM',
    latitude: 43.7315, longitude: -79.7624,
    explanation: [
      { factor: 'Lead Volume', impact: 0.32, description: '38 leads within 3km' },
      { factor: 'Supply Gap', impact: 0.30, description: 'No clinics in zone' },
      { factor: 'Conversion Rate', impact: 0.18, description: '55% conversion in adjacent cells' },
      { factor: 'Seasonality', impact: 0.15, description: 'Spring ramp-up (0.85x)' },
      { factor: 'Competition', impact: 0.05, description: '3 coaches, low density' },
    ],
  },
  {
    id: '3', rank: 3, area_name: 'Mississauga West',
    recommended_event_type: 'camp' as const,
    predicted_fill_rate: 0.78, confidence: 0.71, opportunity_score: 82,
    recommended_day: 'Saturday', recommended_time: '8:30 AM',
    latitude: 43.5890, longitude: -79.6441,
    explanation: [
      { factor: 'Lead Volume', impact: 0.30, description: '35 leads nearby' },
      { factor: 'Supply Gap', impact: 0.25, description: 'Limited capacity in area' },
      { factor: 'Conversion Rate', impact: 0.22, description: '61% regional conversion' },
      { factor: 'Seasonality', impact: 0.13, description: 'Spring factor applied' },
      { factor: 'Competition', impact: 0.10, description: 'Moderate competition' },
    ],
  },
  {
    id: '4', rank: 4, area_name: 'Ajax / Pickering',
    recommended_event_type: 'private' as const,
    predicted_fill_rate: 0.74, confidence: 0.68, opportunity_score: 76,
    recommended_day: 'Weekdays', recommended_time: '4:00 PM',
    latitude: 43.8509, longitude: -79.0204,
    explanation: [
      { factor: 'Lead Volume', impact: 0.28, description: '22 private session leads' },
      { factor: 'Supply Gap', impact: 0.26, description: 'Zero private coaches in zone' },
      { factor: 'Conversion Rate', impact: 0.19, description: 'Private sessions show 72% conversion' },
      { factor: 'Seasonality', impact: 0.15, description: 'Year-round demand for private' },
      { factor: 'Competition', impact: 0.12, description: 'No direct competition' },
    ],
  },
  {
    id: '5', rank: 5, area_name: 'Thornhill',
    recommended_event_type: 'clinic' as const,
    predicted_fill_rate: 0.71, confidence: 0.64, opportunity_score: 70,
    recommended_day: 'Sunday', recommended_time: '11:00 AM',
    latitude: 43.8156, longitude: -79.4240,
    explanation: [
      { factor: 'Lead Volume', impact: 0.25, description: '18 leads in zone' },
      { factor: 'Supply Gap', impact: 0.22, description: 'No clinics within 4km' },
      { factor: 'Conversion Rate', impact: 0.20, description: '53% area conversion' },
      { factor: 'Seasonality', impact: 0.18, description: 'Spring demand rise' },
      { factor: 'Competition', impact: 0.15, description: 'Low-density zone' },
    ],
  },
];

const RADAR_DATA = [
  { metric: 'Supply', current: 65, potential: 90 },
  { metric: 'Demand', current: 82, potential: 82 },
  { metric: 'Conversion', current: 55, potential: 75 },
  { metric: 'Coverage', current: 48, potential: 85 },
  { metric: 'Retention', current: 72, potential: 88 },
  { metric: 'Growth', current: 60, potential: 92 },
];

// ─── Custom Chart Tooltip ─────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card !p-3 !border-slate-300 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary capitalize">{entry.name}:</span>
          <span className="text-text-primary font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────

export default function IntelligencePage() {
  const [selectedRec, setSelectedRec] = useState(RECOMMENDATIONS[0]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* ─── Header ─── */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-atlas-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-atlas-500" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl text-text-primary">
                    Geo Intelligence
                  </h1>
                  <p className="text-sm text-text-muted">
                    Supply vs demand analysis · Expansion recommendations · ML predictions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" dot>Live data</Badge>
              <Button
                variant="outline"
                size="sm"
                loading={refreshing}
                onClick={handleRefresh}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Coaches" value={MOCK_STATS.total_coaches}
            trend={MOCK_STATS.coaches_trend}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Events" value={MOCK_STATS.total_events}
            trend={MOCK_STATS.events_trend}
            icon={<MapPin className="w-5 h-5" />}
          />
          <StatCard
            label="Leads" value={MOCK_STATS.total_leads}
            trend={MOCK_STATS.leads_trend}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            label="Avg Fill Rate" value={formatPercent(MOCK_STATS.avg_fill_rate)}
            trend={5}
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            label="Bookings" value={MOCK_STATS.total_bookings}
            trend={18}
            icon={<Zap className="w-5 h-5" />}
          />
        </div>

        {/* ─── Charts Row ─── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Demand vs Supply Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary">Supply vs Demand</h3>
                <p className="text-xs text-text-muted mt-0.5">30-day rolling view</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-atlas-500" /> Supply
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" /> Demand
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" /> Leads
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={DEMAND_TIMESERIES}>
                <defs>
                  <linearGradient id="gradDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d9fff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4d9fff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6985c6' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6985c6' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="supply" stroke="#3b82f6" fill="url(#gradSupply)" strokeWidth={2} />
                <Area type="monotone" dataKey="demand" stroke="#4d9fff" fill="url(#gradDemand)" strokeWidth={2} />
                <Line type="monotone" dataKey="leads" stroke="#ffb84d" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Radar Chart */}
          <Card>
            <h3 className="font-display font-semibold text-text-primary mb-1">Ecosystem Health</h3>
            <p className="text-xs text-text-muted mb-4">Current vs expansion potential</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(0,0,0,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6985c6' }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Potential" dataKey="potential" stroke="#4d9fff" fill="#4d9fff" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 text-xs">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-atlas-500" /> Current
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" /> Potential
              </span>
            </div>
          </Card>
        </div>

        {/* ─── Zone Gap Analysis ─── */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-text-primary">Supply-Demand Gap by Zone</h3>
              <p className="text-xs text-text-muted mt-0.5">Larger gaps = higher expansion opportunity</p>
            </div>
            <Badge variant="warning" dot>
              <AlertTriangle className="w-3 h-3" />
              3 critical gaps
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ZONE_METRICS} layout="vertical" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6985c6' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="zone" type="category" tick={{ fontSize: 11, fill: '#9dafdb' }} width={100} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="supply" name="Supply" radius={[0, 4, 4, 0]} barSize={12}>
                {ZONE_METRICS.map((_, i) => (
                  <Cell key={i} fill="#3b82f6" fillOpacity={0.7} />
                ))}
              </Bar>
              <Bar dataKey="demand" name="Demand" radius={[0, 4, 4, 0]} barSize={12}>
                {ZONE_METRICS.map((_, i) => (
                  <Cell key={i} fill="#4d9fff" fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ─── Expansion Recommendations ─── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary">
                  AI Expansion Recommendations
                </h3>
                <p className="text-xs text-text-muted">
                  Top zones ranked by ML-predicted opportunity score
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            {/* Recommendation list */}
            <div className="lg:col-span-2 space-y-3">
              {RECOMMENDATIONS.map((rec) => {
                const typeInfo = getEventTypeInfo(rec.recommended_event_type);
                const conf = confidenceLabel(rec.confidence);
                const isSelected = selectedRec.id === rec.id;

                return (
                  <Card
                    key={rec.id}
                    hover
                    className={cn(
                      'relative overflow-hidden cursor-pointer',
                      isSelected && '!border-atlas-500/30 !bg-atlas-500/5'
                    )}
                    padding="sm"
                    onClick={() => setSelectedRec(rec)}
                  >
                    {/* Rank badge */}
                    <div className="absolute top-3 right-3">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs',
                        rec.rank === 1 ? 'bg-atlas-500/15 text-atlas-400' :
                        rec.rank === 2 ? 'bg-blue-500/15 text-blue-400' :
                        'bg-slate-100/50 text-text-muted'
                      )}>
                        #{rec.rank}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        rec.recommended_event_type === 'camp' ? 'info' :
                        rec.recommended_event_type === 'clinic' ? 'warning' : 'premium'
                      } size="sm">
                        {typeInfo.icon} {typeInfo.label}
                      </Badge>
                      <Badge variant={conf.label === 'High' ? 'success' : conf.label === 'Medium' ? 'warning' : 'danger'} size="sm">
                        {conf.label} conf.
                      </Badge>
                    </div>

                    <h4 className="font-display font-semibold text-sm text-text-primary mb-1">
                      {rec.area_name}
                    </h4>
                    <p className="text-xs text-text-muted mb-3">
                      {rec.recommended_day} · {rec.recommended_time}
                    </p>

                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-lg font-display font-bold text-atlas-400">
                          {formatPercent(rec.predicted_fill_rate)}
                        </p>
                        <p className="text-[10px] text-text-muted">Fill Rate</p>
                      </div>
                      <div>
                        <p className="text-lg font-display font-bold text-text-primary">
                          {rec.opportunity_score}
                        </p>
                        <p className="text-[10px] text-text-muted">Opp. Score</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Selected recommendation detail */}
            <div className="lg:col-span-3">
              <Card className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-text-primary">
                      {selectedRec.area_name}
                    </h3>
                    <p className="text-sm text-text-muted">
                      Recommendation #{selectedRec.rank} · {getEventTypeInfo(selectedRec.recommended_event_type).label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-atlas-400">
                      {formatPercent(selectedRec.predicted_fill_rate)}
                    </p>
                    <p className="text-xs text-text-muted">predicted fill rate</p>
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="mb-6">
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-3">
                    Factor Breakdown
                  </p>
                  <div className="space-y-3">
                    {selectedRec.explanation.map((factor, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-text-secondary">
                            {factor.factor}
                          </span>
                          <span className="text-xs text-atlas-400 font-mono">
                            {(factor.impact * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-atlas-600 to-atlas-400 transition-all duration-700"
                            style={{ width: `${factor.impact * 100 * 2.8}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-white/30 rounded-xl border border-white/60">
                  <div className="text-center">
                    <p className="text-sm font-display font-bold text-text-primary">{selectedRec.recommended_day}</p>
                    <p className="text-[10px] text-text-muted">Best Day</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-display font-bold text-text-primary">{selectedRec.recommended_time}</p>
                    <p className="text-[10px] text-text-muted">Best Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-display font-bold text-text-primary">{formatPercent(selectedRec.confidence)}</p>
                    <p className="text-[10px] text-text-muted">Confidence</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button size="md" className="flex-1">
                    <Zap className="w-4 h-4" />
                    Launch Event Here
                  </Button>
                  <Button variant="secondary" size="md">
                    <Target className="w-4 h-4" />
                    Simulate
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
