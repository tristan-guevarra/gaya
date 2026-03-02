// dashboard layout - sidebar nav with collapsible groups, search, and quick actions

'use client';

import { useState, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Users, Calendar, TrendingUp, BarChart3,
  Brain, Target, Zap, DollarSign, MapPin, Layers, Settings,
  ChevronLeft, ChevronRight, ChevronDown, Search, Bell,
  Star, Shield, Activity, MessageCircle, Trophy, Sparkles,
  Eye, PieChart, FileText, Palette, Smartphone, Swords,
  Award, Gift, BookOpen, QrCode, CircleDollarSign, BadgeCheck,
  Radio, Lock, Maximize, Copy, Clock, Gauge, UserCog,
  Megaphone, Puzzle, Beaker, HeartPulse, Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Calendar', href: '/calendar', icon: Calendar },
      { label: 'Messages', href: '/messages', icon: MessageCircle, badge: '3' },
      { label: 'Notifications', href: '/notifications', icon: Bell, badge: '5' },
      { label: 'Activity Feed', href: '/feed', icon: Radio },
    ],
  },
  {
    label: 'Discovery & Events',
    items: [
      { label: 'Event Templates', href: '/templates', icon: BookOpen },
      { label: 'Season Planner', href: '/season-planner', icon: Clock },
      { label: 'QR Check-In', href: '/check-in', icon: QrCode },
      { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Zone Intelligence', href: '/intelligence', icon: Map },
      { label: 'Expansion Recs', href: '/expansion', icon: Target },
      { label: 'Demand Forecast', href: '/forecast', icon: TrendingUp },
      { label: 'What-If Simulator', href: '/simulator', icon: Brain },
      { label: 'Landscape View', href: '/landscape', icon: Layers },
      { label: 'Competitive Intel', href: '/competitive', icon: Eye },
      { label: 'Territory Manager', href: '/territories', icon: Maximize },
    ],
  },
  {
    label: 'CRM & Growth',
    items: [
      { label: 'Lead Pipeline', href: '/pipeline', icon: Zap },
      { label: 'Customer Health', href: '/health', icon: HeartPulse },
      { label: 'AI Coach Matching', href: '/coach-matching', icon: Sparkles },
      { label: 'Parent Portal', href: '/parent-portal', icon: Users },
      { label: 'Cohort Analysis', href: '/cohorts', icon: PieChart },
    ],
  },
  {
    label: 'Revenue & Finance',
    items: [
      { label: 'Revenue Analytics', href: '/revenue', icon: DollarSign },
      { label: 'Financial Modeling', href: '/financials', icon: CircleDollarSign },
      { label: 'A/B Testing Lab', href: '/experiments', icon: Beaker },
      { label: 'Data Room', href: '/data-room', icon: FileText },
    ],
  },
  {
    label: 'Marketing & Content',
    items: [
      { label: 'Content Studio', href: '/content-studio', icon: Palette },
      { label: 'Reports Builder', href: '/reports', icon: BarChart3 },
      { label: 'Pulse Survey', href: '/pulse', icon: Activity },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Gamification Hub', href: '/gamification', icon: Trophy },
      { label: 'Collaboration', href: '/collaboration', icon: Swords },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Venue Intelligence', href: '/venues', icon: MapPin },
      { label: 'Certifications', href: '/certifications', icon: BadgeCheck },
      { label: 'Automations', href: '/automations', icon: Zap },
      { label: 'Integrations', href: '/integrations', icon: Puzzle },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Admin Panel', href: '/admin', icon: Shield },
      { label: 'Permissions', href: '/permissions', icon: Lock },
      { label: 'Goals & OKRs', href: '/goals', icon: Target },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'API Playground', href: '/api-playground', icon: FileText },
      { label: 'Mobile Preview', href: '/mobile-preview', icon: Smartphone },
    ],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(navGroups.map(g => [g.label, true]))
  );

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredGroups = useMemo(() => {
    if (!search) return navGroups;
    const q = search.toLowerCase();
    return navGroups.map(g => ({
      ...g,
      items: g.items.filter(i => i.label.toLowerCase().includes(q)),
    })).filter(g => g.items.length > 0);
  }, [search]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      {/* sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-screen border-r border-white/30 bg-white/40 backdrop-blur-xl flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-60'
      )}>
        {/* logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-white/30 shrink-0">
          {!collapsed ? (
            <Image src="/logo.png" alt="Gaya" width={160} height={50} className="h-11 w-auto" />
          ) : (
            <Image src="/logo.png" alt="Gaya" width={28} height={28} className="h-7 w-7 object-contain" />
          )}
        </div>

        {/* search */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border-white/30">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/40 border border-white/60">
              <Search className="w-3 h-3 text-text-muted shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search pages..." className="flex-1 bg-transparent text-[11px] text-text-primary placeholder:text-text-muted/40 outline-none" />
            </div>
          </div>
        )}

        {/* nav groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
          {filteredGroups.map(group => (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <button onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[9px] font-semibold text-text-muted/50 uppercase tracking-widest hover:text-text-muted">
                  <span>{group.label}</span>
                  <ChevronDown className={cn('w-3 h-3 transition-transform', !openGroups[group.label] && '-rotate-90')} />
                </button>
              )}

              {(collapsed || openGroups[group.label]) && (
                <div className="space-y-0.5 px-2">
                  {group.items.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg transition-all relative',
                          collapsed ? 'justify-center p-2.5' : 'px-2.5 py-1.5',
                          isActive
                            ? 'bg-atlas-400/10 text-atlas-500'
                            : 'text-text-muted hover:text-text-secondary hover:bg-white/40'
                        )}>
                        <item.icon className={cn('shrink-0', collapsed ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
                        {!collapsed && (
                          <>
                            <span className="text-[11px] font-medium truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-red-500 text-white shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && item.badge && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* collapse toggle */}
        <div className="border-t border-white/30 p-2 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-white/40 text-text-muted transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[10px]">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className={cn('flex-1 transition-all duration-300', collapsed ? 'ml-16' : 'ml-60')}>
        {children}
      </main>
    </div>
  );
}
