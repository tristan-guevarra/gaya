// admin command center - feature flags, audit logs, org management, and system config

'use client';

import { useState, useMemo } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Settings, ToggleLeft, ToggleRight, ScrollText, Building2,
  Shield, Search, ChevronDown, Clock, User, Edit,
  Trash2, Plus, AlertTriangle, CheckCircle, XCircle,
  Globe, Zap, Brain, MapPin, Eye, Lock, Unlock,
  ArrowUpRight, Filter, Download, RefreshCw
} from 'lucide-react';
import type { FeatureFlag, AuditLogEntry } from '@/types';


const MOCK_FLAGS: FeatureFlag[] = [
  { id: 'f1', key: 'ml_recommendations', name: 'ML Recommendations', description: 'AI-powered expansion recommendations for admin dashboard', enabled: true, percentage_rollout: 100, updated_by: 'admin@gaya.app', updated_at: '2026-02-28T10:00:00Z' },
  { id: 'f2', key: 'what_if_simulator', name: 'What-If Simulator', description: 'Interactive ML prediction simulator for hypothetical events', enabled: true, percentage_rollout: 100, updated_by: 'admin@gaya.app', updated_at: '2026-02-25T14:00:00Z' },
  { id: 'f3', key: 'heatmap_layers', name: 'Heatmap Layers', description: 'Supply/demand/underserved heatmap overlays on discovery map', enabled: true, percentage_rollout: 100, updated_by: 'admin@gaya.app', updated_at: '2026-02-20T09:00:00Z' },
  { id: 'f4', key: 'lead_scoring', name: 'Lead Scoring', description: 'ML-based lead quality scoring and prioritization', enabled: false, percentage_rollout: 0, updated_by: 'admin@gaya.app', updated_at: '2026-02-15T11:00:00Z' },
  { id: 'f5', key: 'coach_verification_v2', name: 'Coach Verification v2', description: 'Enhanced verification flow with document upload and background checks', enabled: true, percentage_rollout: 50, target_orgs: ['org-1', 'org-3'], updated_by: 'admin@gaya.app', updated_at: '2026-02-10T16:00:00Z' },
  { id: 'f6', key: 'revenue_forecasting', name: 'Revenue Forecasting', description: 'Time-series revenue projections and scenario planning', enabled: false, percentage_rollout: 0, updated_by: 'admin@gaya.app', updated_at: '2026-02-08T13:00:00Z' },
  { id: 'f7', key: 'pulse_feed', name: 'Pulse Activity Feed', description: 'Real-time activity stream and system health monitoring', enabled: true, percentage_rollout: 100, updated_by: 'admin@gaya.app', updated_at: '2026-02-05T10:00:00Z' },
  { id: 'f8', key: 'multi_sport', name: 'Multi-Sport Support', description: 'Extend platform beyond soccer to basketball, baseball, etc.', enabled: false, percentage_rollout: 0, updated_by: 'admin@gaya.app', updated_at: '2026-01-28T09:00:00Z' },
  { id: 'f9', key: 'waitlist_notifications', name: 'Waitlist Notifications', description: 'Auto-notify waitlisted users when spots open up', enabled: true, percentage_rollout: 100, updated_by: 'admin@gaya.app', updated_at: '2026-01-20T14:00:00Z' },
  { id: 'f10', key: 'dark_mode_v2', name: 'Dark Mode v2', description: 'Enhanced dark theme with OLED-optimized contrast', enabled: true, percentage_rollout: 100, updated_by: 'admin@gaya.app', updated_at: '2026-01-15T11:00:00Z' },
];


