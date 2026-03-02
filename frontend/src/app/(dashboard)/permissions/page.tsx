/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Permissions Matrix
   Granular RBAC with custom role builder, permission visualization
   grid, role comparison, and user assignment.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Shield, Users, Lock, Unlock, Eye, Edit, Trash2, Plus,
  CheckCircle, XCircle, Minus, Settings, ChevronRight,
  Crown, Star, UserCog, AlertTriangle, Copy, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Permission = 'full' | 'read' | 'none';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ElementType;
  userCount: number;
  isSystem: boolean;
  permissions: Record<string, Permission>;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const permissionCategories = [
  {
    name: 'Dashboard', permissions: [
      { key: 'dashboard.view', label: 'View Dashboard' },
      { key: 'dashboard.analytics', label: 'View Analytics' },
      { key: 'dashboard.export', label: 'Export Data' },
    ]
  },
  {
    name: 'Events', permissions: [
      { key: 'events.view', label: 'View Events' },
      { key: 'events.create', label: 'Create Events' },
      { key: 'events.edit', label: 'Edit Events' },
      { key: 'events.delete', label: 'Delete Events' },
      { key: 'events.pricing', label: 'Set Pricing' },
    ]
  },
  {
    name: 'Coaches', permissions: [
      { key: 'coaches.view', label: 'View Coaches' },
      { key: 'coaches.manage', label: 'Manage Coaches' },
      { key: 'coaches.certifications', label: 'View Certifications' },
      { key: 'coaches.payroll', label: 'View Payroll' },
    ]
  },
  {
    name: 'Leads & CRM', permissions: [
      { key: 'leads.view', label: 'View Leads' },
      { key: 'leads.manage', label: 'Manage Leads' },
      { key: 'leads.export', label: 'Export Leads' },
    ]
  },
  {
    name: 'Intelligence', permissions: [
      { key: 'intel.zones', label: 'Zone Intelligence' },
      { key: 'intel.expansion', label: 'Expansion Recs' },
      { key: 'intel.competitive', label: 'Competitive Intel' },
      { key: 'intel.financials', label: 'Financial Modeling' },
    ]
  },
  {
    name: 'Administration', permissions: [
      { key: 'admin.users', label: 'Manage Users' },
      { key: 'admin.roles', label: 'Manage Roles' },
      { key: 'admin.billing', label: 'Billing & Plans' },
      { key: 'admin.audit', label: 'Audit Logs' },
      { key: 'admin.feature_flags', label: 'Feature Flags' },
    ]
  },
];

