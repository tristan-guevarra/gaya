/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Parent Portal
   Athlete/parent dashboard with child profiles, progress
   tracking, session history, skill radar, upcoming bookings,
   and coach communication.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  User, Users, Star, Calendar, MapPin, Clock, TrendingUp,
  Award, Target, Zap, Heart, ChevronRight, Bell, Search,
  BookOpen, Trophy, Shield, CheckCircle, ArrowUpRight,
  MessageCircle, DollarSign, Activity, BarChart3, Eye,
  Camera, Edit3, Plus, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'progress' | 'schedule' | 'history';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: string;
  xp: number;
  nextLevelXp: number;
  position: string;
  sessionsTotal: number;
  streak: number;
  skills: { name: string; score: number; change: number }[];
  badges: { name: string; icon: string; date: string }[];
}

// ─── Mock Data ──────────────────────────────────────────────────────

const children: Child[] = [
  {
    id: '1', name: 'Alex', age: 12, avatar: 'AW', level: 'Elite',
    xp: 8420, nextLevelXp: 10000, position: 'Midfielder',
    sessionsTotal: 84, streak: 12,
    skills: [
      { name: 'Dribbling', score: 82, change: 5 },
      { name: 'Passing', score: 78, change: 3 },
      { name: 'Shooting', score: 71, change: 8 },
      { name: 'Speed', score: 88, change: 2 },
      { name: 'Defending', score: 65, change: 4 },
      { name: 'Game IQ', score: 74, change: 6 },
    ],
    badges: [
      { name: 'First Session', icon: '⚡', date: 'Jan 2024' },
      { name: '50 Sessions', icon: '🏆', date: 'Sep 2024' },
      { name: 'Speed Demon', icon: '💨', date: 'Nov 2024' },
      { name: '10-Day Streak', icon: '🔥', date: 'Feb 2025' },
      { name: 'Elite Level', icon: '⭐', date: 'Mar 2025' },
    ],
  },
  {
    id: '2', name: 'Maya', age: 9, avatar: 'MW', level: 'Intermediate',
    xp: 3240, nextLevelXp: 5000, position: 'Forward',
    sessionsTotal: 32, streak: 5,
    skills: [
      { name: 'Dribbling', score: 64, change: 8 },
      { name: 'Passing', score: 58, change: 6 },
      { name: 'Shooting', score: 72, change: 12 },
      { name: 'Speed', score: 76, change: 4 },
      { name: 'Defending', score: 42, change: 3 },
      { name: 'Game IQ', score: 55, change: 7 },
    ],
    badges: [
      { name: 'First Session', icon: '⚡', date: 'Jun 2024' },
      { name: 'Sharp Shooter', icon: '🎯', date: 'Dec 2024' },
      { name: 'Rising Star', icon: '🌟', date: 'Feb 2025' },
    ],
  },
];

const upcomingBookings = [
  { id: '1', title: 'Elite Camp — Day 3', coach: 'Marcus Thompson', date: 'Today', time: '9:00 AM - 1:00 PM', location: 'Scarborough Field A', type: 'camp', child: 'Alex', status: 'confirmed' },
  { id: '2', title: 'Speed Clinic', coach: 'Sarah Chen', date: 'Tomorrow', time: '5:00 - 7:00 PM', location: 'North York Centre', type: 'clinic', child: 'Alex', status: 'confirmed' },
  { id: '3', title: 'Junior Skills Camp', coach: 'David Park', date: 'Sat, Apr 19', time: '10:00 AM - 12:00 PM', location: 'Ajax Sports Hub', type: 'camp', child: 'Maya', status: 'waitlist' },
  { id: '4', title: 'Private Session', coach: 'Marcus Thompson', date: 'Mon, Apr 21', time: '3:00 - 4:00 PM', location: 'Scarborough Field B', type: 'private', child: 'Alex', status: 'confirmed' },
];

const sessionHistory = [
  { date: 'Apr 14', title: 'Elite Camp — Day 2', coach: 'Marcus T.', rating: 5, notes: 'Excellent ball control improvement. Ready for advanced drills.', xpEarned: 120, child: 'Alex' },
  { date: 'Apr 13', title: 'Elite Camp — Day 1', coach: 'Marcus T.', rating: 5, notes: 'Great first day. Strong fundamentals, needs work on weak foot.', xpEarned: 100, child: 'Alex' },
  { date: 'Apr 10', title: 'Speed & Agility', coach: 'Sarah C.', rating: 4, notes: 'Good effort. Sprint times improved by 0.3s.', xpEarned: 80, child: 'Alex' },
  { date: 'Apr 8', title: 'Junior Skills', coach: 'David P.', rating: 5, notes: 'Maya showed great improvement in shooting accuracy.', xpEarned: 90, child: 'Maya' },
  { date: 'Apr 5', title: 'Private Session', coach: 'Marcus T.', rating: 5, notes: 'Focused on 1v1 attacking moves. Mastered the step-over.', xpEarned: 150, child: 'Alex' },
  { date: 'Apr 2', title: 'Weekend Clinic', coach: 'Sarah C.', rating: 4, notes: 'Passing combinations improved. Work on first touch.', xpEarned: 70, child: 'Maya' },
];

