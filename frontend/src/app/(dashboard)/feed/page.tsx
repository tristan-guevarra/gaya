// live activity feed - real-time platform activity stream with filtering and live updates

'use client';

import { useState, useEffect } from 'react';
import {
  Activity, Users, Calendar, DollarSign, Star, MapPin,
  UserPlus, CheckCircle, MessageCircle, Heart, Zap, Bell,
  TrendingUp, Award, Eye, Filter, RefreshCw, Clock,
  ChevronDown, Circle, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';


type Category = 'all' | 'leads' | 'bookings' | 'reviews' | 'events' | 'coaches' | 'system';

interface FeedItem {
  id: string;
  type: string;
  category: Category;
  title: string;
  description: string;
  actor: string;
  actorAvatar: string;
  time: string;
  zone?: string;
  amount?: string;
  icon: React.ElementType;
  iconColor: string;
  isNew: boolean;
}


const feedItems: FeedItem[] = [
  { id: '1', type: 'lead', category: 'leads', title: 'New Lead', description: 'Emily R. requested info about Spring Elite Camp in Scarborough', actor: 'Emily R.', actorAvatar: 'ER', time: '12 seconds ago', zone: 'Scarborough', icon: UserPlus, iconColor: 'text-blue-400', isNew: true },
  { id: '2', type: 'booking', category: 'bookings', title: 'Booking Confirmed', description: 'Alex W. booked a session with Marcus Thompson', actor: 'Alex W.', actorAvatar: 'AW', time: '2 min ago', amount: '$120', icon: CheckCircle, iconColor: 'text-green-400', isNew: true },
  { id: '3', type: 'review', category: 'reviews', title: 'New 5-Star Review', description: '"Best coaching experience for my son!" — Sarah M. for Marcus Thompson', actor: 'Sarah M.', actorAvatar: 'SM', time: '8 min ago', icon: Star, iconColor: 'text-amber-400', isNew: true },
  { id: '4', type: 'event', category: 'events', title: 'Event Almost Full', description: 'Speed & Agility Clinic is now 94% full (15/16 spots)', actor: 'System', actorAvatar: 'SY', time: '15 min ago', icon: Calendar, iconColor: 'text-purple-400', isNew: true },
  { id: '5', type: 'payment', category: 'bookings', title: 'Payment Received', description: 'Payment of $2,840 received from North York Youth FC', actor: 'North York FC', actorAvatar: 'NY', time: '22 min ago', amount: '$2,840', icon: DollarSign, iconColor: 'text-green-400', isNew: false },
  { id: '6', type: 'coach', category: 'coaches', title: 'Coach Milestone', description: 'Sarah Chen reached 100 sessions! 🎉', actor: 'Sarah Chen', actorAvatar: 'SC', time: '45 min ago', icon: Award, iconColor: 'text-amber-400', isNew: false },
  { id: '7', type: 'lead', category: 'leads', title: 'Waitlist Join', description: 'Michael K. joined the waitlist for GK Masterclass', actor: 'Michael K.', actorAvatar: 'MK', time: '1 hour ago', zone: 'Ajax', icon: UserPlus, iconColor: 'text-blue-400', isNew: false },
  { id: '8', type: 'event', category: 'events', title: 'New Event Created', description: 'Marcus Thompson created "Summer Prep Camp" in Ajax', actor: 'Marcus T.', actorAvatar: 'MT', time: '1.5 hours ago', zone: 'Ajax', icon: Calendar, iconColor: 'text-purple-400', isNew: false },
  { id: '9', type: 'system', category: 'system', title: 'Expansion Alert', description: 'AI detected high demand in Brampton South — recommend new camp', actor: 'AI', actorAvatar: 'AI', time: '2 hours ago', zone: 'Brampton', icon: MapPin, iconColor: 'text-red-400', isNew: false },
  { id: '10', type: 'review', category: 'reviews', title: 'New 4-Star Review', description: '"Great technical training" — David K. for David Park', actor: 'David K.', actorAvatar: 'DK', time: '3 hours ago', icon: Star, iconColor: 'text-amber-400', isNew: false },
  { id: '11', type: 'booking', category: 'bookings', title: 'Group Booking', description: '8 athletes registered for Weekend Tournament in Brampton', actor: 'Group', actorAvatar: 'GR', time: '4 hours ago', amount: '$360', icon: Users, iconColor: 'text-atlas-400', isNew: false },
  { id: '12', type: 'system', category: 'system', title: 'Metrics Refreshed', description: 'Nightly geo-metrics aggregation completed — 847 cells updated', actor: 'System', actorAvatar: 'SY', time: '6 hours ago', icon: RefreshCw, iconColor: 'text-text-muted', isNew: false },
  { id: '13', type: 'coach', category: 'coaches', title: 'New Coach Joined', description: 'Aisha Okafor joined the platform — former professional midfielder', actor: 'Aisha O.', actorAvatar: 'AO', time: '8 hours ago', icon: UserPlus, iconColor: 'text-green-400', isNew: false },
  { id: '14', type: 'lead', category: 'leads', title: 'Bulk Lead Import', description: '24 leads imported from Scarborough community event CSV', actor: 'System', actorAvatar: 'SY', time: 'Yesterday', icon: TrendingUp, iconColor: 'text-atlas-400', isNew: false },
];

const liveStats = {
  today: { leads: 12, bookings: 8, revenue: 4280, reviews: 3 },
};


export default function LiveFeedPage() {
  const [category, setCategory] = useState<Category>('all');
  const [isLive, setIsLive] = useState(true);

  const categories: { id: Category; label: string; count: number }[] = [
    { id: 'all', label: 'All Activity', count: feedItems.length },
    { id: 'leads', label: 'Leads', count: feedItems.filter(f => f.category === 'leads').length },
    { id: 'bookings', label: 'Bookings', count: feedItems.filter(f => f.category === 'bookings').length },
    { id: 'reviews', label: 'Reviews', count: feedItems.filter(f => f.category === 'reviews').length },
    { id: 'events', label: 'Events', count: feedItems.filter(f => f.category === 'events').length },
    { id: 'coaches', label: 'Coaches', count: feedItems.filter(f => f.category === 'coaches').length },
    { id: 'system', label: 'System', count: feedItems.filter(f => f.category === 'system').length },
  ];

  const filtered = category === 'all' ? feedItems : feedItems.filter(f => f.category === category);
  const newCount = feedItems.filter(f => f.isNew).length;

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" /> Live Activity Feed
                {isLive && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-[10px] text-green-400">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" /> LIVE
                </span>}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Real-time platform activity stream</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsLive(!isLive)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  isLive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-100/50 text-text-muted border border-slate-200')}>
                {isLive ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* today's summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Leads Today', value: liveStats.today.leads.toString(), icon: UserPlus, color: 'text-blue-400' },
            { label: 'Bookings Today', value: liveStats.today.bookings.toString(), icon: CheckCircle, color: 'text-green-400' },
            { label: 'Revenue Today', value: `$${liveStats.today.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
            { label: 'Reviews Today', value: liveStats.today.reviews.toString(), icon: Star, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
              <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* categories */}
          <div className="col-span-3 space-y-1">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Categories</h3>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all',
                  category === c.id
                    ? 'bg-atlas-500/10 text-atlas-400'
                    : 'text-text-muted hover:text-text-secondary hover:bg-slate-50')}>
                <span>{c.label}</span>
                <span className={cn('px-1.5 py-0.5 rounded-full text-[9px]',
                  category === c.id ? 'bg-atlas-500/20 text-atlas-400' : 'bg-slate-50 text-text-muted')}>{c.count}</span>
              </button>
            ))}
          </div>

          {/* feed */}
          <div className="col-span-9 space-y-1">
            {newCount > 0 && (
              <div className="p-2 rounded-lg bg-atlas-500/5 border border-atlas-500/15 text-center mb-2">
                <span className="text-[10px] text-atlas-400">{newCount} new activities</span>
              </div>
            )}

            {filtered.map(item => (
              <div key={item.id} className={cn('flex items-start gap-3 p-4 rounded-xl border transition-all',
                item.isNew ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-200')}>
                {/* icon */}
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  item.isNew ? 'bg-slate-100' : 'bg-slate-50')}>
                  <item.icon className={cn('w-4 h-4', item.iconColor)} />
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.isNew && <div className="w-1.5 h-1.5 rounded-full bg-atlas-500 shrink-0" />}
                    <p className="text-xs font-medium text-text-primary">{item.title}</p>
                    {item.zone && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-50 text-text-muted flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {item.zone}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">{item.description}</p>
                </div>

                {/* right */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-text-muted">{item.time}</p>
                  {item.amount && (
                    <p className="text-xs font-bold text-green-400 mt-0.5">{item.amount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
