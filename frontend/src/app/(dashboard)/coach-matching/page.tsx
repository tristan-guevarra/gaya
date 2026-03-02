// ai coach matching - pairs athletes with coaches based on skills, location, availability, and compatibility

'use client';

import { useState, useMemo } from 'react';
import {
  Brain, Users, Star, MapPin, Clock, DollarSign, Target,
  Zap, Heart, Shield, ChevronRight, Sparkles, ArrowRight,
  CheckCircle, TrendingUp, Award, Activity, Filter,
  BarChart3, Sliders, RefreshCw, ThumbsUp, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  explanation: string;
  icon: React.ElementType;
}

interface CoachMatch {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  availability: string;
  matchScore: number;
  factors: MatchFactor[];
  specialties: string[];
  style: string;
  experience: string;
  languages: string[];
  nextAvailable: string;
  responseTime: string;
  repeatRate: number;
}


const athleteProfile = {
  name: 'Alex W.', age: 12, position: 'Midfielder', level: 'Intermediate → Elite',
  goals: ['Improve weak foot', 'Game IQ development', 'Speed & agility'],
  location: 'Scarborough East', budget: '$80-150/session',
  preferredTimes: ['Weekday evenings', 'Saturday mornings'],
  learningStyle: 'Visual + hands-on',
};

const matches: CoachMatch[] = [
  {
    id: '1', name: 'Marcus Thompson', avatar: 'MT', title: 'Elite Development Coach',
    rating: 4.97, reviews: 142, distance: '2.4 km', price: '$120/hr',
    availability: '8 slots this week', matchScore: 96,
    specialties: ['Technical skills', 'Game intelligence', 'Midfield play'],
    style: 'High-intensity, detail-oriented', experience: '12 years',
    languages: ['English', 'French'], nextAvailable: 'Tomorrow 5 PM',
    responseTime: '<1 hour', repeatRate: 94,
    factors: [
      { name: 'Skill Alignment', score: 98, weight: 25, explanation: 'Specializes in midfielder development and game IQ — directly matches Alex\'s goals', icon: Target },
      { name: 'Location', score: 95, weight: 20, explanation: 'Only 2.4km away in Scarborough East — same zone as Alex', icon: MapPin },
      { name: 'Availability', score: 92, weight: 15, explanation: '3 weekday evening and 2 Saturday morning slots available', icon: Clock },
      { name: 'Price Match', score: 88, weight: 15, explanation: '$120/hr falls within the $80-150 budget range', icon: DollarSign },
      { name: 'Teaching Style', score: 97, weight: 15, explanation: 'Uses video analysis and on-field demos — ideal for visual learners', icon: Brain },
      { name: 'Track Record', score: 98, weight: 10, explanation: '94% repeat rate, 4.97★ rating, 12 years experience with youth players', icon: Award },
    ],
  },
  {
    id: '2', name: 'Sarah Chen', avatar: 'SC', title: 'Speed & Agility Specialist',
    rating: 4.91, reviews: 98, distance: '4.1 km', price: '$95/hr',
    availability: '5 slots this week', matchScore: 89,
    specialties: ['Speed training', 'Agility', 'Footwork'],
    style: 'Energetic, encouraging', experience: '8 years',
    languages: ['English', 'Mandarin'], nextAvailable: 'Wed 6 PM',
    responseTime: '<30 min', repeatRate: 91,
    factors: [
      { name: 'Skill Alignment', score: 82, weight: 25, explanation: 'Excels at speed & agility training — matches 1 of 3 goals directly', icon: Target },
      { name: 'Location', score: 88, weight: 20, explanation: '4.1km away in North York — slightly further but accessible', icon: MapPin },
      { name: 'Availability', score: 90, weight: 15, explanation: 'Wednesday and Thursday evening slots available', icon: Clock },
      { name: 'Price Match', score: 95, weight: 15, explanation: '$95/hr is well within budget with room for frequent sessions', icon: DollarSign },
      { name: 'Teaching Style', score: 88, weight: 15, explanation: 'Energetic and encouraging — good for building confidence', icon: Brain },
      { name: 'Track Record', score: 92, weight: 10, explanation: '91% repeat rate, fastest response time of all coaches', icon: Award },
    ],
  },
  {
    id: '3', name: 'David Park', avatar: 'DP', title: 'Youth Development Coach',
    rating: 4.85, reviews: 76, distance: '6.8 km', price: '$85/hr',
    availability: '12 slots this week', matchScore: 84,
    specialties: ['Youth development', 'Weak foot training', 'Fundamentals'],
    style: 'Patient, methodical', experience: '6 years',
    languages: ['English', 'Korean'], nextAvailable: 'Today 7 PM',
    responseTime: '<2 hours', repeatRate: 88,
    factors: [
      { name: 'Skill Alignment', score: 85, weight: 25, explanation: 'Specializes in weak foot training — directly matches top goal', icon: Target },
      { name: 'Location', score: 72, weight: 20, explanation: '6.8km away in Ajax — requires short drive', icon: MapPin },
      { name: 'Availability', score: 98, weight: 15, explanation: 'Most availability of any match — 12 open slots', icon: Clock },
      { name: 'Price Match', score: 98, weight: 15, explanation: '$85/hr is at the lower end of budget — great value', icon: DollarSign },
      { name: 'Teaching Style', score: 78, weight: 15, explanation: 'Patient and methodical — good for technical skill building', icon: Brain },
      { name: 'Track Record', score: 82, weight: 10, explanation: 'Growing reputation, strong with younger players (8-13)', icon: Award },
    ],
  },
  {
    id: '4', name: 'Aisha Okafor', avatar: 'AO', title: 'Former Pro — Technical Coach',
    rating: 4.93, reviews: 204, distance: '8.2 km', price: '$150/hr',
    availability: '2 slots this week', matchScore: 81,
    specialties: ['Pro-level technique', 'Mental game', 'Competition prep'],
    style: 'Demanding, results-driven', experience: '15 years + pro career',
    languages: ['English', 'Yoruba'], nextAvailable: 'Sat 9 AM',
    responseTime: '<4 hours', repeatRate: 96,
    factors: [
      { name: 'Skill Alignment', score: 90, weight: 25, explanation: 'Former professional midfielder — elite-level tactical insight', icon: Target },
      { name: 'Location', score: 62, weight: 20, explanation: '8.2km away in Etobicoke — requires 15-20 min drive', icon: MapPin },
      { name: 'Availability', score: 45, weight: 15, explanation: 'Only 2 slots available — high demand coach', icon: Clock },
      { name: 'Price Match', score: 72, weight: 15, explanation: '$150/hr is at the top of budget — premium pricing', icon: DollarSign },
      { name: 'Teaching Style', score: 85, weight: 15, explanation: 'Demanding but produces results — may be intense for some', icon: Brain },
      { name: 'Track Record', score: 98, weight: 10, explanation: '96% repeat rate, 204 reviews — most experienced match', icon: Award },
    ],
  },
];


