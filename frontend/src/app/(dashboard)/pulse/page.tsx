/* ═══════════════════════════════════════════════════════════
   Gaya — Pulse: Real-Time Command Center
   Live activity feed, system health monitor, zone alerts,
   sparkline metrics, and animated event stream
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Card, Badge, Button, StatCard } from '@/components/ui';
import { cn, formatPrice, timeAgo } from '@/lib/utils';
import {
  Activity, Radio, Zap, Users, MapPin, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Brain, Flame,
  Bell, Filter, Pause, Play, ChevronDown,
  ArrowUpRight, ArrowDownRight, Shield, Server,
  Database, Wifi, Cpu, Globe, Eye, BookOpen
} from 'lucide-react';
import type { ActivityItem, ActivityType, SystemHealth } from '@/types';

// ─── Activity Generator ──────────────────────────────────
// Simulates real-time WebSocket events

const ZONES = ['Scarborough', 'North York', 'Brampton', 'Mississauga', 'Etobicoke', 'Vaughan', 'Markham', 'Downtown', 'Ajax', 'Oakville'];
const NAMES = ['Sarah M.', 'David K.', 'Jennifer T.', 'Mike R.', 'Lisa W.', 'James P.', 'Ana S.', 'Chris B.', 'Emma L.', 'Ryan H.', 'Priya N.', 'Carlos F.'];
const EVENTS_LIST = ['Spring Elite Camp', 'Technical Skills Clinic', 'GK Masterclass', 'Speed & Agility Bootcamp', 'U12 Academy Trial', 'Summer Camp 2026'];
const COACHES = ['Marcus Thompson', 'Adriana Costa', 'David Park', 'Fatima Al-Hassan', 'Jake Hartley', 'Nina Okafor'];

function generateActivity(id: number): ActivityItem {
  const types: ActivityType[] = [
    'booking_created', 'lead_submitted', 'event_published', 'coach_joined',
    'review_posted', 'milestone_reached', 'alert_triggered', 'recommendation_generated',
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const event = EVENTS_LIST[Math.floor(Math.random() * EVENTS_LIST.length)];
  const coach = COACHES[Math.floor(Math.random() * COACHES.length)];

  const configs: Record<ActivityType, () => Partial<ActivityItem>> = {
    booking_created: () => ({
      title: `New booking: ${event}`,
      description: `${name} booked a spot in ${coach}'s ${event} in ${zone}`,
      severity: 'success' as const,
    }),
    lead_submitted: () => ({
      title: `New lead from ${zone}`,
      description: `${name} requested info about training options in ${zone}`,
      severity: 'info' as const,
    }),
    event_published: () => ({
      title: `Event published: ${event}`,
      description: `${coach} just listed a new event in ${zone} — ${event}`,
      severity: 'info' as const,
    }),
    coach_joined: () => ({
      title: `New coach: ${coach}`,
      description: `${coach} joined the platform and set up ${zone} as their primary location`,
      severity: 'success' as const,
    }),
    review_posted: () => ({
      title: `⭐ New 5-star review`,
      description: `${name} left a glowing review for ${coach} — "${event} was incredible"`,
      severity: 'success' as const,
    }),
    milestone_reached: () => ({
      title: `🎯 Milestone: ${zone}`,
      description: `${zone} just passed 100 total bookings this quarter — up 34% from last quarter`,
      severity: 'success' as const,
    }),
    alert_triggered: () => ({
      title: `⚠️ Supply gap alert: ${zone}`,
      description: `Demand in ${zone} exceeded supply by 3x this week. Consider recruiting coaches.`,
      severity: 'warning' as const,
    }),
    recommendation_generated: () => ({
      title: `🧠 ML recommendation ready`,
      description: `New expansion opportunity identified in ${zone} — predicted 84% fill rate for camps`,
      severity: 'info' as const,
    }),
    zone_status_change: () => ({
      title: `Zone status change: ${zone}`,
      description: `${zone} moved from "underserved" to "balanced" status`,
      severity: 'info' as const,
    }),
  };

  const config = configs[type]();
  const minutesAgo = Math.floor(Math.random() * 120);
  const created = new Date(Date.now() - minutesAgo * 60000).toISOString();

  return {
    id: `act-${id}`,
    type,
    title: config.title!,
    description: config.description!,
    metadata: {},
    actor_name: name,
    zone,
    severity: config.severity,
    created_at: created,
  };
}

// ─── Activity Icon Map ────────────────────────────────────

const activityIcons: Record<ActivityType, { icon: typeof Zap; color: string; bg: string }> = {
  booking_created: { icon: BookOpen, color: 'text-atlas-400', bg: 'bg-atlas-500/10' },
  lead_submitted: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  event_published: { icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  coach_joined: { icon: Shield, color: 'text-atlas-400', bg: 'bg-atlas-500/10' },
  review_posted: { icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  milestone_reached: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  alert_triggered: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  recommendation_generated: { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  zone_status_change: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

// ─── Mini Sparkline ───────────────────────────────────────

function Sparkline({ data, color = '#3b82f6', height = 30 }: { data: number[]; color?: string; height?: number }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          fill={`url(#spark-${color.replace('#', '')})`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── System Health Card ───────────────────────────────────

const MOCK_HEALTH: SystemHealth[] = [
  { service: 'API Server', status: 'healthy', latency_ms: 42, uptime_percent: 99.97, last_check: new Date().toISOString() },
  { service: 'PostgreSQL + PostGIS', status: 'healthy', latency_ms: 8, uptime_percent: 99.99, last_check: new Date().toISOString() },
  { service: 'Redis Cache', status: 'healthy', latency_ms: 2, uptime_percent: 99.99, last_check: new Date().toISOString() },
  { service: 'Celery Workers', status: 'healthy', latency_ms: 156, uptime_percent: 99.91, last_check: new Date().toISOString() },
  { service: 'ML Pipeline', status: 'degraded', latency_ms: 890, uptime_percent: 98.5, last_check: new Date().toISOString(), details: 'High prediction queue depth' },
  { service: 'Tile Server', status: 'healthy', latency_ms: 23, uptime_percent: 99.95, last_check: new Date().toISOString() },
];

const healthIcons: Record<string, typeof Server> = {
  'API Server': Globe,
  'PostgreSQL + PostGIS': Database,
  'Redis Cache': Cpu,
  'Celery Workers': Activity,
  'ML Pipeline': Brain,
  'Tile Server': MapPin,
};

// ─── Page Component ───────────────────────────────────────

export default function PulsePage() {
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    Array.from({ length: 25 }, (_, i) => generateActivity(i))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'bookings' | 'leads'>('all');
  const [newCount, setNewCount] = useState(0);
  const counterRef = useRef(25);
  const feedRef = useRef<HTMLDivElement>(null);

  // Simulate real-time feed
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      counterRef.current++;
      const newActivity = generateActivity(counterRef.current);
      newActivity.created_at = new Date().toISOString();
      setActivities((prev) => [newActivity, ...prev].slice(0, 100));
      setNewCount((c) => c + 1);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Reset new count on scroll
  useEffect(() => {
    if (newCount > 0) {
      const timer = setTimeout(() => setNewCount(0), 5000);
      return () => clearTimeout(timer);
    }
  }, [newCount]);

  // Generate sparkline data
  const sparklines = useMemo(() => ({
    bookings: Array.from({ length: 24 }, () => 3 + Math.random() * 12),
    leads: Array.from({ length: 24 }, () => 5 + Math.random() * 15),
    fillRate: Array.from({ length: 24 }, () => 60 + Math.random() * 25),
    revenue: Array.from({ length: 24 }, () => 800 + Math.random() * 2000),
  }), []);

  // Zone activity heat
  const zoneHeat = useMemo(() =>
    ZONES.map((zone) => ({
      zone,
      count: activities.filter((a) => a.zone === zone).length,
    })).sort((a, b) => b.count - a.count).slice(0, 8)
  , [activities]);

  // Filter activities
  const filtered = useMemo(() => {
    if (filter === 'all') return activities;
    if (filter === 'alerts') return activities.filter((a) => a.severity === 'warning' || a.severity === 'critical');
    if (filter === 'bookings') return activities.filter((a) => a.type === 'booking_created');
    if (filter === 'leads') return activities.filter((a) => a.type === 'lead_submitted');
    return activities;
  }, [activities, filter]);

  return (
    <div className="min-h-screen pb-16">
      {/* ─── Header ─── */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-red-400" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3">
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
                  <div className="relative w-3 h-3 rounded-full bg-red-500" />
                </div>
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-text-primary">Pulse</h1>
                <p className="text-sm text-text-muted">
                  Real-time activity feed · System health · Zone alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isPaused ? 'warning' : 'success'} dot>
                {isPaused ? 'Paused' : 'Live'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                icon={isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        {/* ─── Live Metrics ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Bookings Today', value: '47', trend: 12, sparkData: sparklines.bookings, color: '#3b82f6', icon: BookOpen },
            { label: 'New Leads', value: '23', trend: 8, sparkData: sparklines.leads, color: '#4d9fff', icon: Users },
            { label: 'Avg Fill Rate', value: '76%', trend: 3, sparkData: sparklines.fillRate, color: '#ffb84d', icon: TrendingUp },
            { label: 'Revenue Today', value: '$4,280', trend: 18, sparkData: sparklines.revenue, color: '#a78bfa', icon: Zap },
          ].map((metric) => (
            <Card key={metric.label} padding="sm" className="relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{metric.label}</span>
                <metric.icon className="w-3.5 h-3.5 text-text-muted/50" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ArrowUpRight className="w-3 h-3 text-atlas-400" />
                    <span className="text-[10px] text-atlas-400 font-medium">+{metric.trend}%</span>
                    <span className="text-[10px] text-text-muted">vs yesterday</span>
                  </div>
                </div>
                <div className="w-24 h-8 opacity-60">
                  <Sparkline data={metric.sparkData} color={metric.color} height={32} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ─── Activity Feed (Left) ─── */}
          <div className="lg:col-span-7">
            {/* Filter bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {(['all', 'alerts', 'bookings', 'leads'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                      filter === f
                        ? 'bg-atlas-500/15 text-atlas-400'
                        : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50'
                    )}
                  >
                    {f === 'alerts' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {f}
                  </button>
                ))}
              </div>
              {newCount > 0 && (
                <button
                  onClick={() => { feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); setNewCount(0); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atlas-500/10 text-atlas-400 text-xs font-medium animate-pulse"
                >
                  <ArrowUpRight className="w-3 h-3" /> {newCount} new events
                </button>
              )}
            </div>

            {/* Feed */}
            <div ref={feedRef} className="space-y-2 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {filtered.map((activity, i) => {
                const iconConfig = activityIcons[activity.type] || activityIcons.booking_created;
                const IconComponent = iconConfig.icon;

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'group flex gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-slate-50 border border-transparent',
                      i === 0 && 'animate-slide-up',
                      activity.severity === 'warning' && 'bg-amber-500/[0.02] border-amber-500/10',
                      activity.severity === 'critical' && 'bg-red-500/[0.02] border-red-500/10',
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconConfig.bg)}>
                      <IconComponent className={cn('w-4 h-4', iconConfig.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-text-primary leading-snug">
                          {activity.title}
                        </p>
                        <span className="text-[10px] text-text-muted shrink-0">
                          {timeAgo(activity.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.zone && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="default" size="sm">
                            <MapPin className="w-2.5 h-2.5" /> {activity.zone}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right Panel ─── */}
          <div className="lg:col-span-5 space-y-6">
            {/* System Health */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-text-primary">System Health</h3>
                <Badge variant="success" dot size="sm">All Systems Operational</Badge>
              </div>
              <div className="space-y-2">
                {MOCK_HEALTH.map((service) => {
                  const Icon = healthIcons[service.service] || Server;
                  return (
                    <div
                      key={service.service}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-xl transition-all',
                        service.status === 'degraded' ? 'bg-amber-500/[0.03] border border-amber-500/10' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        service.status === 'healthy' ? 'bg-atlas-500/10' :
                        service.status === 'degraded' ? 'bg-amber-500/10' : 'bg-red-500/10'
                      )}>
                        <Icon className={cn(
                          'w-3.5 h-3.5',
                          service.status === 'healthy' ? 'text-atlas-400' :
                          service.status === 'degraded' ? 'text-amber-400' : 'text-red-400'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary">{service.service}</p>
                        {service.details && (
                          <p className="text-[10px] text-amber-400">{service.details}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-text-secondary">{service.latency_ms}ms</p>
                        <p className="text-[10px] text-text-muted">{service.uptime_percent}%</p>
                      </div>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        service.status === 'healthy' ? 'bg-atlas-500' :
                        service.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                      )} />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Zone Activity Heat */}
            <Card>
              <h3 className="font-display font-semibold text-text-primary mb-1">Zone Activity</h3>
              <p className="text-xs text-text-muted mb-4">Events per zone in current feed</p>
              <div className="space-y-2">
                {zoneHeat.map((zone, i) => {
                  const maxCount = zoneHeat[0]?.count || 1;
                  const pct = (zone.count / maxCount) * 100;
                  return (
                    <div key={zone.zone} className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary w-24 truncate">{zone.zone}</span>
                      <div className="flex-1 h-3 bg-slate-100/50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            i === 0 ? 'bg-gradient-to-r from-atlas-600 to-atlas-400' :
                            i === 1 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                            'bg-gradient-to-r from-white/10 to-white/20'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-muted w-6 text-right">{zone.count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <h3 className="font-display font-semibold text-text-primary mb-3">Active Alerts</h3>
              <div className="space-y-2">
                {activities
                  .filter((a) => a.severity === 'warning' || a.severity === 'critical')
                  .slice(0, 4)
                  .map((alert) => (
                    <div key={alert.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/[0.03] border border-amber-500/10">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary">{alert.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{timeAgo(alert.created_at)}</p>
                      </div>
                    </div>
                  ))
                }
                {activities.filter((a) => a.severity === 'warning').length === 0 && (
                  <div className="flex items-center gap-2 p-4 text-text-muted">
                    <CheckCircle className="w-4 h-4 text-atlas-400" />
                    <span className="text-xs">No active alerts</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
