// expansion playbook - 5-phase market entry wizard with geo scoring, checklists, and ai launch recommendations

'use client';

import { useState } from 'react';
import {
  Rocket, MapPin, Users, Target, BarChart3, Check, Clock,
  ChevronRight, Brain, Zap, Globe, Star, TrendingUp,
  ArrowRight, Shield, Sparkles, Building2, Calendar,
  DollarSign, Search, Flag, CheckCircle, Circle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface Market {
  id: string;
  city: string;
  country: string;
  score: number;
  population: string;
  youthPop: string;
  soccerIndex: number;
  competitorDensity: string;
  estimatedARR: string;
  timeToBreakeven: string;
  status: 'evaluating' | 'planning' | 'launching' | 'active';
  phase: number;
}

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  duration: string;
  tasks: { text: string; done: boolean }[];
}


const CANDIDATE_MARKETS: Market[] = [
  { id: 'm1', city: 'Austin', country: 'US', score: 94, population: '2.3M', youthPop: '412K', soccerIndex: 88, competitorDensity: 'Low', estimatedARR: '$480K', timeToBreakeven: '4 mo', status: 'launching', phase: 3 },
  { id: 'm2', city: 'Miami', country: 'US', score: 91, population: '6.1M', youthPop: '980K', soccerIndex: 92, competitorDensity: 'Medium', estimatedARR: '$720K', timeToBreakeven: '5 mo', status: 'planning', phase: 2 },
  { id: 'm3', city: 'Chicago', country: 'US', score: 88, population: '9.5M', youthPop: '1.6M', soccerIndex: 78, competitorDensity: 'High', estimatedARR: '$640K', timeToBreakeven: '7 mo', status: 'evaluating', phase: 1 },
  { id: 'm4', city: 'London', country: 'UK', score: 86, population: '9.0M', youthPop: '1.4M', soccerIndex: 96, competitorDensity: 'High', estimatedARR: '$920K', timeToBreakeven: '8 mo', status: 'evaluating', phase: 1 },
  { id: 'm5', city: 'Seattle', country: 'US', score: 84, population: '3.4M', youthPop: '548K', soccerIndex: 82, competitorDensity: 'Low', estimatedARR: '$380K', timeToBreakeven: '4 mo', status: 'evaluating', phase: 0 },
  { id: 'm6', city: 'Dallas', country: 'US', score: 82, population: '7.6M', youthPop: '1.3M', soccerIndex: 76, competitorDensity: 'Medium', estimatedARR: '$560K', timeToBreakeven: '6 mo', status: 'evaluating', phase: 0 },
];

const PHASES: Phase[] = [
  {
    id: 1, title: 'Market Research', subtitle: 'Validate demand signals', icon: Search, duration: '2 weeks',
    tasks: [
      { text: 'Analyze youth population density and sports participation rates', done: true },
      { text: 'Map existing competitor locations and pricing', done: true },
      { text: 'Survey 50+ families in target area for demand validation', done: true },
      { text: 'Identify top 10 potential partner venues (fields, gyms)', done: false },
      { text: 'Score market using Gaya geo intelligence', done: true },
    ],
  },
  {
    id: 2, title: 'Coach Recruitment', subtitle: 'Build supply pipeline', icon: Users, duration: '3 weeks',
    tasks: [
      { text: 'Identify 20+ qualified coaches in the metro area', done: true },
      { text: 'Conduct outreach via LinkedIn, coaching networks, and referrals', done: true },
      { text: 'Onboard minimum 5 coaches to the platform', done: false },
      { text: 'Verify credentials and complete background checks', done: false },
      { text: 'Set up coach profiles with photos, bios, and availability', done: false },
    ],
  },
  {
    id: 3, title: 'Pre-Launch', subtitle: 'Build demand pipeline', icon: Rocket, duration: '2 weeks',
    tasks: [
      { text: 'Create 10+ event listings (camps, clinics, privates)', done: true },
      { text: 'Launch landing page with waitlist signup for the market', done: true },
      { text: 'Run targeted Facebook/Instagram ads ($2K budget)', done: false },
      { text: 'Partner with 3+ local soccer clubs for cross-promotion', done: false },
      { text: 'Set up local Stripe account and payment processing', done: false },
    ],
  },
  {
    id: 4, title: 'Soft Launch', subtitle: 'First events go live', icon: Flag, duration: '4 weeks',
    tasks: [
      { text: 'Launch first 3 events with promotional pricing (20% off)', done: false },
      { text: 'Achieve minimum 60% fill rate on initial events', done: false },
      { text: 'Collect 10+ reviews from attendees', done: false },
      { text: 'Monitor and resolve any operational issues', done: false },
      { text: 'Track CAC, conversion rate, and NPS for the market', done: false },
    ],
  },
  {
    id: 5, title: 'Scale', subtitle: 'Expand and optimize', icon: TrendingUp, duration: 'Ongoing',
    tasks: [
      { text: 'Expand to 15+ active coaches in the market', done: false },
      { text: 'Achieve $40K+ MRR in the market', done: false },
      { text: 'Hit 85%+ average fill rate across all events', done: false },
      { text: 'Launch enterprise academy partnerships', done: false },
      { text: 'Enable self-serve coach onboarding for organic growth', done: false },
    ],
  },
];


