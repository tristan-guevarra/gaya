/* ═══════════════════════════════════════════════════════════════
   Gaya — Settings & Preferences
   Account management, notification preferences, team management,
   API key management, data export, and danger zone.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  User, Bell, Users, Key, Download, Shield, Globe,
  ChevronRight, Check, X, Eye, EyeOff, Copy,
  Moon, Sun, Monitor, Palette, Mail, MessageSquare,
  Smartphone, MapPin, Calendar, Zap, AlertTriangle,
  Settings, Lock, Trash2, ArrowUpRight, ExternalLink,
  CreditCard, Building2
} from 'lucide-react';

// ─── Types & Configs ────────────────────────────────────────

type SettingsTab = 'profile' | 'notifications' | 'team' | 'api' | 'billing' | 'danger';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'team', label: 'Team & Roles', icon: Users },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

// ─── Toggle Component ───────────────────────────────────────

function Toggle({ enabled, onChange, label, desc }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        {desc && <p className="text-xs text-text-muted mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!enabled)}
        className={cn('w-11 h-6 rounded-full transition-all relative shrink-0',
          enabled ? 'bg-atlas-500' : 'bg-slate-100')}>
        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
          enabled ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    email_bookings: true, email_leads: true, email_alerts: true, email_digest: true,
    push_bookings: true, push_leads: false, push_alerts: true,
    in_app_all: true,
    sms_urgent: false,
  });

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const mockApiKey = 'ta_live_sk_7f8e3a2b1c9d4e5f6a7b8c9d0e1f2a3b';

  const copyKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-text-primary mb-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-text-muted" /> Settings
        </h1>
        <p className="text-sm text-text-muted mb-8">Manage your account, preferences, and team.</p>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all',
                  tab === t.id
                    ? 'bg-atlas-500/10 text-atlas-400'
                    : t.id === 'danger' ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/5' : 'text-text-muted hover:text-text-secondary hover:bg-slate-50'
                )}>
                <t.icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="animate-fade-in" key={tab}>
            {/* ── Profile ── */}
            {tab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="font-display font-semibold text-text-primary mb-4">Personal Information</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-xl font-bold text-atlas-400">
                      MT
                    </div>
                    <div>
                      <Button variant="secondary" size="sm">Change Photo</Button>
                      <p className="text-[10px] text-text-muted mt-1">JPG, PNG · Max 5MB</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: 'Marcus Thompson' },
                      { label: 'Email', value: 'marcus@gaya.app' },
                      { label: 'Phone', value: '+1 (416) 555-0123' },
                      { label: 'Timezone', value: 'America/Toronto (EST)' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs text-text-muted mb-1">{field.label}</label>
                        <div className="px-3 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-sm text-text-primary">
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button size="sm">Save Changes</Button>
                  </div>
                </Card>

                <Card>
                  <h2 className="font-display font-semibold text-text-primary mb-4">Organization</h2>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/40 border border-white/60">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                      TA
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">Gaya</p>
                      <p className="text-xs text-text-muted">Pro Plan · 5 seats used</p>
                    </div>
                    <Badge variant="premium">Superadmin</Badge>
                  </div>
                </Card>

                <Card>
                  <h2 className="font-display font-semibold text-text-primary mb-4">Appearance</h2>
                  <div className="flex gap-3">
                    {[
                      { label: 'Dark', icon: Moon, active: true },
                      { label: 'Light', icon: Sun, active: false },
                      { label: 'System', icon: Monitor, active: false },
                    ].map(theme => (
                      <button key={theme.label}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm',
                          theme.active
                            ? 'bg-atlas-500/10 border-atlas-500/20 text-atlas-400'
                            : 'bg-slate-100/50 border-slate-200 text-text-muted hover:text-text-secondary'
                        )}>
                        <theme.icon className="w-4 h-4" />
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Notifications ── */}
            {tab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <h2 className="font-display font-semibold text-text-primary">Email Notifications</h2>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    <Toggle label="New Bookings" desc="When an athlete books your event" enabled={notifSettings.email_bookings} onChange={() => toggleNotif('email_bookings')} />
                    <Toggle label="New Leads" desc="When a parent submits an inquiry" enabled={notifSettings.email_leads} onChange={() => toggleNotif('email_leads')} />
                    <Toggle label="Alerts & Warnings" desc="Capacity alerts, system updates" enabled={notifSettings.email_alerts} onChange={() => toggleNotif('email_alerts')} />
                    <Toggle label="Weekly Digest" desc="Summary of zone activity and metrics" enabled={notifSettings.email_digest} onChange={() => toggleNotif('email_digest')} />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="w-4 h-4 text-text-muted" />
                    <h2 className="font-display font-semibold text-text-primary">Push Notifications</h2>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    <Toggle label="Bookings" enabled={notifSettings.push_bookings} onChange={() => toggleNotif('push_bookings')} />
                    <Toggle label="Leads" enabled={notifSettings.push_leads} onChange={() => toggleNotif('push_leads')} />
                    <Toggle label="Critical Alerts" enabled={notifSettings.push_alerts} onChange={() => toggleNotif('push_alerts')} />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-text-muted" />
                    <h2 className="font-display font-semibold text-text-primary">Other</h2>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    <Toggle label="In-App Notifications" desc="Show notification bell and badges" enabled={notifSettings.in_app_all} onChange={() => toggleNotif('in_app_all')} />
                    <Toggle label="SMS for Urgent Alerts" desc="Only sent for critical issues" enabled={notifSettings.sms_urgent} onChange={() => toggleNotif('sms_urgent')} />
                  </div>
                </Card>
              </div>
            )}

            {/* ── Team ── */}
            {tab === 'team' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-text-primary">Team Members</h2>
                    <Button size="sm"><Users className="w-3.5 h-3.5" /> Invite</Button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Marcus Thompson', email: 'marcus@gaya.app', role: 'Superadmin', status: 'active' },
                      { name: 'Sarah Chen', email: 'sarah@gaya.app', role: 'Org Admin', status: 'active' },
                      { name: 'David Okafor', email: 'david@gmail.com', role: 'Coach', status: 'active' },
                      { name: 'Pending Invite', email: 'alex@example.com', role: 'Coach', status: 'pending' },
                    ].map(member => (
                      <div key={member.email} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-atlas-400">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{member.name}</p>
                          <p className="text-xs text-text-muted">{member.email}</p>
                        </div>
                        <Badge variant={
                          member.role === 'Superadmin' ? 'premium' :
                          member.role === 'Org Admin' ? 'info' : 'default'
                        } size="sm">{member.role}</Badge>
                        {member.status === 'pending' && <Badge variant="warning" size="sm">Pending</Badge>}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── API Keys ── */}
            {tab === 'api' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="font-display font-semibold text-text-primary mb-2">API Access</h2>
                  <p className="text-xs text-text-muted mb-4">
                    Use the Gaya API to integrate intelligence data into your own tools.
                  </p>

                  <div className="p-4 rounded-xl bg-white/40 border border-white/60 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-text-secondary">Live API Key</span>
                      <Badge variant="success" size="sm" dot>Active</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-text-primary bg-slate-100/50 px-3 py-2 rounded-lg overflow-hidden">
                        {showKey ? mockApiKey : '••••••••••••••••••••••••••••••••••••'}
                      </code>
                      <button onClick={() => setShowKey(!showKey)}
                        className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all">
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={copyKey}
                        className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all">
                        {copied ? <Check className="w-4 h-4 text-atlas-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted mt-2">Created Feb 1, 2026 · Last used 2 hours ago</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary"><Key className="w-3.5 h-3.5" /> Regenerate</Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-3.5 h-3.5" /> API Docs
                    </Button>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Usage (This Month)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'API Calls', value: '12,847', max: '50,000' },
                      { label: 'Data Points', value: '3.2M', max: '10M' },
                      { label: 'Webhooks', value: '284', max: '1,000' },
                    ].map(u => (
                      <div key={u.label} className="p-3 rounded-lg bg-white/40 border border-white/60 text-center">
                        <p className="text-sm font-display font-bold text-text-primary">{u.value}</p>
                        <p className="text-[10px] text-text-muted">of {u.max}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{u.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Billing ── */}
            {tab === 'billing' && (
              <div className="space-y-6">
                <Card className="!border-atlas-500/15">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display font-semibold text-text-primary">Pro Plan</h2>
                      <p className="text-xs text-text-muted">$99/month · 5 seats · All features</p>
                    </div>
                    <Badge variant="premium">Current Plan</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Unlimited Reports', 'AI Insights', 'API Access', 'Priority Support'].map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-atlas-400">
                        <Check className="w-3 h-3" /> {f}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Payment Method</h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
                    <CreditCard className="w-5 h-5 text-text-muted" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">Visa ending in 4242</p>
                      <p className="text-xs text-text-muted">Expires 12/27</p>
                    </div>
                    <Button variant="ghost" size="sm">Update</Button>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Danger Zone ── */}
            {tab === 'danger' && (
              <div className="space-y-4">
                <Card className="!border-red-500/15">
                  <h2 className="font-display font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Danger Zone
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Export All Data</p>
                        <p className="text-xs text-text-muted">Download a ZIP of all your data</p>
                      </div>
                      <Button variant="secondary" size="sm"><Download className="w-3.5 h-3.5" /> Export</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Delete Organization</p>
                        <p className="text-xs text-text-muted">Permanently remove all data. This cannot be undone.</p>
                      </div>
                      <Button variant="danger" size="sm"><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
