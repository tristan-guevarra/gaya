/* ═══════════════════════════════════════════════════════════════════
   Gaya — Revenue Analytics
   Sankey-style revenue waterfall, cohort retention heatmap,
   revenue attribution by source/zone/coach, and predictive
   revenue modeling with confidence intervals.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Target,
  Users, MapPin, Calendar, BarChart3, PieChart, Filter, Download,
  ChevronRight, Sparkles, Layers, Brain, Star, Zap, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

type Tab = 'waterfall' | 'cohorts' | 'attribution' | 'forecast';

// ─── Waterfall Data ─────────────────────────────────────────────

const WATERFALL_STEPS = [
  { label: 'Starting MRR', value: 156, cumulative: 156, type: 'neutral' as const },
  { label: 'New Customers', value: 24, cumulative: 180, type: 'add' as const },
  { label: 'Expansion', value: 18, cumulative: 198, type: 'add' as const },
  { label: 'Reactivation', value: 4, cumulative: 202, type: 'add' as const },
  { label: 'Contraction', value: -8, cumulative: 194, type: 'sub' as const },
  { label: 'Churn', value: -10, cumulative: 184, type: 'sub' as const },
  { label: 'Ending MRR', value: 184, cumulative: 184, type: 'total' as const },
];

// ─── Cohort Data ────────────────────────────────────────────────

const COHORT_MONTHS = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
const COHORT_ROWS = [
  { label: 'Jun 2025', size: 12, data: [100, 96, 93, 91, 88, 86, 84, 83, 82] },
  { label: 'Jul 2025', size: 14, data: [100, 97, 94, 92, 90, 88, 86, 85] },
  { label: 'Aug 2025', size: 11, data: [100, 95, 92, 89, 87, 85, 84] },
  { label: 'Sep 2025', size: 16, data: [100, 97, 95, 93, 91, 89] },
  { label: 'Oct 2025', size: 18, data: [100, 98, 96, 94, 92] },
  { label: 'Nov 2025', size: 15, data: [100, 97, 95, 93] },
  { label: 'Dec 2025', size: 20, data: [100, 98, 96] },
  { label: 'Jan 2026', size: 22, data: [100, 97] },
  { label: 'Feb 2026', size: 19, data: [100] },
];

// ─── Attribution Data ───────────────────────────────────────────

const BY_SOURCE = [
  { source: 'Organic Search', revenue: 62400, pct: 33.9, color: 'bg-atlas-500' },
  { source: 'Coach Referrals', revenue: 44200, pct: 24.0, color: 'bg-blue-500' },
  { source: 'Direct', revenue: 31800, pct: 17.3, color: 'bg-purple-500' },
  { source: 'Social Media', revenue: 22100, pct: 12.0, color: 'bg-amber-500' },
  { source: 'Paid Ads', revenue: 15400, pct: 8.4, color: 'bg-red-500' },
  { source: 'Partnerships', revenue: 8300, pct: 4.5, color: 'bg-cyan-500' },
];

const BY_ZONE = [
  { zone: 'Scarborough East', revenue: 42800, coaches: 6, fill: 94, trend: 18 },
  { zone: 'North York Central', revenue: 38400, coaches: 5, fill: 91, trend: 12 },
  { zone: 'Brampton North', revenue: 28600, coaches: 4, fill: 88, trend: 24 },
  { zone: 'Ajax-Pickering', revenue: 24200, coaches: 3, fill: 86, trend: 15 },
  { zone: 'Mississauga West', revenue: 21400, coaches: 3, fill: 82, trend: -3 },
  { zone: 'Etobicoke South', revenue: 18800, coaches: 3, fill: 79, trend: -8 },
];

const BY_TYPE = [
  { type: 'Camps', revenue: 98200, pct: 53.3, count: 24, avgPrice: '$299' },
  { type: 'Clinics', revenue: 52400, pct: 28.5, count: 42, avgPrice: '$89' },
  { type: 'Private', revenue: 33600, pct: 18.2, count: 186, avgPrice: '$120' },
];

// ─── Forecast Data ──────────────────────────────────────────────

const FORECAST_MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FORECAST = {
  actual: [184], // Feb actual
  predicted: [184, 196, 212, 228, 258, 274, 285, 298, 312, 328, 342],
  upper: [184, 208, 228, 252, 290, 312, 328, 348, 368, 392, 410],
  lower: [184, 186, 198, 208, 230, 240, 248, 256, 264, 274, 282],
};

// ─── Helpers ────────────────────────────────────────────────────

function getCohortColor(value: number): string {
  if (value >= 96) return 'bg-green-500/30 text-green-300';
  if (value >= 92) return 'bg-green-500/20 text-green-400';
  if (value >= 88) return 'bg-atlas-500/20 text-atlas-400';
  if (value >= 84) return 'bg-blue-500/20 text-blue-400';
  if (value >= 80) return 'bg-amber-500/20 text-amber-400';
  return 'bg-red-500/20 text-red-400';
}

// ─── Page Component ─────────────────────────────────────────────

export default function RevenueAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('waterfall');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'waterfall', label: 'MRR Waterfall', icon: BarChart3 },
    { id: 'cohorts', label: 'Cohort Retention', icon: Layers },
    { id: 'attribution', label: 'Attribution', icon: PieChart },
    { id: 'forecast', label: 'Forecast', icon: Brain },
  ];

  const waterfallMax = 220;

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" /> Revenue Analytics
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Deep dive into revenue composition, retention, and forecasting</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-extrabold text-text-primary">$184.2K</span>
              <span className="flex items-center gap-0.5 text-sm font-semibold text-green-400">
                <ArrowUpRight className="w-4 h-4" /> +18.3%
              </span>
            </div>
          </div>
          <div className="flex gap-1 mt-5">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === tab.id ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50')}>
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ═══ WATERFALL TAB ═══ */}
        {activeTab === 'waterfall' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-6">MRR Bridge — February 2026</h3>
              <div className="flex items-end gap-3 h-64 px-4">
                {WATERFALL_STEPS.map((step, i) => {
                  const barHeight = (Math.abs(step.value) / waterfallMax) * 100;
                  const isNeutral = step.type === 'neutral' || step.type === 'total';
                  const isAdd = step.type === 'add';
                  const isSub = step.type === 'sub';

                  // Calculate bottom offset for floating bars
                  let bottomPct = 0;
                  if (isAdd) {
                    const prevCum = WATERFALL_STEPS[i - 1]?.cumulative || 0;
                    bottomPct = (prevCum / waterfallMax) * 100;
                  } else if (isSub) {
                    bottomPct = (step.cumulative / waterfallMax) * 100;
                  }

                  return (
                    <div key={step.label} className="flex-1 flex flex-col items-center relative h-full">
                      {/* Value label */}
                      <div className="absolute w-full text-center" style={{ bottom: `${bottomPct + barHeight + 2}%` }}>
                        <span className={cn('text-xs font-bold',
                          isNeutral ? 'text-text-primary' : isAdd ? 'text-green-400' : 'text-red-400'
                        )}>
                          {isSub ? '' : isAdd ? '+' : ''}${Math.abs(step.value)}K
                        </span>
                      </div>
                      {/* Bar */}
                      <div className="absolute w-3/4 rounded-lg transition-all duration-500"
                        style={{
                          height: `${barHeight}%`,
                          bottom: `${bottomPct}%`,
                          background: isNeutral
                            ? 'linear-gradient(to top, rgba(0,209,178,0.3), rgba(0,209,178,0.15))'
                            : isAdd
                            ? 'linear-gradient(to top, rgba(34,197,94,0.3), rgba(34,197,94,0.15))'
                            : 'linear-gradient(to top, rgba(239,68,68,0.3), rgba(239,68,68,0.15))',
                          border: `1px solid ${isNeutral ? 'rgba(0,209,178,0.25)' : isAdd ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`
                        }}
                      />
                      {/* Label */}
                      <span className="absolute bottom-[-24px] text-[9px] text-text-muted text-center leading-tight whitespace-nowrap">{step.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Summary */}
              <div className="grid grid-cols-4 gap-3 mt-10 pt-4 border-t border-slate-200">
                {[
                  { label: 'New MRR', value: '+$24K', color: 'text-green-400' },
                  { label: 'Expansion MRR', value: '+$18K', color: 'text-green-400' },
                  { label: 'Churned MRR', value: '-$10K', color: 'text-red-400' },
                  { label: 'Net New MRR', value: '+$28K', color: 'text-atlas-400' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={cn('text-lg font-display font-bold', s.color)}>{s.value}</p>
                    <p className="text-[10px] text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Ratio */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-3xl font-display font-extrabold text-atlas-400">4.6x</p>
                <p className="text-xs text-text-muted mt-1">SaaS Quick Ratio</p>
                <p className="text-[10px] text-green-400 mt-0.5">Excellent (&gt;4x = best in class)</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-3xl font-display font-extrabold text-green-400">138%</p>
                <p className="text-xs text-text-muted mt-1">Net Revenue Retention</p>
                <p className="text-[10px] text-green-400 mt-0.5">Top decile (&gt;130% = elite)</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-3xl font-display font-extrabold text-blue-400">$2.2M</p>
                <p className="text-xs text-text-muted mt-1">ARR Run Rate</p>
                <p className="text-[10px] text-text-muted mt-0.5">$184K × 12 months</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ COHORTS TAB ═══ */}
        {activeTab === 'cohorts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue Retention by Cohort</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-[10px] text-text-muted py-2 pr-4 font-medium w-24">Cohort</th>
                      <th className="text-center text-[10px] text-text-muted py-2 px-1 font-medium w-10">Size</th>
                      {COHORT_MONTHS.map(m => (
                        <th key={m} className="text-center text-[10px] text-text-muted py-2 px-1 font-medium">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COHORT_ROWS.map(row => (
                      <tr key={row.label}>
                        <td className="py-1 pr-4 text-xs text-text-secondary font-medium">{row.label}</td>
                        <td className="py-1 px-1 text-center text-[10px] text-text-muted">{row.size}</td>
                        {COHORT_MONTHS.map((_, mi) => (
                          <td key={mi} className="py-1 px-1 text-center">
                            {mi < row.data.length ? (
                              <span className={cn('inline-flex items-center justify-center w-12 h-7 rounded-md text-[10px] font-medium',
                                getCohortColor(row.data[mi]))}>
                                {row.data[mi]}%
                              </span>
                            ) : (
                              <span className="text-text-muted/20">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200">
                <span className="text-[9px] text-text-muted">Retention:</span>
                {['≥96%', '≥92%', '≥88%', '≥84%', '<84%'].map((label, i) => (
                  <span key={label} className={cn('text-[9px] px-1.5 py-0.5 rounded',
                    i === 0 ? 'bg-green-500/30 text-green-300' :
                    i === 1 ? 'bg-green-500/20 text-green-400' :
                    i === 2 ? 'bg-atlas-500/20 text-atlas-400' :
                    i === 3 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  )}>{label}</span>
                ))}
              </div>
            </div>

            {/* Cohort Insights */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <Sparkles className="w-4 h-4 text-atlas-400 mb-2" />
                <p className="text-lg font-display font-bold text-text-primary">88.2%</p>
                <p className="text-xs text-text-muted">Avg 6-month retention</p>
                <p className="text-[10px] text-green-400 mt-0.5">+4pp vs industry avg</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <TrendingUp className="w-4 h-4 text-green-400 mb-2" />
                <p className="text-lg font-display font-bold text-text-primary">Improving</p>
                <p className="text-xs text-text-muted">Newer cohorts retain better</p>
                <p className="text-[10px] text-green-400 mt-0.5">M1 retention: 95% → 98%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <Target className="w-4 h-4 text-blue-400 mb-2" />
                <p className="text-lg font-display font-bold text-text-primary">Month 3</p>
                <p className="text-xs text-text-muted">Critical retention inflection</p>
                <p className="text-[10px] text-text-muted mt-0.5">After M3, churn stabilizes at &lt;2%/mo</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ATTRIBUTION TAB ═══ */}
        {activeTab === 'attribution' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              {/* By Source */}
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue by Source</h3>
                <div className="flex rounded-lg overflow-hidden h-4 mb-4">
                  {BY_SOURCE.map(s => (
                    <div key={s.source} className={cn('h-full', s.color)} style={{ width: `${s.pct}%`, opacity: 0.6 }} />
                  ))}
                </div>
                <div className="space-y-2">
                  {BY_SOURCE.map(s => (
                    <div key={s.source} className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-sm', s.color)} />
                      <span className="text-[11px] text-text-muted flex-1">{s.source}</span>
                      <span className="text-xs font-medium text-text-primary">${(s.revenue / 1000).toFixed(1)}K</span>
                      <span className="text-[10px] text-text-muted w-10 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Type */}
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue by Event Type</h3>
                <div className="space-y-4">
                  {BY_TYPE.map(t => (
                    <div key={t.type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-text-primary">{t.type}</span>
                        <span className="text-xs font-bold text-text-primary">${(t.revenue / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="h-6 rounded-lg bg-slate-50 overflow-hidden relative">
                        <div className="h-full rounded-lg bg-atlas-500/25 transition-all" style={{ width: `${t.pct}%` }} />
                        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px]">
                          <span className="text-text-muted">{t.count} events · {t.avgPrice} avg</span>
                          <span className="text-text-primary font-medium">{t.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By Zone */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue by Zone</h3>
              <div className="grid grid-cols-3 gap-3">
                {BY_ZONE.map((z, i) => (
                  <div key={z.zone} className="p-3 rounded-xl bg-white/40 border border-white/60 hover:border-slate-200 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-text-muted">#{i + 1}</span>
                      <span className={cn('flex items-center gap-0.5 text-[10px] font-medium',
                        z.trend > 0 ? 'text-green-400' : 'text-red-400')}>
                        {z.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {z.trend > 0 ? '+' : ''}{z.trend}%
                      </span>
                    </div>
                    <p className="text-xs font-medium text-text-primary">{z.zone}</p>
                    <p className="text-lg font-display font-bold text-atlas-400">${(z.revenue / 1000).toFixed(1)}K</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                      <span>{z.coaches} coaches</span>
                      <span>{z.fill}% fill</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ FORECAST TAB ═══ */}
        {activeTab === 'forecast' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">MRR Forecast — 10 Month Outlook</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">ARIMA + XGBoost ensemble with 80% confidence interval</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-atlas-400">$342K</p>
                  <p className="text-[10px] text-text-muted">Predicted Dec 2026 MRR</p>
                </div>
              </div>

              {/* Forecast Chart - SVG */}
              <div className="relative h-56">
                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                  {/* Confidence band */}
                  <polygon
                    points={FORECAST.upper.map((v, i) => `${(i / 10) * 580 + 10},${200 - ((v - 170) / 250) * 180}`).join(' ') + ' ' +
                      [...FORECAST.lower].reverse().map((v, i) => `${((10 - i) / 10) * 580 + 10},${200 - ((v - 170) / 250) * 180}`).join(' ')}
                    fill="rgba(0,209,178,0.08)" stroke="none"
                  />
                  {/* Predicted line */}
                  <polyline
                    points={FORECAST.predicted.map((v, i) => `${(i / 10) * 580 + 10},${200 - ((v - 170) / 250) * 180}`).join(' ')}
                    fill="none" stroke="rgba(0,209,178,0.6)" strokeWidth="2" strokeDasharray="6,4"
                  />
                  {/* Actual dot */}
                  <circle cx="10" cy={200 - ((184 - 170) / 250) * 180} r="4" fill="#00d1b2" />
                  {/* End dot */}
                  <circle cx="590" cy={200 - ((342 - 170) / 250) * 180} r="4" fill="rgba(0,209,178,0.6)" strokeWidth="1" stroke="#00d1b2" />
                </svg>
                {/* Month labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                  {['Feb', ...FORECAST_MONTHS].map(m => (
                    <span key={m} className="text-[8px] text-text-muted">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Forecast Scenarios */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Conservative', mrr: '$282K', arr: '$3.4M', color: 'text-amber-400', growth: '+53%' },
                { label: 'Base Case', mrr: '$342K', arr: '$4.1M', color: 'text-atlas-400', growth: '+86%' },
                { label: 'Optimistic', mrr: '$410K', arr: '$4.9M', color: 'text-green-400', growth: '+123%' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                  <p className="text-xs text-text-muted mb-2">{s.label}</p>
                  <p className={cn('text-2xl font-display font-extrabold', s.color)}>{s.mrr}</p>
                  <p className="text-xs text-text-muted mt-1">MRR by Dec 2026</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs font-medium text-text-primary">{s.arr} ARR</span>
                    <span className={cn('text-xs font-bold', s.color)}>{s.growth}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Assumptions */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-atlas-400" /> Model Assumptions
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                  'New customer growth: 12-18 orgs/month',
                  'Net expansion rate: 8-12% of existing MRR',
                  'Monthly churn: 2.0-2.5% of MRR',
                  'Seasonal uplift: 1.4x during summer (Jun-Aug)',
                  'New market contribution: $8K MRR/metro at M6',
                  'Price increase assumption: 5% in Q3 2026',
                ].map(a => (
                  <p key={a} className="text-[11px] text-text-muted flex items-start gap-1.5">
                    <Zap className="w-3 h-3 text-atlas-400 mt-0.5 shrink-0" />{a}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
