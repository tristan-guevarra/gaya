/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Gamification Hub
   Full XP system with seasonal challenges, achievement unlocks,
   quest board, tier progression, reward marketplace, and
   competitive seasons. Drives engagement + retention.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Trophy, Star, Flame, Zap, Award, Target, Clock, Users,
  ChevronRight, Lock, CheckCircle, Gift, Crown, Shield,
  Sparkles, TrendingUp, Heart, MapPin, Calendar, DollarSign,
  ArrowUpRight, Medal, Swords, Timer, Gem, Rocket, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'quests' | 'achievements' | 'rewards';

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  total: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  timeLeft?: string;
  icon: React.ElementType;
  completed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  total?: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const playerStats = {
  level: 42, xp: 84200, nextLevelXp: 90000, tier: 'Diamond',
  streak: 47, totalSessions: 284, seasonRank: 3, globalRank: 47,
  seasonXp: 12400, seasonTarget: 20000, coinsBalance: 3240,
};

const tiers = [
  { name: 'Bronze', minXp: 0, color: 'from-amber-700 to-orange-600', icon: '🥉' },
  { name: 'Silver', minXp: 5000, color: 'from-gray-300 to-gray-400', icon: '🥈' },
  { name: 'Gold', minXp: 15000, color: 'from-amber-400 to-yellow-300', icon: '🥇' },
  { name: 'Platinum', minXp: 35000, color: 'from-cyan-300 to-blue-300', icon: '💎' },
  { name: 'Diamond', minXp: 65000, color: 'from-atlas-500 to-cyan-400', icon: '💠' },
  { name: 'Legend', minXp: 100000, color: 'from-purple-400 to-pink-300', icon: '👑' },
];

const weeklyQuests: Quest[] = [
  { id: 'q1', title: 'Fill Master', description: 'Achieve 90%+ fill rate on 3 events', xp: 500, progress: 2, total: 3, category: 'Events', difficulty: 'medium', timeLeft: '3d', icon: Target, completed: false },
  { id: 'q2', title: 'Speed Demon', description: 'Respond to 10 leads within 1 hour', xp: 300, progress: 10, total: 10, category: 'Leads', difficulty: 'easy', icon: Zap, completed: true },
  { id: 'q3', title: 'Zone Conqueror', description: 'Run events in 3 different zones', xp: 750, progress: 1, total: 3, category: 'Expansion', difficulty: 'hard', timeLeft: '3d', icon: MapPin, completed: false },
  { id: 'q4', title: 'Five Star Week', description: 'Maintain 5-star rating for the entire week', xp: 400, progress: 5, total: 7, category: 'Quality', difficulty: 'medium', timeLeft: '3d', icon: Star, completed: false },
  { id: 'q5', title: 'Revenue Milestone', description: 'Earn $3,000+ in a single week', xp: 600, progress: 2840, total: 3000, category: 'Revenue', difficulty: 'hard', timeLeft: '3d', icon: DollarSign, completed: false },
];

const seasonalQuests: Quest[] = [
  { id: 'sq1', title: 'Spring Champion', description: 'Complete 50 sessions this season', xp: 5000, progress: 38, total: 50, category: 'Seasonal', difficulty: 'legendary', timeLeft: '24d', icon: Trophy, completed: false },
  { id: 'sq2', title: 'Community Builder', description: 'Onboard 5 new families', xp: 3000, progress: 3, total: 5, category: 'Seasonal', difficulty: 'hard', timeLeft: '24d', icon: Users, completed: false },
];

const achievements: Achievement[] = [
  { id: 'a1', name: 'First Session', description: 'Complete your very first session', icon: '⚡', xp: 100, rarity: 'common', unlocked: true, unlockedDate: 'Jan 2024' },
  { id: 'a2', name: '50 Sessions', description: 'Complete 50 total sessions', icon: '🏆', xp: 500, rarity: 'rare', unlocked: true, unlockedDate: 'Sep 2024' },
  { id: 'a3', name: 'Perfect Week', description: 'Get all 5-star reviews in a week', icon: '⭐', xp: 750, rarity: 'epic', unlocked: true, unlockedDate: 'Nov 2024' },
  { id: 'a4', name: 'Speed Demon', description: 'Respond to 100 leads within 1 hour', icon: '💨', xp: 500, rarity: 'rare', unlocked: true, unlockedDate: 'Dec 2024' },
  { id: 'a5', name: 'Diamond Tier', description: 'Reach Diamond tier', icon: '💠', xp: 2000, rarity: 'epic', unlocked: true, unlockedDate: 'Feb 2025' },
  { id: 'a6', name: 'Zone Master', description: 'Run events in 10 different zones', icon: '🗺️', xp: 1500, rarity: 'epic', unlocked: false, progress: 7, total: 10 },
  { id: 'a7', name: '$10K Month', description: 'Earn $10,000 in a single month', icon: '💰', xp: 3000, rarity: 'legendary', unlocked: false, progress: 8420, total: 10000 },
  { id: 'a8', name: 'Legend Status', description: 'Reach 100,000 XP', icon: '👑', xp: 5000, rarity: 'legendary', unlocked: false, progress: 84200, total: 100000 },
  { id: 'a9', name: '100-Day Streak', description: 'Maintain a 100-day login streak', icon: '🔥', xp: 2000, rarity: 'legendary', unlocked: false, progress: 47, total: 100 },
  { id: 'a10', name: 'Mentor', description: 'Have a parent leave a 500+ word review', icon: '📝', xp: 300, rarity: 'rare', unlocked: true, unlockedDate: 'Mar 2025' },
];