const roles: Role[] = [
  {
    id: 'r1', name: 'Super Admin', description: 'Full platform access', color: 'text-red-400',
    icon: Crown, userCount: 2, isSystem: true,
    permissions: Object.fromEntries(permissionCategories.flatMap(c => c.permissions.map(p => [p.key, 'full' as Permission]))),
  },
  {
    id: 'r2', name: 'Org Admin', description: 'Organization-level management', color: 'text-purple-400',
    icon: Shield, userCount: 4, isSystem: true,
    permissions: {
      'dashboard.view': 'full', 'dashboard.analytics': 'full', 'dashboard.export': 'full',
      'events.view': 'full', 'events.create': 'full', 'events.edit': 'full', 'events.delete': 'full', 'events.pricing': 'full',
      'coaches.view': 'full', 'coaches.manage': 'full', 'coaches.certifications': 'full', 'coaches.payroll': 'full',
      'leads.view': 'full', 'leads.manage': 'full', 'leads.export': 'full',
      'intel.zones': 'full', 'intel.expansion': 'full', 'intel.competitive': 'read', 'intel.financials': 'full',
      'admin.users': 'full', 'admin.roles': 'read', 'admin.billing': 'full', 'admin.audit': 'read', 'admin.feature_flags': 'none',
    },
  },
  {
    id: 'r3', name: 'Coach', description: 'Coach-level access', color: 'text-atlas-400',
    icon: Star, userCount: 12, isSystem: true,
    permissions: {
      'dashboard.view': 'read', 'dashboard.analytics': 'read', 'dashboard.export': 'none',
      'events.view': 'full', 'events.create': 'full', 'events.edit': 'full', 'events.delete': 'none', 'events.pricing': 'read',
      'coaches.view': 'read', 'coaches.manage': 'none', 'coaches.certifications': 'read', 'coaches.payroll': 'none',
      'leads.view': 'read', 'leads.manage': 'read', 'leads.export': 'none',
      'intel.zones': 'read', 'intel.expansion': 'none', 'intel.competitive': 'none', 'intel.financials': 'none',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.billing': 'none', 'admin.audit': 'none', 'admin.feature_flags': 'none',
    },
  },
  {
    id: 'r4', name: 'Viewer', description: 'Read-only access', color: 'text-text-muted',
    icon: Eye, userCount: 8, isSystem: false,
    permissions: {
      'dashboard.view': 'read', 'dashboard.analytics': 'read', 'dashboard.export': 'none',
      'events.view': 'read', 'events.create': 'none', 'events.edit': 'none', 'events.delete': 'none', 'events.pricing': 'none',
      'coaches.view': 'read', 'coaches.manage': 'none', 'coaches.certifications': 'none', 'coaches.payroll': 'none',
      'leads.view': 'read', 'leads.manage': 'none', 'leads.export': 'none',
      'intel.zones': 'read', 'intel.expansion': 'none', 'intel.competitive': 'none', 'intel.financials': 'none',
      'admin.users': 'none', 'admin.roles': 'none', 'admin.billing': 'none', 'admin.audit': 'none', 'admin.feature_flags': 'none',
    },
  },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" /> Permissions Matrix
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Role-based access control and permission management</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400">
              <Plus className="w-3.5 h-3.5" /> Create Role
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Role Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {roles.map(role => (
            <button key={role.id} onClick={() => setSelectedRole(role)}
              className={cn('p-4 rounded-xl border text-left transition-all',
                selectedRole.id === role.id
                  ? 'bg-purple-500/5 border-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-white/[0.1]')}>
              <div className="flex items-center gap-2 mb-2">
                <role.icon className={cn('w-4 h-4', role.color)} />
                <span className="text-xs font-semibold text-text-primary">{role.name}</span>
                {role.isSystem && <Lock className="w-3 h-3 text-text-muted/30" />}
              </div>
              <p className="text-[10px] text-text-muted mb-2">{role.description}</p>
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-text-muted" />
                <span className="text-[10px] text-text-muted">{role.userCount} users</span>
              </div>
            </button>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
          {/* Header */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="w-56 shrink-0 px-4 py-3 text-xs font-semibold text-text-muted">Permission</div>
            {roles.map(r => (
              <div key={r.id} className={cn('flex-1 px-3 py-3 text-center border-l border-slate-200',
                selectedRole.id === r.id && 'bg-purple-500/5')}>
                <span className={cn('text-xs font-medium', r.color)}>{r.name}</span>
              </div>
            ))}
          </div>

          {/* Categories + Permissions */}
          {permissionCategories.map(cat => (
            <div key={cat.name}>
              {/* Category Header */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <div className="w-56 shrink-0 px-4 py-2">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{cat.name}</span>
                </div>
                {roles.map(r => (
                  <div key={r.id} className="flex-1 border-l border-slate-200" />
                ))}
              </div>

              {/* Permission Rows */}
              {cat.permissions.map(perm => (
                <div key={perm.key} className="flex border-b border-white/[0.03] hover:bg-slate-50">
                  <div className="w-56 shrink-0 px-4 py-2.5 flex items-center gap-2">
                    <span className="text-[11px] text-text-secondary">{perm.label}</span>
                  </div>
                  {roles.map(r => {
                    const p = r.permissions[perm.key] || 'none';
                    return (
                      <div key={r.id} className={cn('flex-1 flex items-center justify-center border-l border-slate-200 py-2.5',
                        selectedRole.id === r.id && 'bg-purple-500/5')}>
                        {p === 'full' ? (
                          <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          </div>
                        ) : p === 'read' ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                            <Minus className="w-3.5 h-3.5 text-text-muted/20" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 justify-center">
          {[
            { icon: CheckCircle, label: 'Full Access', color: 'text-green-400' },
            { icon: Eye, label: 'Read Only', color: 'text-amber-400' },
            { icon: Minus, label: 'No Access', color: 'text-text-muted/30' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <l.icon className={cn('w-3.5 h-3.5', l.color)} /> {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
