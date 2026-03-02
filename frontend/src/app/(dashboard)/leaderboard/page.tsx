/* ═══════════════════════════════════════════════════════════════════
   Gaya — Coach Leaderboard + Gamification
   XP system, ranking tiers, achievement badges, weekly streaks,
   level progression, and animated coach cards.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trophy, Crown, Medal, Star, Flame, Zap, Target,
  TrendingUp, Users, Calendar, Award, Shield, ChevronRight,
  ArrowUp, ArrowDown, Minus, MapPin, Clock, Heart,
  Sparkles, BarChart3, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface Coach {
  id: string;
  name: string;
  initials: string;
  title: string;
  zone: string;
  xp: number;
  level: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';
  rank: number;
  previousRank: number;
  rating: number;
  reviews: number;
  fillRate: number;
  eventsThisMonth: number;
  streak: number;
  badges: string[];
  weeklyXP: number[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  progress?: number;
  total?: number;
  unlocked: boolean;
}

// ─── Constants ──────────────────────────────────────────────────

const TIER_CONFIG = {
  bronze:  { label: 'Bronze',  color: 'text-amber-600',  bg: 'bg-amber-600/10 border-amber-600/20', icon: Medal,  xpMin: 0,     gradient: 'from-amber-700 to-amber-500' },
  silver:  { label: 'Silver',  color: 'text-slate-300',  bg: 'bg-slate-300/10 border-slate-300/20',  icon: Shield, xpMin: 5000,  gradient: 'from-slate-400 to-slate-200' },
  gold:    { label: 'Gold',    color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20',  icon: Star,   xpMin: 15000, gradient: 'from-amber-400 to-yellow-300' },
  diamond: { label: 'Diamond', color: 'text-cyan-400',   bg: 'bg-cyan-400/10 border-cyan-400/20',    icon: Zap,    xpMin: 35000, gradient: 'from-cyan-400 to-blue-300' },
  legend:  { label: 'Legend',  color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: Crown,  xpMin: 75000, gradient: 'from-purple-400 to-pink-300' },
};

// ─── Mock Data ──────────────────────────────────────────────────

const COACHES: Coach[] = [
  { id: '1', name: 'Marcus Thompson', initials: 'MT', title: 'Elite Youth Development Coach', zone: 'Scarborough East', xp: 84200, level: 42, tier: 'legend', rank: 1, previousRank: 1, rating: 4.97, reviews: 234, fillRate: 98, eventsThisMonth: 12, streak: 47, badges: ['🏆', '🔥', '⭐', '💎', '🎯'], weeklyXP: [320, 440, 380, 520, 410, 390, 480] },
  { id: '2', name: 'Sarah Chen', initials: 'SC', title: 'Speed & Agility Specialist', zone: 'North York', xp: 67800, level: 38, tier: 'diamond', rank: 2, previousRank: 3, rating: 4.94, reviews: 187, fillRate: 96, eventsThisMonth: 10, streak: 31, badges: ['🏆', '🔥', '⭐', '💎'], weeklyXP: [280, 350, 410, 370, 320, 440, 390] },
  { id: '3', name: 'David Park', initials: 'DP', title: 'Goalkeeper Academy Director', zone: 'Mississauga', xp: 52400, level: 34, tier: 'diamond', rank: 3, previousRank: 2, rating: 4.91, reviews: 156, fillRate: 94, eventsThisMonth: 8, streak: 22, badges: ['🏆', '🔥', '⭐'], weeklyXP: [240, 280, 310, 260, 350, 290, 300] },
  { id: '4', name: 'Aisha Okafor', initials: 'AO', title: 'Technical Skills Coach', zone: 'Etobicoke', xp: 41200, level: 30, tier: 'gold', rank: 4, previousRank: 5, rating: 4.89, reviews: 123, fillRate: 91, eventsThisMonth: 9, streak: 15, badges: ['🔥', '⭐'], weeklyXP: [200, 240, 180, 310, 270, 220, 260] },
  { id: '5', name: 'James Wilson', initials: 'JW', title: 'Camp Director & Coach', zone: 'Brampton', xp: 38600, level: 28, tier: 'gold', rank: 5, previousRank: 4, rating: 4.85, reviews: 98, fillRate: 89, eventsThisMonth: 7, streak: 8, badges: ['⭐'], weeklyXP: [180, 210, 190, 240, 200, 230, 220] },
  { id: '6', name: 'Elena Rodriguez', initials: 'ER', title: 'Fitness & Conditioning', zone: 'Vaughan', xp: 29400, level: 24, tier: 'gold', rank: 6, previousRank: 6, rating: 4.82, reviews: 87, fillRate: 87, eventsThisMonth: 6, streak: 12, badges: ['⭐'], weeklyXP: [160, 190, 170, 200, 180, 210, 190] },
  { id: '7', name: 'Omar Hassan', initials: 'OH', title: 'Youth Development Specialist', zone: 'Ajax', xp: 18900, level: 19, tier: 'silver', rank: 7, previousRank: 8, rating: 4.78, reviews: 64, fillRate: 84, eventsThisMonth: 5, streak: 6, badges: [], weeklyXP: [120, 150, 140, 180, 160, 130, 170] },
  { id: '8', name: 'Lisa Chang', initials: 'LC', title: 'Tactical Analysis Coach', zone: 'Markham', xp: 12400, level: 15, tier: 'silver', rank: 8, previousRank: 7, rating: 4.74, reviews: 42, fillRate: 81, eventsThisMonth: 4, streak: 3, badges: [], weeklyXP: [90, 110, 100, 130, 120, 100, 140] },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'First Event', description: 'Host your first training event', icon: Calendar, rarity: 'common', xpReward: 100, unlocked: true },
  { id: 'a2', name: 'Sellout', description: 'Fill an event to 100% capacity', icon: Users, rarity: 'common', xpReward: 250, unlocked: true },
  { id: 'a3', name: 'Five Star', description: 'Achieve a 5.0 rating on any event', icon: Star, rarity: 'rare', xpReward: 500, unlocked: true },
  { id: 'a4', name: 'Zone Commander', description: 'Become #1 coach in your zone', icon: MapPin, rarity: 'rare', xpReward: 750, unlocked: true },
  { id: 'a5', name: 'Streak Master', description: 'Maintain a 30-day event streak', icon: Flame, rarity: 'epic', xpReward: 1500, progress: 22, total: 30, unlocked: false },
  { id: 'a6', name: 'Revenue King', description: 'Generate $50,000 in bookings', icon: TrendingUp, rarity: 'epic', xpReward: 2000, progress: 34200, total: 50000, unlocked: false },
  { id: 'a7', name: 'Atlas Legend', description: 'Reach Level 50 and Legend tier', icon: Crown, rarity: 'legendary', xpReward: 5000, progress: 42, total: 50, unlocked: false },
  { id: 'a8', name: 'Community Hero', description: 'Train 1,000 unique athletes', icon: Heart, rarity: 'legendary', xpReward: 5000, progress: 687, total: 1000, unlocked: false },
];

const RARITY_STYLES = {
  common: 'border-slate-300 bg-slate-50',
  rare: 'border-blue-500/20 bg-blue-500/5',
  epic: 'border-purple-500/20 bg-purple-500/5',
  legendary: 'border-amber-500/20 bg-amber-500/5',
};

const RARITY_LABELS = {
  common: 'text-text-muted',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

// ─── Rank Change Indicator ──────────────────────────────────────

function RankDelta({ current, previous }: { current: number; previous: number }) {
  const delta = previous - current;
  if (delta > 0) return <span className="flex items-center gap-0.5 text-[10px] text-green-400"><ArrowUp className="w-3 h-3" />{delta}</span>;
  if (delta < 0) return <span className="flex items-center gap-0.5 text-[10px] text-red-400"><ArrowDown className="w-3 h-3" />{Math.abs(delta)}</span>;
  return <span className="flex items-center text-[10px] text-text-muted"><Minus className="w-3 h-3" /></span>;
}

// ─── XP Spark Line ──────────────────────────────────────────────

function SparkLine({ data, color = 'atlas' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 70;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color === 'atlas' ? '#22c55e' : '#3b82f6'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Page Component ─────────────────────────────────────────────

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'rankings' | 'achievements' | 'tiers'>('rankings');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'alltime'>('month');

  const tabs = [
    { id: 'rankings' as const, label: 'Rankings', icon: Trophy },
    { id: 'achievements' as const, label: 'Achievements', icon: Award },
    { id: 'tiers' as const, label: 'Tier System', icon: Crown },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Leaderboard</span>
              </div>
              <h1 className="font-display font-bold text-2xl text-text-primary">Coach Rankings & Achievements</h1>
              <p className="text-sm text-text-muted mt-1">Compete, earn XP, unlock badges, and climb the ranks.</p>
            </div>

            {/* Time Range */}
            {activeTab === 'rankings' && (
              <div className="flex gap-1 p-1 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                {(['week', 'month', 'alltime'] as const).map(range => (
                  <button key={range} onClick={() => setTimeRange(range)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      timeRange === range ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary')}>
                    {range === 'alltime' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50')}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ═══ Rankings Tab ═══ */}
        {activeTab === 'rankings' && (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[COACHES[1], COACHES[0], COACHES[2]].map((coach, i) => {
                const order = [2, 1, 3][i];
                const heights = ['h-32', 'h-40', 'h-28'];
                const tierCfg = TIER_CONFIG[coach.tier];
                return (
                  <div key={coach.id} className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className={cn('relative w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-display font-bold mb-3',
                      order === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white ring-2 ring-amber-400/30' :
                      order === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                      'bg-gradient-to-br from-amber-600 to-amber-700 text-white')}>
                      {coach.initials}
                      {order === 1 && <Crown className="absolute -top-2 -right-2 w-5 h-5 text-amber-400" />}
                    </div>
                    <p className="text-sm font-semibold text-text-primary text-center">{coach.name}</p>
                    <p className="text-[10px] text-text-muted mb-2">{coach.xp.toLocaleString()} XP</p>
                    <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium', tierCfg.bg, tierCfg.color)}>
                      <tierCfg.icon className="w-3 h-3" />{tierCfg.label}
                    </div>
                    {/* Podium bar */}
                    <div className={cn('w-full mt-3 rounded-t-xl', heights[i],
                      order === 1 ? 'bg-gradient-to-t from-amber-500/20 to-amber-500/5 border-t border-x border-amber-500/20' :
                      order === 2 ? 'bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-t border-x border-slate-400/20' :
                      'bg-gradient-to-t from-amber-600/20 to-amber-600/5 border-t border-x border-amber-600/20'
                    )}>
                      <div className="flex items-center justify-center pt-3">
                        <span className={cn('text-2xl font-display font-extrabold',
                          order === 1 ? 'text-amber-400' : order === 2 ? 'text-slate-300' : 'text-amber-600')}>
                          #{order}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Rankings Table */}
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
                <div className="grid grid-cols-12 gap-4 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-3">Coach</div>
                  <div className="col-span-1 text-center">Tier</div>
                  <div className="col-span-1 text-center">Level</div>
                  <div className="col-span-1 text-right">XP</div>
                  <div className="col-span-1 text-center">Rating</div>
                  <div className="col-span-1 text-center">Fill %</div>
                  <div className="col-span-1 text-center">Streak</div>
                  <div className="col-span-2 text-center">Weekly XP</div>
                </div>
              </div>

              {COACHES.map(coach => {
                const tierCfg = TIER_CONFIG[coach.tier];
                return (
                  <div key={coach.id} className={cn(
                    'grid grid-cols-12 gap-4 items-center px-6 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors',
                    coach.rank <= 3 && 'bg-slate-50'
                  )}>
                    {/* Rank */}
                    <div className="col-span-1 flex items-center gap-1.5">
                      <span className={cn('text-sm font-display font-bold',
                        coach.rank === 1 ? 'text-amber-400' : coach.rank === 2 ? 'text-slate-300' : coach.rank === 3 ? 'text-amber-600' : 'text-text-muted')}>
                        #{coach.rank}
                      </span>
                      <RankDelta current={coach.rank} previous={coach.previousRank} />
                    </div>

                    {/* Coach */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold bg-gradient-to-br', tierCfg.gradient, 'text-white')}>
                        {coach.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary flex items-center gap-1">
                          {coach.name}
                          {coach.badges.slice(0, 3).map((b, i) => <span key={i} className="text-[10px]">{b}</span>)}
                        </p>
                        <p className="text-[10px] text-text-muted">{coach.zone}</p>
                      </div>
                    </div>

                    {/* Tier */}
                    <div className="col-span-1 flex justify-center">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium', tierCfg.bg, tierCfg.color)}>
                        <tierCfg.icon className="w-3 h-3" />{tierCfg.label}
                      </span>
                    </div>

                    {/* Level */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-semibold text-text-primary">{coach.level}</span>
                    </div>

                    {/* XP */}
                    <div className="col-span-1 text-right">
                      <span className="text-sm font-mono text-atlas-400">{(coach.xp / 1000).toFixed(1)}K</span>
                    </div>

                    {/* Rating */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-text-primary">{coach.rating}</span>
                    </div>

                    {/* Fill Rate */}
                    <div className="col-span-1 text-center">
                      <span className={cn('text-xs font-medium', coach.fillRate >= 90 ? 'text-green-400' : coach.fillRate >= 80 ? 'text-amber-400' : 'text-text-muted')}>
                        {coach.fillRate}%
                      </span>
                    </div>

                    {/* Streak */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <Flame className={cn('w-3 h-3', coach.streak >= 30 ? 'text-red-400' : coach.streak >= 10 ? 'text-amber-400' : 'text-text-muted')} />
                      <span className="text-xs text-text-primary">{coach.streak}d</span>
                    </div>

                    {/* Weekly Spark */}
                    <div className="col-span-2 flex justify-center">
                      <SparkLine data={coach.weeklyXP} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Achievements Tab ═══ */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-text-primary">Your Achievements</h2>
                <p className="text-xs text-text-muted">4 of 8 unlocked · 1,600 XP earned from badges</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-atlas-500/10 border border-atlas-500/20">
                <Sparkles className="w-4 h-4 text-atlas-400" />
                <span className="text-sm font-display font-bold text-atlas-400">Level 42</span>
                <span className="text-xs text-text-muted">· 84,200 XP</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map(ach => (
                <div key={ach.id} className={cn(
                  'p-4 rounded-xl border transition-all',
                  ach.unlocked ? RARITY_STYLES[ach.rarity] : 'bg-slate-50 border-slate-200 opacity-60',
                  ach.unlocked && 'hover:-translate-y-0.5'
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      ach.unlocked ? 'bg-slate-100' : 'bg-slate-50'
                    )}>
                      <ach.icon className={cn('w-5 h-5', ach.unlocked ? RARITY_LABELS[ach.rarity] : 'text-text-muted/30')} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-text-primary">{ach.name}</span>
                        <span className={cn('text-[10px] font-medium uppercase tracking-wider', RARITY_LABELS[ach.rarity])}>
                          {ach.rarity}
                        </span>
                        {ach.unlocked && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                      </div>
                      <p className="text-xs text-text-muted mb-2">{ach.description}</p>

                      {/* Progress Bar */}
                      {!ach.unlocked && ach.progress !== undefined && ach.total !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-text-muted">{typeof ach.progress === 'number' && ach.progress > 1000 ? `${(ach.progress / 1000).toFixed(1)}K` : ach.progress} / {typeof ach.total === 'number' && ach.total > 1000 ? `${(ach.total / 1000).toFixed(0)}K` : ach.total}</span>
                            <span className="text-[10px] text-text-muted">{Math.round((ach.progress / ach.total) * 100)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all',
                              ach.rarity === 'epic' ? 'bg-purple-500' : ach.rarity === 'legendary' ? 'bg-amber-400' : 'bg-atlas-500'
                            )} style={{ width: `${(ach.progress / ach.total) * 100}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-medium">+{ach.xpReward.toLocaleString()} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Tier System Tab ═══ */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-xl text-text-primary mb-2">Tier Progression System</h2>
              <p className="text-sm text-text-muted">Earn XP through events, reviews, fill rates, and engagement. Level up to unlock rewards.</p>
            </div>

            {/* Tier Cards */}
            <div className="space-y-4">
              {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, tier], i) => {
                const nextTier = Object.values(TIER_CONFIG)[i + 1];
                const currentXP = 84200;
                const isCurrentTier = key === 'legend';
                const isUnlocked = currentXP >= tier.xpMin;

                return (
                  <div key={key} className={cn(
                    'p-5 rounded-2xl border transition-all',
                    isCurrentTier ? 'bg-slate-50 border-slate-300' : isUnlocked ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-50'
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br', tier.gradient)}>
                        <tier.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('text-lg font-display font-bold', tier.color)}>{tier.label}</span>
                          {isCurrentTier && (
                            <span className="px-2 py-0.5 rounded-md bg-atlas-500/15 text-atlas-400 text-[10px] font-bold">CURRENT</span>
                          )}
                          {isUnlocked && !isCurrentTier && <CheckCircle className="w-4 h-4 text-green-400" />}
                        </div>
                        <p className="text-xs text-text-muted">{tier.xpMin.toLocaleString()} XP required</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-text-primary">
                          {key === 'bronze' ? 'Levels 1-10' : key === 'silver' ? 'Levels 11-20' : key === 'gold' ? 'Levels 21-30' : key === 'diamond' ? 'Levels 31-40' : 'Levels 41-50'}
                        </p>
                      </div>
                    </div>

                    {/* XP Progress to next tier */}
                    {nextTier && isCurrentTier && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-text-muted">Progress to next milestone</span>
                          <span className="text-[10px] text-text-muted">{currentXP.toLocaleString()} / {nextTier.xpMin.toLocaleString()} XP</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-atlas-500 to-atlas-400 transition-all"
                            style={{ width: `${Math.min((currentXP / nextTier.xpMin) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* XP Earning Guide */}
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-6">
              <h3 className="font-display font-semibold text-text-primary mb-4">How to Earn XP</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { action: 'Host an event', xp: '+50 XP', icon: Calendar },
                  { action: 'Fill event to 100%', xp: '+200 XP', icon: Users },
                  { action: 'Receive a 5-star review', xp: '+100 XP', icon: Star },
                  { action: 'Convert a lead to booking', xp: '+75 XP', icon: Target },
                  { action: 'Daily streak (per day)', xp: '+25 XP', icon: Flame },
                  { action: 'Unlock an achievement', xp: 'Varies', icon: Award },
                ].map(item => (
                  <div key={item.action} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/40 border border-white/60">
                    <item.icon className="w-4 h-4 text-atlas-400 shrink-0" />
                    <span className="flex-1 text-xs text-text-muted">{item.action}</span>
                    <span className="text-xs font-mono font-semibold text-atlas-400">{item.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