export default function ExpansionPlaybookPage() {
  const [selectedMarket, setSelectedMarket] = useState<Market>(CANDIDATE_MARKETS[0]);
  const [expandedPhase, setExpandedPhase] = useState(3); // Show Phase 3 expanded for Austin

  const statusColors = {
    evaluating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    launching: 'bg-atlas-500/10 text-atlas-400 border-atlas-500/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Globe className="w-5 h-5 text-atlas-400" /> Expansion Playbook
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Guided market entry with AI-powered scoring and milestone tracking</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-atlas-500 text-white hover:bg-atlas-400 transition-all">
              <Plus className="w-3.5 h-3.5" /> Evaluate New Market
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* left: market list */}
        <div className="w-80 shrink-0 space-y-3">
          <p className="text-xs font-semibold text-text-muted">Target Markets ({CANDIDATE_MARKETS.length})</p>
          {CANDIDATE_MARKETS.map(m => (
            <button key={m.id} onClick={() => setSelectedMarket(m)}
              className={cn('w-full text-left p-4 rounded-xl border transition-all',
                selectedMarket.id === m.id
                  ? 'bg-atlas-500/5 border-atlas-500/20'
                  : 'bg-white/60 backdrop-blur-sm border-white/60 hover:bg-white/70')}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-atlas-500/10 flex items-center justify-center text-xs font-bold text-atlas-400">
                    {m.score}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{m.city}</p>
                    <p className="text-[10px] text-text-muted">{m.country}</p>
                  </div>
                </div>
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium capitalize border', statusColors[m.status])}>
                  {m.status}
                </span>
              </div>
              {/* phase progress */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(p => (
                  <div key={p} className={cn('h-1 flex-1 rounded-full',
                    p <= m.phase ? 'bg-atlas-500' : 'bg-slate-100')} />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                <span>Est. {m.estimatedARR}/yr</span>
                <span>Phase {m.phase}/5</span>
              </div>
            </button>
          ))}
        </div>

        {/* right: market detail */}
        <div className="flex-1 space-y-4">
          {/* market overview card */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-atlas-400" />
                  {selectedMarket.city}, {selectedMarket.country}
                </h2>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize border mt-1', statusColors[selectedMarket.status])}>
                  {selectedMarket.status}
                </span>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-atlas-500/20 to-atlas-500/5 border border-atlas-500/20 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-extrabold text-atlas-400">{selectedMarket.score}</span>
                <span className="text-[8px] text-text-muted font-medium">SCORE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Metro Population', value: selectedMarket.population, icon: Users },
                { label: 'Youth (5-18)', value: selectedMarket.youthPop, icon: Star },
                { label: 'Soccer Index', value: `${selectedMarket.soccerIndex}/100`, icon: Target },
                { label: 'Competitor Density', value: selectedMarket.competitorDensity, icon: Shield },
                { label: 'Est. Annual Revenue', value: selectedMarket.estimatedARR, icon: DollarSign },
                { label: 'Time to Breakeven', value: selectedMarket.timeToBreakeven, icon: Clock },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <m.icon className="w-3.5 h-3.5 text-text-muted/50 mb-1" />
                  <p className="text-sm font-display font-bold text-text-primary">{m.value}</p>
                  <p className="text-[10px] text-text-muted">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ai recommendation */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-atlas-500/5 via-slate-50/60 to-purple-500/5 border border-atlas-500/10">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-atlas-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-atlas-400 mb-1">AI Launch Recommendation</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {selectedMarket.city} shows strong market-product fit: high youth population density ({selectedMarket.youthPop}),
                  {selectedMarket.competitorDensity.toLowerCase()} competitor saturation, and a soccer participation index of {selectedMarket.soccerIndex}/100.
                  Recommend launching with 5 coaches, 3 weekend camps, and 8 weekday clinics. Target $40K MRR within 4 months
                  by focusing on the {selectedMarket.city === 'Austin' ? 'Cedar Park and Round Rock' : selectedMarket.city === 'Miami' ? 'Coral Gables and Doral' : 'suburban'} corridors
                  where demand density is highest.
                </p>
              </div>
            </div>
          </div>

          {/* playbook phases */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted mb-2">Launch Playbook</p>
            {PHASES.map(phase => {
              const isExpanded = expandedPhase === phase.id;
              const completedTasks = phase.tasks.filter(t => t.done).length;
              const totalTasks = phase.tasks.length;
              const isComplete = completedTasks === totalTasks;
              const isCurrent = phase.id === selectedMarket.phase;
              const isPast = phase.id < selectedMarket.phase;

              return (
                <div key={phase.id} className={cn('rounded-xl border overflow-hidden transition-all',
                  isCurrent ? 'bg-atlas-500/5 border-atlas-500/15' :
                  isPast ? 'bg-green-500/[0.02] border-green-500/10' :
                  'bg-white/60 backdrop-blur-sm border-white/60')}>
                  <button onClick={() => setExpandedPhase(isExpanded ? 0 : phase.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/40 transition-colors">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isPast ? 'bg-green-500/15' : isCurrent ? 'bg-atlas-500/15' : 'bg-slate-50')}>
                      {isPast ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                       <phase.icon className={cn('w-4 h-4', isCurrent ? 'text-atlas-400' : 'text-text-muted/50')} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary">Phase {phase.id}: {phase.title}</span>
                        {isCurrent && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-atlas-500/10 text-atlas-400">Current</span>}
                      </div>
                      <span className="text-[10px] text-text-muted">{phase.subtitle} · {phase.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-text-muted">{completedTasks}/{totalTasks}</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn('h-full rounded-full', isPast ? 'bg-green-500' : 'bg-atlas-500')}
                          style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-1.5 animate-fade-in border-t border-white/40 pt-3 ml-11">
                      {phase.tasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {task.done ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-text-muted/30 shrink-0 mt-0.5" />
                          )}
                          <span className={cn('text-xs leading-relaxed', task.done ? 'text-text-muted line-through' : 'text-text-secondary')}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* resource allocation */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Estimated Resource Allocation</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Marketing Spend', value: '$12K', period: 'first 3 months' },
                { label: 'Coach Recruitment', value: '$4K', period: 'signing bonuses' },
                { label: 'Ops Support', value: '0.5 FTE', period: 'for 6 months' },
                { label: 'Total Investment', value: '$24K', period: 'to breakeven' },
              ].map(r => (
                <div key={r.label} className="p-3 rounded-xl bg-white/40 border border-white/60 text-center">
                  <p className="text-base font-display font-bold text-atlas-400">{r.value}</p>
                  <p className="text-[10px] text-text-muted">{r.label}</p>
                  <p className="text-[9px] text-text-muted/60">{r.period}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plus icon (local since not imported)
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
