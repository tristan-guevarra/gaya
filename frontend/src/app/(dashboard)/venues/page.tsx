/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Venue Intelligence
   Facility management with field quality scoring, booking
   optimization, capacity analytics, weather impact, and
   maintenance scheduling. Maps all training venues.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  MapPin, Star, Users, Clock, Sun, CloudRain, Wind, Thermometer,
  Shield, CheckCircle, AlertTriangle, Calendar, DollarSign,
  TrendingUp, Eye, Camera, Wrench, Zap, BarChart3, Layers,
  ChevronRight, Filter, Search, Plus, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface Venue {
  id: string;
  name: string;
  type: 'outdoor' | 'indoor' | 'turf' | 'hybrid';
  address: string;
  zone: string;
  rating: number;
  qualityScore: number;
  fields: number;
  capacity: number;
  utilizationRate: number;
  weeklyBookings: number;
  revenue: number;
  amenities: string[];
  surfaceType: string;
  lighting: boolean;
  parking: number;
  status: 'excellent' | 'good' | 'fair' | 'maintenance';
  nextMaintenance: string;
  weather: { temp: number; condition: string; wind: number; impact: 'none' | 'low' | 'moderate' | 'high' };
  peakHours: string;
  coaches: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const venues: Venue[] = [
  {
    id: 'v1', name: 'Scarborough Sportsplex', type: 'hybrid', address: '1030 Birchmount Rd',
    zone: 'Scarborough East', rating: 4.8, qualityScore: 92, fields: 4, capacity: 200,
    utilizationRate: 87, weeklyBookings: 34, revenue: 12400, amenities: ['Washrooms', 'Parking', 'Lighting', 'Water', 'First Aid'],
    surfaceType: 'Premium Turf + Natural Grass', lighting: true, parking: 120, status: 'excellent',
    nextMaintenance: 'Apr 15', weather: { temp: 14, condition: 'Sunny', wind: 12, impact: 'none' },
    peakHours: '4-7 PM Weekdays', coaches: 8,
  },
  {
    id: 'v2', name: 'North York Community Fields', type: 'outdoor', address: '5 Sheppard Ave E',
    zone: 'North York Central', rating: 4.3, qualityScore: 78, fields: 3, capacity: 150,
    utilizationRate: 72, weeklyBookings: 22, revenue: 7800, amenities: ['Washrooms', 'Parking', 'Water'],
    surfaceType: 'Natural Grass', lighting: false, parking: 60, status: 'good',
    nextMaintenance: 'Mar 28', weather: { temp: 12, condition: 'Cloudy', wind: 18, impact: 'low' },
    peakHours: '10 AM - 2 PM Weekends', coaches: 5,
  },
  {
    id: 'v3', name: 'Ajax Indoor Soccer Centre', type: 'indoor', address: '100 Westney Rd S',
    zone: 'Ajax', rating: 4.6, qualityScore: 85, fields: 2, capacity: 80,
    utilizationRate: 94, weeklyBookings: 42, revenue: 15200, amenities: ['Washrooms', 'Parking', 'Lighting', 'Concession', 'Change Rooms', 'Viewing Area'],
    surfaceType: 'Indoor Turf', lighting: true, parking: 80, status: 'excellent',
    nextMaintenance: 'May 1', weather: { temp: 21, condition: 'Indoor', wind: 0, impact: 'none' },
    peakHours: '5-9 PM Daily', coaches: 6,
  },
  {
    id: 'v4', name: 'Brampton Heritage Park', type: 'outdoor', address: '45 Main St S',
    zone: 'Brampton South', rating: 3.9, qualityScore: 64, fields: 2, capacity: 100,
    utilizationRate: 51, weeklyBookings: 12, revenue: 3200, amenities: ['Parking', 'Water'],
    surfaceType: 'Natural Grass (worn)', lighting: false, parking: 40, status: 'fair',
    nextMaintenance: 'Mar 20', weather: { temp: 11, condition: 'Rainy', wind: 25, impact: 'high' },
    peakHours: '9-11 AM Saturdays', coaches: 2,
  },
  {
    id: 'v5', name: 'Etobicoke Training Dome', type: 'indoor', address: '200 The East Mall',
    zone: 'Etobicoke', rating: 4.7, qualityScore: 88, fields: 3, capacity: 120,
    utilizationRate: 81, weeklyBookings: 28, revenue: 10600, amenities: ['Washrooms', 'Parking', 'Lighting', 'Pro Shop', 'Physio Room', 'Video Analysis'],
    surfaceType: 'FIFA Quality Pro Turf', lighting: true, parking: 100, status: 'good',
    nextMaintenance: 'Apr 5', weather: { temp: 20, condition: 'Indoor', wind: 0, impact: 'none' },
    peakHours: '3-8 PM Weekdays', coaches: 7,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

function getQualityColor(score: number) {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-atlas-400';
  if (score >= 55) return 'text-amber-400';
  return 'text-red-400';
}

function getStatusConfig(s: string) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    excellent: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Excellent' },
    good: { color: 'text-atlas-400', bg: 'bg-atlas-500/10', label: 'Good' },
    fair: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Fair' },
    maintenance: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Maintenance' },
  };
  return map[s] || map.good;
}

function getWeatherIcon(condition: string) {
  if (condition === 'Sunny' || condition === 'Indoor') return Sun;
  if (condition === 'Rainy') return CloudRain;
  return Wind;
}

// ─── Page ───────────────────────────────────────────────────────────

export default function VenuesPage() {
  const [selectedVenue, setSelectedVenue] = useState<Venue>(venues[0]);
  const [filter, setFilter] = useState<'all' | 'indoor' | 'outdoor' | 'turf' | 'hybrid'>('all');

  const filtered = filter === 'all' ? venues : venues.filter(v => v.type === filter);
  const totalRevenue = venues.reduce((s, v) => s + v.revenue, 0);
  const avgUtilization = Math.round(venues.reduce((s, v) => s + v.utilizationRate, 0) / venues.length);

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" /> Venue Intelligence
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Facility quality, booking optimization, and capacity analytics</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <Plus className="w-3.5 h-3.5" /> Add Venue
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Venues', value: venues.length.toString(), icon: MapPin, color: 'text-emerald-400' },
            { label: 'Total Fields', value: venues.reduce((s, v) => s + v.fields, 0).toString(), icon: Layers, color: 'text-atlas-400' },
            { label: 'Weekly Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: 'text-green-400' },
            { label: 'Avg Utilization', value: `${avgUtilization}%`, icon: BarChart3, color: 'text-amber-400' },
            { label: 'Active Coaches', value: venues.reduce((s, v) => s + v.coaches, 0).toString(), icon: Users, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
              <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-4">
          {(['all', 'indoor', 'outdoor', 'turf', 'hybrid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filter === f ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-text-muted hover:text-text-secondary')}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Venue List */}
          <div className="col-span-5 space-y-2">
            {filtered.map(venue => {
              const status = getStatusConfig(venue.status);
              const WeatherIcon = getWeatherIcon(venue.weather.condition);
              return (
                <button key={venue.id} onClick={() => setSelectedVenue(venue)}
                  className={cn('w-full p-4 rounded-xl border text-left transition-all',
                    selectedVenue.id === venue.id
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-white/[0.1]')}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">{venue.name}</h3>
                        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium capitalize', status.bg, status.color)}>{status.label}</span>
                      </div>
                      <p className="text-[10px] text-text-muted">{venue.address} · {venue.zone}</p>
                    </div>
                    <div className={cn('text-lg font-display font-bold', getQualityColor(venue.qualityScore))}>
                      {venue.qualityScore}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{venue.rating}</span>
                    <span>{venue.fields} fields</span>
                    <span>{venue.utilizationRate}% utilized</span>
                    <span className="flex items-center gap-0.5"><WeatherIcon className="w-3 h-3" />{venue.weather.temp}°C</span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-50">{venue.type}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Venue Detail */}
          <div className="col-span-7 space-y-4">
            {/* Header Card */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium capitalize',
                      selectedVenue.type === 'indoor' ? 'bg-blue-500/10 text-blue-400' :
                      selectedVenue.type === 'outdoor' ? 'bg-green-500/10 text-green-400' :
                      selectedVenue.type === 'turf' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-purple-500/10 text-purple-400'
                    )}>{selectedVenue.type}</span>
                    {(() => { const s = getStatusConfig(selectedVenue.status); return <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', s.bg, s.color)}>{s.label}</span>; })()}
                  </div>
                  <h2 className="text-lg font-display font-bold text-text-primary">{selectedVenue.name}</h2>
                  <p className="text-xs text-text-muted">{selectedVenue.address} · {selectedVenue.zone}</p>
                </div>
                <div className="text-center">
                  <div className={cn('text-4xl font-display font-bold', getQualityColor(selectedVenue.qualityScore))}>
                    {selectedVenue.qualityScore}
                  </div>
                  <p className="text-[10px] text-text-muted">Quality Score</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Utilization', value: `${selectedVenue.utilizationRate}%`, icon: BarChart3 },
                  { label: 'Weekly Bookings', value: selectedVenue.weeklyBookings.toString(), icon: Calendar },
                  { label: 'Revenue/Week', value: `$${(selectedVenue.revenue / 1000).toFixed(1)}K`, icon: DollarSign },
                  { label: 'Active Coaches', value: selectedVenue.coaches.toString(), icon: Users },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg bg-white/40 text-center">
                    <m.icon className="w-4 h-4 text-text-muted mx-auto mb-1" />
                    <p className="text-sm font-display font-bold text-text-primary">{m.value}</p>
                    <p className="text-[9px] text-text-muted">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Facility Details */}
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Facility Details</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Fields', value: selectedVenue.fields.toString() },
                    { label: 'Capacity', value: `${selectedVenue.capacity} athletes` },
                    { label: 'Surface', value: selectedVenue.surfaceType },
                    { label: 'Lighting', value: selectedVenue.lighting ? '✅ Floodlights' : '❌ None' },
                    { label: 'Parking', value: `${selectedVenue.parking} spots` },
                    { label: 'Peak Hours', value: selectedVenue.peakHours },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted">{d.label}</span>
                      <span className="text-[10px] text-text-primary font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather + Maintenance */}
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Current Conditions</h3>
                <div className="flex items-center gap-3 mb-3">
                  {(() => { const W = getWeatherIcon(selectedVenue.weather.condition); return <W className="w-8 h-8 text-amber-400" />; })()}
                  <div>
                    <p className="text-lg font-display font-bold text-text-primary">{selectedVenue.weather.temp}°C</p>
                    <p className="text-[10px] text-text-muted">{selectedVenue.weather.condition} · Wind {selectedVenue.weather.wind} km/h</p>
                  </div>
                  <span className={cn('ml-auto px-2 py-0.5 rounded text-[10px] font-medium',
                    selectedVenue.weather.impact === 'none' ? 'bg-green-500/10 text-green-400' :
                    selectedVenue.weather.impact === 'low' ? 'bg-atlas-500/10 text-atlas-400' :
                    selectedVenue.weather.impact === 'moderate' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  )}>
                    {selectedVenue.weather.impact} impact
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-[10px] text-text-muted">Next Maintenance</span>
                    </div>
                    <span className="text-[10px] text-text-primary font-medium">{selectedVenue.nextMaintenance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedVenue.amenities.map(a => (
                  <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] text-text-secondary">
                    <CheckCircle className="w-3 h-3 text-green-400" /> {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Utilization Heatmap (simplified) */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Weekly Utilization Heatmap</h3>
              <div className="grid grid-cols-8 gap-1 text-center">
                <div className="text-[8px] text-text-muted/50" />
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-[8px] text-text-muted py-1">{d}</div>
                ))}
                {['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'].map(time => (
                  <>
                    <div key={time} className="text-[8px] text-text-muted py-1">{time}</div>
                    {Array.from({ length: 7 }).map((_, d) => {
                      const intensity = Math.random();
                      return (
                        <div key={`${time}-${d}`} className={cn('h-5 rounded-sm',
                          intensity > 0.8 ? 'bg-emerald-500/60' :
                          intensity > 0.6 ? 'bg-emerald-500/40' :
                          intensity > 0.4 ? 'bg-emerald-500/20' :
                          intensity > 0.2 ? 'bg-emerald-500/10' : 'bg-slate-50'
                        )} />
                      );
                    })}
                  </>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <span className="text-[8px] text-text-muted">Empty</span>
                {[0.03, 0.1, 0.2, 0.4, 0.6].map((op, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(16, 185, 129, ${op + 0.1})` }} />
                ))}
                <span className="text-[8px] text-text-muted">Full</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
