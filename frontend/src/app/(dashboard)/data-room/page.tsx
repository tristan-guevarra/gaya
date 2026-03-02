/* ═══════════════════════════════════════════════════════════════════
   Gaya — Investor Data Room
   Series B-ready metrics dashboard: ARR waterfall, unit economics,
   market sizing TAM/SAM/SOM, cohort LTV, and fundraising narrative.
   Designed to impress VCs during due diligence.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, Users, Target, BarChart3, Globe,
  ArrowUpRight, ArrowDownRight, Lock, Shield, Download,
  ChevronRight, Sparkles, Layers, Zap, Clock, Building2,
  PieChart, Activity, Award, MapPin, Star, Eye, EyeOff,
  CalendarDays, Briefcase, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

type Tab = 'overview' | 'unit-economics' | 'market' | 'growth';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  accent: string;
  footnote?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────

const HEADLINE_METRICS: MetricCard[] = [
  { label: 'Annual Recurring Revenue', value: '$2.21M', change: '+142%', up: true, icon: DollarSign, accent: 'text-green-400', footnote: 'YoY' },
  { label: 'Monthly Recurring Revenue', value: '$184.2K', change: '+18.3%', up: true, icon: TrendingUp, accent: 'text-atlas-400', footnote: 'MoM' },
  { label: 'Active Organizations', value: '47', change: '+12', up: true, icon: Building2, accent: 'text-blue-400', footnote: 'QoQ' },
  { label: 'Net Revenue Retention', value: '138%', change: '+8pp', up: true, icon: Target, accent: 'text-purple-400', footnote: 'vs 130% LQ' },
  { label: 'Gross Margin', value: '82.4%', change: '+3.1pp', up: true, icon: PieChart, accent: 'text-cyan-400', footnote: 'Improving' },
  { label: 'CAC Payback', value: '4.2 mo', change: '-1.8 mo', up: true, icon: Clock, accent: 'text-amber-400', footnote: 'vs 6 mo target' },
];

const ARR_WATERFALL = [
  { label: 'Starting ARR', value: 912, type: 'start' as const },
  { label: 'New Business', value: 840, type: 'add' as const },
  { label: 'Expansion', value: 624, type: 'add' as const },
  { label: 'Churn', value: -168, type: 'sub' as const },
  { label: 'Ending ARR', value: 2208, type: 'end' as const },
];

const MONTHLY_ARR = [
  { month: 'Mar', arr: 68 }, { month: 'Apr', arr: 74 }, { month: 'May', arr: 82 },
  { month: 'Jun', arr: 91 }, { month: 'Jul', arr: 105 }, { month: 'Aug', arr: 118 },
  { month: 'Sep', arr: 128 }, { month: 'Oct', arr: 142 }, { month: 'Nov', arr: 155 },
  { month: 'Dec', arr: 164 }, { month: 'Jan', arr: 174 }, { month: 'Feb', arr: 184 },
];

const UNIT_ECONOMICS = [
  { label: 'LTV', value: '$18,400', desc: 'Average lifetime value per org' },
  { label: 'CAC', value: '$3,640', desc: 'Blended cost of acquisition' },
  { label: 'LTV:CAC', value: '5.1x', desc: 'Target: >3x for healthy SaaS' },
  { label: 'Avg Contract Value', value: '$4,200/yr', desc: 'Weighted across tiers' },
  { label: 'Logo Churn', value: '2.1%/mo', desc: 'Monthly logo churn rate' },
  { label: 'Revenue Churn', value: '-3.2%/mo', desc: 'Net negative = expansion > churn' },
  { label: 'Avg Seats/Org', value: '8.4', desc: 'Growing via coach additions' },
  { label: 'ARPU', value: '$350/mo', desc: 'Per organization monthly' },
];

const TAM_SAM_SOM = [
  { label: 'TAM', value: '$4.2B', desc: 'Youth sports training market (NA)', width: 100 },
  { label: 'SAM', value: '$890M', desc: 'Soccer + managed field time', width: 60 },
  { label: 'SOM', value: '$124M', desc: 'GTA + top 20 metros (Year 5)', width: 28 },
];

const COHORT_DATA = [
  { cohort: "Q1 '25", m0: 100, m1: 94, m2: 91, m3: 88, m4: 86 },
  { cohort: "Q2 '25", m0: 100, m1: 95, m2: 92, m3: 89 },
  { cohort: "Q3 '25", m0: 100, m1: 96, m2: 93 },
  { cohort: "Q4 '25", m0: 100, m1: 97 },
  { cohort: "Q1 '26", m0: 100 },
];

const GROWTH_LEVERS = [
  { icon: MapPin, title: 'Geographic Expansion', desc: '20 new metros by Q4 2026. Each metro = $2.4M ARR at maturity.', impact: 'High', confidence: 87 },
  { icon: Layers, title: 'Multi-Sport Launch', desc: 'Basketball + baseball = 3.2x addressable market. Shared infra.', impact: 'High', confidence: 78 },
  { icon: Users, title: 'Coach Marketplace', desc: 'Self-serve coach onboarding. Reduce CAC by 60% via network effects.', impact: 'Medium', confidence: 82 },
  { icon: Zap, title: 'Enterprise Academy Deals', desc: '$50K+ ACV deals with 200+ seat academies. 3 in pipeline now.', impact: 'High', confidence: 65 },
  { icon: Sparkles, title: 'AI Expansion Intelligence', desc: 'Upsell intelligence tier at 2.5x ARPU. 40% attach rate projected.', impact: 'Medium', confidence: 74 },
];

// ─── Page Component ─────────────────────────────────────────────

export default function DataRoomPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isRedacted, setIsRedacted] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'unit-economics', label: 'Unit Economics', icon: Target },
    { id: 'market', label: 'Market & TAM', icon: Globe },
    { id: 'growth', label: 'Growth Levers', icon: Rocket },
  ];

  const maxArr = Math.max(...MONTHLY_ARR.map(m => m.arr));

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-atlas-500 to-emerald-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <h1 className="font-display font-bold text-xl text-text-primary">Investor Data Room</h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-text-muted">Series B fundraising metrics • Last updated Feb 28, 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsRedacted(!isRedacted)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary hover:bg-slate-100 transition-all">
                {isRedacted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isRedacted ? 'Show' : 'Redact'}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary hover:bg-slate-100 transition-all">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-atlas-500 text-white font-semibold hover:bg-atlas-400 transition-all">
                <Lock className="w-3.5 h-3.5" /> Share Room
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === tab.id ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50')}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Headline Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {HEADLINE_METRICS.map(m => (
                <div key={m.label} className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-white/[0.1] transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', m.accent.replace('text-', 'bg-').replace('400', '500/10'))}>
                      <m.icon className={cn('w-4.5 h-4.5', m.accent)} />
                    </div>
                    <span className={cn('flex items-center gap-0.5 text-xs font-semibold', m.up ? 'text-green-400' : 'text-red-400')}>
                      {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {m.change}
                    </span>
                  </div>
                  <p className={cn('text-2xl font-display font-extrabold text-text-primary', isRedacted && 'blur-sm select-none')}>{m.value}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-text-muted">{m.label}</p>
                    {m.footnote && <span className="text-[9px] text-text-muted/60">{m.footnote}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* ARR Growth Chart */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">MRR Growth</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">Monthly recurring revenue trajectory</p>
                </div>
                <div className="text-right">
                  <p className={cn('text-lg font-display font-bold text-text-primary', isRedacted && 'blur-sm')}>${MONTHLY_ARR[MONTHLY_ARR.length - 1].arr}K</p>
                  <p className="text-[10px] text-green-400 flex items-center gap-0.5 justify-end">
                    <ArrowUpRight className="w-3 h-3" /> +170% YoY
                  </p>
                </div>
              </div>
              <div className="flex items-end gap-2 h-40">
                {MONTHLY_ARR.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-gradient-to-t from-atlas-500/50 to-atlas-500/20 hover:from-atlas-500/70 hover:to-atlas-500/40 transition-colors cursor-pointer relative group"
                      style={{ height: `${(d.arr / maxArr) * 100}%` }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-100 text-[10px] text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-200 shadow-xl">
                        ${d.arr}K MRR
                      </div>
                    </div>
                    <span className="text-[9px] text-text-muted">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ARR Waterfall */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">ARR Bridge (FY 2025 → 2026)</h3>
              <div className="flex items-end gap-3 h-48">
                {ARR_WATERFALL.map((item, i) => {
                  const maxVal = 2400;
                  const isNeg = item.value < 0;
                  const displayVal = Math.abs(item.value);
                  const height = (displayVal / maxVal) * 100;

                  // Calculate bottom offset for waterfall effect
                  let bottom = 0;
                  if (item.type === 'add') {
                    bottom = (ARR_WATERFALL[0].value / maxVal) * 100;
                    if (i === 2) bottom += (ARR_WATERFALL[1].value / maxVal) * 100;
                  } else if (item.type === 'sub') {
                    bottom = ((ARR_WATERFALL[0].value + ARR_WATERFALL[1].value + ARR_WATERFALL[2].value + item.value) / maxVal) * 100;
                  }

                  return (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-1 relative h-full">
                      <div className="absolute bottom-6 w-full flex flex-col items-center"
                        style={{ bottom: `${bottom + 24}px` }}>
                        <span className={cn('text-xs font-bold mb-1', isRedacted && 'blur-sm',
                          item.type === 'sub' ? 'text-red-400' :
                          item.type === 'start' ? 'text-text-muted' : 'text-green-400'
                        )}>
                          {isNeg ? '-' : item.type === 'add' ? '+' : ''}${displayVal}K
                        </span>
                        <div className={cn('w-full rounded-lg transition-all', 
                          item.type === 'start' || item.type === 'end' ? 'bg-atlas-500/30 border border-atlas-500/20' :
                          item.type === 'add' ? 'bg-green-500/25 border border-green-500/20' :
                          'bg-red-500/25 border border-red-500/20'
                        )} style={{ height: `${height}%`, minHeight: '20px' }} />
                      </div>
                      <span className="absolute bottom-0 text-[9px] text-text-muted text-center leading-tight">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ UNIT ECONOMICS TAB ═══ */}
        {activeTab === 'unit-economics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Unit Econ Grid */}
            <div className="grid grid-cols-4 gap-3">
              {UNIT_ECONOMICS.map(m => (
                <div key={m.label} className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-white/[0.1] transition-all">
                  <p className={cn('text-xl font-display font-bold text-text-primary', isRedacted && 'blur-sm')}>{m.value}</p>
                  <p className="text-xs font-medium text-atlas-400 mt-1">{m.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* LTV:CAC Visual */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">LTV:CAC Ratio Progression</h3>
              <div className="space-y-3">
                {[
                  { quarter: 'Q1 2025', ratio: 2.8, color: 'bg-amber-500' },
                  { quarter: 'Q2 2025', ratio: 3.4, color: 'bg-yellow-500' },
                  { quarter: 'Q3 2025', ratio: 4.1, color: 'bg-green-500' },
                  { quarter: 'Q4 2025', ratio: 4.7, color: 'bg-green-500' },
                  { quarter: 'Q1 2026', ratio: 5.1, color: 'bg-atlas-500' },
                ].map(q => (
                  <div key={q.quarter} className="flex items-center gap-3">
                    <span className="text-[11px] text-text-muted w-16">{q.quarter}</span>
                    <div className="flex-1 h-6 rounded-lg bg-slate-50 overflow-hidden relative">
                      <div className={cn('h-full rounded-lg transition-all duration-700', q.color)}
                        style={{ width: `${(q.ratio / 6) * 100}%`, opacity: 0.4 }} />
                      <span className="absolute inset-y-0 flex items-center text-xs font-bold text-text-primary"
                        style={{ left: `${Math.min((q.ratio / 6) * 100, 90)}%`, paddingLeft: '8px' }}>
                        {q.ratio}x
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-text-muted w-16" />
                  <div className="flex-1 relative h-4">
                    <div className="absolute left-[50%] top-0 bottom-0 border-l border-dashed border-green-500/30" />
                    <span className="absolute left-[50%] -top-0.5 text-[9px] text-green-400 ml-1">3x healthy threshold</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cohort Retention Matrix */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue Retention by Cohort</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left text-text-muted py-2 pr-3 font-medium">Cohort</th>
                      {['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4'].map(h => (
                        <th key={h} className="text-center text-text-muted py-2 px-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COHORT_DATA.map(row => (
                      <tr key={row.cohort}>
                        <td className="py-1.5 pr-3 text-text-secondary font-medium">{row.cohort}</td>
                        {[row.m0, row.m1, row.m2, row.m3, row.m4].map((val, i) => (
                          <td key={i} className="py-1.5 px-2 text-center">
                            {val !== undefined ? (
                              <span className={cn('inline-flex items-center justify-center w-12 h-7 rounded-md text-[11px] font-medium',
                                val >= 95 ? 'bg-green-500/20 text-green-400' :
                                val >= 90 ? 'bg-atlas-500/20 text-atlas-400' :
                                val >= 85 ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400',
                                isRedacted && 'blur-sm'
                              )}>
                                {val}%
                              </span>
                            ) : <span className="text-text-muted/30">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-text-muted mt-3 flex items-center gap-1">
                <Award className="w-3 h-3 text-green-400" />
                Net revenue retention consistently above 95% at month 3 — best in class for SMB SaaS
              </p>
            </div>
          </div>
        )}

        {/* ═══ MARKET TAB ═══ */}
        {activeTab === 'market' && (
          <div className="space-y-6 animate-fade-in">
            {/* TAM / SAM / SOM */}
            <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-5">Total Addressable Market</h3>
              <div className="space-y-4">
                {TAM_SAM_SOM.map((tier, i) => (
                  <div key={tier.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-bold',
                          i === 0 ? 'text-text-muted' : i === 1 ? 'text-blue-400' : 'text-atlas-400'
                        )}>{tier.label}</span>
                        <span className={cn('text-lg font-display font-extrabold text-text-primary', isRedacted && 'blur-sm')}>{tier.value}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">{tier.desc}</span>
                    </div>
                    <div className="h-8 rounded-lg bg-slate-50 overflow-hidden">
                      <div className={cn('h-full rounded-lg transition-all duration-700',
                        i === 0 ? 'bg-slate-100' : i === 1 ? 'bg-blue-500/20' : 'bg-atlas-500/30'
                      )} style={{ width: `${tier.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Expansion Map */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Current Markets</h3>
                <div className="space-y-2">
                  {[
                    { city: 'Toronto / GTA', orgs: 18, mrr: 68, status: 'Mature' },
                    { city: 'Vancouver', orgs: 8, mrr: 32, status: 'Growing' },
                    { city: 'Calgary', orgs: 6, mrr: 24, status: 'Growing' },
                    { city: 'Ottawa', orgs: 4, mrr: 16, status: 'Early' },
                    { city: 'Montreal', orgs: 3, mrr: 12, status: 'Early' },
                  ].map(m => (
                    <div key={m.city} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-atlas-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary">{m.city}</p>
                        <p className="text-[10px] text-text-muted">{m.orgs} orgs</p>
                      </div>
                      <span className={cn('text-xs font-medium', isRedacted && 'blur-sm')}>${m.mrr}K</span>
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium',
                        m.status === 'Mature' ? 'bg-green-500/10 text-green-400' :
                        m.status === 'Growing' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'
                      )}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Expansion Pipeline</h3>
                <div className="space-y-2">
                  {[
                    { city: 'Austin, TX', est: '$480K', timeline: 'Q2 2026', score: 92 },
                    { city: 'Miami, FL', est: '$420K', timeline: 'Q2 2026', score: 88 },
                    { city: 'Chicago, IL', est: '$640K', timeline: 'Q3 2026', score: 85 },
                    { city: 'Seattle, WA', est: '$380K', timeline: 'Q3 2026', score: 81 },
                    { city: 'London, UK', est: '$720K', timeline: 'Q4 2026', score: 76 },
                  ].map(m => (
                    <div key={m.city} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-atlas-500/10 flex items-center justify-center text-[10px] font-bold text-atlas-400">
                        {m.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary">{m.city}</p>
                        <p className="text-[10px] text-text-muted">{m.timeline}</p>
                      </div>
                      <span className={cn('text-xs font-medium text-atlas-400', isRedacted && 'blur-sm')}>{m.est}/yr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Competitive Moats */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-atlas-500/5 via-slate-50/60 to-purple-500/5 backdrop-blur-xl border border-atlas-500/10">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-atlas-400" /> Competitive Moats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: 'Proprietary Geospatial Data', desc: '2M+ data points across 400+ zones. 18 months of demand signals no competitor has.' },
                  { title: 'Network Effects', desc: 'More coaches → more athletes → more data → better intelligence → more coaches. Flywheel accelerating.' },
                  { title: 'AI Intelligence Layer', desc: 'Expansion predictions at 87% accuracy. Each new market makes the model smarter.' },
                ].map(moat => (
                  <div key={moat.title} className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                    <p className="text-xs font-semibold text-atlas-400 mb-1">{moat.title}</p>
                    <p className="text-[11px] text-text-muted leading-relaxed">{moat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ GROWTH TAB ═══ */}
        {activeTab === 'growth' && (
          <div className="space-y-6 animate-fade-in">
            {/* Growth Levers */}
            <div className="space-y-3">
              {GROWTH_LEVERS.map(lever => (
                <div key={lever.title} className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-white/[0.1] transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-atlas-500/10 flex items-center justify-center shrink-0">
                      <lever.icon className="w-5 h-5 text-atlas-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text-primary">{lever.title}</h3>
                        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium',
                          lever.impact === 'High' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                        )}>{lever.impact} Impact</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{lever.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/40 border border-white/60 flex flex-col items-center justify-center">
                        <span className="text-sm font-display font-bold text-text-primary">{lever.confidence}%</span>
                        <span className="text-[8px] text-text-muted">conf.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Funding Ask */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-atlas-500/10 via-slate-50/60 to-purple-500/10 backdrop-blur-xl border border-atlas-500/15">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-5 h-5 text-atlas-400" />
                <h3 className="text-sm font-semibold text-text-primary">Series B: $15M at $120M Pre-Money</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Engineering', pct: '40%', amount: '$6M', desc: 'AI/ML team, mobile, infrastructure' },
                  { label: 'GTM', pct: '30%', amount: '$4.5M', desc: 'Sales, marketing, partnerships' },
                  { label: 'Expansion', pct: '20%', amount: '$3M', desc: '10 new metros, UK/EU launch' },
                  { label: 'Operations', pct: '10%', amount: '$1.5M', desc: 'Legal, compliance, G&A' },
                ].map(alloc => (
                  <div key={alloc.label} className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-atlas-400">{alloc.label}</span>
                      <span className="text-[10px] text-text-muted">{alloc.pct}</span>
                    </div>
                    <p className={cn('text-lg font-display font-bold text-text-primary', isRedacted && 'blur-sm')}>{alloc.amount}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{alloc.desc}</p>
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
