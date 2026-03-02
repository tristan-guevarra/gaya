// cohort analysis - retention cohorts, survival curves, engagement funnels, ltv analysis, and behavioral segmentation

'use client';

import { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, DollarSign, Clock, Target,
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Layers,
  ChevronDown, Download, Sparkles, Activity, RefreshCw,
  Zap, Eye, Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';


type Tab = 'retention' | 'ltv' | 'funnel' | 'segments';


const retentionCohorts = [
  { month: 'Oct 2024', users: 142, weeks: [100, 72, 58, 49, 44, 41, 38, 36, 34, 32, 31, 30] },
  { month: 'Nov 2024', users: 168, weeks: [100, 75, 62, 53, 47, 43, 40, 37, 35, 33, 31] },
  { month: 'Dec 2024', users: 124, weeks: [100, 68, 52, 43, 38, 34, 31, 29, 27] },
  { month: 'Jan 2025', users: 198, weeks: [100, 78, 65, 56, 50, 46, 42] },
  { month: 'Feb 2025', users: 215, weeks: [100, 82, 71, 62, 55] },
  { month: 'Mar 2025', users: 187, weeks: [100, 84, 73] },
];

const ltvByChannel = [
  { channel: 'Organic Search', users: 420, ltv: 847, cac: 12, ratio: 70.6, trend: 8.2 },
  { channel: 'Instagram Ads', users: 312, ltv: 623, cac: 45, ratio: 13.8, trend: -2.1 },
  { channel: 'Referral', users: 198, ltv: 1240, cac: 8, ratio: 155, trend: 14.5 },
  { channel: 'Google Ads', users: 267, ltv: 582, cac: 62, ratio: 9.4, trend: 3.8 },
  { channel: 'Word of Mouth', users: 156, ltv: 1089, cac: 0, ratio: Infinity, trend: 6.7 },
  { channel: 'Coach Referral', users: 89, ltv: 945, cac: 25, ratio: 37.8, trend: 11.3 },
];

const funnelStages = [
  { stage: 'Map Visit', count: 12840, rate: 100, color: 'bg-atlas-500' },
  { stage: 'Search / Filter', count: 8420, rate: 65.6, color: 'bg-blue-500' },
  { stage: 'View Listing', count: 4210, rate: 32.8, color: 'bg-purple-500' },
  { stage: 'Request Info / Waitlist', count: 1684, rate: 13.1, color: 'bg-amber-500' },
  { stage: 'Booking Made', count: 842, rate: 6.6, color: 'bg-green-500' },
  { stage: 'Repeat Booking', count: 378, rate: 2.9, color: 'bg-pink-500' },
];

const segments = [
  { name: 'Power Users', description: '3+ bookings/month, high engagement', users: 89, pct: 7.2, avgLtv: 2140, avgSessions: 4.2, color: 'from-purple-500 to-pink-500' },
  { name: 'Regular Parents', description: 'Monthly bookings, moderate engagement', users: 312, pct: 25.4, avgLtv: 890, avgSessions: 1.8, color: 'from-atlas-500 to-cyan-400' },
  { name: 'Seasonal Users', description: 'Camp/clinic only, seasonal spikes', users: 445, pct: 36.2, avgLtv: 420, avgSessions: 0.6, color: 'from-amber-500 to-yellow-400' },
  { name: 'Tire Kickers', description: 'Browsed but never booked', users: 284, pct: 23.1, avgLtv: 45, avgSessions: 0.1, color: 'from-gray-500 to-gray-400' },
  { name: 'Churned', description: 'Previously active, no activity 60+ days', users: 98, pct: 8.0, avgLtv: 310, avgSessions: 0, color: 'from-red-500 to-orange-500' },
];


function getCellColor(value: number): string {
  if (value >= 70) return 'bg-green-500/40 text-green-200';
  if (value >= 50) return 'bg-green-500/25 text-green-300';
  if (value >= 40) return 'bg-atlas-500/25 text-atlas-300';
  if (value >= 30) return 'bg-amber-500/20 text-amber-300';
  if (value >= 20) return 'bg-orange-500/15 text-orange-300';
  return 'bg-red-500/10 text-red-300';
}


export default function CohortAnalysisPage() {
  const [tab, setTab] = useState<Tab>('retention');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'retention', label: 'Retention', icon: Activity },
    { id: 'ltv', label: 'LTV Analysis', icon: DollarSign },
    { id: 'funnel', label: 'Funnel', icon: Layers },
    { id: 'segments', label: 'Segments', icon: Users },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Cohort Analysis
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Deep retention, LTV, and behavioral analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>
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
        {/* retention tab */}
        {tab === 'retention' && (
          <div className="space-y-6 animate-fade-in">
            {/* summary */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Week 1 Retention', value: '78%', change: '+4%', icon: Activity, color: 'text-green-400' },
                { label: 'Week 4 Retention', value: '52%', change: '+7%', icon: TrendingUp, color: 'text-atlas-400' },
                { label: 'Week 12 Retention', value: '30%', change: '+3%', icon: Target, color: 'text-amber-400' },
                { label: 'Median Lifetime', value: '8.2 wk', change: '+1.4', icon: Clock, color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <s.icon className={cn('w-5 h-5 mb-2', s.color)} />
                  <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5 mt-1">
                    <ArrowUpRight className="w-3 h-3" /> {s.change} vs last period
                  </span>
                </div>
              ))}
            </div>

            {/* retention heatmap table */}
            <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-text-primary">Retention Cohort Heatmap</h3>
                <p className="text-[10px] text-text-muted">Percentage of users returning each week after signup</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-[10px] text-text-muted font-medium px-3 py-2 sticky left-0 bg-white/95">Cohort</th>
                      <th className="text-center text-[10px] text-text-muted font-medium px-1 py-2">Users</th>
                      {Array.from({ length: 12 }, (_, i) => (
                        <th key={i} className="text-center text-[10px] text-text-muted font-medium px-1 py-2">W{i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {retentionCohorts.map(cohort => (
                      <tr key={cohort.month} className="border-b border-white/[0.03]">
                        <td className="text-xs font-medium text-text-primary px-3 py-2 sticky left-0 bg-white/95 whitespace-nowrap">{cohort.month}</td>
                        <td className="text-center text-xs text-text-muted px-1 py-2">{cohort.users}</td>
                        {Array.from({ length: 12 }, (_, i) => (
                          <td key={i} className="px-0.5 py-1 text-center">
                            {cohort.weeks[i] !== undefined ? (
                              <div className={cn('mx-auto w-10 py-1 rounded text-[10px] font-mono font-medium', getCellColor(cohort.weeks[i]))}>
                                {cohort.weeks[i]}%
                              </div>
                            ) : (
                              <div className="w-10 mx-auto py-1 text-[10px] text-text-muted/20">—</div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* survival curve */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Survival Curve — Latest Cohort (Mar 2025)</h3>
              <div className="h-40 flex items-end gap-1">
                {retentionCohorts[retentionCohorts.length - 1].weeks.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted">{val}%</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-atlas-500 to-cyan-400" style={{ height: `${val * 1.4}px` }} />
                    <span className="text-[8px] text-text-muted/50">W{i}</span>
                  </div>
                ))}
                {/* projected weeks */}
                {[64, 56].map((val, i) => (
                  <div key={`proj-${i}`} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted/40">{val}%</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-atlas-500/30 to-cyan-400/30 border border-dashed border-atlas-500/30" style={{ height: `${val * 1.4}px` }} />
                    <span className="text-[8px] text-text-muted/30">W{i + retentionCohorts[retentionCohorts.length - 1].weeks.length}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-muted/40 mt-2 text-right">Dashed = AI projected</p>
            </div>
          </div>
        )}

        {/* ltv tab */}
        {tab === 'ltv' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Avg LTV', value: '$812', change: '+12%', icon: DollarSign },
                { label: 'Avg CAC', value: '$28', change: '-8%', icon: Target },
                { label: 'LTV:CAC Ratio', value: '29:1', change: '+3.2', icon: TrendingUp },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <s.icon className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-2xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-muted">{s.label}</p>
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5 mt-1">
                    <ArrowUpRight className="w-3 h-3" />{s.change}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-text-primary">LTV by Acquisition Channel</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Channel', 'Users', 'Avg LTV', 'CAC', 'LTV:CAC', 'Trend'].map(h => (
                      <th key={h} className="text-left text-[10px] text-text-muted font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ltvByChannel.map(ch => (
                    <tr key={ch.channel} className="border-b border-white/[0.03] hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-medium text-text-primary">{ch.channel}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">{ch.users}</td>
                      <td className="px-4 py-3 text-xs font-display font-bold text-green-400">${ch.ltv}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">${ch.cac}</td>
                      <td className="px-4 py-3 text-xs font-display font-bold text-text-primary">
                        {ch.ratio === Infinity ? '∞' : `${ch.ratio.toFixed(1)}x`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-[10px] flex items-center gap-0.5',
                          ch.trend > 0 ? 'text-green-400' : 'text-red-400')}>
                          {ch.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(ch.trend)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ltv insight */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">AI LTV Insight</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Referral users have <span className="text-green-400 font-semibold">46% higher LTV</span> than the average, with virtually zero CAC. 
                Investing $5K in a structured referral program could yield <span className="text-green-400 font-semibold">$48K additional LTV</span> over 12 months. 
                Instagram Ads show declining ROI — consider reallocating 30% of that budget to Coach Referral incentives.
              </p>
            </div>
          </div>
        )}

        {/* funnel tab */}
        {tab === 'funnel' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-6">Conversion Funnel — Last 30 Days</h3>
              <div className="space-y-1">
                {funnelStages.map((stage, i) => (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-40 text-right">
                      <p className="text-xs font-medium text-text-primary">{stage.stage}</p>
                      <p className="text-[10px] text-text-muted">{stage.count.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className={cn('h-10 rounded-lg transition-all flex items-center px-3', stage.color)}
                        style={{ width: `${Math.max(stage.rate, 5)}%`, opacity: 0.3 + (stage.rate / 100) * 0.7 }}>
                        <span className="text-xs font-bold text-white">{stage.rate}%</span>
                      </div>
                    </div>
                    {i > 0 && (
                      <div className="w-20 text-right">
                        <span className="text-[10px] text-text-muted">
                          {((funnelStages[i].count / funnelStages[i - 1].count) * 100).toFixed(1)}% conv.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* drop-off analysis */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Biggest Drop-offs</h3>
                <div className="space-y-3">
                  {[
                    { from: 'Search → View Listing', drop: '50%', fix: 'Improve search result cards with photos + ratings' },
                    { from: 'View Listing → Request Info', drop: '60%', fix: 'Add "Quick Book" CTA above fold on listing pages' },
                    { from: 'Request Info → Booking', drop: '50%', fix: 'Reduce response time — current avg is 4.2 hours' },
                  ].map(d => (
                    <div key={d.from} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text-primary">{d.from}</span>
                        <span className="text-xs font-bold text-red-400">{d.drop} lost</span>
                      </div>
                      <p className="text-[10px] text-text-muted">💡 {d.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Funnel Benchmarks</h3>
                <div className="space-y-3">
                  {[
                    { metric: 'Visit → Search', you: 65.6, benchmark: 55, verdict: 'above' },
                    { metric: 'Search → View', you: 50.0, benchmark: 45, verdict: 'above' },
                    { metric: 'View → Request', you: 40.0, benchmark: 35, verdict: 'above' },
                    { metric: 'Request → Book', you: 50.0, benchmark: 60, verdict: 'below' },
                    { metric: 'Book → Repeat', you: 44.9, benchmark: 40, verdict: 'above' },
                  ].map(b => (
                    <div key={b.metric} className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{b.metric}</span>
                      <div className="flex items-center gap-3">
                        <span className={cn('text-xs font-display font-bold', b.verdict === 'above' ? 'text-green-400' : 'text-red-400')}>
                          {b.you}%
                        </span>
                        <span className="text-[10px] text-text-muted/50">vs {b.benchmark}%</span>
                        {b.verdict === 'above'
                          ? <ArrowUpRight className="w-3 h-3 text-green-400" />
                          : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* segments tab */}
        {tab === 'segments' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">Behavioral Segments</h3>
              <span className="text-[10px] text-text-muted">1,228 total users analyzed</span>
            </div>

            {/* segment distribution bar */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <p className="text-xs text-text-muted mb-3">Distribution</p>
              <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
                {segments.map(seg => (
                  <div key={seg.name} className={cn('bg-gradient-to-r rounded', seg.color)} style={{ width: `${seg.pct}%` }}
                    title={`${seg.name}: ${seg.pct}%`} />
                ))}
              </div>
              <div className="flex gap-4 mt-2">
                {segments.map(seg => (
                  <div key={seg.name} className="flex items-center gap-1.5">
                    <div className={cn('w-2 h-2 rounded-full bg-gradient-to-r', seg.color)} />
                    <span className="text-[9px] text-text-muted">{seg.name} ({seg.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* segment cards */}
            {segments.map(seg => (
              <div key={seg.name} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', seg.color)} />
                      <h4 className="text-sm font-semibold text-text-primary">{seg.name}</h4>
                      <span className="text-[10px] text-text-muted">{seg.users} users ({seg.pct}%)</span>
                    </div>
                    <p className="text-[10px] text-text-muted">{seg.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-display font-bold text-green-400">${seg.avgLtv}</p>
                      <p className="text-[9px] text-text-muted">Avg LTV</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-display font-bold text-text-primary">{seg.avgSessions}</p>
                      <p className="text-[9px] text-text-muted">Sessions/mo</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-white/40 border border-white/60 text-[10px] text-text-secondary">
                      View Users
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* segment insight */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">Segment Opportunity</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Converting just <span className="font-semibold text-atlas-400">15% of Seasonal Users</span> into Regular Parents would add 
                <span className="font-semibold text-green-400"> $31.4K in annual LTV</span>. Recommended: send a personalized &ldquo;off-season private training&rdquo; offer 
                2 weeks after their last camp ends. Historical conversion rate for this tactic: 18.2%.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
