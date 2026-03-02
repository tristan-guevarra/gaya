/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Competitive Intelligence
   Monitor competitor pricing, reviews, coverage, market share.
   Feature comparison matrix, pricing benchmarks, and strategic
   positioning insights with AI analysis.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Crosshair, TrendingUp, TrendingDown, Star, Users, MapPin,
  DollarSign, Shield, Eye, Target, Zap, ChevronRight, Globe,
  ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, Minus,
  AlertTriangle, Sparkles, BarChart3, Activity, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'features' | 'pricing' | 'moats';

interface Competitor {
  id: string;
  name: string;
  logo: string;
  color: string;
  rating: number;
  reviews: number;
  coaches: number;
  cities: number;
  events: number;
  avgPrice: number;
  marketShare: number;
  trend: 'up' | 'down' | 'flat';
  founded: string;
  funding: string;
  strengths: string[];
  weaknesses: string[];
}

// ─── Mock Data ──────────────────────────────────────────────────────

const competitors: Competitor[] = [
  {
    id: 'tenpo', name: 'Gaya', logo: 'TA', color: 'from-atlas-500 to-cyan-400',
    rating: 4.8, reviews: 342, coaches: 240, cities: 5, events: 1840,
    avgPrice: 149, marketShare: 32, trend: 'up', founded: '2024', funding: 'Seed',
    strengths: ['AI-powered insights', 'Geospatial intelligence', 'Multi-tenant SaaS', 'Coach gamification'],
    weaknesses: ['Newer to market', 'Soccer-only (for now)', 'Smaller brand'],
  },
  {
    id: 'upper90', name: 'Upper90 Training', logo: 'U9', color: 'from-orange-400 to-red-400',
    rating: 4.2, reviews: 1240, coaches: 380, cities: 12, events: 3200,
    avgPrice: 189, marketShare: 28, trend: 'flat', founded: '2019', funding: 'Series A',
    strengths: ['Large coach network', 'Brand recognition', 'Multi-sport'],
    weaknesses: ['No geo intelligence', 'Legacy tech stack', 'High churn'],
  },
  {
    id: 'fieldtime', name: 'FieldTime Pro', logo: 'FT', color: 'from-blue-400 to-indigo-400',
    rating: 4.5, reviews: 680, coaches: 160, cities: 8, events: 1420,
    avgPrice: 129, marketShare: 18, trend: 'up', founded: '2021', funding: 'Series A',
    strengths: ['Affordable pricing', 'Good UX', 'Fast onboarding'],
    weaknesses: ['Limited analytics', 'No AI features', 'Small team'],
  },
  {
    id: 'kickstart', name: 'KickStart Academy', logo: 'KA', color: 'from-green-400 to-emerald-400',
    rating: 3.9, reviews: 2100, coaches: 520, cities: 15, events: 4800,
    avgPrice: 199, marketShare: 22, trend: 'down', founded: '2017', funding: 'Series B',
    strengths: ['Largest market presence', 'Enterprise deals', 'Strong partnerships'],
    weaknesses: ['Dated UI', 'Poor mobile experience', 'Slow innovation', 'High pricing'],
  },
];

