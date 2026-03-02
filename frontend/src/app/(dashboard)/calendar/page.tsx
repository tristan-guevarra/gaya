/* ═══════════════════════════════════════════════════════════════════
   Gaya — Smart Calendar
   AI-powered scheduling with weekly grid view, drag-to-create,
   conflict detection, availability gaps, and intelligent
   scheduling suggestions based on zone demand patterns.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Brain, Clock,
  MapPin, Users, Star, AlertTriangle, Zap, Check, X, Filter,
  Sparkles, Target, TrendingUp, CalendarDays, Sun, Moon,
  CloudSun, Sunrise
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface CalEvent {
  id: string;
  title: string;
  coach: string;
  coachInitials: string;
  zone: string;
  day: number;        // 0-6 (Mon-Sun)
  startHour: number;  // 6-21
  duration: number;   // hours
  type: 'camp' | 'clinic' | 'private';
  filled: number;
  capacity: number;
  color: string;
  conflict?: boolean;
}

interface AISuggestion {
  title: string;
  zone: string;
  day: string;
  time: string;
  type: 'camp' | 'clinic' | 'private';
  predictedFill: number;
  revenue: string;
  reason: string;
}

// ─── Mock Data ──────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6AM - 9PM

const EVENTS: CalEvent[] = [
  { id: 'e1', title: 'Elite Camp', coach: 'Marcus T.', coachInitials: 'MT', zone: 'Scarborough', day: 0, startHour: 9, duration: 3, type: 'camp', filled: 37, capacity: 40, color: 'bg-atlas-500/30 border-atlas-500/40 text-atlas-300' },
  { id: 'e2', title: 'Speed Clinic', coach: 'Sarah C.', coachInitials: 'SC', zone: 'North York', day: 0, startHour: 17, duration: 2, type: 'clinic', filled: 18, capacity: 20, color: 'bg-blue-500/30 border-blue-500/40 text-blue-300' },
  { id: 'e3', title: 'Private Session', coach: 'David P.', coachInitials: 'DP', zone: 'Brampton', day: 1, startHour: 10, duration: 1, type: 'private', filled: 1, capacity: 1, color: 'bg-purple-500/30 border-purple-500/40 text-purple-300' },
  { id: 'e4', title: 'GK Workshop', coach: 'David P.', coachInitials: 'DP', zone: 'Etobicoke', day: 1, startHour: 15, duration: 2, type: 'clinic', filled: 12, capacity: 15, color: 'bg-blue-500/30 border-blue-500/40 text-blue-300' },
  { id: 'e5', title: 'Spring Camp', coach: 'Aisha O.', coachInitials: 'AO', zone: 'Ajax', day: 2, startHour: 9, duration: 4, type: 'camp', filled: 24, capacity: 30, color: 'bg-atlas-500/30 border-atlas-500/40 text-atlas-300' },
  { id: 'e6', title: 'Technical Clinic', coach: 'Marcus T.', coachInitials: 'MT', zone: 'North York', day: 2, startHour: 17, duration: 2, type: 'clinic', filled: 20, capacity: 20, color: 'bg-blue-500/30 border-blue-500/40 text-blue-300' },
  { id: 'e7', title: 'Finishing Clinic', coach: 'Sarah C.', coachInitials: 'SC', zone: 'Scarborough', day: 3, startHour: 17, duration: 2, type: 'clinic', filled: 16, capacity: 20, color: 'bg-blue-500/30 border-blue-500/40 text-blue-300' },
  { id: 'e8', title: 'Private Session', coach: 'Aisha O.', coachInitials: 'AO', zone: 'Mississauga', day: 3, startHour: 10, duration: 1, type: 'private', filled: 1, capacity: 1, color: 'bg-purple-500/30 border-purple-500/40 text-purple-300' },
  { id: 'e9', title: 'Weekend Intensive', coach: 'Marcus T.', coachInitials: 'MT', zone: 'Scarborough', day: 5, startHour: 8, duration: 5, type: 'camp', filled: 38, capacity: 40, color: 'bg-atlas-500/30 border-atlas-500/40 text-atlas-300' },
  { id: 'e10', title: 'Youth Clinic', coach: 'Sarah C.', coachInitials: 'SC', zone: 'Brampton', day: 5, startHour: 14, duration: 2, type: 'clinic', filled: 19, capacity: 20, color: 'bg-blue-500/30 border-blue-500/40 text-blue-300' },
  // Conflict example
  { id: 'e11', title: 'Private (CONFLICT)', coach: 'Marcus T.', coachInitials: 'MT', zone: 'Ajax', day: 5, startHour: 10, duration: 1, type: 'private', filled: 1, capacity: 1, color: 'bg-red-500/30 border-red-500/40 text-red-300', conflict: true },
];

const AI_SUGGESTIONS: AISuggestion[] = [
  { title: 'Evening Clinic', zone: 'Scarborough East', day: 'Tuesday', time: '5-7 PM', type: 'clinic', predictedFill: 94, revenue: '$1,880', reason: 'Highest demand gap detected. 47 unfulfilled search queries this week in this time slot.' },
  { title: 'Morning Camp', zone: 'Brampton North', day: 'Saturday', time: '9 AM-1 PM', type: 'camp', predictedFill: 88, revenue: '$8,970', reason: 'Zero Saturday camps within 5km. Historical conversion rate: 12.4% → booking.' },
  { title: 'Private Block', zone: 'North York', day: 'Thursday', time: '3-6 PM', type: 'private', predictedFill: 91, revenue: '$540', reason: '3 pending waitlist requests for private training in this zone/time slot.' },
];

const DEMAND_OVERLAY = [
  { day: 0, hour: 17, intensity: 0.9 }, { day: 0, hour: 18, intensity: 0.85 },
  { day: 1, hour: 17, intensity: 0.7 }, { day: 1, hour: 18, intensity: 0.65 },
  { day: 2, hour: 9, intensity: 0.6 }, { day: 2, hour: 10, intensity: 0.55 },
  { day: 2, hour: 17, intensity: 0.95 }, { day: 2, hour: 18, intensity: 0.9 },
  { day: 3, hour: 17, intensity: 0.8 }, { day: 3, hour: 18, intensity: 0.75 },
  { day: 4, hour: 16, intensity: 0.5 }, { day: 4, hour: 17, intensity: 0.7 },
  { day: 5, hour: 8, intensity: 0.85 }, { day: 5, hour: 9, intensity: 0.9 },
  { day: 5, hour: 10, intensity: 0.8 }, { day: 5, hour: 14, intensity: 0.6 },
  { day: 6, hour: 9, intensity: 0.7 }, { day: 6, hour: 10, intensity: 0.65 },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0 || h === 12) return h === 0 ? '12 AM' : '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function getTimeOfDay(h: number): { icon: React.ElementType; label: string } {
  if (h < 9) return { icon: Sunrise, label: 'Early' };
  if (h < 12) return { icon: Sun, label: 'Morning' };
  if (h < 17) return { icon: CloudSun, label: 'Afternoon' };
  return { icon: Moon, label: 'Evening' };
}

// ─── Page Component ─────────────────────────────────────────────

export default function SmartCalendarPage() {
  const [showDemand, setShowDemand] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [filterCoach, setFilterCoach] = useState<string>('all');
  const [weekOffset, setWeekOffset] = useState(0);

  const coaches = useMemo(() => {
    const unique = Array.from(new Set(EVENTS.map(e => e.coach)));
    return ['all', ...unique];
  }, []);

  const filteredEvents = useMemo(() => {
    if (filterCoach === 'all') return EVENTS;
    return EVENTS.filter(e => e.coach === filterCoach);
  }, [filterCoach]);

  const conflicts = EVENTS.filter(e => e.conflict);

  const getDemandIntensity = (day: number, hour: number): number => {
    const match = DEMAND_OVERLAY.find(d => d.day === day && d.hour === hour);
    return match?.intensity || 0;
  };

  // Week dates
  const baseDate = new Date(2026, 2, 2); // Mon Mar 2, 2026
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-atlas-400" /> Smart Calendar
              </h1>
              <p className="text-xs text-text-muted mt-0.5">AI-powered scheduling with demand intelligence</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Coach Filter */}
              <select value={filterCoach} onChange={e => setFilterCoach(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary">
                {coaches.map(c => <option key={c} value={c}>{c === 'all' ? 'All Coaches' : c}</option>)}
              </select>
              {/* Toggles */}
              <button onClick={() => setShowDemand(!showDemand)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  showDemand ? 'bg-atlas-500/10 border-atlas-500/20 text-atlas-400' : 'bg-slate-100/50 border-slate-200 text-text-muted')}>
                <TrendingUp className="w-3.5 h-3.5" /> Demand
              </button>
              <button onClick={() => setShowAI(!showAI)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  showAI ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-slate-100/50 border-slate-200 text-text-muted')}>
                <Brain className="w-3.5 h-3.5" /> AI Suggest
              </button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-atlas-500 text-white hover:bg-atlas-400 transition-all">
                <Plus className="w-3.5 h-3.5" /> New Event
              </button>
            </div>
          </div>

          {/* Week Nav */}
          <div className="flex items-center gap-4 mt-4">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded-lg hover:bg-slate-100/50 text-text-muted">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekOffset(0)}
              className="px-3 py-1 rounded-lg text-xs font-medium text-text-secondary hover:bg-slate-100/50">
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 rounded-lg hover:bg-slate-100/50 text-text-muted">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {conflicts.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium ml-auto animate-pulse">
                <AlertTriangle className="w-3 h-3" /> {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-4 flex gap-4">
        {/* ═══ Calendar Grid ═══ */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[900px]">
            {/* Header Row */}
            <div className="sticky top-0 z-20 bg-white" />
            {DAYS.map((day, di) => {
              const date = weekDates[di];
              const isToday = di === 4; // Pretend Friday is today for demo
              return (
                <div key={day} className={cn('sticky top-0 z-20 bg-white text-center py-2 border-b border-slate-200',
                  isToday && 'bg-atlas-500/5')}>
                  <p className={cn('text-[10px] font-medium', isToday ? 'text-atlas-400' : 'text-text-muted')}>{day}</p>
                  <p className={cn('text-sm font-display font-bold', isToday ? 'text-atlas-400' : 'text-text-primary')}>{date.getDate()}</p>
                </div>
              );
            })}

            {/* Time Rows */}
            {HOURS.map(hour => (
              <>
                {/* Time label */}
                <div key={`label-${hour}`} className="text-right pr-2 pt-0.5 h-14">
                  <span className="text-[9px] text-text-muted/60">{formatHour(hour)}</span>
                </div>
                {/* Day cells */}
                {DAYS.map((_, di) => {
                  const demandIntensity = showDemand ? getDemandIntensity(di, hour) : 0;
                  const cellEvents = filteredEvents.filter(e => e.day === di && hour >= e.startHour && hour < e.startHour + e.duration);
                  const isStart = cellEvents.find(e => e.startHour === hour);

                  return (
                    <div key={`${hour}-${di}`}
                      className={cn('h-14 border-b border-r border-white/[0.03] relative transition-colors',
                        demandIntensity > 0 && `bg-atlas-500/${Math.round(demandIntensity * 8)}`,
                        di === 4 && 'bg-atlas-500/[0.02]'
                      )}>
                      {/* Demand dot */}
                      {showDemand && demandIntensity > 0.7 && !isStart && cellEvents.length === 0 && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-atlas-500/50" />
                      )}

                      {/* Event Block */}
                      {isStart && (
                        <button onClick={() => setSelectedEvent(isStart)}
                          className={cn('absolute inset-x-0.5 rounded-lg border px-1.5 py-1 z-10 text-left hover:brightness-125 transition-all overflow-hidden cursor-pointer',
                            isStart.color,
                            isStart.conflict && 'ring-1 ring-red-500 animate-pulse'
                          )} style={{ top: '1px', height: `${isStart.duration * 56 - 4}px` }}>
                          <p className="text-[10px] font-semibold truncate leading-tight">{isStart.title}</p>
                          <p className="text-[8px] opacity-70 truncate">{isStart.coach} · {isStart.zone}</p>
                          {isStart.duration >= 2 && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-[8px] opacity-70">{isStart.filled}/{isStart.capacity}</span>
                              <div className="flex-1 h-1 rounded-full bg-black/20 overflow-hidden">
                                <div className="h-full rounded-full bg-white/40" style={{ width: `${(isStart.filled / isStart.capacity) * 100}%` }} />
                              </div>
                            </div>
                          )}
                          {isStart.conflict && (
                            <div className="absolute top-0.5 right-0.5">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* ═══ AI Sidebar ═══ */}
        {showAI && (
          <div className="w-80 shrink-0 space-y-4 animate-fade-in">
            {/* Suggestions */}
            <div className="rounded-2xl bg-white backdrop-blur-xl border border-purple-500/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-text-primary">AI Suggestions</span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-400">{AI_SUGGESTIONS.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {AI_SUGGESTIONS.map((sug, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/60 hover:border-purple-500/20 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium',
                        sug.type === 'camp' ? 'bg-atlas-500/10 text-atlas-400' :
                        sug.type === 'clinic' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-purple-500/10 text-purple-400'
                      )}>{sug.type}</span>
                      <span className="text-[10px] font-bold text-green-400">{sug.predictedFill}% fill</span>
                    </div>
                    <p className="text-xs font-medium text-text-primary">{sug.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{sug.zone}</span>
                      <span>·</span>
                      <span>{sug.day} {sug.time}</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">{sug.reason}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-medium text-atlas-400">{sug.revenue} est. revenue</span>
                      <button className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors opacity-0 group-hover:opacity-100">
                        <Plus className="w-2.5 h-2.5 inline mr-0.5" />Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demand Heatmap Legend */}
            {showDemand && (
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-atlas-400" /> Demand Overlay
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[9px] text-text-muted">Low</span>
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map(int => (
                    <div key={int} className="flex-1 h-3 rounded" style={{ backgroundColor: `rgba(0, 209, 178, ${int * 0.4})` }} />
                  ))}
                  <span className="text-[9px] text-text-muted">High</span>
                </div>
                <p className="text-[10px] text-text-muted">Based on searches, leads, and waitlist activity in the last 30 days.</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <p className="text-xs font-semibold text-text-primary mb-3">This Week</p>
              <div className="space-y-2">
                {[
                  { label: 'Events Scheduled', value: `${filteredEvents.length}`, icon: Calendar },
                  { label: 'Total Capacity', value: `${filteredEvents.reduce((s, e) => s + e.capacity, 0)}`, icon: Users },
                  { label: 'Avg Fill Rate', value: `${Math.round(filteredEvents.reduce((s, e) => s + (e.filled / e.capacity), 0) / filteredEvents.length * 100)}%`, icon: Target },
                  { label: 'Gaps (AI-detected)', value: '7 slots', icon: Sparkles },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="w-3.5 h-3.5 text-text-muted/50" />
                    <span className="text-[11px] text-text-muted flex-1">{stat.label}</span>
                    <span className="text-xs font-medium text-text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Event Detail Modal ═══ */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="w-96 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 shadow-2xl shadow-black/10 overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className={cn('px-5 py-4 border-b border-slate-200', selectedEvent.conflict && 'bg-red-500/5')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium',
                    selectedEvent.type === 'camp' ? 'bg-atlas-500/10 text-atlas-400' :
                    selectedEvent.type === 'clinic' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                  )}>{selectedEvent.type}</span>
                  {selectedEvent.conflict && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> Conflict
                    </span>
                  )}
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              <h3 className="text-base font-display font-bold text-text-primary mt-2">{selectedEvent.title}</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <p className="text-[9px] text-text-muted">Coach</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-atlas-500 to-cyan-400 flex items-center justify-center text-[8px] font-bold text-white">
                      {selectedEvent.coachInitials}
                    </div>
                    <span className="text-xs font-medium text-text-primary">{selectedEvent.coach}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <p className="text-[9px] text-text-muted">Zone</p>
                  <p className="text-xs font-medium text-text-primary mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-atlas-400" />{selectedEvent.zone}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <p className="text-[9px] text-text-muted">Schedule</p>
                  <p className="text-xs font-medium text-text-primary mt-0.5">{DAYS[selectedEvent.day]} {formatHour(selectedEvent.startHour)}-{formatHour(selectedEvent.startHour + selectedEvent.duration)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <p className="text-[9px] text-text-muted">Capacity</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-text-primary">{selectedEvent.filled}/{selectedEvent.capacity}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-atlas-500" style={{ width: `${(selectedEvent.filled / selectedEvent.capacity) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {selectedEvent.conflict && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                  <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Schedule Conflict Detected
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Marcus T. already has Weekend Intensive scheduled at this time. Consider rescheduling to an open slot.
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex gap-2">
              <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary hover:bg-slate-100">Edit</button>
              <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-atlas-500 text-white font-semibold hover:bg-atlas-400">View Full Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