const rewards = [
  { id: 'r1', name: 'Priority Listing Boost', description: '24h featured placement in discovery feed', cost: 500, icon: '🚀', available: true },
  { id: 'r2', name: 'Custom Profile Badge', description: 'Exclusive profile badge for your tier', cost: 1000, icon: '🏅', available: true },
  { id: 'r3', name: 'Zone Report Unlock', description: 'Free zone intelligence report for any area', cost: 1500, icon: '📊', available: true },
  { id: 'r4', name: 'Premium Analytics', description: '30-day premium analytics access', cost: 2500, icon: '📈', available: true },
  { id: 'r5', name: 'Gaya Merch Box', description: 'Exclusive Gaya-branded coaching gear', cost: 5000, icon: '👕', available: false },
];

// ─── Helpers ────────────────────────────────────────────────────────

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-400',
  medium: 'bg-atlas-500/10 text-atlas-400',
  hard: 'bg-amber-500/10 text-amber-400',
  legendary: 'bg-purple-500/10 text-purple-400',
};

const rarityColors = {
  common: 'border-slate-200 bg-slate-50',
  rare: 'border-blue-500/20 bg-blue-500/5',
  epic: 'border-purple-500/20 bg-purple-500/5',
  legendary: 'border-amber-500/20 bg-amber-500/5',
};

// ─── Page ───────────────────────────────────────────────────────────

