/* ═══════════════════════════════════════════════════════════════════════
   Gaya — A/B Testing Lab
   Run experiments on pricing, timing, and copy. Statistical
   significance tracking, variant comparison, experiment
   history, and visual results dashboard.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  FlaskConical, Play, Pause, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, Target, Users, DollarSign,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus, Zap,
  Plus, Filter, ChevronRight, AlertTriangle, Sparkles,
  Calendar, MapPin, Eye, Copy, Percent, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type ExperimentStatus = 'running' | 'completed' | 'paused' | 'draft';
type ExperimentType = 'pricing' | 'timing' | 'copy' | 'capacity' | 'channel';

interface Variant {
  name: string;
  description: string;
  visitors: number;
  conversions: number;
  revenue: number;
  convRate: number;
  isControl: boolean;
  isWinner?: boolean;
}

interface Experiment {
  id: string;
  name: string;
  type: ExperimentType;
  status: ExperimentStatus;
  startDate: string;
  endDate?: string;
  traffic: number;
  confidence: number;
  variants: Variant[];
  description: string;
  zone: string;
  uplift?: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const experiments: Experiment[] = [
  {
    id: 'exp-1', name: 'Camp Pricing: $249 vs $299 vs $349', type: 'pricing', status: 'running',
    startDate: 'Mar 18', traffic: 68, confidence: 87.4, zone: 'Scarborough East',
    description: 'Testing optimal price point for spring elite camp. Measuring conversion rate and total revenue.',
    variants: [
      { name: 'Control ($299)', description: 'Current price', visitors: 842, conversions: 71, revenue: 21229, convRate: 8.43, isControl: true },
      { name: 'Lower ($249)', description: 'Price-sensitive segment', visitors: 836, conversions: 94, revenue: 23406, convRate: 11.24, isWinner: true },
      { name: 'Premium ($349)', description: 'Higher price point', visitors: 828, conversions: 52, revenue: 18148, convRate: 6.28 },
    ],
  },
  {
    id: 'exp-2', name: 'Clinic Time: Weekday Evening vs Weekend Morning', type: 'timing', status: 'completed',
    startDate: 'Feb 20', endDate: 'Mar 15', traffic: 100, confidence: 96.2, zone: 'North York',
    description: 'Determining optimal scheduling window for speed & agility clinics. Measuring fill rate and satisfaction.',
    uplift: 23,
    variants: [
      { name: 'Weekday Evening (5-7 PM)', description: 'Tuesday + Thursday', visitors: 1240, conversions: 186, revenue: 16554, convRate: 15.0, isControl: true },
      { name: 'Weekend Morning (9-11 AM)', description: 'Saturday', visitors: 1218, conversions: 225, revenue: 20025, convRate: 18.47, isWinner: true },
    ],
  },
  {
    id: 'exp-3', name: 'CTA: "Join Now" vs "Reserve Your Spot" vs "Start Training"', type: 'copy', status: 'running',
    startDate: 'Mar 25', traffic: 42, confidence: 62.1, zone: 'All Zones',
    description: 'Testing CTA button text on event listing pages. Measuring click-through rate.',
    variants: [
      { name: '"Join Now"', description: 'Current CTA', visitors: 2140, conversions: 192, revenue: 0, convRate: 8.97, isControl: true },
      { name: '"Reserve Your Spot"', description: 'Urgency-driven', visitors: 2108, conversions: 221, revenue: 0, convRate: 10.48 },
      { name: '"Start Training"', description: 'Action-oriented', visitors: 2096, conversions: 236, revenue: 0, convRate: 11.26, isWinner: true },
    ],
  },
  {
    id: 'exp-4', name: 'Camp Capacity: 20 vs 30 vs 40 spots', type: 'capacity', status: 'completed',
    startDate: 'Jan 10', endDate: 'Feb 28', traffic: 100, confidence: 94.8, zone: 'Ajax-Pickering',
    description: 'Optimal group size balancing fill rate, coach satisfaction, and revenue per session.',
    uplift: 18,
    variants: [
      { name: '20 spots', description: 'Small group', visitors: 800, conversions: 156, revenue: 46644, convRate: 19.5, isControl: true },
      { name: '30 spots', description: 'Medium group', visitors: 812, conversions: 178, revenue: 53222, convRate: 21.92, isWinner: true },
      { name: '40 spots', description: 'Large group', visitors: 796, conversions: 164, revenue: 49036, convRate: 20.6 },
    ],
  },
  {
    id: 'exp-5', name: 'Email Subject Line: Urgency vs Value vs Social Proof', type: 'copy', status: 'paused',
    startDate: 'Mar 10', traffic: 35, confidence: 44.2, zone: 'All Zones',
    description: 'Testing email subject lines for camp promotion emails. Paused due to low sample size.',
    variants: [
      { name: '"Last 5 Spots!"', description: 'Urgency', visitors: 1420, conversions: 412, revenue: 0, convRate: 29.01, isControl: true },
      { name: '"Train Like a Pro"', description: 'Value', visitors: 1380, conversions: 386, revenue: 0, convRate: 27.97 },
      { name: '"Join 500+ Athletes"', description: 'Social proof', visitors: 1396, conversions: 420, revenue: 0, convRate: 30.09 },
    ],
  },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function ABTestingPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment>(experiments[0]);
  const [statusFilter, setStatusFilter] = useState<ExperimentStatus | 'all'>('all');

  const filtered = statusFilter === 'all' ? experiments : experiments.filter(e => e.status === statusFilter);

  const statusConfig: Record<ExperimentStatus, { icon: React.ElementType; color: string; label: string }> = {
    running: { icon: Play, color: 'text-green-400 bg-green-500/10', label: 'Running' },
    completed: { icon: CheckCircle, color: 'text-atlas-400 bg-atlas-500/10', label: 'Completed' },
    paused: { icon: Pause, color: 'text-amber-400 bg-amber-500/10', label: 'Paused' },
    draft: { icon: Clock, color: 'text-text-muted bg-slate-50', label: 'Draft' },
  };

  const typeColors: Record<ExperimentType, string> = {
    pricing: 'bg-green-500/10 text-green-400',
    timing: 'bg-blue-500/10 text-blue-400',
    copy: 'bg-purple-500/10 text-purple-400',
    capacity: 'bg-amber-500/10 text-amber-400',
    channel: 'bg-pink-500/10 text-pink-400',
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-green-400" /> A/B Testing Lab
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Run experiments, measure outcomes, ship winning variants</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-xs font-medium text-atlas-400 hover:bg-atlas-500/15">
              <Plus className="w-3.5 h-3.5" /> New Experiment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Experiments', value: experiments.filter(e => e.status === 'running').length.toString(), color: 'text-green-400', icon: Play },
            { label: 'Completed', value: experiments.filter(e => e.status === 'completed').length.toString(), color: 'text-atlas-400', icon: CheckCircle },
            { label: 'Avg Confidence', value: `${Math.round(experiments.reduce((s, e) => s + e.confidence, 0) / experiments.length)}%`, color: 'text-purple-400', icon: Target },
            { label: 'Total Revenue Impact', value: '+$14.2K', color: 'text-amber-400', icon: DollarSign },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-2', s.color)} />
              <p className="text-2xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Experiment List */}
          <div className="col-span-5 space-y-3">
            {/* Filters */}
            <div className="flex gap-1.5">
              {(['all', 'running', 'completed', 'paused'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                    statusFilter === s ? 'bg-atlas-500/10 text-atlas-400 border border-atlas-500/20' : 'text-text-muted border border-slate-200')}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {filtered.map(exp => {
              const sc = statusConfig[exp.status];
              return (
                <button key={exp.id} onClick={() => setSelectedExperiment(exp)}
                  className={cn('w-full p-4 rounded-xl border text-left transition-all',
                    selectedExperiment.id === exp.id
                      ? 'bg-atlas-500/5 border-atlas-500/20'
                      : 'bg-white border-slate-200 hover:border-white/[0.1]')}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', typeColors[exp.type])}>
                      {exp.type}
                    </span>
                    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', sc.color)}>
                      <sc.icon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text-primary mb-1">{exp.name}</p>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>{exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : ''}</span>
                    <span>{exp.confidence.toFixed(1)}% confidence</span>
                    <span>{exp.zone}</span>
                  </div>
                  {/* Traffic bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={cn('h-full rounded-full', exp.traffic >= 95 ? 'bg-green-500' : 'bg-atlas-500')}
                        style={{ width: `${exp.traffic}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted">{exp.traffic}% traffic</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Experiment Detail */}
          <div className="col-span-7 space-y-4">
            {/* Header */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', typeColors[selectedExperiment.type])}>
                    {selectedExperiment.type}
                  </span>
                  {(() => { const sc = statusConfig[selectedExperiment.status]; return (
                    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', sc.color)}>
                      <sc.icon className="w-3 h-3" /> {sc.label}
                    </span>
                  ); })()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{selectedExperiment.zone}</span>
                  {selectedExperiment.status === 'running' && (
                    <button className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
                      Stop
                    </button>
                  )}
                </div>
              </div>
              <h2 className="text-base font-display font-bold text-text-primary">{selectedExperiment.name}</h2>
              <p className="text-xs text-text-muted mt-1">{selectedExperiment.description}</p>

              {/* Confidence Meter */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium text-text-secondary">Statistical Confidence</span>
                  <span className={cn('text-sm font-display font-bold',
                    selectedExperiment.confidence >= 95 ? 'text-green-400' :
                    selectedExperiment.confidence >= 80 ? 'text-atlas-400' :
                    'text-amber-400'
                  )}>{selectedExperiment.confidence.toFixed(1)}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all',
                    selectedExperiment.confidence >= 95 ? 'bg-green-500' :
                    selectedExperiment.confidence >= 80 ? 'bg-atlas-500' :
                    'bg-amber-500'
                  )} style={{ width: `${selectedExperiment.confidence}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-text-muted">0%</span>
                  <span className="text-[9px] text-text-muted/50">← 95% = statistically significant →</span>
                  <span className="text-[9px] text-text-muted">100%</span>
                </div>
              </div>
            </div>

            {/* Variant Comparison */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Variant Comparison</h3>

              {/* Visual bars */}
              <div className="space-y-4 mb-6">
                {selectedExperiment.variants.map((v, i) => {
                  const maxRate = Math.max(...selectedExperiment.variants.map(x => x.convRate));
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-primary">{v.name}</span>
                          {v.isControl && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-text-muted">CONTROL</span>}
                          {v.isWinner && <span className="px-1.5 py-0.5 rounded text-[8px] bg-green-500/10 text-green-400">WINNER</span>}
                        </div>
                        <span className={cn('text-sm font-display font-bold',
                          v.isWinner ? 'text-green-400' : 'text-text-secondary'
                        )}>{v.convRate.toFixed(2)}%</span>
                      </div>
                      <div className="h-6 rounded-lg bg-slate-50 overflow-hidden">
                        <div className={cn('h-full rounded-lg transition-all flex items-center px-3',
                          v.isWinner ? 'bg-green-500/20' : v.isControl ? 'bg-atlas-500/15' : 'bg-slate-100'
                        )} style={{ width: `${(v.convRate / maxRate) * 100}%` }}>
                          <span className="text-[10px] text-text-secondary">{v.visitors.toLocaleString()} visitors · {v.conversions} conv.</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase pb-2">Variant</th>
                    <th className="text-right text-[10px] font-medium text-text-muted uppercase pb-2">Visitors</th>
                    <th className="text-right text-[10px] font-medium text-text-muted uppercase pb-2">Conversions</th>
                    <th className="text-right text-[10px] font-medium text-text-muted uppercase pb-2">Conv. Rate</th>
                    <th className="text-right text-[10px] font-medium text-text-muted uppercase pb-2">Revenue</th>
                    <th className="text-right text-[10px] font-medium text-text-muted uppercase pb-2">vs Control</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExperiment.variants.map((v, i) => {
                    const control = selectedExperiment.variants.find(x => x.isControl)!;
                    const diff = v.isControl ? 0 : ((v.convRate - control.convRate) / control.convRate) * 100;
                    return (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="py-2.5 text-xs text-text-primary">{v.name}</td>
                        <td className="py-2.5 text-xs text-text-secondary text-right">{v.visitors.toLocaleString()}</td>
                        <td className="py-2.5 text-xs text-text-secondary text-right">{v.conversions}</td>
                        <td className="py-2.5 text-xs text-text-primary text-right font-mono">{v.convRate.toFixed(2)}%</td>
                        <td className="py-2.5 text-xs text-text-secondary text-right">
                          {v.revenue > 0 ? `$${v.revenue.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2.5 text-right">
                          {v.isControl ? (
                            <span className="text-[10px] text-text-muted">baseline</span>
                          ) : (
                            <span className={cn('text-xs font-semibold', diff > 0 ? 'text-green-400' : 'text-red-400')}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI Recommendation */}
            {selectedExperiment.confidence >= 80 && (
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400">AI Recommendation</span>
                </div>
                {(() => {
                  const winner = selectedExperiment.variants.find(v => v.isWinner);
                  const control = selectedExperiment.variants.find(v => v.isControl)!;
                  if (!winner) return null;
                  const uplift = ((winner.convRate - control.convRate) / control.convRate * 100).toFixed(1);
                  return (
                    <p className="text-xs text-text-secondary leading-relaxed">
                      At {selectedExperiment.confidence.toFixed(1)}% confidence, <strong className="text-text-primary">{winner.name}</strong> outperforms
                      the control by <strong className="text-green-400">+{uplift}%</strong>.
                      {selectedExperiment.confidence >= 95
                        ? ' Results are statistically significant. Recommend shipping this variant to 100% of traffic.'
                        : ' Continue running to reach 95% significance threshold before shipping.'}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
