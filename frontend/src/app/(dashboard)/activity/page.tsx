// activity heatmap - github-style contribution calendar for coach engagement, events, leads, and streaks

'use client';

import { useState, useMemo } from 'react';
import {
  Flame, Calendar, Users, Star, TrendingUp, Target,
  ChevronLeft, ChevronRight, Award, Zap, Activity,
  MapPin, Clock, DollarSign, ArrowUpRight, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface DayData {
  date: string;
  events: number;
  leads: number;
  bookings: number;
  xp: number;
}

interface TimelineItem {
  id: string;
  type: 'event' | 'lead' | 'booking' | 'review' | 'milestone' | 'streak';
  title: string;
  description: string;
  timestamp: string;
  xp: number;
  icon: React.ElementType;
  accent: string;
}


function generateHeatmapData(): DayData[] {
  const data: DayData[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const month = d.getMonth();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // simulate realistic activity patterns
    const seasonMultiplier = [6, 7, 8].includes(month) ? 2.5 : [5, 9].includes(month) ? 1.5 : [11, 0, 1].includes(month) ? 0.6 : 1;
    const weekdayMultiplier = isWeekend ? 1.3 : 1;
    const randomness = Math.random();
    const base = randomness * seasonMultiplier * weekdayMultiplier;

    const events = base > 1.8 ? Math.floor(Math.random() * 4) + 2 : base > 1 ? Math.floor(Math.random() * 3) + 1 : base > 0.4 ? 1 : 0;
    const leads = events > 0 ? Math.floor(Math.random() * (events * 3)) + 1 : Math.random() > 0.5 ? Math.floor(Math.random() * 2) : 0;
    const bookings = leads > 0 ? Math.floor(leads * (0.3 + Math.random() * 0.4)) : 0;
    const xp = events * 50 + leads * 25 + bookings * 75;

    data.push({
      date: d.toISOString().split('T')[0],
      events,
      leads,
      bookings,
      xp,
    });
  }
  return data;
}


function getActivityLevel(xp: number): 0 | 1 | 2 | 3 | 4 {
  if (xp === 0) return 0;
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  return 4;
}

const LEVEL_COLORS = [
  'bg-slate-50',
  'bg-atlas-500/20',
  'bg-atlas-500/40',
  'bg-atlas-500/60',
  'bg-atlas-500/90',
];


const TIMELINE: TimelineItem[] = [
  { id: 't1', type: 'event', title: 'Spring Elite Camp', description: 'Hosted 5-day camp in Scarborough East · 37/40 filled', timestamp: '2 hours ago', xp: 250, icon: Calendar, accent: 'bg-atlas-500/10 text-atlas-400' },
  { id: 't2', type: 'review', title: '5-Star Review Received', description: '"Best coaching experience my son has ever had" — Jennifer P.', timestamp: '4 hours ago', xp: 100, icon: Star, accent: 'bg-amber-500/10 text-amber-400' },
  { id: 't3', type: 'booking', title: 'New Booking Confirmed', description: 'David Kim booked Summer Intensive Camp · $349', timestamp: '6 hours ago', xp: 75, icon: DollarSign, accent: 'bg-green-500/10 text-green-400' },
  { id: 't4', type: 'lead', title: '3 New Leads Captured', description: 'Via discovery map search · Scarborough East zone', timestamp: 'yesterday', xp: 75, icon: Users, accent: 'bg-blue-500/10 text-blue-400' },
  { id: 't5', type: 'milestone', title: 'Level 42 Reached! 🎉', description: 'Earned 1,200 XP this week · Legend tier maintained', timestamp: 'yesterday', xp: 500, icon: Award, accent: 'bg-purple-500/10 text-purple-400' },
  { id: 't6', type: 'streak', title: '47-Day Streak!', description: 'Hosted events or converted leads for 47 consecutive days', timestamp: '2 days ago', xp: 50, icon: Flame, accent: 'bg-red-500/10 text-red-400' },
  { id: 't7', type: 'event', title: 'Speed & Agility Clinic', description: 'Hosted evening clinic in North York · 20/20 sold out', timestamp: '3 days ago', xp: 200, icon: Calendar, accent: 'bg-atlas-500/10 text-atlas-400' },
  { id: 't8', type: 'booking', title: '5 Bookings Confirmed', description: 'From waitlist conversion · $1,745 total revenue', timestamp: '4 days ago', xp: 375, icon: DollarSign, accent: 'bg-green-500/10 text-green-400' },
];


function HeatmapCalendar({ data, metric }: { data: DayData[]; metric: 'xp' | 'events' | 'leads' | 'bookings' }) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // group by weeks
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];

    // pad start to align with sunday
    const firstDate = new Date(data[0].date);
    const startPad = firstDate.getDay();
    for (let i = 0; i < startPad; i++) {
      currentWeek.push({ date: '', events: 0, leads: 0, bookings: 0, xp: 0 });
    }

    for (const day of data) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [data]);

  const getValue = (day: DayData) => {
    switch (metric) {
      case 'xp': return day.xp;
      case 'events': return day.events * 50;
      case 'leads': return day.leads * 25;
      case 'bookings': return day.bookings * 75;
    }
  };

  // month labels
  const months = useMemo(() => {
    const labels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      for (const day of week) {
        if (!day.date) continue;
        const m = new Date(day.date).getMonth();
        if (m !== lastMonth) {
          labels.push({ label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m], weekIdx });
          lastMonth = m;
        }
        break;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="relative">
      {/* month labels */}
      <div className="flex mb-1.5 ml-8">
        {months.map((m, i) => (
          <div key={i} className="text-[9px] text-text-muted" style={{ position: 'relative', left: `${m.weekIdx * 14}px` }}>
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-0">
        {/* day labels */}
        <div className="flex flex-col justify-between pr-2 py-0.5" style={{ height: `${7 * 12 + 6}px` }}>
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
            <span key={i} className="text-[9px] text-text-muted leading-none h-[10px] flex items-center">{d}</span>
          ))}
        </div>

        {/* grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day, di) => {
                const level = getActivityLevel(getValue(day));
                return (
                  <div
                    key={di}
                    className={cn(
                      'w-[10px] h-[10px] rounded-[2px] transition-colors cursor-pointer',
                      day.date ? LEVEL_COLORS[level] : 'bg-transparent',
                      day.date && 'hover:ring-1 hover:ring-white/20'
                    )}
                    onMouseEnter={(e) => {
                      if (day.date) {
                        setHoveredDay(day);
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltipPos({ x: rect.left, y: rect.top - 60 });
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div className="fixed z-50 px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 shadow-xl"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}>
          <p className="text-[10px] font-medium text-text-primary">{new Date(hoveredDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-[9px] text-text-muted">{hoveredDay.events} events</span>
            <span className="text-[9px] text-text-muted">{hoveredDay.leads} leads</span>
            <span className="text-[9px] text-text-muted">{hoveredDay.bookings} bookings</span>
          </div>
          <p className="text-[9px] text-atlas-400 mt-0.5">{hoveredDay.xp} XP earned</p>
        </div>
      )}

      {/* legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[9px] text-text-muted">Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={cn('w-[10px] h-[10px] rounded-[2px]', color)} />
        ))}
        <span className="text-[9px] text-text-muted">More</span>
      </div>
    </div>
  );
}


export default function ActivityPage() {
  const [metric, setMetric] = useState<'xp' | 'events' | 'leads' | 'bookings'>('xp');
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  // compute stats from data
  const totalXP = heatmapData.reduce((s, d) => s + d.xp, 0);
  const totalEvents = heatmapData.reduce((s, d) => s + d.events, 0);
  const totalLeads = heatmapData.reduce((s, d) => s + d.leads, 0);
  const totalBookings = heatmapData.reduce((s, d) => s + d.bookings, 0);
  const activeDays = heatmapData.filter(d => d.xp > 0).length;
  const currentStreak = (() => {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].xp > 0) streak++;
      else break;
    }
    return streak;
  })();
  const longestStreak = (() => {
    let max = 0, current = 0;
    for (const d of heatmapData) {
      if (d.xp > 0) { current++; max = Math.max(max, current); }
      else current = 0;
    }
    return max;
  })();

  const metrics = ['xp', 'events', 'leads', 'bookings'] as const;

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-atlas-400" />
                <span className="text-xs font-medium text-atlas-400 uppercase tracking-wider">Activity</span>
              </div>
              <h1 className="font-display font-bold text-2xl text-text-primary">Engagement Heatmap</h1>
              <p className="text-sm text-text-muted mt-1">Your coaching activity over the past year</p>
            </div>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Total XP', value: totalXP.toLocaleString(), icon: Zap, color: 'text-atlas-400' },
              { label: 'Events Hosted', value: totalEvents.toString(), icon: Calendar, color: 'text-blue-400' },
              { label: 'Leads Captured', value: totalLeads.toString(), icon: Users, color: 'text-purple-400' },
              { label: 'Bookings', value: totalBookings.toString(), icon: DollarSign, color: 'text-green-400' },
              { label: 'Current Streak', value: `${currentStreak}d`, icon: Flame, color: currentStreak >= 30 ? 'text-red-400' : 'text-amber-400' },
              { label: 'Active Days', value: `${activeDays}/365`, icon: Target, color: 'text-cyan-400' },
            ].map(stat => (
              <div key={stat.label} className="px-4 py-3 rounded-xl bg-white/40 border border-white/60">
                <stat.icon className={cn('w-4 h-4 mb-1.5', stat.color)} />
                <p className="text-lg font-display font-bold text-text-primary">{stat.value}</p>
                <p className="text-[10px] text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* heatmap */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-text-primary">Contribution Calendar</h2>
                <div className="flex gap-1 p-0.5 rounded-lg bg-white/40 border border-white/60">
                  {metrics.map(m => (
                    <button key={m} onClick={() => setMetric(m)}
                      className={cn('px-2.5 py-1 rounded-md text-[10px] font-medium transition-all capitalize',
                        metric === m ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary')}>
                      {m === 'xp' ? 'XP' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <HeatmapCalendar data={heatmapData} metric={metric} />
              </div>

              {/* streak info */}
              <div className="mt-6 flex items-center gap-6 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-text-muted">Current streak: <span className="font-semibold text-text-primary">{currentStreak} days</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-text-muted">Longest streak: <span className="font-semibold text-text-primary">{longestStreak} days</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-atlas-400" />
                  <span className="text-xs text-text-muted">Active: <span className="font-semibold text-text-primary">{Math.round((activeDays / 365) * 100)}%</span> of days</span>
                </div>
              </div>
            </div>

            {/* monthly breakdown */}
            <div className="mt-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-6">
              <h2 className="font-display font-semibold text-text-primary mb-4">Monthly Breakdown</h2>
              <div className="space-y-2">
                {(() => {
                  const monthlyData: Record<string, { events: number; leads: number; bookings: number; xp: number }> = {};
                  heatmapData.forEach(d => {
                    const month = d.date.slice(0, 7);
                    if (!monthlyData[month]) monthlyData[month] = { events: 0, leads: 0, bookings: 0, xp: 0 };
                    monthlyData[month].events += d.events;
                    monthlyData[month].leads += d.leads;
                    monthlyData[month].bookings += d.bookings;
                    monthlyData[month].xp += d.xp;
                  });
                  return Object.entries(monthlyData).slice(-6).reverse().map(([month, stats]) => {
                    const date = new Date(month + '-01');
                    const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const maxXP = Math.max(...Object.values(monthlyData).map(m => m.xp));
                    return (
                      <div key={month} className="flex items-center gap-4">
                        <span className="text-xs text-text-muted w-16">{label}</span>
                        <div className="flex-1 h-4 rounded-full bg-slate-50 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-atlas-500/60 to-atlas-500/30 transition-all"
                            style={{ width: `${(stats.xp / maxXP) * 100}%` }} />
                        </div>
                        <div className="flex gap-4 text-[10px] text-text-muted w-48">
                          <span>{stats.events} events</span>
                          <span>{stats.leads} leads</span>
                          <span className="text-atlas-400 font-medium">{stats.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* activity timeline */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="font-display font-semibold text-text-primary">Recent Activity</h2>
                <p className="text-[10px] text-text-muted mt-0.5">Your latest coaching milestones</p>
              </div>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {TIMELINE.map(item => (
                  <div key={item.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', item.accent)}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-medium text-text-primary truncate">{item.title}</p>
                        <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-atlas-400 font-medium">
                          <Zap className="w-2.5 h-2.5" />+{item.xp}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-snug">{item.description}</p>
                      <p className="text-[9px] text-text-muted/50 mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
