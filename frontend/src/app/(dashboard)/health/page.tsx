/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Customer Health Score
   Churn risk prediction, engagement scoring, NPS tracking,
   health matrix, and AI-powered retention recommendations.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Users, Activity, Target, Brain, Shield, Star, Clock,
  ArrowUpRight, ArrowDownRight, ChevronRight, Sparkles,
  ThumbsUp, ThumbsDown, Minus, Zap, DollarSign, BarChart3,
  Filter, Download, RefreshCw, Eye, MessageCircle, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type HealthStatus = 'thriving' | 'healthy' | 'at-risk' | 'critical';
type Tab = 'overview' | 'accounts' | 'nps' | 'playbooks';

interface Account {
  id: string;
  name: string;
  logo: string;
  health: number;
  status: HealthStatus;
  mrr: number;
  nps: number;
  lastActive: string;
  trend: 'up' | 'down' | 'flat';
  riskFactors: string[];
  dau: number;
  eventsCreated: number;
  fillRate: number;
  csm: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const accounts: Account[] = [
  { id: '1', name: 'Elite Soccer Academy', logo: 'ES', health: 94, status: 'thriving', mrr: 8400, nps: 72, lastActive: '2 hours ago', trend: 'up', riskFactors: [], dau: 89, eventsCreated: 24, fillRate: 96, csm: 'Sarah C.' },
  { id: '2', name: 'GTA Football Club', logo: 'GF', health: 87, status: 'healthy', mrr: 6200, nps: 58, lastActive: '1 day ago', trend: 'up', riskFactors: [], dau: 72, eventsCreated: 18, fillRate: 91, csm: 'Marcus T.' },
  { id: '3', name: 'North York United', logo: 'NY', health: 78, status: 'healthy', mrr: 4800, nps: 45, lastActive: '3 days ago', trend: 'flat', riskFactors: ['Declining event creation'], dau: 61, eventsCreated: 12, fillRate: 84, csm: 'Sarah C.' },
  { id: '4', name: 'Ajax Sports Academy', logo: 'AS', health: 62, status: 'at-risk', mrr: 3200, nps: 22, lastActive: '5 days ago', trend: 'down', riskFactors: ['Low DAU', 'No events in 2 weeks', 'Support tickets up 3x'], dau: 34, eventsCreated: 4, fillRate: 68, csm: 'David P.' },
  { id: '5', name: 'Brampton FC', logo: 'BF', health: 55, status: 'at-risk', mrr: 2800, nps: 15, lastActive: '8 days ago', trend: 'down', riskFactors: ['Billing dispute', 'Key user churned', 'Feature gap cited'], dau: 28, eventsCreated: 2, fillRate: 52, csm: 'Marcus T.' },
  { id: '6', name: 'Mississauga Youth', logo: 'MY', health: 38, status: 'critical', mrr: 1800, nps: -12, lastActive: '14 days ago', trend: 'down', riskFactors: ['No login in 14 days', 'Competitor evaluation', 'Contract renewal in 30d', 'NPS declined 40pts'], dau: 8, eventsCreated: 0, fillRate: 0, csm: 'David P.' },
  { id: '7', name: 'Etobicoke United', logo: 'EU', health: 91, status: 'thriving', mrr: 5600, nps: 68, lastActive: '4 hours ago', trend: 'up', riskFactors: [], dau: 85, eventsCreated: 22, fillRate: 94, csm: 'Sarah C.' },
  { id: '8', name: 'Scarborough FC', logo: 'SC', health: 82, status: 'healthy', mrr: 4200, nps: 52, lastActive: '1 day ago', trend: 'flat', riskFactors: [], dau: 68, eventsCreated: 15, fillRate: 88, csm: 'Marcus T.' },
];

const npsResponses = [
  { month: 'Sep', promoters: 42, passives: 18, detractors: 8, score: 50 },
  { month: 'Oct', promoters: 45, passives: 20, detractors: 7, score: 53 },
  { month: 'Nov', promoters: 48, passives: 19, detractors: 9, score: 51 },
  { month: 'Dec', promoters: 52, passives: 22, detractors: 6, score: 58 },
  { month: 'Jan', promoters: 56, passives: 21, detractors: 8, score: 56 },
  { month: 'Feb', promoters: 61, passives: 24, detractors: 5, score: 62 },
];

const retentionPlaybooks = [
  {
    id: 'p1', account: 'Mississauga Youth', status: 'critical' as HealthStatus,
    title: 'Executive Intervention',
    steps: ['Schedule executive call within 48h', 'Prepare ROI analysis showing $42K value delivered', 'Offer 90-day success plan with dedicated CSM', 'Provide competitor gap analysis', 'Propose custom pricing for renewal'],
    impact: 'High', urgency: 'Immediate', owner: 'David P.',
  },
  {
    id: 'p2', account: 'Brampton FC', status: 'at-risk' as HealthStatus,
    title: 'Re-engagement Campaign',
    steps: ['Send personalized check-in email from CSM', 'Share 3 relevant case studies', 'Offer free training webinar for their team', 'Address billing dispute with credit', 'Schedule product roadmap preview call'],
    impact: 'Medium', urgency: 'This week', owner: 'Marcus T.',
  },
  {
    id: 'p3', account: 'Ajax Sports Academy', status: 'at-risk' as HealthStatus,
    title: 'Feature Adoption Push',
    steps: ['Identify top 3 unused features', 'Create personalized onboarding flow', 'Assign power user champion', 'Set up weekly check-ins for 4 weeks', 'Track feature adoption metrics'],
    impact: 'Medium', urgency: 'Next 2 weeks', owner: 'David P.',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

function getHealthColor(status: HealthStatus) {
  switch (status) {
    case 'thriving': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'healthy': return 'text-atlas-400 bg-atlas-500/10 border-atlas-500/20';
    case 'at-risk': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
  }
}

function getHealthBarColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-atlas-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// ─── Page Component ─────────────────────────────────────────────────

export default function HealthScorePage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [statusFilter, setStatusFilter] = useState<HealthStatus | 'all'>('all');

  const filteredAccounts = useMemo(() => {
    if (statusFilter === 'all') return accounts;
    return accounts.filter(a => a.status === statusFilter);
  }, [statusFilter]);

  const stats = useMemo(() => {
    const total = accounts.length;
    const thriving = accounts.filter(a => a.status === 'thriving').length;
    const healthy = accounts.filter(a => a.status === 'healthy').length;
    const atRisk = accounts.filter(a => a.status === 'at-risk').length;
    const critical = accounts.filter(a => a.status === 'critical').length;
    const avgHealth = Math.round(accounts.reduce((s, a) => s + a.health, 0) / total);
    const avgNps = Math.round(accounts.reduce((s, a) => s + a.nps, 0) / total);
    const totalMrr = accounts.reduce((s, a) => s + a.mrr, 0);
    const atRiskMrr = accounts.filter(a => a.status === 'at-risk' || a.status === 'critical').reduce((s, a) => s + a.mrr, 0);
    return { total, thriving, healthy, atRisk, critical, avgHealth, avgNps, totalMrr, atRiskMrr };
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'nps', label: 'NPS Tracking', icon: ThumbsUp },
    { id: 'playbooks', label: 'Playbooks', icon: Shield },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" /> Customer Health
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Monitor engagement, predict churn, retain customers</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary hover:bg-slate-100 transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary hover:bg-slate-100 transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Tabs */}
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
        {/* ═══ Overview Tab ═══ */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Health Distribution */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-xs text-text-muted mb-1">Avg Health Score</p>
                <p className="text-3xl font-display font-bold text-text-primary">{stats.avgHealth}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+4 pts this month</span>
                </div>
              </div>
              {[
                { label: 'Thriving', count: stats.thriving, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Healthy', count: stats.healthy, color: 'text-atlas-400', bg: 'bg-atlas-500/10' },
                { label: 'At Risk', count: stats.atRisk, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Critical', count: stats.critical, color: 'text-red-400', bg: 'bg-red-500/10' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <p className="text-xs text-text-muted mb-1">{s.label}</p>
                  <p className={cn('text-3xl font-display font-bold', s.color)}>{s.count}</p>
                  <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-1 text-[10px] font-medium', s.bg, s.color)}>
                    {Math.round((s.count / stats.total) * 100)}% of accounts
                  </div>
                </div>
              ))}
            </div>

            {/* Health Bar + At-Risk Revenue */}
            <div className="grid grid-cols-2 gap-4">
              {/* Health Distribution Bar */}
              <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Health Distribution</h3>
                <div className="flex rounded-full h-5 overflow-hidden mb-4">
                  <div className="bg-green-500 transition-all" style={{ width: `${(stats.thriving / stats.total) * 100}%` }} />
                  <div className="bg-atlas-500 transition-all" style={{ width: `${(stats.healthy / stats.total) * 100}%` }} />
                  <div className="bg-amber-500 transition-all" style={{ width: `${(stats.atRisk / stats.total) * 100}%` }} />
                  <div className="bg-red-500 transition-all" style={{ width: `${(stats.critical / stats.total) * 100}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Thriving', pct: stats.thriving, color: 'bg-green-500' },
                    { label: 'Healthy', pct: stats.healthy, color: 'bg-atlas-500' },
                    { label: 'At Risk', pct: stats.atRisk, color: 'bg-amber-500' },
                    { label: 'Critical', pct: stats.critical, color: 'bg-red-500' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', s.color)} />
                      <span className="text-[10px] text-text-muted">{s.label} ({s.pct})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* At-Risk Revenue */}
              <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue at Risk</h3>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-3xl font-display font-bold text-red-400">${(stats.atRiskMrr / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-text-muted mt-1">MRR from at-risk + critical accounts</p>
                  </div>
                  <div className="flex-1">
                    <div className="text-right text-xs text-text-muted mb-1">
                      {Math.round((stats.atRiskMrr / stats.totalMrr) * 100)}% of total MRR
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                        style={{ width: `${(stats.atRiskMrr / stats.totalMrr) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-medium text-red-400">Action Required</span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    3 accounts need immediate attention. Mississauga Youth has a contract renewal in 30 days with declining engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* Health Signals Grid */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Health Signal Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-[10px] font-medium text-text-muted uppercase pb-2 pr-4">Account</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">Health</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">DAU</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">Events</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">Fill Rate</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">NPS</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">MRR</th>
                      <th className="text-center text-[10px] font-medium text-text-muted uppercase pb-2 px-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.sort((a, b) => a.health - b.health).map(acc => (
                      <tr key={acc.id} className="border-b border-white/[0.03] hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold',
                              acc.status === 'thriving' ? 'bg-green-500/10 text-green-400' :
                              acc.status === 'healthy' ? 'bg-atlas-500/10 text-atlas-400' :
                              acc.status === 'at-risk' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-red-500/10 text-red-400'
                            )}>{acc.logo}</div>
                            <div>
                              <p className="text-xs font-medium text-text-primary">{acc.name}</p>
                              <p className="text-[10px] text-text-muted">{acc.lastActive}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className={cn('h-full rounded-full', getHealthBarColor(acc.health))} style={{ width: `${acc.health}%` }} />
                            </div>
                            <span className="text-xs font-mono text-text-secondary">{acc.health}</span>
                          </div>
                        </td>
                        <td className={cn('py-3 px-2 text-center text-xs', acc.dau >= 60 ? 'text-green-400' : acc.dau >= 30 ? 'text-amber-400' : 'text-red-400')}>
                          {acc.dau}%
                        </td>
                        <td className={cn('py-3 px-2 text-center text-xs', acc.eventsCreated >= 10 ? 'text-green-400' : acc.eventsCreated >= 5 ? 'text-amber-400' : 'text-red-400')}>
                          {acc.eventsCreated}
                        </td>
                        <td className={cn('py-3 px-2 text-center text-xs', acc.fillRate >= 80 ? 'text-green-400' : acc.fillRate >= 50 ? 'text-amber-400' : 'text-red-400')}>
                          {acc.fillRate}%
                        </td>
                        <td className={cn('py-3 px-2 text-center text-xs', acc.nps >= 50 ? 'text-green-400' : acc.nps >= 20 ? 'text-amber-400' : 'text-red-400')}>
                          {acc.nps}
                        </td>
                        <td className="py-3 px-2 text-center text-xs text-text-secondary">
                          ${(acc.mrr / 1000).toFixed(1)}K
                        </td>
                        <td className="py-3 px-2 text-center">
                          {acc.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-400 mx-auto" /> :
                           acc.trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-red-400 mx-auto" /> :
                           <Minus className="w-4 h-4 text-text-muted mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Accounts Tab ═══ */}
        {tab === 'accounts' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filters */}
            <div className="flex items-center gap-2">
              {(['all', 'thriving', 'healthy', 'at-risk', 'critical'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    statusFilter === s ? 'bg-atlas-500/10 text-atlas-400 border border-atlas-500/20' : 'text-text-muted hover:text-text-secondary border border-slate-200')}>
                  {s === 'all' ? 'All Accounts' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                  {s !== 'all' && ` (${accounts.filter(a => a.status === s).length})`}
                </button>
              ))}
            </div>

            {/* Account Cards */}
            {filteredAccounts.map(acc => (
              <div key={acc.id} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-white/[0.1] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold', getHealthColor(acc.status))}>
                      {acc.logo}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{acc.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', getHealthColor(acc.status))}>
                          {acc.status.replace('-', ' ')}
                        </span>
                        <span className="text-[10px] text-text-muted">CSM: {acc.csm}</span>
                        <span className="text-[10px] text-text-muted">Last active: {acc.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-text-primary">{acc.health}</p>
                    <p className="text-[10px] text-text-muted">Health Score</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {[
                    { label: 'MRR', value: `$${(acc.mrr / 1000).toFixed(1)}K` },
                    { label: 'DAU', value: `${acc.dau}%` },
                    { label: 'Events', value: acc.eventsCreated.toString() },
                    { label: 'Fill Rate', value: `${acc.fillRate}%` },
                    { label: 'NPS', value: acc.nps.toString() },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 rounded-lg bg-white/40 text-center">
                      <p className="text-sm font-display font-bold text-text-primary">{m.value}</p>
                      <p className="text-[9px] text-text-muted">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Risk Factors */}
                {acc.riskFactors.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] font-semibold text-red-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Risk Factors
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {acc.riskFactors.map(rf => (
                        <span key={rf} className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-300">{rf}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-[10px] text-text-secondary hover:bg-slate-100">
                    <Eye className="w-3 h-3" /> View Details
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-[10px] text-text-secondary hover:bg-slate-100">
                    <Mail className="w-3 h-3" /> Send Check-in
                  </button>
                  {(acc.status === 'at-risk' || acc.status === 'critical') && (
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/15">
                      <Shield className="w-3 h-3" /> Run Playbook
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ NPS Tab ═══ */}
        {tab === 'nps' && (
          <div className="space-y-6 animate-fade-in">
            {/* NPS Score */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-xs text-text-muted mb-1">Current NPS</p>
                <p className="text-3xl font-display font-bold text-green-400">+62</p>
                <span className="flex items-center gap-1 text-xs text-green-400 mt-1"><ArrowUpRight className="w-3 h-3" />+6 from last month</span>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-xs text-text-muted mb-1">Promoters (9-10)</p>
                <p className="text-3xl font-display font-bold text-green-400">61</p>
                <span className="text-xs text-text-muted">67.8% of responses</span>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-xs text-text-muted mb-1">Passives (7-8)</p>
                <p className="text-3xl font-display font-bold text-amber-400">24</p>
                <span className="text-xs text-text-muted">26.7% of responses</span>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-xs text-text-muted mb-1">Detractors (0-6)</p>
                <p className="text-3xl font-display font-bold text-red-400">5</p>
                <span className="text-xs text-text-muted">5.6% of responses</span>
              </div>
            </div>

            {/* NPS Trend Chart */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">NPS Trend (6 months)</h3>
              <div className="h-48 flex items-end gap-2">
                {npsResponses.map(n => {
                  const total = n.promoters + n.passives + n.detractors;
                  return (
                    <div key={n.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-text-primary">+{n.score}</span>
                      <div className="w-full flex flex-col rounded-lg overflow-hidden" style={{ height: `${(total / 100) * 160}px` }}>
                        <div className="bg-green-500/60" style={{ flex: n.promoters }} />
                        <div className="bg-amber-500/40" style={{ flex: n.passives }} />
                        <div className="bg-red-500/50" style={{ flex: n.detractors }} />
                      </div>
                      <span className="text-[10px] text-text-muted">{n.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                {[
                  { label: 'Promoters', color: 'bg-green-500/60' },
                  { label: 'Passives', color: 'bg-amber-500/40' },
                  { label: 'Detractors', color: 'bg-red-500/50' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={cn('w-3 h-3 rounded', l.color)} />
                    <span className="text-[10px] text-text-muted">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Feedback</h3>
              <div className="space-y-3">
                {[
                  { score: 10, text: 'The zone intelligence feature alone justifies the price. We\'ve doubled our fill rates since switching.', org: 'Elite Soccer Academy', time: '2 days ago' },
                  { score: 9, text: 'Great product, wish there was better multi-sport support but the roadmap looks promising.', org: 'Etobicoke United', time: '5 days ago' },
                  { score: 7, text: 'Good product but onboarding could be smoother for our less tech-savvy coaches.', org: 'North York United', time: '1 week ago' },
                  { score: 3, text: 'We had billing issues for 3 months that went unresolved. Considering alternatives.', org: 'Mississauga Youth', time: '2 weeks ago' },
                ].map((fb, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                      fb.score >= 9 ? 'bg-green-500/10 text-green-400' :
                      fb.score >= 7 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    )}>{fb.score}</div>
                    <div>
                      <p className="text-xs text-text-secondary leading-relaxed">&quot;{fb.text}&quot;</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium text-text-primary">{fb.org}</span>
                        <span className="text-[10px] text-text-muted">{fb.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Playbooks Tab ═══ */}
        {tab === 'playbooks' && (
          <div className="space-y-4 animate-fade-in">
            {/* AI Header */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">AI-Generated Retention Playbooks</span>
              </div>
              <p className="text-xs text-text-muted">
                Based on health signals, usage patterns, and historical churn data, these are the recommended intervention strategies.
              </p>
            </div>

            {retentionPlaybooks.map(pb => (
              <div key={pb.id} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', getHealthColor(pb.status))}>
                        {pb.account}
                      </span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium',
                        pb.urgency === 'Immediate' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      )}>{pb.urgency}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{pb.title}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">Owner: {pb.owner} · Impact: {pb.impact}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-xs font-medium text-atlas-400 hover:bg-atlas-500/15">
                    Start Playbook
                  </button>
                </div>

                <div className="space-y-2">
                  {pb.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-xs text-text-secondary">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