const featureMatrix = [
  { feature: 'Interactive Discovery Map', tenpo: true, upper90: false, fieldtime: true, kickstart: false },
  { feature: 'AI-Powered Recommendations', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Geospatial Intelligence (H3)', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Supply vs Demand Heatmaps', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'What-If Simulator', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Multi-Tenant SaaS', tenpo: true, upper90: true, fieldtime: true, kickstart: true },
  { feature: 'Coach Gamification (XP/Levels)', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Investor Data Room', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'A/B Testing Lab', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Real-Time Collaboration', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Mobile App', tenpo: true, upper90: true, fieldtime: true, kickstart: true },
  { feature: 'Stripe Payments', tenpo: true, upper90: true, fieldtime: true, kickstart: true },
  { feature: 'Parent Portal', tenpo: true, upper90: true, fieldtime: false, kickstart: true },
  { feature: 'Skill Tracking / Radar', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Content Studio (AI)', tenpo: true, upper90: false, fieldtime: false, kickstart: false },
  { feature: 'Automated Workflows', tenpo: true, upper90: false, fieldtime: false, kickstart: true },
  { feature: 'API / Developer Platform', tenpo: true, upper90: false, fieldtime: true, kickstart: false },
  { feature: 'Multi-Sport Support', tenpo: false, upper90: true, fieldtime: false, kickstart: true },
  { feature: 'Enterprise SSO', tenpo: false, upper90: true, fieldtime: false, kickstart: true },
  { feature: 'Custom Branding', tenpo: true, upper90: false, fieldtime: false, kickstart: true },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function CompetitiveIntelPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [highlightGaya, setHighlightGaya] = useState(true);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'features', label: 'Feature Matrix', icon: CheckCircle },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'moats', label: 'Moats & Strategy', icon: Shield },
  ];

  const tenpo = competitors.find(c => c.id === 'tenpo')!;

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-red-400" /> Competitive Intelligence
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Monitor the landscape, identify opportunities, defend your moat</p>
            </div>
            <span className="text-[10px] text-text-muted">Last updated: 2 hours ago</span>
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
            {/* Market Share */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">GTA Youth Soccer Training Market Share</h3>
              <div className="flex rounded-full h-8 overflow-hidden mb-4">
                {competitors.map(c => (
                  <div key={c.id} className={cn('flex items-center justify-center text-[10px] font-bold transition-all',
                    c.id === 'tenpo' ? 'bg-gradient-to-r from-atlas-500 to-cyan-400 text-white' :
                    c.id === 'upper90' ? 'bg-orange-500/60 text-white' :
                    c.id === 'fieldtime' ? 'bg-blue-500/50 text-white' :
                    'bg-green-500/40 text-white'
                  )} style={{ width: `${c.marketShare}%` }}>
                    {c.marketShare}%
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6">
                {competitors.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', c.color)} />
                    <span className="text-[10px] text-text-muted">{c.name} ({c.marketShare}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Cards */}
            <div className="grid grid-cols-2 gap-4">
              {competitors.map(c => (
                <div key={c.id} className={cn('p-5 rounded-xl border transition-all',
                  c.id === 'tenpo'
                    ? 'bg-atlas-500/5 border-atlas-500/20 ring-1 ring-atlas-500/10'
                    : 'bg-white/60 backdrop-blur-sm border-white/60')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white', c.color)}>
                        {c.logo}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                        <p className="text-[10px] text-text-muted">{c.founded} · {c.funding}</p>
                      </div>
                    </div>
                    {c.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-400" /> :
                     c.trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-red-400" /> :
                     <Minus className="w-4 h-4 text-text-muted" />}
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-white/40">
                      <p className="text-sm font-display font-bold text-text-primary">{c.rating}</p>
                      <p className="text-[8px] text-text-muted">Rating</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/40">
                      <p className="text-sm font-display font-bold text-text-primary">{c.coaches}</p>
                      <p className="text-[8px] text-text-muted">Coaches</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/40">
                      <p className="text-sm font-display font-bold text-text-primary">{c.cities}</p>
                      <p className="text-[8px] text-text-muted">Cities</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/40">
                      <p className="text-sm font-display font-bold text-text-primary">${c.avgPrice}</p>
                      <p className="text-[8px] text-text-muted">Avg Price</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] font-medium text-green-400 mb-1">Strengths</p>
                      {c.strengths.slice(0, 3).map(s => (
                        <p key={s} className="text-[10px] text-text-muted flex items-center gap-1 mb-0.5">
                          <CheckCircle className="w-2.5 h-2.5 text-green-400/50 shrink-0" /> {s}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-[9px] font-medium text-red-400 mb-1">Weaknesses</p>
                      {c.weaknesses.slice(0, 3).map(w => (
                        <p key={w} className="text-[10px] text-text-muted flex items-center gap-1 mb-0.5">
                          <XCircle className="w-2.5 h-2.5 text-red-400/50 shrink-0" /> {w}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Feature Matrix ═══ */}
        {tab === 'features' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Feature Comparison</h3>
              <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                <input type="checkbox" checked={highlightGaya} onChange={e => setHighlightGaya(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-100 border-slate-300 accent-atlas-500" />
                Highlight Gaya exclusives
              </label>
            </div>

            <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/40">
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase py-3 px-5">Feature</th>
                    {competitors.map(c => (
                      <th key={c.id} className={cn('text-center py-3 px-3', c.id === 'tenpo' && 'bg-atlas-500/5')}>
                        <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white mx-auto mb-1', c.color)}>
                          {c.logo}
                        </div>
                        <span className="text-[10px] text-text-secondary">{c.name.split(' ')[0]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureMatrix.map((row, i) => {
                    const vals = [row.tenpo, row.upper90, row.fieldtime, row.kickstart];
                    const isExclusive = row.tenpo && !row.upper90 && !row.fieldtime && !row.kickstart;
                    return (
                      <tr key={i} className={cn('border-b border-white/[0.03]',
                        highlightGaya && isExclusive && 'bg-atlas-500/[0.03]')}>
                        <td className="py-2.5 px-5">
                          <span className="text-xs text-text-secondary">{row.feature}</span>
                          {highlightGaya && isExclusive && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-atlas-500/10 text-atlas-400">EXCLUSIVE</span>
                          )}
                        </td>
                        {competitors.map(c => {
                          const has = vals[competitors.indexOf(c)];
                          return (
                            <td key={c.id} className={cn('py-2.5 px-3 text-center', c.id === 'tenpo' && 'bg-atlas-500/5')}>
                              {has ? (
                                <CheckCircle className={cn('w-4 h-4 mx-auto', c.id === 'tenpo' ? 'text-atlas-400' : 'text-green-400/60')} />
                              ) : (
                                <XCircle className="w-4 h-4 mx-auto text-white/[0.08]" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/40">
                    <td className="py-3 px-5 text-xs font-semibold text-text-primary">Total Features</td>
                    {competitors.map(c => {
                      const key = c.id === 'tenpo' ? 'tenpo' : c.id === 'upper90' ? 'upper90' : c.id === 'fieldtime' ? 'fieldtime' : 'kickstart';
                      const count = featureMatrix.filter(r => r[key as keyof typeof r]).length;
                      return (
                        <td key={c.id} className={cn('py-3 px-3 text-center', c.id === 'tenpo' && 'bg-atlas-500/5')}>
                          <span className={cn('text-sm font-display font-bold', c.id === 'tenpo' ? 'text-atlas-400' : 'text-text-primary')}>
                            {count}/{featureMatrix.length}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ═══ Pricing ═══ */}
        {tab === 'pricing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Pricing Benchmark (Avg Event Price)</h3>
              <div className="space-y-4">
                {competitors.sort((a, b) => a.avgPrice - b.avgPrice).map(c => {
                  const maxPrice = Math.max(...competitors.map(x => x.avgPrice));
                  return (
                    <div key={c.id} className="flex items-center gap-4">
                      <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white shrink-0', c.color)}>
                        {c.logo}
                      </div>
                      <span className="text-xs text-text-secondary w-32">{c.name}</span>
                      <div className="flex-1 h-6 rounded-lg bg-white/30 overflow-hidden">
                        <div className={cn('h-full rounded-lg flex items-center px-3',
                          c.id === 'tenpo' ? 'bg-atlas-500/20' : 'bg-white/40'
                        )} style={{ width: `${(c.avgPrice / maxPrice) * 100}%` }}>
                          <span className="text-xs font-display font-bold text-text-primary">${c.avgPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Strategy */}
            <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">AI Pricing Insight</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Gaya is positioned at a competitive $149 average — <strong className="text-text-primary">21% below Upper90</strong> and <strong className="text-text-primary">25% below KickStart</strong>.
                A/B testing suggests a $169 price point (13% increase) would maintain 95%+ fill rates while adding <strong className="text-green-400">$4.2K/mo additional MRR</strong>.
                The AI intelligence features justify premium positioning versus FieldTime&apos;s budget tier.
              </p>
            </div>
          </div>
        )}

        {/* ═══ Moats ═══ */}
        {tab === 'moats' && (
          <div className="space-y-6 animate-fade-in">
            {/* Moat Assessment */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  title: 'Proprietary Geo Intelligence',
                  score: 95, category: 'Data Moat',
                  desc: 'H3-based geospatial analytics with supply/demand scoring, zone intelligence, and expansion predictions. No competitor has equivalent capabilities.',
                  icon: MapPin, color: 'text-atlas-400',
                },
                {
                  title: 'Network Effects',
                  score: 72, category: 'Network Moat',
                  desc: 'More coaches → more events → more athletes → more data → better recommendations. Each new user increases platform value for all participants.',
                  icon: Users, color: 'text-purple-400',
                },
                {
                  title: 'AI/ML Intelligence Layer',
                  score: 88, category: 'Technical Moat',
                  desc: 'Demand forecasting, fill-rate prediction, what-if simulator, content generation, and health scoring. Competitors would need 12-18 months to replicate.',
                  icon: Sparkles, color: 'text-amber-400',
                },
              ].map(moat => (
                <div key={moat.title} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <div className="flex items-center justify-between mb-3">
                    <moat.icon className={cn('w-5 h-5', moat.color)} />
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-text-muted">{moat.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{moat.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-atlas-500 to-cyan-400" style={{ width: `${moat.score}%` }} />
                    </div>
                    <span className="text-xs font-display font-bold text-text-primary">{moat.score}/100</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">{moat.desc}</p>
                </div>
              ))}
            </div>

            {/* Win/Loss Analysis */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Win/Loss Analysis (Last 90 Days)</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Deals Won', value: '34', pct: '68%', color: 'text-green-400' },
                  { label: 'Deals Lost', value: '12', pct: '24%', color: 'text-red-400' },
                  { label: 'No Decision', value: '4', pct: '8%', color: 'text-amber-400' },
                  { label: 'Win Rate vs Last Q', value: '+8%', pct: 'improving', color: 'text-atlas-400' },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-xl bg-white/40 text-center">
                    <p className={cn('text-2xl font-display font-bold', s.color)}>{s.value}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-text-muted/50">{s.pct}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-text-primary">Top Loss Reasons:</p>
                {[
                  { reason: 'Multi-sport requirement', count: 4, action: 'On roadmap Q3' },
                  { reason: 'Enterprise SSO/compliance', count: 3, action: 'Planned Q2' },
                  { reason: 'Price sensitivity', count: 3, action: 'Run pricing experiment' },
                  { reason: 'Existing contract', count: 2, action: 'Follow up at renewal' },
                ].map(l => (
                  <div key={l.reason} className="flex items-center justify-between p-2.5 rounded-lg bg-white/40">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-400">{l.count}</span>
                      <span className="text-xs text-text-secondary">{l.reason}</span>
                    </div>
                    <span className="text-[10px] text-atlas-400">{l.action}</span>
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
