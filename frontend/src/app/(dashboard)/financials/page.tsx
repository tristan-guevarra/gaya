// financial modeling - unit economics, ltv:cac, burn rate, revenue waterfall, and funding runway

'use client';

import { useState } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
  Calculator, Target, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Clock, Users, Zap, Layers, ChevronRight, Sparkles, Wallet,
  CreditCard, Receipt, CircleDollarSign, BadgeDollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';


type Tab = 'unit-economics' | 'projections' | 'runway';


const unitEconomics = {
  ltv: 2840,
  cac: 142,
  ltvCacRatio: 20.0,
  paybackMonths: 1.8,
  grossMargin: 78,
  netMargin: 42,
  arpu: 89,
  churnRate: 3.2,
  avgLifespan: 31.9,
};

const monthlyMetrics = [
  { month: 'Sep', revenue: 28400, costs: 18600, profit: 9800, customers: 310 },
  { month: 'Oct', revenue: 31200, costs: 19200, profit: 12000, customers: 338 },
  { month: 'Nov', revenue: 34800, costs: 20100, profit: 14700, customers: 372 },
  { month: 'Dec', revenue: 29600, costs: 19800, profit: 9800, customers: 352 },
  { month: 'Jan', revenue: 36200, costs: 20900, profit: 15300, customers: 394 },
  { month: 'Feb', revenue: 38900, costs: 21400, profit: 17500, customers: 421 },
  { month: 'Mar', revenue: 41200, costs: 22100, profit: 19100, customers: 448 },
];

const costBreakdown = [
  { category: 'Coach Payouts', amount: 12800, pct: 58, color: 'bg-blue-500' },
  { category: 'Venue Fees', amount: 3200, pct: 14, color: 'bg-purple-500' },
  { category: 'Marketing', amount: 2800, pct: 13, color: 'bg-amber-500' },
  { category: 'Platform & Ops', amount: 1900, pct: 9, color: 'bg-emerald-500' },
  { category: 'Insurance', amount: 800, pct: 4, color: 'bg-red-500' },
  { category: 'Other', amount: 600, pct: 3, color: 'bg-gray-500' },
];

const runway = {
  cashBalance: 284000,
  monthlyBurn: 22100,
  monthlyRevenue: 41200,
  netBurn: -19100, // positive (revenue > costs)
  runwayMonths: 'Infinite (profitable)',
  breakEvenDate: 'Achieved Jan 2025',
  arr: 494400,
};

const projections = [
  { quarter: 'Q2 2025', revenue: 135000, customers: 520, arr: 540000 },
  { quarter: 'Q3 2025', revenue: 182000, customers: 680, arr: 728000 },
  { quarter: 'Q4 2025', revenue: 245000, customers: 890, arr: 980000 },
  { quarter: 'Q1 2026', revenue: 312000, customers: 1140, arr: 1248000 },
];


