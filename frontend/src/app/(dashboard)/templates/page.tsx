/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Event Templates
   Reusable event blueprints with one-click duplication, template
   library, usage stats, and AI-suggested configurations.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Copy, Calendar, Users, DollarSign, Clock, MapPin,
  Star, Plus, Search, Filter, Tag, BarChart3,
  ChevronRight, CheckCircle, Sparkles, Zap, Edit,
  Trash2, Eye, Heart, TrendingUp, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'camp' | 'clinic' | 'private' | 'tournament';
  ageRange: string;
  level: string;
  duration: string;
  capacity: number;
  price: number;
  timesUsed: number;
  avgFillRate: number;
  avgRevenue: number;
  lastUsed: string;
  createdBy: string;
  tags: string[];
  isFavorite: boolean;
  isAISuggested: boolean;
  schedule: { day: string; time: string }[];
}

// ─── Mock Data ──────────────────────────────────────────────────────

const templates: Template[] = [
  {
    id: 't1', name: 'Elite Skills Camp', description: '4-day intensive camp focused on technical development and game intelligence',
    type: 'camp', ageRange: '11-14', level: 'Advanced', duration: '4 days',
    capacity: 24, price: 299, timesUsed: 12, avgFillRate: 94, avgRevenue: 6742,
    lastUsed: 'Mar 1', createdBy: 'Marcus T.', tags: ['summer', 'technical', 'elite'],
    isFavorite: true, isAISuggested: false,
    schedule: [{ day: 'Mon-Thu', time: '9 AM - 1 PM' }],
  },
  {
    id: 't2', name: 'Speed & Agility Clinic', description: '2-week clinic series for speed and footwork development',
    type: 'clinic', ageRange: '9-13', level: 'Intermediate', duration: '2 weeks',
    capacity: 16, price: 89, timesUsed: 8, avgFillRate: 88, avgRevenue: 1251,
    lastUsed: 'Feb 20', createdBy: 'Sarah C.', tags: ['speed', 'agility', 'fitness'],
    isFavorite: false, isAISuggested: false,
    schedule: [{ day: 'Tue & Thu', time: '5 - 6:30 PM' }],
  },
  {
    id: 't3', name: 'GK Masterclass', description: 'Specialized goalkeeper training for aspiring keepers',
    type: 'clinic', ageRange: '10-16', level: 'All Levels', duration: '6 weeks',
    capacity: 12, price: 79, timesUsed: 5, avgFillRate: 92, avgRevenue: 873,
    lastUsed: 'Feb 10', createdBy: 'David P.', tags: ['goalkeeper', 'specialized'],
    isFavorite: true, isAISuggested: false,
    schedule: [{ day: 'Saturday', time: '10 - 11:30 AM' }],
  },
  {
    id: 't4', name: 'AI: Weekend Intro Camp', description: 'AI-suggested: High-demand template for beginner weekend camps',
    type: 'camp', ageRange: '6-9', level: 'Beginner', duration: '2 days',
    capacity: 30, price: 149, timesUsed: 0, avgFillRate: 0, avgRevenue: 0,
    lastUsed: 'Never', createdBy: 'AI', tags: ['beginner', 'weekend', 'young'],
    isFavorite: false, isAISuggested: true,
    schedule: [{ day: 'Sat-Sun', time: '9 AM - 12 PM' }],
  },
  {
    id: 't5', name: 'Private Training Block', description: '10-session private training package at discounted rate',
    type: 'private', ageRange: '8-18', level: 'All Levels', duration: '10 sessions',
    capacity: 1, price: 1080, timesUsed: 24, avgFillRate: 100, avgRevenue: 1080,
    lastUsed: 'Mar 2', createdBy: 'Marcus T.', tags: ['private', '1-on-1', 'package'],
    isFavorite: true, isAISuggested: false,
    schedule: [{ day: 'Flexible', time: 'By appointment' }],
  },
  {
    id: 't6', name: 'Community Tournament', description: '1-day mini tournament with round-robin format',
    type: 'tournament', ageRange: '10-14', level: 'All Levels', duration: '1 day',
    capacity: 120, price: 45, timesUsed: 3, avgFillRate: 78, avgRevenue: 4212,
    lastUsed: 'Jan 15', createdBy: 'Marcus T.', tags: ['tournament', 'community', 'competition'],
    isFavorite: false, isAISuggested: false,
    schedule: [{ day: 'Saturday', time: '8 AM - 4 PM' }],
  },
];

const typeColors: Record<string, string> = {
  camp: 'bg-atlas-500/10 text-atlas-400',
  clinic: 'bg-blue-500/10 text-blue-400',
  private: 'bg-purple-500/10 text-purple-400',
  tournament: 'bg-red-500/10 text-red-400',
};

