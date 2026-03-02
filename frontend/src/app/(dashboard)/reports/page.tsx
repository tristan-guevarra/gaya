/* ═══════════════════════════════════════════════════════════════
   Gaya — Market Intelligence Reports
   Auto-generated zone reports with executive summary,
   supply/demand analysis, recommendations, and PDF export.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatPercent } from '@/lib/utils';
import {
  FileText, Download, Plus, Calendar, MapPin, TrendingUp,
  TrendingDown, Clock, Eye, Share2, Sparkles, Zap, Brain,
  BarChart3, Target, Users, Flame, ChevronRight, Filter,
  ArrowUpRight, ArrowDownRight, CheckCircle
} from 'lucide-react';

// ─── Mock Reports ───────────────────────────────────────────

interface Report {
  id: string;
  title: string;
  zone: string;
  generated_at: string;
  status: 'ready' | 'generating' | 'draft';
  opportunity_score: number;
  key_finding: string;
  metrics: {
    demand_index: number;
    supply_index: number;
    gap_score: number;
    fill_rate: number;
    leads_30d: number;
    coaches: number;
  };
  monthly_data: { month: string; demand: number; supply: number }[];
  recommendations: string[];
}

const REPORTS: Report[] = [
  {
    id: 'r1', title: 'Scarborough East Market Report', zone: 'Scarborough East',
    generated_at: '2026-02-28T10:00:00Z', status: 'ready', opportunity_score: 92,
    key_finding: 'Demand exceeds supply by 2.5× — highest gap in the GTA. Immediate expansion recommended.',
    metrics: { demand_index: 87, supply_index: 34, gap_score: 53, fill_rate: 0.64, leads_30d: 186, coaches: 7 },
    monthly_data: Array.from({ length: 6 }, (_, i) => ({
      month: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i],
      demand: [72, 68, 58, 45, 62, 87][i],
      supply: [30, 31, 32, 28, 33, 34][i],
    })),
    recommendations: ['Launch 2 weekend clinics targeting U12 age group', 'Recruit 2 verified coaches to improve coverage', 'Price at 15% premium — demand supports it'],
  },
  {
    id: 'r2', title: 'North York Monthly Intelligence', zone: 'North York',
    generated_at: '2026-02-27T14:00:00Z', status: 'ready', opportunity_score: 71,
    key_finding: 'Supply growing faster than demand — focus on conversion optimization over expansion.',
    metrics: { demand_index: 64, supply_index: 58, gap_score: 6, fill_rate: 0.72, leads_30d: 142, coaches: 14 },
    monthly_data: Array.from({ length: 6 }, (_, i) => ({
      month: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i],
      demand: [60, 58, 52, 48, 55, 64][i],
      supply: [45, 47, 49, 46, 52, 58][i],
    })),
    recommendations: ['Improve listing quality to boost conversion by 15%', 'Add weekend evening slots — search data shows demand', 'Partner with local schools for awareness'],
  },
  {
    id: 'r3', title: 'Etobicoke Q1 Analysis', zone: 'Etobicoke',
    generated_at: '2026-02-25T09:00:00Z', status: 'ready', opportunity_score: 78,
    key_finding: 'Centennial Park area shows emerging demand for speed & agility training.',
    metrics: { demand_index: 72, supply_index: 42, gap_score: 30, fill_rate: 0.68, leads_30d: 98, coaches: 9 },
    monthly_data: Array.from({ length: 6 }, (_, i) => ({
      month: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i],
      demand: [55, 58, 50, 42, 60, 72][i],
      supply: [35, 36, 38, 34, 40, 42][i],
    })),
    recommendations: ['Add speed & agility clinics at Centennial Park', 'Target U14-U17 for highest conversion potential', 'Consider GK training — zero supply currently'],
  },
  {
    id: 'r4', title: 'Vaughan Market Report', zone: 'Vaughan',
    generated_at: '2026-02-26T11:00:00Z', status: 'generating', opportunity_score: 65,
    key_finding: 'Generating...',
    metrics: { demand_index: 55, supply_index: 48, gap_score: 7, fill_rate: 0.71, leads_30d: 76, coaches: 11 },
    monthly_data: [],
    recommendations: [],
  },
];

// ─── Chart Tooltip ──────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-100/95 backdrop-blur-xl border border-slate-200 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] font-medium text-text-primary mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-[10px]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted">{p.name}:</span>
          <span className="font-medium text-text-primary">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Report Card ────────────────────────────────────────────

function ReportCard({ report, expanded, onToggle }: { report: Report; expanded: boolean; onToggle: () => void }) {
  const isGenerating = report.status === 'generating';

  return (
    <Card className={cn(expanded && '!border-atlas-500/15')}>
      {/* Header */}
      <div className="flex items-start gap-4 cursor-pointer" onClick={onToggle}>
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          isGenerating ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-atlas-500/10 text-atlas-400'
        )}>
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-text-primary truncate">{report.title}</h3>
            <Badge variant={report.opportunity_score >= 80 ? 'success' : report.opportunity_score >= 60 ? 'info' : 'default'} size="sm">
              {report.opportunity_score}/100
            </Badge>
            {isGenerating && <Badge variant="warning" size="sm" dot>Generating</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {report.zone}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(report.generated_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isGenerating && (
            <Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" /></Button>
          )}
          <ChevronRight className={cn('w-4 h-4 text-text-muted transition-transform', expanded && 'rotate-90')} />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && !isGenerating && (
        <div className="mt-5 pt-5 border-t border-slate-200 animate-fade-in">
          {/* Key Finding */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-atlas-500/5 border border-atlas-500/10 mb-5">
            <Brain className="w-4 h-4 text-atlas-400 mt-0.5 shrink-0" />
            <p className="text-xs text-atlas-300 leading-relaxed">{report.key_finding}</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
            {[
              { label: 'Demand', value: report.metrics.demand_index, color: 'text-red-400' },
              { label: 'Supply', value: report.metrics.supply_index, color: 'text-atlas-400' },
              { label: 'Gap', value: report.metrics.gap_score, color: 'text-amber-400' },
              { label: 'Fill Rate', value: `${Math.round(report.metrics.fill_rate * 100)}%`, color: 'text-blue-400' },
              { label: 'Leads/30d', value: report.metrics.leads_30d, color: 'text-purple-400' },
              { label: 'Coaches', value: report.metrics.coaches, color: 'text-cyan-400' },
            ].map(m => (
              <div key={m.label} className="text-center p-2 rounded-lg bg-white/40 border border-white/60">
                <p className={cn('text-lg font-display font-bold', m.color)}>{m.value}</p>
                <p className="text-[9px] text-text-muted">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mb-5">
            <p className="text-xs font-medium text-text-muted mb-2">Supply vs Demand (6 Months)</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={report.monthly_data}>
                <defs>
                  <linearGradient id={`d_${report.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d6a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ff4d6a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`s_${report.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="demand" stroke="#ff4d6a" fill={`url(#d_${report.id})`} strokeWidth={1.5} name="Demand" />
                <Area type="monotone" dataKey="supply" stroke="#3b82f6" fill={`url(#s_${report.id})`} strokeWidth={1.5} name="Supply" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-atlas-400" /> AI Recommendations
            </p>
            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/40 border border-white/60">
                  <div className="w-5 h-5 rounded-md bg-atlas-500/15 flex items-center justify-center text-[10px] font-bold text-atlas-400 shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xs text-text-secondary">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200">
            <Button size="sm"><Download className="w-3.5 h-3.5" /> Export PDF</Button>
            <Button variant="secondary" size="sm"><Share2 className="w-3.5 h-3.5" /> Share</Button>
            <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /> Full Report</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Page Component ─────────────────────────────────────────

export default function ReportsPage() {
  const [expandedId, setExpandedId] = useState<string | null>('r1');
  const [generating, setGenerating] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-text-primary flex items-center gap-2">
                <FileText className="w-6 h-6 text-atlas-400" />
                Market Reports
              </h1>
              <p className="text-sm text-text-muted mt-1">AI-generated zone intelligence reports with actionable insights</p>
            </div>
            <Button onClick={() => setGenerating(true)}>
              <Plus className="w-4 h-4" /> Generate Report
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Reports Generated', value: '24', trend: '+3 this week', icon: FileText },
              { label: 'Zones Analyzed', value: '10', trend: 'All GTA zones', icon: MapPin },
              { label: 'Avg Opportunity', value: '76', trend: '+5 vs last month', icon: Target },
              { label: 'Actions Taken', value: '18', trend: '75% implementation rate', icon: CheckCircle },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-[10px] text-text-muted">{s.label}</span>
                </div>
                <p className="text-lg font-display font-bold text-text-primary">{s.value}</p>
                <p className="text-[10px] text-atlas-400">{s.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {REPORTS.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            expanded={expandedId === report.id}
            onToggle={() => setExpandedId(prev => prev === report.id ? null : report.id)}
          />
        ))}
      </div>
    </div>
  );
}
