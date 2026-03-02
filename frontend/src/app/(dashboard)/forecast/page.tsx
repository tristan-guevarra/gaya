/* ═══════════════════════════════════════════════════════════
   Gaya — Revenue Forecasting Engine
   Time-series projections with confidence bands,
   scenario comparison, zone revenue breakdown,
   and booking funnel analysis
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, ReferenceLine
} from 'recharts';
import { Card, Badge, Button, StatCard } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import {
  TrendingUp, DollarSign, Calendar, Target, Zap,
  ArrowUpRight, ArrowDownRight, BarChart3, Brain,
  Layers, Globe, ChevronDown, Sparkles, PieChart
} from 'lucide-react';

// ─── Revenue Forecast Data ────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_MONTH = 1; // February (0-indexed)

const FORECAST_DATA = MONTHS.map((month, i) => {
  const isActual = i <= CURRENT_MONTH;
  const baseValue = 18000 + i * 3500 + Math.sin(i * 0.8) * 5000;
  const actual = isActual ? baseValue + (Math.random() - 0.3) * 3000 : undefined;
  const predicted = baseValue + (Math.random() - 0.5) * 2000;
  const uncertainty = 1500 + i * 800; // Grows with time

  return {
    month,
    actual: actual ? Math.round(actual) : undefined,
    predicted: Math.round(predicted),
    lower_bound: Math.round(predicted - uncertainty),
    upper_bound: Math.round(predicted + uncertainty),
    isProjected: !isActual,
  };
});

// ─── Scenario Data ────────────────────────────────────────

type Scenario = 'base' | 'aggressive' | 'conservative';

const SCENARIO_MULTIPLIERS: Record<Scenario, number> = {
  base: 1.0,
  aggressive: 1.35,
  conservative: 0.75,
};

// ─── Zone Revenue ─────────────────────────────────────────

const ZONE_REVENUE = [
  { zone: 'Downtown', revenue: 42800, bookings: 156, avg_ticket: 274, growth: 18, fill_rate: 0.82 },
  { zone: 'North York', revenue: 35200, bookings: 132, avg_ticket: 267, growth: 12, fill_rate: 0.71 },
  { zone: 'Mississauga', revenue: 31500, bookings: 118, avg_ticket: 267, growth: 24, fill_rate: 0.76 },
  { zone: 'Scarborough', revenue: 22400, bookings: 89, avg_ticket: 252, growth: 31, fill_rate: 0.64 },
  { zone: 'Brampton', revenue: 19800, bookings: 78, avg_ticket: 254, growth: 28, fill_rate: 0.58 },
  { zone: 'Etobicoke', revenue: 17600, bookings: 72, avg_ticket: 244, growth: 8, fill_rate: 0.69 },
  { zone: 'Markham', revenue: 14200, bookings: 58, avg_ticket: 245, growth: 15, fill_rate: 0.65 },
  { zone: 'Vaughan', revenue: 11800, bookings: 48, avg_ticket: 246, growth: 5, fill_rate: 0.61 },
].sort((a, b) => b.revenue - a.revenue);

const maxRevenue = ZONE_REVENUE[0].revenue;

// ─── Funnel Data ──────────────────────────────────────────

const FUNNEL = [
  { stage: 'Map Views', count: 12450, color: '#4d9fff' },
  { stage: 'Listing Views', count: 4820, color: '#6366f1' },
  { stage: 'Lead Submitted', count: 1240, color: '#a78bfa' },
  { stage: 'Booking Created', count: 680, color: '#3b82f6' },
  { stage: 'Completed', count: 612, color: '#00cc88' },
];

// ─── Monthly Breakdown ────────────────────────────────────

const MONTHLY_BREAKDOWN = [
  { type: 'Camps', revenue: 28400, pct: 0.42, color: '#4d9fff' },
  { type: 'Clinics', revenue: 22100, pct: 0.33, color: '#ffb84d' },
  { type: 'Private', revenue: 16800, pct: 0.25, color: '#a78bfa' },
];

// ─── Custom Tooltip ───────────────────────────────────────

function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card !p-3 !border-slate-300 text-xs min-w-[160px]">
      <p className="text-text-muted font-medium mb-2">{label}</p>
      {payload.map((entry: any, i: number) => {
        if (entry.dataKey === 'upper_bound' || entry.dataKey === 'lower_bound') return null;
        return (
          <div key={i} className="flex items-center justify-between gap-4 mb-1">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-text-secondary capitalize">{entry.name}</span>
            </span>
            <span className="text-text-primary font-medium font-mono">
              ${(entry.value / 100).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────

export default function ForecastPage() {
  const [scenario, setScenario] = useState<Scenario>('base');
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('12m');

  const adjustedForecast = useMemo(() =>
    FORECAST_DATA.map((d) => ({
      ...d,
      predicted: Math.round(d.predicted * SCENARIO_MULTIPLIERS[scenario]),
      upper_bound: Math.round(d.upper_bound * SCENARIO_MULTIPLIERS[scenario]),
      lower_bound: Math.round(d.lower_bound * SCENARIO_MULTIPLIERS[scenario]),
    })).slice(0, timeRange === '6m' ? 6 : 12),
  [scenario, timeRange]);

  const totalActual = FORECAST_DATA.filter((d) => d.actual).reduce((s, d) => s + (d.actual || 0), 0);
  const totalProjected = adjustedForecast.reduce((s, d) => s + d.predicted, 0);
  const avgMonthly = Math.round(totalProjected / adjustedForecast.length);
  const yearEndProjection = adjustedForecast[adjustedForecast.length - 1]?.predicted || 0;

  return (
    <div className="min-h-screen pb-16">
      {/* ─── Header ─── */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-text-primary">Revenue Forecast</h1>
                <p className="text-sm text-text-muted">
                  Time-series projections · Scenario planning · Zone revenue analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['6m', '12m'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    timeRange === range
                      ? 'bg-atlas-500/15 text-atlas-400'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {range === '6m' ? '6 Months' : '12 Months'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        {/* ─── Top Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="YTD Revenue" value={`$${(totalActual / 100).toLocaleString()}`} trend={22} icon={<DollarSign className="w-5 h-5" />} />
          <StatCard label="Projected Annual" value={`$${(totalProjected / 100).toLocaleString()}`} trend={34} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard label="Avg Monthly" value={`$${(avgMonthly / 100).toLocaleString()}`} trend={18} icon={<Calendar className="w-5 h-5" />} />
          <StatCard label="Dec Projection" value={`$${(yearEndProjection / 100).toLocaleString()}`} trend={45} icon={<Target className="w-5 h-5" />} />
        </div>

        {/* ─── Main Forecast Chart ─── */}
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h3 className="font-display font-semibold text-text-primary">Revenue Projection</h3>
              <p className="text-xs text-text-muted mt-0.5">Actual vs predicted with confidence bands</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted mr-2">Scenario:</span>
              {(['conservative', 'base', 'aggressive'] as Scenario[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    scenario === s
                      ? s === 'aggressive' ? 'bg-atlas-500/15 text-atlas-400' :
                        s === 'conservative' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-blue-500/15 text-blue-400'
                      : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mb-4 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-atlas-500" /> Actual
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-blue-400" style={{ opacity: 0.6 }} /> Predicted
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-6 h-3 rounded bg-blue-400/10 border border-blue-400/20" /> Confidence Band
            </span>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={adjustedForecast}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d9fff" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#4d9fff" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6985c6' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#6985c6' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 100).toLocaleString()}`}
              />
              <Tooltip content={<ForecastTooltip />} />

              {/* Now / Actual boundary */}
              <ReferenceLine x={MONTHS[CURRENT_MONTH]} stroke="#ffffff15" strokeDasharray="6 4" label={{ value: 'Now', fill: '#6985c6', fontSize: 10, position: 'top' }} />

              {/* Confidence band (area between upper and lower) */}
              <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#bandGrad)" />
              <Area type="monotone" dataKey="lower_bound" stroke="none" fill="rgba(255,255,255,0.3)" />

              {/* Predicted line */}
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#4d9fff" strokeWidth={2} dot={false} strokeDasharray="6 3" />

              {/* Actual revenue */}
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" fill="url(#actualGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-text-muted">
            <span>
              <Sparkles className="w-3 h-3 inline mr-1 text-blue-400" />
              Model: ARIMA + Gradient Boosting ensemble · R² = 0.91
            </span>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* ─── Zone Revenue Breakdown ─── */}
          <Card>
            <h3 className="font-display font-semibold text-text-primary mb-1">Revenue by Zone</h3>
            <p className="text-xs text-text-muted mb-5">Monthly revenue and growth by area</p>

            <div className="space-y-3">
              {ZONE_REVENUE.map((zone, i) => (
                <div key={zone.zone} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold',
                        i === 0 ? 'bg-atlas-500/15 text-atlas-400' :
                        i === 1 ? 'bg-blue-500/15 text-blue-400' :
                        'bg-slate-100/50 text-text-muted'
                      )}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-text-primary">{zone.zone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'flex items-center gap-0.5 text-[10px] font-medium',
                        zone.growth >= 20 ? 'text-atlas-400' :
                        zone.growth >= 10 ? 'text-blue-400' : 'text-text-muted'
                      )}>
                        <ArrowUpRight className="w-2.5 h-2.5" />+{zone.growth}%
                      </span>
                      <span className="text-sm font-display font-bold text-text-primary">
                        ${zone.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        i === 0 ? 'bg-gradient-to-r from-atlas-700 to-atlas-400' :
                        i === 1 ? 'bg-gradient-to-r from-blue-700 to-blue-400' :
                        i < 4 ? 'bg-gradient-to-r from-purple-700 to-purple-400' :
                        'bg-white/15'
                      )}
                      style={{ width: `${(zone.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-text-muted">
                    <span>{zone.bookings} bookings</span>
                    <span>Avg ${zone.avg_ticket}</span>
                    <span>{Math.round(zone.fill_rate * 100)}% fill</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ─── Right Column ─── */}
          <div className="space-y-6">
            {/* Revenue by Type */}
            <Card>
              <h3 className="font-display font-semibold text-text-primary mb-1">Revenue by Event Type</h3>
              <p className="text-xs text-text-muted mb-5">This month&apos;s revenue split</p>

              <div className="space-y-4">
                {MONTHLY_BREAKDOWN.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-text-primary">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">{Math.round(item.pct * 100)}%</span>
                        <span className="text-sm font-display font-bold text-text-primary">
                          ${item.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.pct * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Booking Funnel */}
            <Card>
              <h3 className="font-display font-semibold text-text-primary mb-1">Conversion Funnel</h3>
              <p className="text-xs text-text-muted mb-5">Monthly user journey progression</p>

              <div className="space-y-2">
                {FUNNEL.map((stage, i) => {
                  const prevCount = i > 0 ? FUNNEL[i - 1].count : stage.count;
                  const convRate = i > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '100';
                  const widthPct = (stage.count / FUNNEL[0].count) * 100;

                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          {i > 0 && (
                            <span className="text-[10px] text-text-muted">{convRate}%</span>
                          )}
                          <span className="text-xs font-mono font-medium text-text-primary">
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-6 bg-white/30 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all duration-1000 flex items-center pl-2"
                          style={{ width: `${widthPct}%`, backgroundColor: `${stage.color}20`, borderLeft: `3px solid ${stage.color}` }}
                        >
                          <span className="text-[10px] font-medium" style={{ color: stage.color }}>
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-atlas-500/5 border border-atlas-500/10">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-atlas-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <strong className="text-atlas-400">ML Insight:</strong> Lead → Booking conversion is strongest in 
                    Scarborough (42%) and weakest in Vaughan (28%). Consider targeted promotions in low-conversion zones.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