const MOCK_AUDIT: AuditLogEntry[] = [
  { id: 'a1', user_id: 'u1', user_name: 'admin@gaya.app', action: 'update', resource_type: 'feature_flag', resource_id: 'f1', changes: { enabled: { old: false, new: true } }, ip_address: '192.168.1.100', created_at: '2026-02-28T10:00:00Z' },
  { id: 'a2', user_id: 'u2', user_name: 'marcus@example.com', action: 'create', resource_type: 'event', resource_id: 'e5', ip_address: '10.0.0.42', created_at: '2026-02-28T09:30:00Z' },
  { id: 'a3', user_id: 'u1', user_name: 'admin@gaya.app', action: 'update', resource_type: 'coach', resource_id: 'c3', changes: { verified: { old: false, new: true } }, ip_address: '192.168.1.100', created_at: '2026-02-28T09:15:00Z' },
  { id: 'a4', user_id: 'u3', user_name: 'adriana@example.com', action: 'update', resource_type: 'event', resource_id: 'e2', changes: { price_cents: { old: 7900, new: 8900 } }, ip_address: '172.16.0.5', created_at: '2026-02-28T08:45:00Z' },
  { id: 'a5', user_id: 'u1', user_name: 'admin@gaya.app', action: 'delete', resource_type: 'lead', resource_id: 'l15', ip_address: '192.168.1.100', created_at: '2026-02-27T17:00:00Z' },
  { id: 'a6', user_id: 'u4', user_name: 'david@example.com', action: 'create', resource_type: 'coach', resource_id: 'c8', ip_address: '10.0.1.22', created_at: '2026-02-27T15:30:00Z' },
  { id: 'a7', user_id: 'u1', user_name: 'admin@gaya.app', action: 'update', resource_type: 'organization', resource_id: 'org1', changes: { plan: { old: 'starter', new: 'pro' } }, ip_address: '192.168.1.100', created_at: '2026-02-27T14:00:00Z' },
  { id: 'a8', user_id: 'u5', user_name: 'fatima@example.com', action: 'create', resource_type: 'event', resource_id: 'e12', ip_address: '10.0.2.8', created_at: '2026-02-27T11:15:00Z' },
  { id: 'a9', user_id: 'u1', user_name: 'admin@gaya.app', action: 'update', resource_type: 'feature_flag', resource_id: 'f5', changes: { percentage_rollout: { old: 25, new: 50 } }, ip_address: '192.168.1.100', created_at: '2026-02-26T16:45:00Z' },
  { id: 'a10', user_id: 'u6', user_name: 'jake@example.com', action: 'update', resource_type: 'coach', resource_id: 'c2', changes: { hourly_rate_cents: { old: 10000, new: 11500 } }, ip_address: '172.16.1.12', created_at: '2026-02-26T10:00:00Z' },
];

const actionColors: Record<string, string> = {
  create: 'text-atlas-400 bg-atlas-500/10',
  update: 'text-blue-400 bg-blue-500/10',
  delete: 'text-red-400 bg-red-500/10',
};

const resourceIcons: Record<string, typeof Zap> = {
  feature_flag: ToggleRight,
  event: MapPin,
  coach: Shield,
  lead: User,
  organization: Building2,
};