// ─── Page ───────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(templates[0]);

  const filtered = templates.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" /> Event Templates
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Reusable event blueprints — one-click event creation</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400">
              <Plus className="w-3.5 h-3.5" /> New Template
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Templates', value: templates.length.toString(), icon: BookOpen, color: 'text-cyan-400' },
            { label: 'Times Used', value: templates.reduce((s, t) => s + t.timesUsed, 0).toString(), icon: Copy, color: 'text-atlas-400' },
            { label: 'Avg Fill Rate', value: `${Math.round(templates.filter(t => t.timesUsed > 0).reduce((s, t) => s + t.avgFillRate, 0) / templates.filter(t => t.timesUsed > 0).length)}%`, icon: TrendingUp, color: 'text-green-400' },
            { label: 'AI Suggested', value: templates.filter(t => t.isAISuggested).length.toString(), icon: Sparkles, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
              <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 border border-white/60">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..." className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted/50 outline-none" />
          </div>
          <div className="flex gap-1">
            {['all', 'camp', 'clinic', 'private', 'tournament'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                  typeFilter === t ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-text-muted hover:text-text-secondary')}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Template Grid */}
          <div className="col-span-7">
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(t => (
                <button key={t.id} onClick={() => setSelectedTemplate(t)}
                  className={cn('p-4 rounded-xl border text-left transition-all',
                    selectedTemplate?.id === t.id
                      ? 'bg-cyan-500/5 border-cyan-500/20'
                      : 'bg-white border-slate-200 hover:border-white/[0.1]',
                    t.isAISuggested && 'border-purple-500/20')}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded text-[9px] font-medium capitalize', typeColors[t.type])}>
                        {t.type}
                      </span>
                      {t.isAISuggested && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-purple-500/10 text-purple-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                    </div>
                    {t.isFavorite && <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />}
                  </div>
                  <h3 className="text-xs font-semibold text-text-primary mb-0.5">{t.name}</h3>
                  <p className="text-[10px] text-text-muted mb-2 line-clamp-2">{t.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>{t.ageRange} yrs</span>
                    <span>{t.level}</span>
                    <span>${t.price}</span>
                    <span>{t.capacity} cap</span>
                  </div>
                  {t.timesUsed > 0 && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-text-muted">Used {t.timesUsed}x</span>
                      <span className="text-[10px] text-green-400">{t.avgFillRate}% avg fill</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Template Detail */}
          {selectedTemplate && (
            <div className="col-span-5 space-y-4">
              <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium capitalize', typeColors[selectedTemplate.type])}>
                    {selectedTemplate.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-50 text-text-muted">{selectedTemplate.level}</span>
                </div>
                <h2 className="text-base font-display font-bold text-text-primary mb-1">{selectedTemplate.name}</h2>
                <p className="text-xs text-text-muted">{selectedTemplate.description}</p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: 'Age Range', value: `${selectedTemplate.ageRange} years`, icon: Users },
                    { label: 'Duration', value: selectedTemplate.duration, icon: Clock },
                    { label: 'Capacity', value: `${selectedTemplate.capacity} spots`, icon: Users },
                    { label: 'Price', value: `$${selectedTemplate.price}`, icon: DollarSign },
                  ].map(d => (
                    <div key={d.label} className="p-3 rounded-lg bg-slate-50">
                      <d.icon className="w-3.5 h-3.5 text-text-muted mb-1" />
                      <p className="text-xs font-medium text-text-primary">{d.value}</p>
                      <p className="text-[9px] text-text-muted">{d.label}</p>
                    </div>
                  ))}
                </div>

                {/* Schedule */}
                <div className="mt-4">
                  <h4 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Schedule</h4>
                  {selectedTemplate.schedule.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3 text-text-muted" /> {s.day} · {s.time}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedTemplate.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] bg-slate-50 text-text-muted">#{tag}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-atlas-500 text-xs font-semibold text-white">
                    <Copy className="w-3.5 h-3.5" /> Use Template
                  </button>
                  <button className="px-3 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Performance Stats */}
              {selectedTemplate.timesUsed > 0 && (
                <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Performance</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-text-primary">{selectedTemplate.timesUsed}</p>
                      <p className="text-[9px] text-text-muted">Times Used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-green-400">{selectedTemplate.avgFillRate}%</p>
                      <p className="text-[9px] text-text-muted">Avg Fill Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-text-primary">${selectedTemplate.avgRevenue.toLocaleString()}</p>
                      <p className="text-[9px] text-text-muted">Avg Revenue</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
