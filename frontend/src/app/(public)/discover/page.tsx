// athlete discovery feed - swipeable card-based training discovery

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Calendar, Clock, Users, Star, Heart,
  X, ChevronRight, ArrowRight, Zap, BookOpen,
  Shield, Award, Sparkles, Filter, Map, Eye,
  ThumbsUp, Send, Bookmark, Share2, BadgeCheck
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Card, Badge, Button } from '@/components/ui';
import type { EventType } from '@/types';

interface DiscoverCard {
  id: string;
  title: string;
  coach_name: string;
  coach_verified: boolean;
  coach_rating: number;
  coach_reviews: number;
  event_type: EventType;
  sport: string;
  skill_levels: string[];
  age_min: number;
  age_max: number;
  price_cents: number;
  capacity: number;
  enrolled: number;
  address: string;
  zone: string;
  distance_km: number;
  date_str: string;
  time_str: string;
  tags: string[];
  gradient: string;
  emoji: string;
}

const CARDS: DiscoverCard[] = [
  {
    id: '1', title: 'Spring Elite Camp 2026', coach_name: 'Marcus Thompson', coach_verified: true,
    coach_rating: 4.9, coach_reviews: 127, event_type: 'camp', sport: 'Soccer',
    skill_levels: ['Advanced', 'Elite'], age_min: 12, age_max: 17, price_cents: 34900,
    capacity: 24, enrolled: 21, address: 'Downsview Park', zone: 'North York',
    distance_km: 3.2, date_str: 'Apr 14–18', time_str: '9 AM – 4 PM',
    tags: ['Indoor Turf', 'Video Analysis', 'Performance Report'],
    gradient: 'from-emerald-600/40 via-emerald-800/20 to-transparent', emoji: '⚽'
  },
  {
    id: '2', title: 'Technical Skills Clinic', coach_name: 'Sarah Chen', coach_verified: true,
    coach_rating: 4.8, coach_reviews: 89, event_type: 'clinic', sport: 'Soccer',
    skill_levels: ['Intermediate'], age_min: 9, age_max: 14, price_cents: 8900,
    capacity: 16, enrolled: 11, address: 'Centennial Park', zone: 'Etobicoke',
    distance_km: 5.8, date_str: 'Mar 22', time_str: '10 AM – 1 PM',
    tags: ['Ball Mastery', 'Passing', 'First Touch'],
    gradient: 'from-blue-600/40 via-blue-800/20 to-transparent', emoji: '⚡'
  },
  {
    id: '3', title: 'Private 1-on-1 Training', coach_name: 'David Okafor', coach_verified: true,
    coach_rating: 5.0, coach_reviews: 43, event_type: 'private', sport: 'Soccer',
    skill_levels: ['All Levels'], age_min: 6, age_max: 18, price_cents: 12500,
    capacity: 1, enrolled: 0, address: 'Rouge Park', zone: 'Scarborough',
    distance_km: 8.1, date_str: 'Flexible', time_str: 'By appointment',
    tags: ['Personalized', 'Flexible Schedule', 'Position-Specific'],
    gradient: 'from-purple-600/40 via-purple-800/20 to-transparent', emoji: '👤'
  },
  {
    id: '4', title: 'Goalkeeper Masterclass', coach_name: 'Kenji Watanabe', coach_verified: false,
    coach_rating: 4.7, coach_reviews: 31, event_type: 'clinic', sport: 'Soccer',
    skill_levels: ['Intermediate', 'Advanced'], age_min: 10, age_max: 16, price_cents: 12900,
    capacity: 8, enrolled: 6, address: "L'Amoreaux Sports Complex", zone: 'Scarborough',
    distance_km: 7.3, date_str: 'Mar 29', time_str: '2 PM – 5 PM',
    tags: ['Shot Stopping', 'Distribution', 'Cross Dealing'],
    gradient: 'from-amber-600/40 via-amber-800/20 to-transparent', emoji: '🧤'
  },
  {
    id: '5', title: 'Summer Super Camp', coach_name: 'Marcus Thompson', coach_verified: true,
    coach_rating: 4.9, coach_reviews: 127, event_type: 'camp', sport: 'Soccer',
    skill_levels: ['All Levels'], age_min: 8, age_max: 15, price_cents: 44900,
    capacity: 36, enrolled: 14, address: 'Downsview Park', zone: 'North York',
    distance_km: 3.2, date_str: 'Jul 7–18', time_str: '9 AM – 3 PM',
    tags: ['Two Weeks', 'All Skills', 'Tournament Day'],
    gradient: 'from-rose-600/40 via-rose-800/20 to-transparent', emoji: '☀️'
  },
  {
    id: '6', title: 'Speed & Agility Clinic', coach_name: 'Fatima Al-Rashid', coach_verified: true,
    coach_rating: 4.6, coach_reviews: 56, event_type: 'clinic', sport: 'Soccer',
    skill_levels: ['Intermediate', 'Advanced'], age_min: 11, age_max: 17, price_cents: 7500,
    capacity: 20, enrolled: 18, address: 'Sunnybrook Park', zone: 'Midtown',
    distance_km: 4.5, date_str: 'Apr 5', time_str: '11 AM – 1 PM',
    tags: ['Athletic Performance', 'Sprint Mechanics', 'Lateral Movement'],
    gradient: 'from-cyan-600/40 via-cyan-800/20 to-transparent', emoji: '🏃'
  },
];