const MOCK_ORGS = [
  { id: 'org-1', name: 'GTA Elite Soccer Academy', coaches: 12, events: 28, plan: 'pro', status: 'active' },
  { id: 'org-2', name: 'Brampton Youth FC', coaches: 6, events: 14, plan: 'starter', status: 'active' },
  { id: 'org-3', name: 'Scarborough United Training', coaches: 8, events: 19, plan: 'pro', status: 'active' },
  { id: 'org-4', name: 'Mississauga Soccer Lab', coaches: 4, events: 8, plan: 'free', status: 'active' },
  { id: 'org-5', name: 'Durham Region FC', coaches: 3, events: 5, plan: 'starter', status: 'trial' },
  { id: 'org-6', name: 'Vaughan Technical Academy', coaches: 2, events: 3, plan: 'free', status: 'trial' },
];


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'flags' | 'audit' | 'orgs'>('flags');
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [auditSearch, setAuditSearch] = useState('');
  const [flagSearch, setFlagSearch] = useState('');

  const toggleFlag = (id: string) => {
    setFlags((prev) => prev.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled, updated_at: new Date().toISOString() } : f
    ));
  };

  const filteredFlags = useMemo(() =>
    flags.filter((f) =>
      f.name.toLowerCase().includes(flagSearch.toLowerCase()) ||
      f.key.toLowerCase().includes(flagSearch.toLowerCase())
    ),
  [flags, flagSearch]);

  const filteredAudit = useMemo(() =>
    MOCK_AUDIT.filter((a) =>
      a.user_name.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.resource_type.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.action.toLowerCase().includes(auditSearch.toLowerCase())
    ),
  [auditSearch]);

  return (
    <div className="min-h-screen pb-16">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-text-primary">Admin Center</h1>
              <p className="text-sm text-text-muted">
                Feature flags · Audit logs · Organization management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-slate-200 sticky top-0/80 backdrop-blur-xl z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex gap-0">
            {[
              { key: 'flags' as const, label: 'Feature Flags', icon: ToggleRight, count: flags.filter((f) => f.enabled).length },
              { key: 'audit' as const, label: 'Audit Log', icon: ScrollText, count: MOCK_AUDIT.length },
              { key: 'orgs' as const, label: 'Organizations', icon: Building2, count: MOCK_ORGS.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'text-atlas-400 border-atlas-500'
                    : 'text-text-muted hover:text-text-secondary border-transparent'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-md',
                  activeTab === tab.key ? 'bg-atlas-500/10 text-atlas-400' : 'bg-slate-100/50 text-text-muted'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        {/* feature flags tab */}
        {activeTab === 'flags' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search flags..."
                  value={flagSearch}
                  onChange={(e) => setFlagSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-atlas-500/30 focus:ring-1 focus:ring-atlas-500/20"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                New Flag
              </Button>
            </div>

            <div className="space-y-3">
              {filteredFlags.map((flag) => (
                <Card
                  key={flag.id}
                  padding="sm"
                  className={cn(
                    'relative overflow-hidden transition-all',
                    flag.enabled ? 'border-atlas-500/10' : 'opacity-70'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* toggle */}
                    <button
                      onClick={() => toggleFlag(flag.id)}
                      className={cn(
                        'relative w-12 h-7 rounded-full transition-all duration-300 shrink-0',
                        flag.enabled ? 'bg-atlas-500' : 'bg-slate-100'
                      )}
                    >
                      <div className={cn(
                        'absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300',
                        flag.enabled ? 'left-6' : 'left-1'
                      )} />
                    </button>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-text-primary">{flag.name}</h4>
                        <code className="text-[10px] font-mono text-text-muted bg-slate-100/50 px-1.5 py-0.5 rounded">{flag.key}</code>
                      </div>
                      <p className="text-xs text-text-muted">{flag.description}</p>
                    </div>

                    {/* meta */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                      {flag.percentage_rollout !== undefined && flag.percentage_rollout < 100 && flag.enabled && (
                        <Badge variant="warning" size="sm">{flag.percentage_rollout}% rollout</Badge>
                      )}
                      {flag.target_orgs && flag.target_orgs.length > 0 && (
                        <Badge variant="info" size="sm">{flag.target_orgs.length} orgs</Badge>
                      )}
                      <span className="text-[10px] text-text-muted">
                        {new Date(flag.updated_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/40 border border-white/60 text-center">
              <p className="text-xs text-text-muted">
                {flags.filter((f) => f.enabled).length} of {flags.length} flags enabled
                · Flags are evaluated server-side and cached in Redis for 60s
              </p>
            </div>
          </div>
        )}

        {/* audit log tab */}
        {activeTab === 'audit' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-atlas-500/30 focus:ring-1 focus:ring-atlas-500/20"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                Export CSV
              </Button>
            </div>

            {/* log entries */}
            <div className="space-y-1">
              {filteredAudit.map((log) => {
                const Icon = resourceIcons[log.resource_type] || Edit;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 transition-all group"
                  >
                    {/* action icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      actionColors[log.action] || 'text-text-muted bg-slate-100/50'
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">
                        <span className="font-medium">{log.user_name}</span>
                        {' '}
                        <span className={cn(
                          'font-mono text-xs px-1.5 py-0.5 rounded',
                          actionColors[log.action]
                        )}>
                          {log.action}
                        </span>
                        {' '}
                        <span className="text-text-secondary">{log.resource_type}</span>
                        {' '}
                        <code className="text-[10px] text-text-muted">{log.resource_id}</code>
                      </p>

                      {/* changes detail */}
                      {log.changes && (
                        <div className="flex items-center gap-2 mt-1">
                          {Object.entries(log.changes).map(([key, val]) => (
                            <span key={key} className="text-[10px] text-text-muted">
                              {key}: <span className="text-red-400/70 line-through">{String(val.old)}</span>
                              {' → '}
                              <span className="text-atlas-400">{String(val.new)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* timestamp + ip */}
                    <div className="text-right shrink-0 hidden md:block">
                      <p className="text-xs text-text-muted">
                        {new Date(log.created_at).toLocaleString('en-CA', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {log.ip_address && (
                        <p className="text-[10px] font-mono text-text-muted/50">{log.ip_address}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* organizations tab */}
        {activeTab === 'orgs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-text-muted">{MOCK_ORGS.length} organizations registered</p>
              <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Add Organization
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_ORGS.map((org) => (
                <Card key={org.id} hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-atlas-500/15 to-blue-500/15 flex items-center justify-center text-sm font-bold text-atlas-400">
                      {org.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                    </div>
                    <Badge variant={
                      org.plan === 'pro' ? 'premium' :
                      org.plan === 'starter' ? 'info' : 'default'
                    } size="sm">
                      {org.plan}
                    </Badge>
                  </div>

                  <h3 className="font-display font-semibold text-sm text-text-primary mb-1">{org.name}</h3>
                  <Badge variant={org.status === 'active' ? 'success' : 'warning'} size="sm" dot>
                    {org.status}
                  </Badge>

                  <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                    <div>
                      <p className="text-lg font-display font-bold text-text-primary">{org.coaches}</p>
                      <p className="text-[10px] text-text-muted">Coaches</p>
                    </div>
                    <div>
                      <p className="text-lg font-display font-bold text-text-primary">{org.events}</p>
                      <p className="text-[10px] text-text-muted">Events</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">Manage</Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
