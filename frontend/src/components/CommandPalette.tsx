// command palette (cmd+k) - spotlight-style search with fuzzy matching and keyboard nav

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, MapPin, Calendar, Users, BarChart3, Settings, FileText,
  Map, Brain, Zap, Star, TrendingUp, Shield, Globe, Smartphone,
  DollarSign, Target, Layers, Activity, Bell, ChevronRight,
  Clock, ArrowRight, Hash, Command, CornerDownLeft, ArrowUp,
  ArrowDown, X, Sparkles, Building2, User, Link2, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

// types

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: 'navigation' | 'action' | 'search' | 'recent' | 'ai';
  href?: string;
  action?: () => void;
  keywords: string[];
  shortcut?: string;
  badge?: string;
}

// command registry

const commands: CommandItem[] = [
  // navigation
  { id: 'nav-dashboard', label: 'Dashboard', description: 'Overview & KPIs', icon: BarChart3, category: 'navigation', href: '/dashboard', keywords: ['dashboard', 'home', 'overview', 'kpi'] },
  { id: 'nav-map', label: 'Discovery Map', description: 'Interactive map with listings', icon: Map, category: 'navigation', href: '/map', keywords: ['map', 'discovery', 'explore', 'pins'] },
  { id: 'nav-intelligence', label: 'Intelligence Hub', description: 'Supply vs demand analysis', icon: Brain, category: 'navigation', href: '/intelligence', keywords: ['intelligence', 'supply', 'demand', 'analysis', 'geo'] },
  { id: 'nav-simulator', label: 'What-If Simulator', description: 'Predict event outcomes', icon: Target, category: 'navigation', href: '/simulator', keywords: ['simulator', 'predict', 'what-if', 'forecast'] },
  { id: 'nav-calendar', label: 'Smart Calendar', description: 'AI-powered scheduling', icon: Calendar, category: 'navigation', href: '/calendar', keywords: ['calendar', 'schedule', 'events', 'booking'] },
  { id: 'nav-revenue', label: 'Revenue Analytics', description: 'Waterfall, cohorts, forecast', icon: DollarSign, category: 'navigation', href: '/revenue', keywords: ['revenue', 'money', 'waterfall', 'cohorts', 'mrr', 'arr'] },
  { id: 'nav-pipeline', label: 'Lead Pipeline', description: 'CRM & lead management', icon: Users, category: 'navigation', href: '/pipeline', keywords: ['pipeline', 'leads', 'crm', 'sales', 'contacts'] },
  { id: 'nav-expansion', label: 'Expansion Playbook', description: 'Market entry wizard', icon: Globe, category: 'navigation', href: '/expansion', keywords: ['expansion', 'market', 'launch', 'playbook', 'growth'] },
  { id: 'nav-data-room', label: 'Investor Data Room', description: 'Fundraising metrics', icon: Building2, category: 'navigation', href: '/data-room', keywords: ['investor', 'data room', 'fundraising', 'arr', 'metrics'] },
  { id: 'nav-integrations', label: 'Integrations', description: 'Connected apps marketplace', icon: Link2, category: 'navigation', href: '/integrations', keywords: ['integrations', 'apps', 'connect', 'stripe', 'slack'] },
  { id: 'nav-leaderboard', label: 'Leaderboard', description: 'Coach rankings & XP', icon: Flame, category: 'navigation', href: '/leaderboard', keywords: ['leaderboard', 'ranking', 'xp', 'coaches', 'gamification'] },
  { id: 'nav-reports', label: 'Reports', description: 'Generate & export reports', icon: FileText, category: 'navigation', href: '/reports', keywords: ['reports', 'export', 'pdf', 'download'] },
  { id: 'nav-admin', label: 'Admin Panel', description: 'Users, orgs, feature flags', icon: Shield, category: 'navigation', href: '/admin', keywords: ['admin', 'users', 'organizations', 'flags', 'settings'] },
  { id: 'nav-settings', label: 'Settings', description: 'Account & preferences', icon: Settings, category: 'navigation', href: '/settings', keywords: ['settings', 'account', 'preferences', 'profile'] },
  { id: 'nav-zones', label: 'Zone Detail', description: 'Deep dive into a zone', icon: Layers, category: 'navigation', href: '/zones/scarborough-east', keywords: ['zone', 'area', 'neighborhood', 'detail'] },
  { id: 'nav-landscape', label: 'Competitive Landscape', description: 'Market positioning', icon: TrendingUp, category: 'navigation', href: '/landscape', keywords: ['landscape', 'competitive', 'competitors', 'market'] },
  { id: 'nav-pulse', label: 'Real-Time Pulse', description: 'Live activity stream', icon: Activity, category: 'navigation', href: '/pulse', keywords: ['pulse', 'live', 'realtime', 'activity', 'stream'] },
  { id: 'nav-mobile', label: 'Mobile App Preview', description: 'iPhone coach experience', icon: Smartphone, category: 'navigation', href: '/mobile-preview', keywords: ['mobile', 'app', 'iphone', 'ios'] },
  { id: 'nav-collaboration', label: 'Live Collaboration', description: 'Team presence & cursors', icon: Users, category: 'navigation', href: '/collaboration', keywords: ['collaboration', 'team', 'cursors', 'presence'] },
  { id: 'nav-api', label: 'API Playground', description: 'Test API endpoints', icon: Hash, category: 'navigation', href: '/api-playground', keywords: ['api', 'playground', 'endpoints', 'developer'] },
  { id: 'nav-activity', label: 'Activity Heatmap', description: 'GitHub-style contribution map', icon: Activity, category: 'navigation', href: '/activity', keywords: ['activity', 'heatmap', 'contributions'] },
  { id: 'nav-forecast', label: 'Demand Forecast', description: 'Predict future demand', icon: TrendingUp, category: 'navigation', href: '/forecast', keywords: ['forecast', 'demand', 'prediction', 'future'] },

  // actions
  { id: 'act-new-event', label: 'Create New Event', description: 'Camp, clinic, or private session', icon: Calendar, category: 'action', keywords: ['create', 'new', 'event', 'camp', 'clinic'], shortcut: 'N' },
  { id: 'act-add-coach', label: 'Add Coach', description: 'Onboard a new coach', icon: User, category: 'action', keywords: ['add', 'coach', 'onboard', 'new'], shortcut: 'C' },
  { id: 'act-export', label: 'Export Data', description: 'CSV, PDF, or JSON', icon: FileText, category: 'action', keywords: ['export', 'download', 'csv', 'pdf'], shortcut: 'E' },
  { id: 'act-notifications', label: 'View Notifications', description: 'Alerts and updates', icon: Bell, category: 'action', keywords: ['notifications', 'alerts', 'updates', 'bell'] },
  { id: 'act-invite', label: 'Invite Team Member', description: 'Send invite link', icon: Users, category: 'action', keywords: ['invite', 'team', 'member', 'add'] },

  // ai
  { id: 'ai-suggest', label: 'AI: Suggest Next Action', description: 'Get AI-powered recommendation', icon: Sparkles, category: 'ai', keywords: ['ai', 'suggest', 'recommend', 'help', 'next'] },
  { id: 'ai-analyze', label: 'AI: Analyze My Performance', description: 'Deep dive performance review', icon: Brain, category: 'ai', keywords: ['ai', 'analyze', 'performance', 'review'] },
  { id: 'ai-write', label: 'AI: Generate Marketing Copy', description: 'Social posts, emails, ads', icon: Sparkles, category: 'ai', keywords: ['ai', 'write', 'marketing', 'copy', 'generate', 'content'] },
  { id: 'ai-forecast', label: 'AI: Revenue Forecast', description: 'Predict next quarter revenue', icon: TrendingUp, category: 'ai', keywords: ['ai', 'forecast', 'revenue', 'predict', 'quarter'] },
];