const typeConfig: Record<EventType, { color: string; label: string }> = {
  camp: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: '🏕️ Camp' },
  clinic: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', label: '⚡ Clinic' },
  private: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/20', label: '👤 Private' },
};

// swipeable card component
function SwipeCard({
  card,
  isTop,
  onSwipe,
}: {
  card: DiscoverCard;
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState({ x: 0, y: 0, dragging: false });
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragState({ x: 0, y: 0, dragging: true });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.dragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = (e.clientY - startPos.current.y) * 0.3;
    setDragState({ x: dx, y: dy, dragging: true });
  };

  const handlePointerUp = () => {
    if (!dragState.dragging) return;
    const threshold = 120;
    if (Math.abs(dragState.x) > threshold) {
      const dir = dragState.x > 0 ? 'right' : 'left';
      setExitDir(dir);
      setTimeout(() => onSwipe(dir), 300);
    } else {
      setDragState({ x: 0, y: 0, dragging: false });
    }
  };

  const rotation = dragState.x * 0.05;
  const opacity = Math.max(0, 1 - Math.abs(dragState.x) / 400);
  const pct = Math.min(1, Math.abs(dragState.x) / 120);
  const spotsLeft = card.capacity - card.enrolled;
  const fillPct = Math.round((card.enrolled / card.capacity) * 100);

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute inset-0 touch-none select-none',
        exitDir === 'left' && 'animate-swipe-left',
        exitDir === 'right' && 'animate-swipe-right',
        !isTop && 'pointer-events-none'
      )}
      style={!exitDir ? {
        transform: `translateX(${dragState.x}px) translateY(${dragState.y}px) rotate(${rotation}deg) scale(${isTop ? 1 : 0.95})`,
        opacity: isTop ? 1 : 0.6,
        transition: dragState.dragging ? 'none' : 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1), opacity 0.4s',
        zIndex: isTop ? 10 : 5,
      } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="h-full rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl shadow-black/8 flex flex-col">
        {/* card header with gradient */}
        <div className={cn('relative h-44 flex items-end p-5', `bg-gradient-to-br ${card.gradient}`)}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />

          {/* swipe indicators */}
          {isTop && dragState.dragging && (
            <>
              <div className={cn(
                'absolute top-6 left-6 px-4 py-2 rounded-xl border-2 font-display font-bold text-lg transition-opacity',
                dragState.x < -20 ? 'opacity-100' : 'opacity-0',
                'border-red-400/60 text-red-400 bg-red-500/10 -rotate-12'
              )}>
                SKIP
              </div>
              <div className={cn(
                'absolute top-6 right-6 px-4 py-2 rounded-xl border-2 font-display font-bold text-lg transition-opacity',
                dragState.x > 20 ? 'opacity-100' : 'opacity-0',
                'border-atlas-400/60 text-atlas-400 bg-atlas-500/10 rotate-12'
              )}>
                SAVE ♥
              </div>
            </>
          )}

          {/* type badge */}
          <div className="relative z-10 flex items-center gap-2">
            <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm', typeConfig[card.event_type].color)}>
              {typeConfig[card.event_type].label}
            </span>
            {spotsLeft <= 3 && spotsLeft > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                🔥 {spotsLeft} left
              </span>
            )}
            {spotsLeft === 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                Sold Out
              </span>
            )}
          </div>

          {/* emoji decorator */}
          <span className="absolute top-4 right-5 text-5xl opacity-20">{card.emoji}</span>
        </div>

        {/* card body */}
        <div className="flex-1 p-5 flex flex-col">
          <h2 className="font-display font-bold text-xl text-text-primary mb-1">{card.title}</h2>
          <p className="text-xs text-text-muted mb-4">{card.sport} · {card.skill_levels.join(', ')} · Ages {card.age_min}–{card.age_max}</p>

          {/* coach row */}
          <div className="flex items-center gap-2.5 mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-atlas-400">
              {card.coach_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-text-primary truncate">{card.coach_name}</span>
                {card.coach_verified && <BadgeCheck className="w-3.5 h-3.5 text-atlas-400" />}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] text-text-muted">{card.coach_rating} ({card.coach_reviews})</span>
              </div>
            </div>
          </div>

          {/* info grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate">{card.date_str}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate">{card.time_str}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate">{card.zone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate">{fillPct}% full</span>
            </div>
          </div>

          {/* tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {card.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200/60 shadow-sm text-text-muted">
                {tag}
              </span>
            ))}
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* price + distance */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div>
              <span className="text-2xl font-display font-bold text-atlas-400">{formatPrice(card.price_cents)}</span>
              <span className="text-xs text-text-muted ml-1">
                {card.event_type === 'private' ? '/hr' : card.event_type === 'camp' ? '/week' : '/session'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <MapPin className="w-3 h-3" />
              {card.distance_km} km away
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [stack, setStack] = useState(CARDS);
  const [saved, setSaved] = useState<DiscoverCard[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setStack(prev => {
      const [top, ...rest] = prev;
      if (direction === 'right' && top) {
        setSaved(s => [...s, top]);
      } else {
        setSkipped(s => s + 1);
      }
      // if stack runs out, refill with shuffled cards
      if (rest.length === 0) {
        return [...CARDS].sort(() => Math.random() - 0.5);
      }
      return rest;
    });
  }, []);

  const filteredStack = filter === 'all'
    ? stack
    : stack.filter(c => c.event_type === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <div className="border-b border-slate-200">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-atlas-400" />
                Discover
              </h1>
              <p className="text-xs text-text-muted">Swipe right to save, left to skip</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-sm',
                  showSaved
                    ? 'bg-atlas-500/10 border-atlas-500/20 text-atlas-400'
                    : 'bg-slate-100/50 border-slate-200 text-text-muted hover:text-text-secondary'
                )}
              >
                <Bookmark className="w-4 h-4" />
                {saved.length}
              </button>
              <Link href="/map" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/60 shadow-sm text-text-muted hover:text-text-secondary transition-all text-sm">
                <Map className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* filter pills */}
          <div className="flex items-center gap-2 mt-3">
            {(['all', 'camp', 'clinic', 'private'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  filter === f
                    ? 'bg-atlas-500/15 border-atlas-500/25 text-atlas-400'
                    : 'bg-slate-100/50 border-slate-200 text-text-muted hover:text-text-secondary'
                )}
              >
                {f === 'all' ? '✨ All' : typeConfig[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* content */}
      <div className="max-w-lg mx-auto px-6 py-6">
        {showSaved ? (
          /* saved list */
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-text-primary">Saved ({saved.length})</h2>
              <button onClick={() => setShowSaved(false)} className="text-xs text-atlas-400 hover:underline">
                Back to feed
              </button>
            </div>
            {saved.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-text-muted">No saved training yet</p>
                <p className="text-xs text-text-muted/60 mt-1">Swipe right on cards you like</p>
              </div>
            ) : (
              saved.map(card => (
                <Link key={card.id} href={`/events/${card.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-atlas-500/20 transition-all group">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', `bg-gradient-to-br ${card.gradient}`)}>
                      {card.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-atlas-400 transition-colors truncate">{card.title}</p>
                      <p className="text-xs text-text-muted">{card.coach_name} · {card.date_str}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-display font-bold text-atlas-400">{formatPrice(card.price_cents)}</p>
                      <p className="text-[10px] text-text-muted">{card.distance_km} km</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          /* card stack */
          <>
            <div className="relative h-[520px] mb-6">
              {filteredStack.slice(0, 3).reverse().map((card, i, arr) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  isTop={i === arr.length - 1}
                  onSwipe={handleSwipe}
                />
              ))}
            </div>

            {/* action buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => { /* request info */ }}
                className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all active:scale-90">
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="w-14 h-14 rounded-2xl bg-atlas-500/10 border border-atlas-500/20 flex items-center justify-center text-atlas-400 hover:bg-atlas-500/20 transition-all active:scale-90"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* stats */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
              <span>{saved.length} saved</span>
              <span>·</span>
              <span>{skipped} skipped</span>
              <span>·</span>
              <span>{filteredStack.length} remaining</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
