/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Workflow Automations
   Visual IFTTT-style automation builder with trigger/action
   cards, pre-built templates, execution logs, and AI-suggested
   automations for event management and lead nurturing.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Workflow, Play, Pause, Plus, ChevronRight, ChevronDown,
  Zap, Bell, Mail, MessageCircle, Calendar, Users, MapPin,
  DollarSign, Clock, Target, TrendingUp, Star, Shield,
  CheckCircle, XCircle, AlertTriangle, Sparkles, ArrowDown,
  RefreshCw, Eye, Copy, Trash2, Activity, BarChart3,
  ArrowUpRight, Filter, Settings, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type AutomationStatus = 'active' | 'paused' | 'draft' | 'error';

interface AutomationStep {
  type: 'trigger' | 'condition' | 'action';
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  trigger: string;
  actions: string[];
  runs: number;
  successRate: number;
  lastRun: string;
  steps: AutomationStep[];
  category: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const automations: Automation[] = [
  {
    id: 'auto-1', name: 'Lead Welcome Sequence', description: 'Send personalized welcome email when a new lead submits a request',
    status: 'active', trigger: 'New lead submitted', actions: ['Send welcome email', 'Add to CRM', 'Notify coach'],
    runs: 342, successRate: 98.2, lastRun: '12 min ago', category: 'Lead Nurturing',
    steps: [
      { type: 'trigger', icon: Users, label: 'New Lead Submitted', description: 'When someone submits a training request', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      { type: 'condition', icon: Filter, label: 'Check Location', description: 'Is the lead within a served zone?', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      { type: 'action', icon: Mail, label: 'Send Welcome Email', description: 'Personalized email with nearby coaches & events', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: Users, label: 'Add to Pipeline', description: 'Create CRM record with lead score', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: Bell, label: 'Notify Coach', description: 'Push notification to nearest matched coach', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    ],
  },
  {
    id: 'auto-2', name: 'Low Fill Rate Alert', description: 'Alert coach when an event drops below 60% fill rate 48h before start',
    status: 'active', trigger: 'Fill rate < 60% && 48h before event', actions: ['Slack alert', 'Suggest discount', 'Boost in feed'],
    runs: 28, successRate: 100, lastRun: '3 hours ago', category: 'Event Management',
    steps: [
      { type: 'trigger', icon: Target, label: 'Fill Rate Below 60%', description: 'Event is 48h away with < 60% capacity', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
      { type: 'action', icon: MessageCircle, label: 'Send Slack Alert', description: 'Notify #events channel with details', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: DollarSign, label: 'Auto-Discount', description: 'Apply 15% early-bird discount code', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: TrendingUp, label: 'Boost in Feed', description: 'Promote in discovery feed for 24h', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    ],
  },
  {
    id: 'auto-3', name: 'Post-Session Review Request', description: 'Ask parents for a review 24h after session completion',
    status: 'active', trigger: 'Session completed', actions: ['Wait 24h', 'Send review request', 'Track response'],
    runs: 1284, successRate: 96.8, lastRun: '1 hour ago', category: 'Engagement',
    steps: [
      { type: 'trigger', icon: CheckCircle, label: 'Session Completed', description: 'When a session/event ends', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      { type: 'action', icon: Clock, label: 'Wait 24 Hours', description: 'Delay to allow reflection', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      { type: 'action', icon: Star, label: 'Send Review Request', description: 'Email with 1-click star rating', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    ],
  },
  {
    id: 'auto-4', name: 'Coach Milestone Celebration', description: 'Celebrate when a coach hits XP milestones',
    status: 'active', trigger: 'Coach reaches XP milestone', actions: ['Award badge', 'Send congrats', 'Post to feed'],
    runs: 47, successRate: 100, lastRun: '2 days ago', category: 'Gamification',
    steps: [
      { type: 'trigger', icon: Zap, label: 'XP Milestone Reached', description: 'Coach hits 10K, 25K, 50K, or 100K XP', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      { type: 'action', icon: Star, label: 'Award Badge', description: 'Unlock milestone badge in profile', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: Mail, label: 'Send Congrats Email', description: 'Personalized celebration email', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: Activity, label: 'Post to Feed', description: 'Share achievement in community feed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    ],
  },
  {
    id: 'auto-5', name: 'Churn Risk Intervention', description: 'Trigger retention playbook when health score drops below 50',
    status: 'paused', trigger: 'Health score < 50', actions: ['Alert CSM', 'Schedule call', 'Send offer'],
    runs: 8, successRate: 87.5, lastRun: '1 week ago', category: 'Retention',
    steps: [
      { type: 'trigger', icon: AlertTriangle, label: 'Health Score Critical', description: 'Account health drops below 50', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
      { type: 'condition', icon: Filter, label: 'Check MRR', description: 'Is MRR > $2,000? (high-value account)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      { type: 'action', icon: Bell, label: 'Alert CSM', description: 'Urgent notification to assigned CSM', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      { type: 'action', icon: Calendar, label: 'Schedule Call', description: 'Auto-schedule check-in within 48h', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    ],
  },
];

const executionLog = [
  { automation: 'Lead Welcome Sequence', status: 'success', time: '12 min ago', details: 'Lead: Sarah M. (Scarborough) → Coach Marcus T. notified' },
  { automation: 'Post-Session Review', status: 'success', time: '1 hour ago', details: 'Sent to 8 parents after Elite Camp Day 3' },
  { automation: 'Low Fill Rate Alert', status: 'success', time: '3 hours ago', details: 'GK Workshop (12/15) → 15% discount applied' },
  { automation: 'Lead Welcome Sequence', status: 'success', time: '4 hours ago', details: 'Lead: Michael K. (Ajax) → Coach David P. notified' },
  { automation: 'Coach Milestone', status: 'success', time: '2 days ago', details: 'Sarah Chen reached 50K XP → Diamond badge awarded' },
  { automation: 'Churn Risk', status: 'error', time: '1 week ago', details: 'Failed to schedule call — calendar API timeout' },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function WorkflowAutomationsPage() {
  const [selectedAutomation, setSelectedAutomation] = useState<Automation>(automations[0]);
  const [showLog, setShowLog] = useState(false);

  const statusConfig: Record<AutomationStatus, { color: string; label: string; icon: React.ElementType }> = {
    active: { color: 'text-green-400 bg-green-500/10', label: 'Active', icon: Play },
    paused: { color: 'text-amber-400 bg-amber-500/10', label: 'Paused', icon: Pause },
    draft: { color: 'text-text-muted bg-slate-50', label: 'Draft', icon: Settings },
    error: { color: 'text-red-400 bg-red-500/10', label: 'Error', icon: AlertTriangle },
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Workflow className="w-5 h-5 text-amber-400" /> Workflow Automations
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Automate repetitive tasks with trigger → action workflows</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowLog(!showLog)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Activity className="w-3.5 h-3.5" /> Execution Log
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-xs font-medium text-atlas-400">
                <Plus className="w-3.5 h-3.5" /> New Automation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Automations', value: automations.filter(a => a.status === 'active').length.toString(), icon: Play, color: 'text-green-400' },
            { label: 'Total Executions', value: automations.reduce((s, a) => s + a.runs, 0).toLocaleString(), icon: Zap, color: 'text-amber-400' },
            { label: 'Avg Success Rate', value: `${(automations.reduce((s, a) => s + a.successRate, 0) / automations.length).toFixed(1)}%`, icon: Target, color: 'text-atlas-400' },
            { label: 'Time Saved', value: '~42 hrs/mo', icon: Clock, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-2', s.color)} />
              <p className="text-2xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Execution Log (conditional) */}
        {showLog && (
          <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 mb-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Executions</h3>
            <div className="space-y-2">
              {executionLog.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                  {log.status === 'success'
                    ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary">{log.automation}</span>
                      <span className="text-[10px] text-text-muted">{log.time}</span>
                    </div>
                    <p className="text-[10px] text-text-muted truncate">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Automation List */}
          <div className="col-span-5 space-y-3">
            {automations.map(auto => {
              const sc = statusConfig[auto.status];
              return (
                <button key={auto.id} onClick={() => setSelectedAutomation(auto)}
                  className={cn('w-full p-4 rounded-xl border text-left transition-all',
                    selectedAutomation.id === auto.id
                      ? 'bg-atlas-500/5 border-atlas-500/20'
                      : 'bg-white border-slate-200 hover:border-white/[0.1]')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-text-muted">{auto.category}</span>
                    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', sc.color)}>
                      <sc.icon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text-primary mb-1">{auto.name}</p>
                  <p className="text-[10px] text-text-muted mb-2">{auto.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>{auto.runs.toLocaleString()} runs</span>
                    <span>{auto.successRate}% success</span>
                    <span>{auto.lastRun}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Automation Detail / Visual Builder */}
          <div className="col-span-7 space-y-4">
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-display font-bold text-text-primary">{selectedAutomation.name}</h2>
                  <p className="text-xs text-text-muted mt-0.5">{selectedAutomation.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedAutomation.status === 'active' ? (
                    <button className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
                      <Pause className="w-3 h-3 inline mr-1" /> Pause
                    </button>
                  ) : (
                    <button className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] text-green-400">
                      <Play className="w-3 h-3 inline mr-1" /> Activate
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Flow */}
              <div className="space-y-0">
                {selectedAutomation.steps.map((step, i) => (
                  <div key={i}>
                    {/* Step Card */}
                    <div className={cn('p-4 rounded-xl border', step.color)}>
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', step.color)}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-medium uppercase tracking-wider text-text-muted/50">
                              {step.type === 'trigger' ? '⚡ TRIGGER' : step.type === 'condition' ? '❓ CONDITION' : '✅ ACTION'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-text-primary">{step.label}</p>
                          <p className="text-[10px] text-text-muted">{step.description}</p>
                        </div>
                        <Settings className="w-4 h-4 text-text-muted/30" />
                      </div>
                    </div>

                    {/* Connector */}
                    {i < selectedAutomation.steps.length - 1 && (
                      <div className="flex items-center justify-center py-1">
                        <div className="w-px h-6 bg-white/[0.1]" />
                        <ArrowDown className="w-3 h-3 text-text-muted/30 absolute" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Step */}
                <div className="flex items-center justify-center pt-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-white/[0.1] text-[10px] text-text-muted hover:border-white/[0.2] hover:text-text-secondary transition-all">
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-xl font-display font-bold text-text-primary">{selectedAutomation.runs.toLocaleString()}</p>
                <p className="text-[10px] text-text-muted">Total Runs</p>
              </div>
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-xl font-display font-bold text-green-400">{selectedAutomation.successRate}%</p>
                <p className="text-[10px] text-text-muted">Success Rate</p>
              </div>
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <p className="text-xl font-display font-bold text-text-primary">{selectedAutomation.lastRun}</p>
                <p className="text-[10px] text-text-muted">Last Run</p>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">AI Suggestion</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Based on your automation patterns, consider adding a <strong className="text-text-primary">&quot;Waitlist Auto-Notification&quot;</strong> workflow:
                When a spot opens in a sold-out event, automatically notify the next person on the waitlist and give them 2 hours to confirm before moving to the next.
              </p>
              <button className="mt-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400">
                Create This Automation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
