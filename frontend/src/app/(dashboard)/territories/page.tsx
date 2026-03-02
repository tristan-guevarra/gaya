/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Territory Manager
   Geographic territory assignment with franchise zones, coach
   allocation, performance metrics, exclusivity, and territory
   expansion planning.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Map, MapPin, Users, DollarSign, TrendingUp, Shield,
  Layers, Target, AlertTriangle, CheckCircle, Clock,
  ChevronRight, Plus, Eye, Lock, Unlock, BarChart3,
  ArrowUpRight, Star, Zap, Crown, Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface Territory {
  id: string;
  name: string;
  type: 'exclusive' | 'shared' | 'open';
  owner: string;
  ownerAvatar: string;
  coaches: number;
  events: number;
  population: string;
  revenue: number;
  penetration: number;
  performance: number;
  status: 'active' | 'expanding' | 'new' | 'saturated';
  color: string;
  zones: string[];
  athletes: number;
  growthRate: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const territories: Territory[] = [
  {
    id: 't1', name: 'Scarborough East', type: 'exclusive', owner: 'Marcus Thompson',
    ownerAvatar: 'MT', coaches: 4, events: 12, population: '142K', revenue: 18400,
    penetration: 8.4, performance: 94, status: 'active', color: 'bg-atlas-500/30 border-atlas-500/50',
    zones: ['E01', 'E02', 'E03', 'E04'], athletes: 180, growthRate: 12.4,
  },
  {
    id: 't2', name: 'North York Central', type: 'shared', owner: 'Sarah Chen',
    ownerAvatar: 'SC', coaches: 3, events: 8, population: '198K', revenue: 12800,
    penetration: 5.2, performance: 82, status: 'expanding', color: 'bg-blue-500/30 border-blue-500/50',
    zones: ['N01', 'N02', 'N03'], athletes: 120, growthRate: 18.6,
  },
  {
    id: 't3', name: 'Ajax-Pickering', type: 'exclusive', owner: 'David Park',
    ownerAvatar: 'DP', coaches: 2, events: 6, population: '86K', revenue: 7200,
    penetration: 4.8, performance: 76, status: 'new', color: 'bg-purple-500/30 border-purple-500/50',
    zones: ['A01', 'A02'], athletes: 64, growthRate: 24.2,
  },
  {
    id: 't4', name: 'Etobicoke', type: 'exclusive', owner: 'Aisha Okafor',
    ownerAvatar: 'AO', coaches: 3, events: 10, population: '165K', revenue: 14600,
    penetration: 6.1, performance: 88, status: 'active', color: 'bg-green-500/30 border-green-500/50',
    zones: ['W01', 'W02', 'W03'], athletes: 142, growthRate: 8.7,
  },
  {
    id: 't5', name: 'Brampton South', type: 'open', owner: 'Unassigned',
    ownerAvatar: '??', coaches: 1, events: 2, population: '124K', revenue: 2400,
    penetration: 1.2, performance: 45, status: 'new', color: 'bg-amber-500/30 border-amber-500/50',
    zones: ['B01', 'B02'], athletes: 18, growthRate: 42.8,
  },
  {
    id: 't6', name: 'Mississauga West', type: 'open', owner: 'Unassigned',
    ownerAvatar: '??', coaches: 0, events: 0, population: '178K', revenue: 0,
    penetration: 0, performance: 0, status: 'new', color: 'bg-red-500/30 border-red-500/50',
    zones: ['M01', 'M02', 'M03'], athletes: 0, growthRate: 0,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  exclusive: { label: 'Exclusive', icon: Lock, color: 'text-purple-400 bg-purple-500/10' },
  shared: { label: 'Shared', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
  open: { label: 'Open', icon: Unlock, color: 'text-green-400 bg-green-500/10' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-400' },
  expanding: { label: 'Expanding', color: 'bg-atlas-500/10 text-atlas-400' },
  new: { label: 'New', color: 'bg-amber-500/10 text-amber-400' },
  saturated: { label: 'Saturated', color: 'bg-red-500/10 text-red-400' },
};

// ─── Page ───────────────────────────────────────────────────────────

export default function TerritoryPage() {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory>(territories[0]);

  const totalRevenue = territories.reduce((s, t) => s + t.revenue, 0);
  const totalAthletes = territories.reduce((s, t) => s + t.athletes, 0);
  const assignedTerritories = territories.filter(t => t.owner !== 'Unassigned').length;

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Map className="w-5 h-5 text-indigo-400" /> Territory Manager
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Geographic territory assignment and franchise management</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400">
              <Plus className="w-3.5 h-3.5" /> Create Territory
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Territories', value: territories.length.toString(), icon: Map, color: 'text-indigo-400' },
            { label: 'Assigned', value: `${assignedTerritories}/${territories.length}`, icon: Shield, color: 'text-purple-400' },
            { label: 'Total Athletes', value: totalAthletes.toLocaleString(), icon: Users, color: 'text-atlas-400' },
            { label: 'Monthly Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: 'text-green-400' },
            { label: 'Open Territories', value: territories.filter(t => t.type === 'open').length.toString(), icon: Maximize, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
              <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Territory List */}
          <div className="col-span-5 space-y-2">
            {territories.map(t => {
              const type = typeConfig[t.type];
              const status = statusConfig[t.status];
              const TypeIcon = type.icon;
              return (
                <button key={t.id} onClick={() => setSelectedTerritory(t)}
                  className={cn('w-full p-4 rounded-xl border text-left transition-all',
                    selectedTerritory.id === t.id
                      ? 'bg-indigo-500/5 border-indigo-500/20'
                      : 'bg-white/60 backdrop-blur-sm border-white/60 hover:bg-white/70')}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">{t.name}</h3>
                        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-0.5', type.color)}>
                          <TypeIcon className="w-2.5 h-2.5" /> {type.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {t.owner} · {t.coaches} coaches · {t.zones.length} zones
                      </p>
                    </div>
                    <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium', status.color)}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-text-muted">
                    <span>${(t.revenue / 1000).toFixed(1)}K/mo</span>
                    <span>{t.athletes} athletes</span>
                    <span>{t.penetration}% penetration</span>
                    {t.growthRate > 0 && (
                      <span className="text-green-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> {t.growthRate}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Territory Detail */}
          <div className="col-span-7 space-y-4">
            {/* Header */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => { const t = typeConfig[selectedTerritory.type]; const T = t.icon; return <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1', t.color)}><T className="w-3 h-3" /> {t.label}</span>; })()}
                    {(() => { const s = statusConfig[selectedTerritory.status]; return <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', s.color)}>{s.label}</span>; })()}
                  </div>
                  <h2 className="text-lg font-display font-bold text-text-primary">{selectedTerritory.name}</h2>
                  <p className="text-xs text-text-muted">Population: {selectedTerritory.population} · Zones: {selectedTerritory.zones.join(', ')}</p>
                </div>
                {selectedTerritory.owner !== 'Unassigned' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-sm font-bold text-white">
                      {selectedTerritory.ownerAvatar}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary">{selectedTerritory.owner}</p>
                      <p className="text-[10px] text-text-muted">Territory Owner</p>
                    </div>
                  </div>
                ) : (
                  <button className="px-3 py-2 rounded-lg bg-indigo-500/10 text-xs text-indigo-400">
                    <Users className="w-3.5 h-3.5 inline mr-1" /> Assign Owner
                  </button>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Revenue', value: `$${(selectedTerritory.revenue / 1000).toFixed(1)}K` },
                  { label: 'Athletes', value: selectedTerritory.athletes.toString() },
                  { label: 'Coaches', value: selectedTerritory.coaches.toString() },
                  { label: 'Events', value: selectedTerritory.events.toString() },
                  { label: 'Growth', value: `${selectedTerritory.growthRate}%` },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg bg-white/40 text-center">
                    <p className="text-sm font-display font-bold text-text-primary">{m.value}</p>
                    <p className="text-[9px] text-text-muted">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Penetration & Performance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Market Penetration</h3>
                <div className="text-center mb-3">
                  <p className="text-3xl font-display font-bold text-atlas-400">{selectedTerritory.penetration}%</p>
                  <p className="text-[10px] text-text-muted">of addressable market</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-atlas-500 to-cyan-400"
                    style={{ width: `${selectedTerritory.penetration * 5}%` }} />
                </div>
                <p className="text-[10px] text-text-muted mt-2 text-center">
                  Potential: {Math.round(parseInt(selectedTerritory.population) * 0.15)}K youth athletes in zone
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Performance Score</h3>
                <div className="text-center mb-3">
                  <p className={cn('text-3xl font-display font-bold',
                    selectedTerritory.performance >= 80 ? 'text-green-400' :
                    selectedTerritory.performance >= 60 ? 'text-amber-400' : 'text-red-400'
                  )}>{selectedTerritory.performance}</p>
                  <p className="text-[10px] text-text-muted">/ 100</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full rounded-full',
                    selectedTerritory.performance >= 80 ? 'bg-green-500' :
                    selectedTerritory.performance >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  )} style={{ width: `${selectedTerritory.performance}%` }} />
                </div>
              </div>
            </div>

            {/* Territory Map Placeholder */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Territory Boundaries</h3>
              <div className="h-48 rounded-lg bg-white/30 border border-white/60 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-8 h-8 text-text-muted/20 mx-auto mb-2" />
                  <p className="text-xs text-text-muted/30">Interactive territory map</p>
                  <p className="text-[10px] text-text-muted/20">Zones: {selectedTerritory.zones.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
