/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Certification Tracker
   Coach credential management with license tracking, expiry
   alerts, compliance scoring, verification badges, and
   renewal workflows.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Shield, Award, CheckCircle, AlertTriangle, XCircle, Clock,
  FileText, Upload, Calendar, Users, Star, TrendingUp,
  Filter, Search, ChevronRight, ExternalLink, Download,
  RefreshCw, Eye, Bell, BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface Certification {
  id: string;
  name: string;
  issuer: string;
  type: 'required' | 'recommended' | 'optional';
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  expiryDate: string;
  daysLeft?: number;
  verificationUrl?: string;
}

interface Coach {
  id: string;
  name: string;
  avatar: string;
  role: string;
  complianceScore: number;
  certifications: Certification[];
  verified: boolean;
  lastAudit: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const coaches: Coach[] = [
  {
    id: 'c1', name: 'Marcus Thompson', avatar: 'MT', role: 'Elite Development Coach',
    complianceScore: 100, verified: true, lastAudit: 'Feb 28, 2025',
    certifications: [
      { id: 'cert1', name: 'Vulnerable Sector Check', issuer: 'Toronto Police', type: 'required', status: 'valid', expiryDate: 'Dec 2025', daysLeft: 274 },
      { id: 'cert2', name: 'Standard First Aid + CPR', issuer: 'Red Cross', type: 'required', status: 'valid', expiryDate: 'Aug 2026', daysLeft: 520 },
      { id: 'cert3', name: 'Canada Soccer C License', issuer: 'Canada Soccer', type: 'required', status: 'valid', expiryDate: 'Mar 2027', daysLeft: 731 },
      { id: 'cert4', name: 'NCCP Competition Development', issuer: 'CAC', type: 'recommended', status: 'valid', expiryDate: 'Jan 2026', daysLeft: 305 },
      { id: 'cert5', name: 'Concussion Protocol Training', issuer: 'Parachute Canada', type: 'required', status: 'valid', expiryDate: 'Sep 2025', daysLeft: 183 },
    ],
  },
  {
    id: 'c2', name: 'Sarah Chen', avatar: 'SC', role: 'Speed & Agility Specialist',
    complianceScore: 85, verified: true, lastAudit: 'Feb 15, 2025',
    certifications: [
      { id: 'cert6', name: 'Vulnerable Sector Check', issuer: 'Toronto Police', type: 'required', status: 'valid', expiryDate: 'Nov 2025', daysLeft: 244 },
      { id: 'cert7', name: 'Standard First Aid + CPR', issuer: 'Red Cross', type: 'required', status: 'expiring', expiryDate: 'Apr 2025', daysLeft: 28 },
      { id: 'cert8', name: 'CSCS Certification', issuer: 'NSCA', type: 'recommended', status: 'valid', expiryDate: 'Jun 2026', daysLeft: 457 },
      { id: 'cert9', name: 'Concussion Protocol Training', issuer: 'Parachute Canada', type: 'required', status: 'valid', expiryDate: 'Jul 2025', daysLeft: 122 },
    ],
  },
  {
    id: 'c3', name: 'David Park', avatar: 'DP', role: 'Youth Development Coach',
    complianceScore: 62, verified: false, lastAudit: 'Jan 20, 2025',
    certifications: [
      { id: 'cert10', name: 'Vulnerable Sector Check', issuer: 'Toronto Police', type: 'required', status: 'expired', expiryDate: 'Feb 2025', daysLeft: -5 },
      { id: 'cert11', name: 'Standard First Aid + CPR', issuer: 'Red Cross', type: 'required', status: 'valid', expiryDate: 'Oct 2025', daysLeft: 213 },
      { id: 'cert12', name: 'Canada Soccer D License', issuer: 'Canada Soccer', type: 'required', status: 'valid', expiryDate: 'May 2026', daysLeft: 426 },
      { id: 'cert13', name: 'Concussion Protocol Training', issuer: 'Parachute Canada', type: 'required', status: 'pending', expiryDate: 'N/A' },
    ],
  },
  {
    id: 'c4', name: 'Aisha Okafor', avatar: 'AO', role: 'Former Pro — Technical Coach',
    complianceScore: 92, verified: true, lastAudit: 'Feb 22, 2025',
    certifications: [
      { id: 'cert14', name: 'Vulnerable Sector Check', issuer: 'Toronto Police', type: 'required', status: 'valid', expiryDate: 'Sep 2025', daysLeft: 183 },
      { id: 'cert15', name: 'Standard First Aid + CPR', issuer: 'Red Cross', type: 'required', status: 'expiring', expiryDate: 'Apr 2025', daysLeft: 32 },
      { id: 'cert16', name: 'Canada Soccer B License', issuer: 'Canada Soccer', type: 'required', status: 'valid', expiryDate: 'Nov 2027', daysLeft: 975 },
      { id: 'cert17', name: 'NCCP Competition Development', issuer: 'CAC', type: 'recommended', status: 'valid', expiryDate: 'Aug 2026', daysLeft: 518 },
      { id: 'cert18', name: 'Concussion Protocol Training', issuer: 'Parachute Canada', type: 'required', status: 'valid', expiryDate: 'Jun 2025', daysLeft: 91 },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  valid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Valid' },
  expiring: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Expiring Soon' },
  expired: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Expired' },
  pending: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Pending' },
};

function getComplianceColor(score: number) {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

// ─── Page ───────────────────────────────────────────────────────────

export default function CertificationsPage() {
  const [selectedCoach, setSelectedCoach] = useState(coaches[0]);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired' | 'pending'>('all');

  const totalCerts = coaches.reduce((s, c) => s + c.certifications.length, 0);
  const expiringCerts = coaches.reduce((s, c) => s + c.certifications.filter(cert => cert.status === 'expiring').length, 0);
  const expiredCerts = coaches.reduce((s, c) => s + c.certifications.filter(cert => cert.status === 'expired').length, 0);
  const avgCompliance = Math.round(coaches.reduce((s, c) => s + c.complianceScore, 0) / coaches.length);

  const filteredCerts = filter === 'all' ? selectedCoach.certifications :
    selectedCoach.certifications.filter(c => c.status === filter);

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> Certification Tracker
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Coach credentials, compliance, and verification management</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
              <Upload className="w-3.5 h-3.5" /> Upload Certificate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Certifications', value: totalCerts.toString(), icon: FileText, color: 'text-blue-400' },
            { label: 'Expiring Soon', value: expiringCerts.toString(), icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'Expired', value: expiredCerts.toString(), icon: XCircle, color: 'text-red-400' },
            { label: 'Avg Compliance', value: `${avgCompliance}%`, icon: Shield, color: getComplianceColor(avgCompliance) },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
              <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Coach List */}
          <div className="col-span-4 space-y-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Coaches</h3>
            {coaches.map(coach => (
              <button key={coach.id} onClick={() => setSelectedCoach(coach)}
                className={cn('w-full p-4 rounded-xl border text-left transition-all',
                  selectedCoach.id === coach.id
                    ? 'bg-blue-500/5 border-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-white/[0.1]')}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white',
                    coach.complianceScore >= 90 ? 'from-green-400 to-emerald-400' :
                    coach.complianceScore >= 70 ? 'from-amber-400 to-yellow-400' :
                    'from-red-400 to-pink-400'
                  )}>{coach.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-text-primary">{coach.name}</p>
                      {coach.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-text-muted">{coach.role}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-display font-bold', getComplianceColor(coach.complianceScore))}>
                      {coach.complianceScore}%
                    </p>
                    <p className="text-[8px] text-text-muted">compliance</p>
                  </div>
                </div>
                {/* Cert status dots */}
                <div className="flex gap-1 mt-2">
                  {coach.certifications.map(cert => {
                    const s = statusConfig[cert.status];
                    return <div key={cert.id} className={cn('w-2 h-2 rounded-full',
                      cert.status === 'valid' ? 'bg-green-500' :
                      cert.status === 'expiring' ? 'bg-amber-500' :
                      cert.status === 'expired' ? 'bg-red-500' : 'bg-blue-500'
                    )} />;
                  })}
                </div>
              </button>
            ))}
          </div>

          {/* Cert Details */}
          <div className="col-span-8 space-y-4">
            {/* Coach Header */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white',
                    selectedCoach.complianceScore >= 90 ? 'from-green-400 to-emerald-400' :
                    selectedCoach.complianceScore >= 70 ? 'from-amber-400 to-yellow-400' : 'from-red-400 to-pink-400'
                  )}>{selectedCoach.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-display font-bold text-text-primary">{selectedCoach.name}</h2>
                      {selectedCoach.verified && <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-500/10 text-blue-400 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</span>}
                    </div>
                    <p className="text-xs text-text-muted">{selectedCoach.role} · Last audit: {selectedCoach.lastAudit}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn('text-3xl font-display font-bold', getComplianceColor(selectedCoach.complianceScore))}>
                    {selectedCoach.complianceScore}%
                  </div>
                  <p className="text-[10px] text-text-muted">Compliance</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1.5">
              {(['all', 'expiring', 'expired', 'pending'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                    filter === f ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-text-muted hover:text-text-secondary')}>
                  {f}
                </button>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              {filteredCerts.map(cert => {
                const status = statusConfig[cert.status];
                const StatusIcon = status.icon;
                return (
                  <div key={cert.id} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', status.bg)}>
                          <StatusIcon className={cn('w-5 h-5', status.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-xs font-semibold text-text-primary">{cert.name}</h4>
                            <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium',
                              cert.type === 'required' ? 'bg-red-500/10 text-red-400' :
                              cert.type === 'recommended' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-slate-50 text-text-muted'
                            )}>{cert.type}</span>
                          </div>
                          <p className="text-[10px] text-text-muted">Issued by: {cert.issuer}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Expires: {cert.expiryDate}
                            </span>
                            {cert.daysLeft !== undefined && (
                              <span className={cn('text-[10px] font-medium',
                                cert.daysLeft > 90 ? 'text-green-400' :
                                cert.daysLeft > 30 ? 'text-amber-400' : 'text-red-400'
                              )}>
                                {cert.daysLeft > 0 ? `${cert.daysLeft} days left` : `${Math.abs(cert.daysLeft)} days overdue`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {cert.status === 'expired' && (
                          <button className="px-2.5 py-1 rounded-lg bg-red-500/10 text-[10px] text-red-400 font-medium">Renew Now</button>
                        )}
                        {cert.status === 'expiring' && (
                          <button className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-[10px] text-amber-400 font-medium">
                            <Bell className="w-3 h-3 inline mr-0.5" /> Remind
                          </button>
                        )}
                        <button className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] text-text-muted">
                          <Eye className="w-3 h-3 inline mr-0.5" /> View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