export default function GamificationPage() {
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'quests', label: 'Quests', icon: Swords },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  const currentTierIdx = tiers.findIndex(t => t.name === playerStats.tier);
  const nextTier = tiers[currentTierIdx + 1];
  const levelProgress = ((playerStats.xp - tiers[currentTierIdx].minXp) / ((nextTier?.minXp || 100000) - tiers[currentTierIdx].minXp)) * 100;

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Gamification Hub
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Level up, complete quests, unlock rewards</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{playerStats.coinsBalance.toLocaleString()} coins</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-400">{playerStats.streak} day streak</span>
              </div>
            </div>
          </div>

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
            {/* Level + Tier */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn('w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl', tiers[currentTierIdx].color)}>
                    {tiers[currentTierIdx].icon}
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Current Tier</p>
                    <h2 className="text-2xl font-display font-bold text-text-primary">{playerStats.tier}</h2>
                    <p className="text-xs text-text-muted mt-0.5">Level {playerStats.level} · {playerStats.xp.toLocaleString()} XP</p>
                  </div>
                </div>
                {nextTier && (
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Next: {nextTier.name}</p>
                    <p className="text-sm font-display font-bold text-text-primary">
                      {(nextTier.minXp - playerStats.xp).toLocaleString()} XP to go
                    </p>
                  </div>
                )}
              </div>

              {/* Tier Progress */}
              <div className="flex items-center gap-1.5">
                {tiers.map((tier, i) => (
                  <div key={tier.name} className="flex-1">
                    <div className={cn('h-3 rounded-full transition-all',
                      i <= currentTierIdx ? `bg-gradient-to-r ${tier.color}` :
                      i === currentTierIdx + 1 ? 'bg-slate-100 overflow-hidden' : 'bg-slate-50'
                    )}>
                      {i === currentTierIdx && (
                        <div className="h-full rounded-full bg-gradient-to-r from-atlas-500 to-cyan-400"
                          style={{ width: `${levelProgress}%` }} />
                      )}
                    </div>
                    <p className="text-center text-[8px] text-text-muted mt-1">{tier.icon} {tier.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Season Card */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400">Season 4: Spring Thunder ⚡</span>
                  </div>
                  <p className="text-xs text-text-muted">24 days remaining · Rank #{playerStats.seasonRank} in your zone</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-text-primary">{playerStats.seasonXp.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">/ {playerStats.seasonTarget.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-3">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(playerStats.seasonXp / playerStats.seasonTarget) * 100}%` }} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Total XP', value: playerStats.xp.toLocaleString(), icon: Zap, color: 'text-amber-400' },
                { label: 'Sessions', value: playerStats.totalSessions.toString(), icon: Calendar, color: 'text-atlas-400' },
                { label: 'Day Streak', value: playerStats.streak.toString(), icon: Flame, color: 'text-orange-400' },
                { label: 'Season Rank', value: `#${playerStats.seasonRank}`, icon: Medal, color: 'text-purple-400' },
                { label: 'Global Rank', value: `#${playerStats.globalRank}`, icon: Crown, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                  <s.icon className={cn('w-5 h-5 mx-auto mb-1.5', s.color)} />
                  <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active Quests Preview */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Active Quests</h3>
                <button onClick={() => setTab('quests')} className="text-[10px] text-atlas-400 flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              <div className="space-y-2">
                {weeklyQuests.filter(q => !q.completed).slice(0, 3).map(q => (
                  <div key={q.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <q.icon className="w-5 h-5 text-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-atlas-500" style={{ width: `${(q.progress / q.total) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-text-muted">{q.progress}/{q.total}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5"><Zap className="w-3 h-3" />{q.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Quests ═══ */}
        {tab === 'quests' && (
          <div className="space-y-6 animate-fade-in">
            {/* Weekly Quests */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-4 h-4 text-atlas-400" />
                <h3 className="text-sm font-semibold text-text-primary">Weekly Quests</h3>
                <span className="text-[10px] text-text-muted">Resets in 3 days</span>
              </div>
              <div className="space-y-2">
                {weeklyQuests.map(q => (
                  <div key={q.id} className={cn('p-4 rounded-xl border transition-all',
                    q.completed ? 'bg-green-500/5 border-green-500/15' : 'bg-white border-slate-200')}>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        q.completed ? 'bg-green-500/10' : 'bg-slate-50')}>
                        {q.completed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <q.icon className="w-5 h-5 text-text-muted" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={cn('text-xs font-semibold', q.completed ? 'text-green-400 line-through' : 'text-text-primary')}>{q.title}</p>
                          <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium', difficultyColors[q.difficulty])}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted">{q.description}</p>
                        {!q.completed && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-atlas-500" style={{ width: `${(q.progress / q.total) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-text-muted font-mono">{q.progress}/{q.total}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="flex items-center gap-0.5 text-sm font-bold text-amber-400"><Zap className="w-3.5 h-3.5" />{q.xp}</span>
                        {q.timeLeft && <p className="text-[10px] text-text-muted mt-0.5">{q.timeLeft} left</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Quests */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-text-primary">Season Quests</h3>
                <span className="text-[10px] text-purple-400">5x XP bonus</span>
              </div>
              <div className="space-y-2">
                {seasonalQuests.map(q => (
                  <div key={q.id} className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <q.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-semibold text-text-primary">{q.title}</p>
                          <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium', difficultyColors[q.difficulty])}>{q.difficulty}</span>
                        </div>
                        <p className="text-[10px] text-text-muted">{q.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${(q.progress / q.total) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-text-muted font-mono">{q.progress}/{q.total}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="flex items-center gap-0.5 text-sm font-bold text-purple-400"><Zap className="w-3.5 h-3.5" />{q.xp.toLocaleString()}</span>
                        {q.timeLeft && <p className="text-[10px] text-text-muted mt-0.5">{q.timeLeft} left</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Achievements ═══ */}
        {tab === 'achievements' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-text-muted">
                {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(ach => (
                <div key={ach.id} className={cn('p-4 rounded-xl border transition-all',
                  ach.unlocked ? rarityColors[ach.rarity] : 'bg-slate-50/30 border-slate-200 opacity-60')}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{ach.unlocked ? ach.icon : '🔒'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-xs font-semibold', ach.unlocked ? 'text-text-primary' : 'text-text-muted')}>{ach.name}</p>
                        <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium',
                          ach.rarity === 'common' ? 'bg-slate-100 text-text-muted' :
                          ach.rarity === 'rare' ? 'bg-blue-500/10 text-blue-400' :
                          ach.rarity === 'epic' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-amber-500/10 text-amber-400'
                        )}>{ach.rarity}</span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">{ach.description}</p>
                      {ach.unlocked ? (
                        <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Unlocked {ach.unlockedDate}
                        </p>
                      ) : ach.progress !== undefined && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-atlas-500" style={{ width: `${(ach.progress / ach.total!) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-text-muted">{Math.round((ach.progress / ach.total!) * 100)}%</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                      <Zap className="w-3 h-3" />{ach.xp.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Rewards ═══ */}
        {tab === 'rewards' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Reward Marketplace</h3>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10">
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{playerStats.coinsBalance.toLocaleString()} coins</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {rewards.map(r => (
                <div key={r.id} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                  <div className="text-4xl mb-3">{r.icon}</div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">{r.name}</h4>
                  <p className="text-[10px] text-text-muted mb-3">{r.description}</p>
                  <button disabled={playerStats.coinsBalance < r.cost}
                    className={cn('w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all',
                      playerStats.coinsBalance >= r.cost
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white hover:opacity-90'
                        : 'bg-slate-50 text-text-muted/50 cursor-not-allowed')}>
                    <Gem className="w-3.5 h-3.5" /> {r.cost.toLocaleString()} coins
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