// ─── Skill Radar Component ─────────────────────────────────────────

function SkillRadar({ skills }: { skills: Child['skills'] }) {
  const cx = 120, cy = 120, r = 90;
  const n = skills.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const radius = (value / 100) * r;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[260px] mx-auto">
      {/* Grid */}
      {gridLevels.map(level => {
        const points = skills.map((_, i) => getPoint(i, level));
        return (
          <polygon key={level} points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        );
      })}

      {/* Axes */}
      {skills.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />;
      })}

      {/* Data polygon */}
      <polygon
        points={skills.map((s, i) => { const p = getPoint(i, s.score); return `${p.x},${p.y}`; }).join(' ')}
        fill="rgba(0, 204, 136, 0.15)" stroke="rgba(0, 204, 136, 0.6)" strokeWidth="2"
      />

      {/* Data points */}
      {skills.map((s, i) => {
        const p = getPoint(i, s.score);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#00CC88" />;
      })}

      {/* Labels */}
      {skills.map((s, i) => {
        const p = getPoint(i, 115);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-text-muted text-[10px]">
            {s.name}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function ParentPortalPage() {
  const [selectedChild, setSelectedChild] = useState(children[0]);
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'history', label: 'History', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-atlas-400" /> Parent Portal
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Track your child&apos;s training progress and manage bookings</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Child Selector */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 border border-white/60">
                {children.map(child => (
                  <button key={child.id} onClick={() => setSelectedChild(child)}
                    className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium',
                      selectedChild.id === child.id
                        ? 'bg-atlas-500/10 text-atlas-400'
                        : 'text-text-muted hover:text-text-secondary')}>
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                      selectedChild.id === child.id ? 'bg-atlas-500/20 text-atlas-400' : 'bg-slate-100 text-text-muted')}>
                      {child.avatar}
                    </div>
                    {child.name}
                  </button>
                ))}
                <button className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-slate-100">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  tab === t.id ? 'bg-atlas-500/10 text-atlas-400 border border-atlas-500/20' : 'text-text-muted hover:text-text-secondary')}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ═══ Overview ═══ */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Profile Card */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-atlas-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white">
                  {selectedChild.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-display font-bold text-text-primary">{selectedChild.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-atlas-500 to-cyan-400 text-white">
                      {selectedChild.level}
                    </span>
                    <span className="text-xs text-text-muted">Age {selectedChild.age} · {selectedChild.position}</span>
                  </div>
                  {/* XP Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-atlas-500 to-cyan-400 transition-all"
                        style={{ width: `${(selectedChild.xp / selectedChild.nextLevelXp) * 100}%` }} />
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      {selectedChild.xp.toLocaleString()} / {selectedChild.nextLevelXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-display font-bold text-text-primary">{selectedChild.sessionsTotal}</p>
                    <p className="text-[10px] text-text-muted">Sessions</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-orange-400">{selectedChild.streak}</p>
                    <p className="text-[10px] text-text-muted">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-text-primary">{selectedChild.badges.length}</p>
                    <p className="text-[10px] text-text-muted">Badges</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Skill Radar */}
              <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Skill Assessment</h3>
                <SkillRadar skills={selectedChild.skills} />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {selectedChild.skills.map(s => (
                    <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div>
                        <p className="text-[10px] font-medium text-text-primary">{s.name}</p>
                        <p className="text-xs font-display font-bold text-text-primary">{s.score}</p>
                      </div>
                      <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-2.5 h-2.5" />+{s.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming + Badges */}
              <div className="space-y-4">
                {/* Next Session */}
                <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Next Session</h3>
                  {(() => {
                    const next = upcomingBookings.find(b => b.child === selectedChild.name && b.status === 'confirmed');
                    if (!next) return <p className="text-xs text-text-muted">No upcoming sessions</p>;
                    return (
                      <div className="p-4 rounded-xl bg-atlas-500/5 border border-atlas-500/15">
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium',
                            next.type === 'camp' ? 'bg-atlas-500/10 text-atlas-400' :
                            next.type === 'clinic' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          )}>{next.type}</span>
                          <span className="text-[10px] text-green-400">✓ Confirmed</span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{next.title}</p>
                        <div className="space-y-1 mt-2">
                          <p className="text-xs text-text-muted flex items-center gap-1"><User className="w-3 h-3" /> {next.coach}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> {next.date}, {next.time}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> {next.location}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Badges */}
                <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Badges Earned</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedChild.badges.map(b => (
                      <div key={b.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 border border-white/60">
                        <span className="text-lg">{b.icon}</span>
                        <div>
                          <p className="text-[10px] font-medium text-text-primary">{b.name}</p>
                          <p className="text-[8px] text-text-muted">{b.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coach Rating */}
                <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Primary Coach</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-300 flex items-center justify-center text-sm font-bold text-white">MT</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">Marcus Thompson</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-xs text-text-muted ml-1">4.97 (142 reviews)</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-[10px] text-text-secondary">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Progress Tab ═══ */}
        {tab === 'progress' && (
          <div className="space-y-6 animate-fade-in">
            {/* Skill Progress Over Time */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Skill Progress (Last 6 Months)</h3>
              <div className="space-y-3">
                {selectedChild.skills.map(skill => (
                  <div key={skill.name} className="flex items-center gap-4">
                    <span className="text-xs text-text-secondary w-20">{skill.name}</span>
                    <div className="flex-1 h-4 rounded-full bg-slate-50 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-atlas-500/60 to-atlas-500"
                        style={{ width: `${skill.score}%` }} />
                      {/* Previous score indicator */}
                      <div className="absolute inset-y-0 border-r-2 border-dashed border-slate-300"
                        style={{ left: `${skill.score - skill.change}%` }} />
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-xs font-display font-bold text-text-primary">{skill.score}</span>
                      <span className="text-[10px] text-green-400 ml-1">+{skill.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Sessions This Month', value: '12', icon: Calendar, color: 'text-atlas-400' },
                { label: 'XP Earned', value: '+1,240', icon: Zap, color: 'text-amber-400' },
                { label: 'Skills Improved', value: '6/6', icon: TrendingUp, color: 'text-green-400' },
                { label: 'Coach Rating', value: '4.8', icon: Star, color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                  <s.icon className={cn('w-5 h-5 mx-auto mb-2', s.color)} />
                  <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Upcoming Milestones</h3>
              <div className="space-y-3">
                {[
                  { label: '100 Sessions', current: selectedChild.sessionsTotal, target: 100, reward: '🏅 Century Badge + 500 XP' },
                  { label: 'Level Up to Legend', current: selectedChild.xp, target: selectedChild.nextLevelXp, reward: '⭐ Legend Status + Custom Avatar' },
                  { label: '30-Day Streak', current: selectedChild.streak, target: 30, reward: '🔥 Ironman Badge + 300 XP' },
                ].map(m => (
                  <div key={m.label} className="p-4 rounded-xl bg-white/40 border border-white/60">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-text-primary">{m.label}</p>
                      <span className="text-[10px] text-text-muted">{m.current.toLocaleString()} / {m.target.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-atlas-500 to-cyan-400"
                        style={{ width: `${Math.min((m.current / m.target) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-text-muted">Reward: {m.reward}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Schedule Tab ═══ */}
        {tab === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Upcoming Bookings</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-xs font-medium text-atlas-400">
                <Search className="w-3.5 h-3.5" /> Find Training
              </button>
            </div>

            {upcomingBookings.filter(b => b.child === selectedChild.name).map(booking => (
              <div key={booking.id} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium',
                      booking.type === 'camp' ? 'bg-atlas-500/10 text-atlas-400' :
                      booking.type === 'clinic' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-400'
                    )}>{booking.type}</span>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium',
                      booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    )}>{booking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Waitlist'}</span>
                  </div>
                  <span className="text-xs text-text-muted">{booking.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-text-primary">{booking.title}</h4>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <User className="w-3.5 h-3.5" /> {booking.coach}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="w-3.5 h-3.5" /> {booking.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <MapPin className="w-3.5 h-3.5" /> {booking.location}
                  </div>
                </div>
              </div>
            ))}

            {upcomingBookings.filter(b => b.child === selectedChild.name).length === 0 && (
              <div className="p-8 text-center rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <Calendar className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-text-muted">No upcoming bookings for {selectedChild.name}</p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-atlas-500/10 text-xs font-medium text-atlas-400">Find Training</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ History Tab ═══ */}
        {tab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="text-sm font-semibold text-text-primary">Session History</h3>
            {sessionHistory.filter(s => s.child === selectedChild.name).map((session, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-white/[0.1] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-text-muted shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{session.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-text-muted">{session.date}</span>
                        <span className="text-xs text-text-muted">Coach: {session.coach}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: session.rating }).map((_, s) => (
                            <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-text-secondary mt-2 p-2.5 rounded-lg bg-slate-50 leading-relaxed">
                          &quot;{session.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <Zap className="w-3 h-3" />+{session.xpEarned} XP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
