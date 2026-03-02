/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Season Planner
   Multi-month event programming with capacity planning, revenue
   forecasting, zone allocation, and visual timeline. Seasonal
   overview with phase management and resource allocation.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Calendar, MapPin, Users, DollarSign, TrendingUp, Target,
  ChevronLeft, ChevronRight, Plus, Clock, Star, Zap, Eye,
  BarChart3, Layers, CheckCircle, AlertTriangle, Sparkles,
  Sun, Cloud, Snowflake, Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface SeasonEvent {
  id: string;
  title: string;
  type: 'camp' | 'clinic' | 'private' | 'tournament';
  zone: string;
  startWeek: number;
  duration: number; // weeks
  capacity: number;
  price: number;
  projectedFill: number;
  status: 'planned' | 'confirmed' | 'active' | 'completed';
  coach: string;
  color: string;
}

interface SeasonPhase {
  name: string;
  weeks: [number, number];
  description: string;
  icon: React.ElementType;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const seasonConfig = {
  name: 'Spring 2025',
  season: 'spring' as Season,
  startDate: 'Mar 1, 2025',
  endDate: 'May 31, 2025',
  totalWeeks: 13,
  phases: [
    { name: 'Pre-Season', weeks: [1, 3] as [number, number], description: 'Marketing + early registrations', icon: Target },
    { name: 'Launch', weeks: [4, 6] as [number, number], description: 'First events, initial camps', icon: Zap },
    { name: 'Peak Season', weeks: [7, 10] as [number, number], description: 'Maximum event density', icon: Sun },
    { name: 'Wind Down', weeks: [11, 13] as [number, number], description: 'Final events + summer planning', icon: Leaf },
  ],
};

const events: SeasonEvent[] = [
  { id: 'e1', title: 'Spring Elite Camp', type: 'camp', zone: 'Scarborough', startWeek: 4, duration: 3, capacity: 40, price: 299, projectedFill: 94, status: 'confirmed', coach: 'Marcus T.', color: 'bg-atlas-500/30 border-atlas-500/50' },
  { id: 'e2', title: 'Speed & Agility Clinic', type: 'clinic', zone: 'North York', startWeek: 5, duration: 2, capacity: 20, price: 89, projectedFill: 88, status: 'confirmed', coach: 'Sarah C.', color: 'bg-blue-500/30 border-blue-500/50' },
  { id: 'e3', title: 'GK Training Series', type: 'clinic', zone: 'Etobicoke', startWeek: 6, duration: 4, capacity: 15, price: 79, projectedFill: 82, status: 'planned', coach: 'David P.', color: 'bg-purple-500/30 border-purple-500/50' },
  { id: 'e4', title: 'Summer Prep Camp', type: 'camp', zone: 'Ajax', startWeek: 8, duration: 2, capacity: 30, price: 249, projectedFill: 91, status: 'planned', coach: 'Marcus T.', color: 'bg-green-500/30 border-green-500/50' },
  { id: 'e5', title: 'Private Sessions Block', type: 'private', zone: 'Scarborough', startWeek: 3, duration: 10, capacity: 5, price: 120, projectedFill: 96, status: 'active', coach: 'Marcus T.', color: 'bg-amber-500/30 border-amber-500/50' },
  { id: 'e6', title: 'Weekend Tournament', type: 'tournament', zone: 'Brampton', startWeek: 10, duration: 1, capacity: 120, price: 45, projectedFill: 78, status: 'planned', coach: 'All', color: 'bg-red-500/30 border-red-500/50' },
  { id: 'e7', title: 'U10 Skills Camp', type: 'camp', zone: 'Mississauga', startWeek: 7, duration: 2, capacity: 25, price: 199, projectedFill: 85, status: 'planned', coach: 'Sarah C.', color: 'bg-cyan-500/30 border-cyan-500/50' },
  { id: 'e8', title: 'Elite 1v1 Clinic', type: 'clinic', zone: 'North York', startWeek: 9, duration: 3, capacity: 12, price: 129, projectedFill: 92, status: 'planned', coach: 'Aisha O.', color: 'bg-pink-500/30 border-pink-500/50' },
];

const zones = ['Scarborough', 'North York', 'Etobicoke', 'Ajax', 'Brampton', 'Mississauga'];
const weeks = Array.from({ length: seasonConfig.totalWeeks }, (_, i) => i + 1);

// ─── Page ───────────────────────────────────────────────────────────

export default function SeasonPlannerPage() {
  const [selectedEvent, setSelectedEvent] = useState<SeasonEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'zone'>('timeline');

  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);
  const projectedRevenue = events.reduce((s, e) => s + (e.capacity * e.price * e.projectedFill / 100), 0);
  const avgFill = Math.round(events.reduce((s, e) => s + e.projectedFill, 0) / events.length);

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" /> Season Planner
              </h1>
              <p className="text-xs text-text-muted mt-0.5">{seasonConfig.name} · {seasonConfig.startDate} — {seasonConfig.endDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-white/40 border border-white/60 p-0.5">
                {(['timeline', 'zone'] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      viewMode === m ? 'bg-atlas-500/10 text-atlas-400' : 'text-text-muted')}>
                    {m === 'timeline' ? 'Timeline' : 'By Zone'}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-xs font-medium text-atlas-400">
                <Plus className="w-3.5 h-3.5" /> Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Events', value: events.length.toString(), icon: Calendar, color: 'text-atlas-400' },
            { label: 'Total Capacity', value: totalCapacity.toLocaleString(), icon: Users, color: 'text-blue-400' },
            { label: 'Projected Revenue', value: `$${Math.round(projectedRevenue / 1000)}K`, icon: DollarSign, color: 'text-green-400' },
            { label: 'Avg Fill Rate', value: `${avgFill}%`, icon: Target, color: 'text-amber-400' },
            { label: 'Active Zones', value: Array.from(new Set(events.map(e => e.zone))).length.toString(), icon: MapPin, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
              <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Season Phases */}
        <div className="flex gap-2 mb-4">
          {seasonConfig.phases.map(phase => (
            <div key={phase.name} className="flex-1 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center gap-2 mb-1">
                <phase.icon className="w-3.5 h-3.5 text-atlas-400" />
                <span className="text-xs font-semibold text-text-primary">{phase.name}</span>
              </div>
              <p className="text-[10px] text-text-muted">{phase.description}</p>
              <p className="text-[10px] text-text-muted/50 mt-0.5">Weeks {phase.weeks[0]}-{phase.weeks[1]}</p>
            </div>
          ))}
        </div>

        {/* Timeline Gantt View */}
        <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
          {/* Week Headers */}
          <div className="flex border-b border-slate-200">
            <div className="w-48 shrink-0 px-4 py-2 text-[10px] text-text-muted font-medium border-r border-slate-200">
              {viewMode === 'timeline' ? 'Event' : 'Zone'}
            </div>
            {weeks.map(w => {
              const inPhase = seasonConfig.phases.find(p => w >= p.weeks[0] && w <= p.weeks[1]);
              return (
                <div key={w} className="flex-1 px-1 py-2 text-center border-r border-white/[0.03] min-w-[50px]">
                  <p className="text-[9px] text-text-muted">W{w}</p>
                  {inPhase && w === inPhase.weeks[0] && (
                    <p className="text-[7px] text-atlas-400/60 truncate">{inPhase.name}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {viewMode === 'timeline' ? (
            // Timeline: one row per event
            events.map(event => (
              <div key={event.id} className="flex border-b border-white/[0.03] hover:bg-slate-50 cursor-pointer"
                onClick={() => setSelectedEvent(event)}>
                <div className="w-48 shrink-0 px-4 py-3 border-r border-slate-200">
                  <p className="text-xs font-medium text-text-primary truncate">{event.title}</p>
                  <p className="text-[10px] text-text-muted">{event.zone} · {event.coach}</p>
                </div>
                <div className="flex-1 flex relative py-2 px-1">
                  {weeks.map(w => (
                    <div key={w} className="flex-1 border-r border-white/[0.02] min-w-[50px]" />
                  ))}
                  {/* Event bar */}
                  <div className={cn('absolute top-2 h-[calc(100%-16px)] rounded-lg border flex items-center px-2', event.color)}
                    style={{
                      left: `${((event.startWeek - 1) / seasonConfig.totalWeeks) * 100}%`,
                      width: `${(event.duration / seasonConfig.totalWeeks) * 100}%`,
                    }}>
                    <span className="text-[9px] text-text-primary font-medium truncate">
                      {event.type} · {event.projectedFill}% fill
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Zone view: one row per zone
            zones.map(zone => {
              const zoneEvents = events.filter(e => e.zone === zone);
              return (
                <div key={zone} className="flex border-b border-white/[0.03]">
                  <div className="w-48 shrink-0 px-4 py-3 border-r border-slate-200">
                    <p className="text-xs font-medium text-text-primary">{zone}</p>
                    <p className="text-[10px] text-text-muted">{zoneEvents.length} events</p>
                  </div>
                  <div className="flex-1 flex relative py-2 px-1" style={{ minHeight: '40px' }}>
                    {weeks.map(w => (
                      <div key={w} className="flex-1 border-r border-white/[0.02] min-w-[50px]" />
                    ))}
                    {zoneEvents.map(event => (
                      <div key={event.id} onClick={() => setSelectedEvent(event)}
                        className={cn('absolute top-1 h-6 rounded border flex items-center px-1.5 cursor-pointer hover:opacity-90', event.color)}
                        style={{
                          left: `${((event.startWeek - 1) / seasonConfig.totalWeeks) * 100}%`,
                          width: `${(event.duration / seasonConfig.totalWeeks) * 100}%`,
                        }}>
                        <span className="text-[8px] text-text-primary truncate">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Event Detail */}
        {selectedEvent && (
          <div className="mt-4 p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium',
                    selectedEvent.type === 'camp' ? 'bg-atlas-500/10 text-atlas-400' :
                    selectedEvent.type === 'clinic' ? 'bg-blue-500/10 text-blue-400' :
                    selectedEvent.type === 'tournament' ? 'bg-red-500/10 text-red-400' :
                    'bg-purple-500/10 text-purple-400'
                  )}>{selectedEvent.type}</span>
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium',
                    selectedEvent.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                    selectedEvent.status === 'active' ? 'bg-atlas-500/10 text-atlas-400' :
                    'bg-slate-50 text-text-muted'
                  )}>{selectedEvent.status}</span>
                </div>
                <h3 className="text-base font-display font-bold text-text-primary">{selectedEvent.title}</h3>
                <p className="text-xs text-text-muted mt-0.5">Coach: {selectedEvent.coach} · Zone: {selectedEvent.zone}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-text-muted hover:text-text-secondary text-xs">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-3 mt-4">
              {[
                { label: 'Duration', value: `${selectedEvent.duration} weeks` },
                { label: 'Capacity', value: selectedEvent.capacity.toString() },
                { label: 'Price', value: `$${selectedEvent.price}` },
                { label: 'Projected Fill', value: `${selectedEvent.projectedFill}%` },
                { label: 'Est. Revenue', value: `$${Math.round(selectedEvent.capacity * selectedEvent.price * selectedEvent.projectedFill / 100).toLocaleString()}` },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg bg-white/40 text-center">
                  <p className="text-sm font-display font-bold text-text-primary">{m.value}</p>
                  <p className="text-[9px] text-text-muted">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">AI Season Optimization</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { tip: 'Gap in Brampton weeks 4-8 — add a U12 camp to capture underserved demand (score: 91)', action: 'Add Event' },
              { tip: 'Weekend Tournament overlaps with Marcus\'s private block — consider shifting to Week 11', action: 'Resolve' },
              { tip: 'Projected revenue could increase 18% by adding Thursday evening clinics in North York', action: 'Explore' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50">
                <p className="text-[10px] text-text-secondary leading-relaxed">{s.tip}</p>
                <button className="mt-2 px-2.5 py-1 rounded-lg bg-purple-500/10 text-[10px] text-purple-400">{s.action}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