const recentItems = [
  'nav-dashboard', 'nav-intelligence', 'nav-calendar', 'act-new-event', 'nav-revenue'
];

// fuzzy match

function fuzzyMatch(query: string, item: CommandItem): number {
  const q = query.toLowerCase();
  const targets = [item.label, item.description || '', ...item.keywords].map(s => s.toLowerCase());

  let bestScore = 0;
  for (const target of targets) {
    if (target === q) return 100;
    if (target.startsWith(q)) bestScore = Math.max(bestScore, 80);
    if (target.includes(q)) bestScore = Math.max(bestScore, 60);

    // character-by-character fuzzy matching
    let qi = 0;
    let consecutive = 0;
    let maxConsecutive = 0;
    for (let ti = 0; ti < target.length && qi < q.length; ti++) {
      if (target[ti] === q[qi]) {
        qi++;
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 0;
      }
    }
    if (qi === q.length) {
      const score = 30 + (maxConsecutive / q.length) * 30;
      bestScore = Math.max(bestScore, score);
    }
  }

  return bestScore;
}

// component

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // cmd+k listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // focus input
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // filter results
  const results = useMemo(() => {
    if (!query.trim()) {
      // show recents + popular
      const recents = recentItems.map(id => commands.find(c => c.id === id)!).filter(Boolean);
      return { recent: recents, results: [] };
    }

    const scored = commands
      .map(item => ({ item, score: fuzzyMatch(query, item) }))
      .filter(({ score }) => score > 25)
      .sort((a, b) => b.score - a.score);

    return { recent: [], results: scored.map(s => s.item) };
  }, [query]);

  const allItems = query.trim() ? results.results : results.recent;

  // keyboard nav
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = allItems[selectedIndex];
      if (item) {
        if (item.href) {
          // in production, use router.push(item.href)
          console.log('Navigate to:', item.href);
        }
        if (item.action) item.action();
        setOpen(false);
      }
    }
  }, [allItems, selectedIndex]);

  // reset selection on query change
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Pages',
    action: 'Actions',
    ai: 'AI Commands',
    recent: 'Recent',
    search: 'Search',
  };

  const categoryIcons: Record<string, React.ElementType> = {
    navigation: ArrowRight,
    action: Zap,
    ai: Sparkles,
    recent: Clock,
    search: Search,
  };

  // group results by category
  const grouped = allItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const cat = query.trim() ? item.category : 'recent';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setOpen(false)} />

      {/* palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[640px] z-[101]">
        <div className="mx-4 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/10 overflow-hidden">

          {/* search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, actions, AI commands..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded-md hover:bg-slate-100">
                <X className="w-3.5 h-3.5 text-text-muted" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-text-muted font-mono">
              ESC
            </kbd>
          </div>

          {/* results */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
            {Object.entries(grouped).length === 0 && query.trim() && (
              <div className="px-5 py-8 text-center">
                <Search className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-text-muted">No results for &quot;{query}&quot;</p>
                <p className="text-xs text-text-muted/50 mt-1">Try different keywords</p>
              </div>
            )}

            {Object.entries(grouped).map(([category, items]) => {
              const CatIcon = categoryIcons[category] || Search;
              return (
                <div key={category}>
                  {/* category header */}
                  <div className="flex items-center gap-2 px-5 py-1.5">
                    <CatIcon className="w-3 h-3 text-text-muted/50" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/50">
                      {categoryLabels[category] || category}
                    </span>
                  </div>

                  {/* items */}
                  {items.map(item => {
                    const idx = flatIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => {
                          if (item.href) console.log('Navigate:', item.href);
                          if (item.action) item.action();
                          setOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors',
                          isSelected ? 'bg-atlas-500/10' : 'hover:bg-slate-50'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          isSelected ? 'bg-atlas-500/20' : 'bg-slate-50',
                          item.category === 'ai' && 'bg-purple-500/10'
                        )}>
                          <item.icon className={cn(
                            'w-4 h-4',
                            isSelected ? 'text-atlas-400' :
                            item.category === 'ai' ? 'text-purple-400' : 'text-text-muted'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            isSelected ? 'text-text-primary' : 'text-text-secondary'
                          )}>{item.label}</p>
                          {item.description && (
                            <p className="text-xs text-text-muted/60 truncate">{item.description}</p>
                          )}
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-atlas-500/10 text-atlas-400">
                            {item.badge}
                          </span>
                        )}
                        {item.shortcut && (
                          <kbd className="hidden sm:block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-text-muted font-mono">
                            {item.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-atlas-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-4 text-[10px] text-text-muted/50">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" /> Select
              </span>
              <span className="flex items-center gap-1">
                ESC Close
              </span>
            </div>
            <span className="text-[10px] text-text-muted/30">{allItems.length} results</span>
          </div>
        </div>
      </div>
    </>
  );
}
