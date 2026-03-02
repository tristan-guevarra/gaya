// notification center - dropdown with categories, mark-as-read, and action buttons

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell, X, Check, CheckCheck, Settings, Calendar,
  Users, Star, MapPin, Zap, TrendingUp, AlertTriangle,
  MessageSquare, UserPlus, BookOpen, Flame, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// types

interface Notification {
  id: string;
  type: 'booking' | 'lead' | 'alert' | 'milestone' | 'system' | 'review' | 'recommendation';
  title: string;
  message: string;
  time: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  avatar_initials?: string;
}

// mock data

const NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'booking', title: 'New Booking!', message: 'Sarah M. booked Spring Elite Camp (Apr 14-18)', time: '2 min ago', read: false, action_url: '/events/e1', action_label: 'View Booking', avatar_initials: 'SM' },
  { id: '2', type: 'lead', title: 'New Lead', message: 'Parent inquired about private training in Scarborough', time: '15 min ago', read: false, action_url: '/pulse', action_label: 'View Lead', avatar_initials: 'PK' },
  { id: '3', type: 'alert', title: 'Almost Full!', message: 'Spring Elite Camp is 88% full (21/24). Consider opening a waitlist.', time: '1 hr ago', read: false, action_url: '/events/e1' },
  { id: '4', type: 'milestone', title: 'Milestone Reached 🎉', message: 'You've trained 100 athletes this season!', time: '3 hr ago', read: true },
  { id: '5', type: 'review', title: 'New Review', message: 'Alex K. left a 5-star review: "Best coach in the GTA!"', time: '5 hr ago', read: true, action_url: '/coaches/c1', avatar_initials: 'AK' },
  { id: '6', type: 'recommendation', title: 'AI Insight', message: 'Scarborough East has 2.5× demand vs supply. Launch a clinic there?', time: '8 hr ago', read: true, action_url: '/intelligence' },
  { id: '7', type: 'system', title: 'System Update', message: 'Revenue forecasting is now available in your dashboard.', time: '1 day ago', read: true },
  { id: '8', type: 'booking', title: 'Booking Confirmed', message: 'James O. confirmed payment for Goalkeeper Masterclass', time: '1 day ago', read: true, avatar_initials: 'JO' },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  booking: { icon: Calendar, color: 'bg-atlas-500/15 text-atlas-400' },
  lead: { icon: UserPlus, color: 'bg-blue-500/15 text-blue-400' },
  alert: { icon: AlertTriangle, color: 'bg-amber-500/15 text-amber-400' },
  milestone: { icon: Star, color: 'bg-purple-500/15 text-purple-400' },
  review: { icon: MessageSquare, color: 'bg-cyan-500/15 text-cyan-400' },
  recommendation: { icon: Zap, color: 'bg-rose-500/15 text-rose-400' },
  system: { icon: Shield, color: 'bg-slate-100 text-text-muted' },
};

// component

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} className="relative">
      {/* bell button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative w-9 h-9 rounded-xl flex items-center justify-center transition-all',
          open
            ? 'bg-atlas-500/10 text-atlas-400'
            : 'bg-slate-100/50 text-text-muted hover:text-text-secondary hover:bg-slate-100'
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-[380px] max-h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/8 overflow-hidden animate-slide-up z-50">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="font-display font-semibold text-sm text-text-primary">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-atlas-400 hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <Link href="/settings" onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100/50 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all">
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* filter tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-slate-200">
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                  filter === f ? 'bg-atlas-500/10 text-atlas-400' : 'text-text-muted hover:text-text-secondary')}>
                {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>

          {/* list */}
          <div className="overflow-y-auto max-h-[380px] scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-text-muted/20 mx-auto mb-2" />
                <p className="text-sm text-text-muted">No notifications</p>
              </div>
            ) : (
              filtered.map(n => {
                const cfg = typeConfig[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex gap-3 px-4 py-3 border-b border-white/[0.03] transition-colors cursor-pointer',
                      !n.read ? 'bg-atlas-500/[0.03] hover:bg-atlas-500/[0.06]' : 'hover:bg-slate-50'
                    )}
                  >
                    {/* icon or avatar */}
                    {n.avatar_initials ? (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-atlas-400 shrink-0">
                        {n.avatar_initials}
                      </div>
                    ) : (
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', cfg.color)}>
                        <cfg.icon className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-xs font-medium truncate', !n.read ? 'text-text-primary' : 'text-text-secondary')}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-text-muted/50 whitespace-nowrap shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                      {n.action_url && n.action_label && (
                        <Link href={n.action_url} onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-[10px] text-atlas-400 hover:underline mt-1">
                          {n.action_label} <Zap className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>

                    {/* unread dot */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-atlas-500 mt-2 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* footer */}
          <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
            <Link href="/settings" onClick={() => setOpen(false)}
              className="text-xs text-text-muted hover:text-atlas-400 transition-colors text-center block">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
