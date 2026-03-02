/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Notification Center
   Full notification system with categories, read/unread state,
   action items, priority levels, bulk actions, and notification
   preferences management.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Filter,
  Users, Calendar, DollarSign, Star, MapPin, TrendingUp,
  AlertTriangle, Zap, MessageCircle, Shield, Award,
  Clock, ChevronRight, Settings, Brain, Target,
  ArrowUpRight, Eye, Mail, Sparkles, Activity, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type NotifCategory = 'all' | 'leads' | 'events' | 'revenue' | 'system' | 'ai' | 'team';
type Priority = 'urgent' | 'high' | 'normal' | 'low';

interface Notification {
  id: string;
  title: string;
  body: string;
  category: Exclude<NotifCategory, 'all'>;
  priority: Priority;
  icon: React.ElementType;
  iconColor: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  timestamp: string;
  relativeTime: string;
  actor?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const initialNotifications: Notification[] = [
  {
    id: '1', title: 'New Lead — Scarborough East', body: 'Sarah M. is looking for elite camp training for her 11-year-old. Matches your zone.',
    category: 'leads', priority: 'high', icon: Users, iconColor: 'text-blue-400 bg-blue-500/10',
    read: false, actionLabel: 'View Lead', timestamp: '2025-04-15T14:32:00', relativeTime: '12 min ago',
  },
  {
    id: '2', title: 'Event Almost Full', body: 'Spring Elite Camp is at 37/40 capacity. 3 spots remaining.',
    category: 'events', priority: 'normal', icon: Calendar, iconColor: 'text-atlas-400 bg-atlas-500/10',
    read: false, actionLabel: 'View Event', timestamp: '2025-04-15T14:15:00', relativeTime: '29 min ago',
  },
  {
    id: '3', title: 'AI Insight: Expansion Opportunity', body: 'Brampton North has 0 camps within 5km but high search volume. Launch score: 91/100.',
    category: 'ai', priority: 'high', icon: Brain, iconColor: 'text-purple-400 bg-purple-500/10',
    read: false, actionLabel: 'View Analysis', timestamp: '2025-04-15T13:45:00', relativeTime: '1 hour ago',
  },
  {
    id: '4', title: 'Payment Received — $2,840', body: 'Weekly payout processed. 12 bookings across 3 events.',
    category: 'revenue', priority: 'normal', icon: DollarSign, iconColor: 'text-green-400 bg-green-500/10',
    read: false, actionLabel: 'View Earnings', timestamp: '2025-04-15T12:00:00', relativeTime: '2 hours ago',
  },
  {
    id: '5', title: 'New 5-Star Review', body: '"Marcus is hands down the best coach my son has ever trained with. Incredible attention to detail." — Alex M.',
    category: 'team', priority: 'low', icon: Star, iconColor: 'text-amber-400 bg-amber-500/10',
    read: false, timestamp: '2025-04-15T10:30:00', relativeTime: '4 hours ago',
  },
  {
    id: '6', title: 'Churn Risk Alert', body: 'Mississauga Youth health score dropped to 38. Contract renewal in 30 days.',
    category: 'system', priority: 'urgent', icon: AlertTriangle, iconColor: 'text-red-400 bg-red-500/10',
    read: true, actionLabel: 'Run Playbook', timestamp: '2025-04-15T09:00:00', relativeTime: '5 hours ago',
  },
  {
    id: '7', title: 'Automation Completed', body: 'Post-Session Review requests sent to 8 parents after Elite Camp Day 3.',
    category: 'system', priority: 'low', icon: Zap, iconColor: 'text-amber-400 bg-amber-500/10',
    read: true, timestamp: '2025-04-15T08:30:00', relativeTime: '6 hours ago',
  },
  {
    id: '8', title: 'Coach Milestone: 50K XP', body: 'Sarah Chen reached 50,000 XP! Diamond tier badge unlocked.',
    category: 'team', priority: 'normal', icon: Award, iconColor: 'text-purple-400 bg-purple-500/10',
    read: true, timestamp: '2025-04-14T16:00:00', relativeTime: 'Yesterday',
  },
  {
    id: '9', title: 'A/B Test Results Ready', body: 'Camp Pricing experiment reached 87.4% confidence. $249 variant winning by +33%.',
    category: 'ai', priority: 'high', icon: Target, iconColor: 'text-green-400 bg-green-500/10',
    read: true, actionLabel: 'View Results', timestamp: '2025-04-14T14:00:00', relativeTime: 'Yesterday',
  },
  {
    id: '10', title: 'New Lead — North York', body: 'Michael K. looking for private training sessions in North York area.',
    category: 'leads', priority: 'normal', icon: Users, iconColor: 'text-blue-400 bg-blue-500/10',
    read: true, timestamp: '2025-04-14T11:00:00', relativeTime: 'Yesterday',
  },
  {
    id: '11', title: 'Weekly Report Ready', body: 'Your weekly performance report is ready. Revenue up 12%, fill rate at 94%.',
    category: 'system', priority: 'normal', icon: Activity, iconColor: 'text-atlas-400 bg-atlas-500/10',
    read: true, actionLabel: 'View Report', timestamp: '2025-04-14T08:00:00', relativeTime: '2 days ago',
  },
  {
    id: '12', title: 'AI: Optimal Time Slot Found', body: 'Thursday 5-7 PM in Scarborough East has 92% predicted fill rate with zero competition.',
    category: 'ai', priority: 'normal', icon: Sparkles, iconColor: 'text-purple-400 bg-purple-500/10',
    read: true, timestamp: '2025-04-13T15:00:00', relativeTime: '2 days ago',
  },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeCategory, setActiveCategory] = useState<NotifCategory>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const categories: { id: NotifCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'team', label: 'Team', icon: Heart },
    { id: 'system', label: 'System', icon: Shield },
  ];

  const filtered = useMemo(() => {
    let result = notifications;
    if (activeCategory !== 'all') result = result.filter(n => n.category === activeCategory);
    if (showUnreadOnly) result = result.filter(n => !n.read);
    return result;
  }, [notifications, activeCategory, showUnreadOnly]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.filter(n => !n.read).forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const priorityBadge: Record<Priority, { color: string; label: string }> = {
    urgent: { color: 'bg-red-500/10 text-red-400', label: 'URGENT' },
    high: { color: 'bg-amber-500/10 text-amber-400', label: 'HIGH' },
    normal: { color: '', label: '' },
    low: { color: '', label: '' },
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Bell className="w-5 h-5 text-atlas-400" /> Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">{unreadCount}</span>
                )}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Stay on top of leads, events, and AI insights</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                  showUnreadOnly
                    ? 'bg-atlas-500/10 text-atlas-400 border border-atlas-500/20'
                    : 'bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary')}>
                <Eye className="w-3.5 h-3.5" /> Unread Only
              </button>
              <button onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary hover:bg-slate-100">
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Settings className="w-3.5 h-3.5" /> Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Categories */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-1">
              {categories.map(cat => {
                const count = cat.id === 'all' ? unreadCount : (categoryCounts[cat.id] || 0);
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                      activeCategory === cat.id
                        ? 'bg-atlas-500/10 border border-atlas-500/20'
                        : 'hover:bg-slate-50 border border-transparent')}>
                    <cat.icon className={cn('w-4 h-4', activeCategory === cat.id ? 'text-atlas-400' : 'text-text-muted')} />
                    <span className={cn('text-xs font-medium flex-1', activeCategory === cat.id ? 'text-atlas-400' : 'text-text-secondary')}>
                      {cat.label}
                    </span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400">{count}</span>
                    )}
                  </button>
                );
              })}

              {/* Quick Stats */}
              <div className="mt-6 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">Today&apos;s Summary</h4>
                {[
                  { label: 'New Leads', value: '3', icon: Users, color: 'text-blue-400' },
                  { label: 'Events Updated', value: '2', icon: Calendar, color: 'text-atlas-400' },
                  { label: 'Revenue', value: '$2,840', icon: DollarSign, color: 'text-green-400' },
                  { label: 'AI Insights', value: '4', icon: Brain, color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      <s.icon className={cn('w-3 h-3', s.color)} /> {s.label}
                    </span>
                    <span className="text-xs font-display font-bold text-text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Notification List */}
          <div className="col-span-9 space-y-2">
            {filtered.length === 0 && (
              <div className="p-12 text-center rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <BellOff className="w-10 h-10 text-text-muted/20 mx-auto mb-3" />
                <p className="text-sm text-text-muted">No notifications</p>
                <p className="text-xs text-text-muted/50 mt-1">
                  {showUnreadOnly ? 'All caught up! Try showing all notifications.' : 'Nothing in this category.'}
                </p>
              </div>
            )}

            {filtered.map(notif => (
              <div key={notif.id} onClick={() => markAsRead(notif.id)}
                className={cn(
                  'group p-4 rounded-xl border transition-all cursor-pointer',
                  notif.read
                    ? 'bg-slate-50/30 border-slate-200 hover:border-slate-200'
                    : 'bg-white border-slate-200 hover:border-atlas-500/20'
                )}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', notif.iconColor)}>
                    <notif.icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-atlas-400 shrink-0" />}
                      <h4 className={cn('text-sm font-medium truncate', notif.read ? 'text-text-secondary' : 'text-text-primary')}>
                        {notif.title}
                      </h4>
                      {priorityBadge[notif.priority].label && (
                        <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0', priorityBadge[notif.priority].color)}>
                          {priorityBadge[notif.priority].label}
                        </span>
                      )}
                    </div>
                    <p className={cn('text-xs leading-relaxed', notif.read ? 'text-text-muted/60' : 'text-text-muted')}>
                      {notif.body}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-text-muted/50">{notif.relativeTime}</span>
                      {notif.actionLabel && (
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-atlas-500/10 text-[10px] font-medium text-atlas-400 hover:bg-atlas-500/15 transition-all"
                          onClick={e => { e.stopPropagation(); }}>
                          {notif.actionLabel} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button onClick={e => { e.stopPropagation(); markAsRead(notif.id); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100" title="Mark as read">
                        <Check className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