function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-atlas-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreRing(score: number) {
  if (score >= 90) return 'from-green-500 to-emerald-400';
  if (score >= 80) return 'from-atlas-500 to-cyan-400';
  if (score >= 70) return 'from-amber-500 to-yellow-400';
  return 'from-red-500 to-orange-400';
}


export default function CoachMatchingPage() {
  const [selectedMatch, setSelectedMatch] = useState<CoachMatch>(matches[0]);
  const [showFactors, setShowFactors] = useState(true);
  const [weights, setWeights] = useState({
    skills: 25, location: 20, availability: 15, price: 15, style: 15, track: 10,
  });

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> AI Coach Matching
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Intelligent algorithm finds the perfect coach for every athlete</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Sliders className="w-3.5 h-3.5" /> Adjust Weights
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">
                <RefreshCw className="w-3.5 h-3.5" /> Re-Match
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* athlete profile summary */}
        <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/15 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-300 flex items-center justify-center text-lg font-bold text-white">
                AW
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">{athleteProfile.name} · Age {athleteProfile.age}</h2>
                <p className="text-xs text-text-muted">{athleteProfile.position} · {athleteProfile.level} · {athleteProfile.location}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {athleteProfile.goals.map(g => (
                    <span key={g} className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-400">{g}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Budget: {athleteProfile.budget}</p>
              <p className="text-xs text-text-muted">{athleteProfile.preferredTimes.join(' · ')}</p>
              <p className="text-xs text-text-muted">Style: {athleteProfile.learningStyle}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* left: match results */}
          <div className="col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Top Matches
              </h3>
              <span className="text-[10px] text-text-muted">{matches.length} coaches found</span>
            </div>

            {matches.map((match, rank) => (
              <button key={match.id} onClick={() => setSelectedMatch(match)}
                className={cn('w-full p-4 rounded-xl border text-left transition-all',
                  selectedMatch.id === match.id
                    ? 'bg-atlas-500/5 border-atlas-500/20'
                    : 'bg-white border-slate-200 hover:border-white/[0.1]')}>
                <div className="flex items-start gap-3">
                  {/* score ring */}
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
                      <circle cx="28" cy="28" r="24" fill="none"
                        stroke={match.matchScore >= 90 ? '#00CC88' : match.matchScore >= 80 ? '#00CC88' : '#F59E0B'}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(match.matchScore / 100) * 150.8} 150.8`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn('text-sm font-display font-bold', getScoreColor(match.matchScore))}>
                        {match.matchScore}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-muted/50">#{rank + 1}</span>
                      <p className="text-sm font-semibold text-text-primary truncate">{match.name}</p>
                    </div>
                    <p className="text-[10px] text-text-muted">{match.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />{match.rating}
                      </span>
                      <span className="text-[10px] text-text-muted">{match.distance}</span>
                      <span className="text-[10px] text-text-muted">{match.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {match.specialties.slice(0, 3).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[8px] bg-slate-50 text-text-muted">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* right: match detail */}
          <div className="col-span-7 space-y-4">
            {/* coach header */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl font-bold text-white',
                    getScoreRing(selectedMatch.matchScore))}>
                    {selectedMatch.avatar}
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-text-primary">{selectedMatch.name}</h2>
                    <p className="text-xs text-text-muted">{selectedMatch.title} · {selectedMatch.experience}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedMatch.rating} ({selectedMatch.reviews} reviews)
                      </span>
                      <span className="text-xs text-text-muted">{selectedMatch.distance}</span>
                      <span className="text-xs text-green-400">{selectedMatch.responseTime} response</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn('text-4xl font-display font-bold', getScoreColor(selectedMatch.matchScore))}>
                    {selectedMatch.matchScore}%
                  </div>
                  <p className="text-[10px] text-text-muted">Match Score</p>
                </div>
              </div>

              {/* quick info */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Price', value: selectedMatch.price, icon: DollarSign },
                  { label: 'Availability', value: selectedMatch.availability, icon: Clock },
                  { label: 'Next Slot', value: selectedMatch.nextAvailable, icon: Activity },
                  { label: 'Repeat Rate', value: `${selectedMatch.repeatRate}%`, icon: Heart },
                ].map(i => (
                  <div key={i.label} className="p-3 rounded-lg bg-white/40 text-center">
                    <i.icon className="w-4 h-4 text-text-muted mx-auto mb-1" />
                    <p className="text-xs font-display font-bold text-text-primary">{i.value}</p>
                    <p className="text-[9px] text-text-muted">{i.label}</p>
                  </div>
                ))}
              </div>

              {/* action buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-atlas-500 to-cyan-400 text-sm font-semibold text-white hover:opacity-90 transition-all">
                  <Zap className="w-4 h-4" /> Book Session
                </button>
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-sm text-text-secondary hover:bg-slate-100">
                  <Heart className="w-4 h-4" /> Save
                </button>
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-sm text-text-secondary hover:bg-slate-100">
                  Message
                </button>
              </div>
            </div>

            {/* match factors breakdown */}
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-400" /> Why This Match
                </h3>
                <button onClick={() => setShowFactors(!showFactors)}
                  className="text-[10px] text-text-muted flex items-center gap-1">
                  {showFactors ? 'Hide' : 'Show'} details <ChevronDown className={cn('w-3 h-3 transition-transform', showFactors && 'rotate-180')} />
                </button>
              </div>

              <div className="space-y-3">
                {selectedMatch.factors.map(factor => (
                  <div key={factor.name}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <factor.icon className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-text-primary">{factor.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">{factor.weight}% weight</span>
                            <span className={cn('text-xs font-display font-bold', getScoreColor(factor.score))}>{factor.score}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all',
                            factor.score >= 90 ? 'bg-green-500' :
                            factor.score >= 80 ? 'bg-atlas-500' :
                            factor.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          )} style={{ width: `${factor.score}%` }} />
                        </div>
                      </div>
                    </div>
                    {showFactors && (
                      <p className="text-[10px] text-text-muted ml-11 mt-1 leading-relaxed">{factor.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* weighted score calculation */}
              <div className="mt-4 p-3 rounded-lg bg-white/40 border border-white/60">
                <p className="text-[10px] text-text-muted/50 mb-1">Score Calculation</p>
                <p className="text-[10px] font-mono text-text-muted">
                  {selectedMatch.factors.map(f => `(${f.score} × ${f.weight}%)`).join(' + ')} = <span className={cn('font-bold', getScoreColor(selectedMatch.matchScore))}>{selectedMatch.matchScore}%</span>
                </p>
              </div>
            </div>

            {/* languages & style */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Teaching Style</h3>
                <p className="text-sm text-text-primary">{selectedMatch.style}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedMatch.specialties.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-atlas-500/10 text-atlas-400">{s}</span>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMatch.languages.map(l => (
                    <span key={l} className="px-3 py-1.5 rounded-lg bg-slate-50 text-xs text-text-secondary">{l}</span>
                  ))}
                </div>
                <p className="text-[10px] text-text-muted mt-3">Experience: {selectedMatch.experience}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
