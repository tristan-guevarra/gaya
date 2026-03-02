/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Goal Tracker (OKRs)
   OKR-style goal management for organizations. Quarterly
   objectives with key results, team alignment, progress
   visualization, and AI-powered goal suggestions.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Target, TrendingUp, Users, DollarSign, CheckCircle, Clock,
  Plus, ChevronRight, ChevronDown, Star, Zap, AlertTriangle,
  Award, Flag, Sparkles, ArrowUpRight, Calendar, BarChart3,
  MapPin, Layers, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  owner: string;
}

interface Objective {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  progress: number;
  owner: string;
  dueDate: string;
  keyResults: KeyResult[];
  expanded: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const quarter = { name: 'Q2 2025', start: 'Apr 1', end: 'Jun 30', daysLeft: 62, totalDays: 91 };
const overallProgress = 58;

const initialObjectives: Objective[] = [
  {
    id: 'o1', title: 'Scale to 500 active families across the GTA', category: 'Growth',
    categoryColor: 'bg-green-500/10 text-green-400', progress: 72, owner: 'Marcus T.',
    dueDate: 'Jun 30', expanded: true,
    keyResults: [
      { id: 'kr1', title: 'Reach 500 registered families', current: 362, target: 500, unit: 'families', status: 'on_track', owner: 'Marcus T.' },
      { id: 'kr2', title: 'Achieve 85% week-1 retention for new signups', current: 82, target: 85, unit: '%', status: 'at_risk', owner: 'Sarah C.' },
      { id: 'kr3', title: 'Launch in 3 new zones (Brampton, Oakville, Whitby)', current: 2, target: 3, unit: 'zones', status: 'on_track', owner: 'David P.' },
    ],
  },
  {
    id: 'o2', title: 'Achieve $40K MRR with 90%+ gross margin', category: 'Revenue',
    categoryColor: 'bg-amber-500/10 text-amber-400', progress: 61, owner: 'Marcus T.',
    dueDate: 'Jun 30', expanded: true,
    keyResults: [
      { id: 'kr4', title: 'Hit $40,000 monthly recurring revenue', current: 24200, target: 40000, unit: '$', status: 'at_risk', owner: 'Marcus T.' },
      { id: 'kr5', title: 'Average booking value above $95', current: 104, target: 95, unit: '$', status: 'completed', owner: 'Sarah C.' },
      { id: 'kr6', title: 'Reduce churn to below 5%', current: 6.2, target: 5, unit: '%', status: 'behind', owner: 'Marcus T.' },
    ],
  },
  {
    id: 'o3', title: 'Build a world-class coaching network', category: 'Product',
    categoryColor: 'bg-atlas-500/10 text-atlas-400', progress: 48, owner: 'Sarah C.',
    dueDate: 'Jun 30', expanded: false,
    keyResults: [
      { id: 'kr7', title: 'Onboard 25 verified coaches', current: 12, target: 25, unit: 'coaches', status: 'behind', owner: 'David P.' },
      { id: 'kr8', title: 'Maintain 4.8+ average coach rating', current: 4.91, target: 4.8, unit: '★', status: 'completed', owner: 'Sarah C.' },
      { id: 'kr9', title: 'Fill rate above 80% across all events', current: 74, target: 80, unit: '%', status: 'at_risk', owner: 'Marcus T.' },
    ],
  },
  {
    id: 'o4', title: 'Establish Gaya as the go-to training platform', category: 'Brand',
    categoryColor: 'bg-purple-500/10 text-purple-400', progress: 44, owner: 'David P.',
    dueDate: 'Jun 30', expanded: false,
    keyResults: [
      { id: 'kr10', title: 'Reach 10K monthly organic visitors', current: 4200, target: 10000, unit: 'visitors', status: 'behind', owner: 'David P.' },
      { id: 'kr11', title: 'Get featured in 3 sports media outlets', current: 1, target: 3, unit: 'features', status: 'at_risk', owner: 'David P.' },
      { id: 'kr12', title: 'NPS score above +50', current: 62, target: 50, unit: 'NPS', status: 'completed', owner: 'Sarah C.' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

const statusConfig = {
  on_track: { label: 'On Track', color: 'text-green-400 bg-green-500/10', icon: TrendingUp },
  at_risk: { label: 'At Risk', color: 'text-amber-400 bg-amber-500/10', icon: AlertTriangle },
  behind: { label: 'Behind', color: 'text-red-400 bg-red-500/10', icon: Clock },
  completed: { label: 'Completed', color: 'text-atlas-400 bg-atlas-500/10', icon: CheckCircle },
};

function getProgressColor(progress: number) {
  if (progress >= 70) return 'bg-green-500';
  if (progress >= 50) return 'bg-atlas-500';
  if (progress >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatValue(value: number, unit: string) {
  if (unit === '$') return `$${value.toLocaleString()}`;
  if (unit === '%' || unit === '★' || unit === 'NPS') return `${value}${unit === '★' ? '★' : ''}`;
  return value.toLocaleString();
}

// ─── Page ───────────────────────────────────────────────────────────

export default function GoalTrackerPage() {
  const [objectives, setObjectives] = useState(initialObjectives);

  const toggleExpand = (id: string) => {
    setObjectives(objectives.map(o => o.id === id ? { ...o, expanded: !o.expanded } : o));
  };

  const totalKRs = objectives.reduce((s, o) => s + o.keyResults.length, 0);
  const completedKRs = objectives.reduce((s, o) => s + o.keyResults.filter(kr => kr.status === 'completed').length, 0);
  const atRiskKRs = objectives.reduce((s, o) => s + o.keyResults.filter(kr => kr.status === 'at_risk' || kr.status === 'behind').length, 0);

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" /> Goal Tracker
              </h1>
              <p className="text-xs text-text-muted mt-0.5">{quarter.name} · {quarter.daysLeft} days remaining</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-xs font-medium text-atlas-400">
              <Plus className="w-3.5 h-3.5" /> Add Objective
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Quarter Progress */}
        <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Quarter Progress</h2>
            <span className="text-2xl font-display font-bold text-text-primary">{overallProgress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-4">
            <div className={cn('h-full rounded-full transition-all', getProgressColor(overallProgress))} style={{ width: `${overallProgress}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Objectives', value: objectives.length.toString(), icon: Flag, color: 'text-atlas-400' },
              { label: 'Key Results', value: `${completedKRs}/${totalKRs}`, icon: Target, color: 'text-green-400' },
              { label: 'On Track', value: objectives.reduce((s, o) => s + o.keyResults.filter(kr => kr.status === 'on_track').length, 0).toString(), icon: TrendingUp, color: 'text-green-400' },
              { label: 'At Risk', value: atRiskKRs.toString(), icon: AlertTriangle, color: 'text-amber-400' },
              { label: 'Time Elapsed', value: `${Math.round(((quarter.totalDays - quarter.daysLeft) / quarter.totalDays) * 100)}%`, icon: Clock, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <s.icon className={cn('w-4 h-4 mx-auto mb-1', s.color)} />
                <p className="text-sm font-display font-bold text-text-primary">{s.value}</p>
                <p className="text-[9px] text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        {objectives.map(obj => (
          <div key={obj.id} className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
            {/* Objective Header */}
            <button onClick={() => toggleExpand(obj.id)}
              className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-all text-left">
              {obj.expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', obj.categoryColor)}>{obj.category}</span>
                  <h3 className="text-sm font-semibold text-text-primary">{obj.title}</h3>
                </div>
                <p className="text-[10px] text-text-muted">Owner: {obj.owner} · Due: {obj.dueDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full rounded-full', getProgressColor(obj.progress))} style={{ width: `${obj.progress}%` }} />
                </div>
                <span className={cn('text-sm font-display font-bold', obj.progress >= 70 ? 'text-green-400' : obj.progress >= 50 ? 'text-atlas-400' : 'text-amber-400')}>
                  {obj.progress}%
                </span>
              </div>
            </button>

            {/* Key Results */}
            {obj.expanded && (
              <div className="border-t border-slate-200 px-5 pb-4">
                {obj.keyResults.map(kr => {
                  const pct = kr.unit === '%' || kr.unit === '★' || kr.unit === 'NPS'
                    ? Math.min((kr.current / kr.target) * 100, 100)
                    : Math.min((kr.current / kr.target) * 100, 100);
                  const StatusIcon = statusConfig[kr.status].icon;

                  return (
                    <div key={kr.id} className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0">
                      <StatusIcon className={cn('w-4 h-4 shrink-0',
                        kr.status === 'completed' ? 'text-atlas-400' :
                        kr.status === 'on_track' ? 'text-green-400' :
                        kr.status === 'at_risk' ? 'text-amber-400' : 'text-red-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs', kr.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary')}>{kr.title}</p>
                        <p className="text-[10px] text-text-muted/50 mt-0.5">Owner: {kr.owner}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={cn('h-full rounded-full',
                            kr.status === 'completed' ? 'bg-atlas-500' :
                            kr.status === 'on_track' ? 'bg-green-500' :
                            kr.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'
                          )} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-mono text-text-muted w-28 text-right">
                          {formatValue(kr.current, kr.unit)} / {formatValue(kr.target, kr.unit)}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded text-[9px] font-medium w-20 text-center', statusConfig[kr.status].color)}>
                          {statusConfig[kr.status].label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* AI Goal Suggestions */}
        <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/15">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">AI Goal Recommendations for Q3</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { obj: 'Reduce customer acquisition cost by 25%', why: 'CAC has increased 12% QoQ while LTV remains flat. Referral program could cut CAC significantly.', category: 'Revenue' },
              { obj: 'Achieve 90% fill rate across all zones', why: 'Current 74% fill rate leaves $8.4K/mo on the table. Dynamic pricing + targeted marketing could close the gap.', category: 'Product' },
              { obj: 'Launch multi-sport support (basketball, tennis)', why: 'User surveys show 34% of parents want multi-sport access. Competitors are single-sport only — first-mover advantage.', category: 'Growth' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/40 border border-white/60">
                <span className="text-[9px] text-purple-400 font-medium">{s.category}</span>
                <p className="text-xs font-medium text-text-primary mt-1">{s.obj}</p>
                <p className="text-[10px] text-text-muted mt-2 leading-relaxed">{s.why}</p>
                <button className="mt-2 px-3 py-1 rounded-lg bg-purple-500/10 text-[10px] text-purple-400">Add to Q3</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