export default function FinancialModelingPage() {
  const [tab, setTab] = useState<Tab>('unit-economics');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'unit-economics', label: 'Unit Economics', icon: Calculator },
    { id: 'projections', label: 'Projections', icon: TrendingUp },
    { id: 'runway', label: 'Runway', icon: Wallet },
  ];

  const maxRevenue = Math.max(...monthlyMetrics.map(m => m.revenue));

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-green-400" /> Financial Modeling
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Unit economics, projections, and runway analysis</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">ARR: ${(runway.arr / 1000).toFixed(0)}K</span>
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  tab === t.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-text-muted hover:text-text-secondary')}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* unit economics */}
        {tab === 'unit-economics' && (
          <div className="space-y-6 animate-fade-in">
            {/* key metrics */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'LTV', value: `$${unitEconomics.ltv.toLocaleString()}`, sub: 'Lifetime Value', icon: BadgeDollarSign, color: 'text-green-400' },
                { label: 'CAC', value: `$${unitEconomics.cac}`, sub: 'Customer Acquisition Cost', icon: Target, color: 'text-blue-400' },
                { label: 'LTV:CAC Ratio', value: `${unitEconomics.ltvCacRatio}x`, sub: '> 3x is healthy', icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Payback Period', value: `${unitEconomics.paybackMonths} mo`, sub: '< 12 mo is great', icon: Clock, color: 'text-amber-400' },
              ].map(m => (
                <div key={m.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <m.icon className={cn('w-5 h-5 mb-2', m.color)} />
                  <p className="text-2xl font-display font-bold text-text-primary">{m.value}</p>
                  <p className="text-xs text-text-muted">{m.label}</p>
                  <p className="text-[10px] text-text-muted/50 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* ltv:cac visual */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">LTV vs CAC Visualization</h3>
              <div className="flex items-end gap-8 justify-center h-48">
                <div className="text-center">
                  <div className="w-24 rounded-t-xl bg-gradient-to-t from-green-500/60 to-green-400/30 mb-2"
                    style={{ height: '180px' }} />
                  <p className="text-sm font-display font-bold text-green-400">${unitEconomics.ltv.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">LTV</p>
                </div>
                <div className="text-center">
                  <div className="w-24 rounded-t-xl bg-gradient-to-t from-red-500/60 to-red-400/30 mb-2"
                    style={{ height: `${(unitEconomics.cac / unitEconomics.ltv) * 180}px` }} />
                  <p className="text-sm font-display font-bold text-red-400">${unitEconomics.cac}</p>
                  <p className="text-[10px] text-text-muted">CAC</p>
                </div>
              </div>
              <p className="text-center text-xs text-text-muted mt-3">
                Every $1 spent on acquisition generates <span className="text-green-400 font-bold">${unitEconomics.ltvCacRatio}</span> in lifetime value
              </p>
            </div>

            {/* margins + arpu */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-3xl font-display font-bold text-green-400">{unitEconomics.grossMargin}%</p>
                <p className="text-xs text-text-muted">Gross Margin</p>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${unitEconomics.grossMargin}%` }} />
                </div>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-3xl font-display font-bold text-atlas-400">${unitEconomics.arpu}</p>
                <p className="text-xs text-text-muted">ARPU / month</p>
                <p className="text-[10px] text-green-400 mt-1">↑ 12% vs last quarter</p>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-3xl font-display font-bold text-amber-400">{unitEconomics.churnRate}%</p>
                <p className="text-xs text-text-muted">Monthly Churn</p>
                <p className="text-[10px] text-green-400 mt-1">↓ 0.4% vs last quarter</p>
              </div>
            </div>

            {/* cost breakdown */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Cost Breakdown</h3>
              <div className="flex h-6 rounded-full overflow-hidden mb-4">
                {costBreakdown.map(c => (
                  <div key={c.category} className={cn('h-full', c.color)} style={{ width: `${c.pct}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {costBreakdown.map(c => (
                  <div key={c.category} className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded', c.color)} />
                    <div>
                      <p className="text-[10px] text-text-primary">{c.category}</p>
                      <p className="text-[10px] text-text-muted">${c.amount.toLocaleString()} ({c.pct}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* projections */}
        {tab === 'projections' && (
          <div className="space-y-6 animate-fade-in">
            {/* revenue chart */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Revenue vs Costs</h3>
              <div className="flex items-end gap-2 h-52">
                {monthlyMetrics.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted font-mono">${(m.revenue / 1000).toFixed(1)}K</span>
                    <div className="w-full flex flex-col gap-0.5">
                      <div className="w-full rounded-t bg-gradient-to-t from-green-500/60 to-green-400/30"
                        style={{ height: `${(m.profit / maxRevenue) * 160}px` }} />
                      <div className="w-full bg-red-500/20 rounded-b"
                        style={{ height: `${(m.costs / maxRevenue) * 160}px` }} />
                    </div>
                    <span className="text-[10px] text-text-muted">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 justify-center mt-3">
                <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <div className="w-3 h-3 rounded bg-green-500/40" /> Profit
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <div className="w-3 h-3 rounded bg-red-500/20" /> Costs
                </span>
              </div>
            </div>

            {/* quarterly projections */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Forward Projections</h3>
              <div className="grid grid-cols-4 gap-3">
                {projections.map(p => (
                  <div key={p.quarter} className="p-4 rounded-xl bg-white/40 border border-white/60 text-center">
                    <p className="text-xs font-semibold text-atlas-400 mb-2">{p.quarter}</p>
                    <p className="text-lg font-display font-bold text-text-primary">${(p.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-text-muted">Revenue</p>
                    <div className="border-t border-slate-200 mt-2 pt-2 space-y-1">
                      <p className="text-[10px] text-text-muted">{p.customers.toLocaleString()} customers</p>
                      <p className="text-[10px] text-green-400 font-medium">ARR: ${(p.arr / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* runway */}
        {tab === 'runway' && (
          <div className="space-y-6 animate-fade-in">
            {/* runway summary */}
            <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/15 text-center">
              <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h2 className="text-2xl font-display font-bold text-green-400">Cash Flow Positive 🎉</h2>
              <p className="text-xs text-text-muted mt-1">Revenue exceeds costs — self-sustaining growth</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Cash Balance', value: `$${(runway.cashBalance / 1000).toFixed(0)}K`, icon: Wallet, color: 'text-green-400' },
                { label: 'Monthly Revenue', value: `$${(runway.monthlyRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-atlas-400' },
                { label: 'Monthly Costs', value: `$${(runway.monthlyBurn / 1000).toFixed(1)}K`, icon: CreditCard, color: 'text-amber-400' },
                { label: 'Net Positive', value: `+$${(Math.abs(runway.netBurn) / 1000).toFixed(1)}K/mo`, icon: ArrowUpRight, color: 'text-green-400' },
              ].map(m => (
                <div key={m.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <m.icon className={cn('w-5 h-5 mb-2', m.color)} />
                  <p className="text-xl font-display font-bold text-text-primary">{m.value}</p>
                  <p className="text-[10px] text-text-muted">{m.label}</p>
                </div>
              ))}
            </div>

            {/* cash flow projection */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">12-Month Cash Projection</h3>
              <div className="flex items-end gap-2 h-40">
                {Array.from({ length: 12 }).map((_, i) => {
                  const projected = runway.cashBalance + (Math.abs(runway.netBurn) * (i + 1));
                  const maxProj = runway.cashBalance + (Math.abs(runway.netBurn) * 12);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm bg-gradient-to-t from-green-500/40 to-green-400/20"
                        style={{ height: `${(projected / maxProj) * 130}px` }} />
                      <span className="text-[8px] text-text-muted">M{i + 1}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[10px] text-text-muted mt-2">
                Projected balance in 12 months: <span className="text-green-400 font-bold">
                  ${((runway.cashBalance + (Math.abs(runway.netBurn) * 12)) / 1000).toFixed(0)}K
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
