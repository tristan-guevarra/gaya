/* ═══════════════════════════════════════════════════════════════
   Gaya — ⌘K Command Bar
   Spotlight/Raycast-style command palette with fuzzy search,
   keyboard navigation, recent commands, and AI integration
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, Calendar, Users, BarChart3, Shield,
  Zap, TrendingUp, Activity, Globe, Settings, Bell,
  Map, ChevronRight, Sparkles, Clock, ArrowRight,
  Command, CornerDownLeft, ArrowUp, ArrowDown,
  Brain, Layers, Target, FileText, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────

type CommandCategory = 'navigation' | 'actions' | 'search' | 'ai' | 'recent';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: CommandCategory;
  keywords: string[];
  action: () => void;
  shortcut?: string;
  badge?: string;
}

// ─── Command Registry ───────────────────────────────────────

function useCommands() {
  const router = useRouter();

  return useMemo<CommandItem[]>(() => [
    // ── Navigation ──
    { id: 'nav-map', label: 'Discovery Map', description: 'Find training near you', icon: Map, category: 'navigation', keywords: ['map', 'discover', 'find', 'search', 'training'], action: () => router.push('/map'), shortcut: 'G M' },
    { id: 'nav-intelligence', label: 'Intelligence Dashboard', description: 'Supply & demand analytics', icon: BarChart3, category: 'navigation', keywords: ['intelligence', 'analytics', 'dashboard', 'supply', 'demand'], action: () => router.push('/intelligence'), shortcut: 'G I' },
    { id: 'nav-simulator', label: 'What-If Simulator', description: 'Model new camp scenarios', icon: Zap, category: 'navigation', keywords: ['simulator', 'what-if', 'model', 'predict', 'scenario'], action: () => router.push('/simulator'), shortcut: 'G S' },
    { id: 'nav-forecast', label: 'Revenue Forecasting', description: 'Financial projections', icon: TrendingUp, category: 'navigation', keywords: ['forecast', 'revenue', 'projection', 'financial', 'money'], action: () => router.push('/forecast'), shortcut: 'G F' },
    { id: 'nav-landscape', label: 'Competitive Landscape', description: 'Zone benchmarking', icon: Target, category: 'navigation', keywords: ['landscape', 'competitive', 'benchmark', 'compare', 'zone'], action: () => router.push('/landscape'), shortcut: 'G L' },
    { id: 'nav-pulse', label: 'Pulse Feed', description: 'Real-time activity', icon: Activity, category: 'navigation', keywords: ['pulse', 'feed', 'activity', 'real-time', 'live'], action: () => router.push('/pulse'), shortcut: 'G P' },
    { id: 'nav-admin', label: 'Admin Center', description: 'Feature flags & audit logs', icon: Shield, category: 'navigation', keywords: ['admin', 'settings', 'flags', 'audit', 'manage'], action: () => router.push('/admin'), shortcut: 'G A' },
    { id: 'nav-reports', label: 'Market Reports', description: 'Zone intelligence reports', icon: FileText, category: 'navigation', keywords: ['reports', 'market', 'zone', 'intelligence', 'pdf'], action: () => router.push('/reports') },
    { id: 'nav-discover', label: 'Discovery Feed', description: 'Swipe through training', icon: Sparkles, category: 'navigation', keywords: ['discover', 'feed', 'swipe', 'browse', 'explore'], action: () => router.push('/discover') },
    { id: 'nav-settings', label: 'Settings', description: 'Account & preferences', icon: Settings, category: 'navigation', keywords: ['settings', 'preferences', 'account', 'profile', 'notification'], action: () => router.push('/settings') },

    // ── Actions ──
    { id: 'act-new-event', label: 'Create New Event', description: 'Publish a camp, clinic, or session', icon: Plus, category: 'actions', keywords: ['create', 'new', 'event', 'camp', 'clinic', 'publish'], action: () => router.push('/events/new'), badge: 'Coach' },
    { id: 'act-new-report', label: 'Generate Report', description: 'Create a zone market report', icon: FileText, category: 'actions', keywords: ['generate', 'report', 'create', 'pdf', 'export'], action: () => router.push('/reports/new'), badge: 'Admin' },
    { id: 'act-run-analysis', label: 'Run Zone Analysis', description: 'Compute fresh supply/demand scores', icon: Brain, category: 'actions', keywords: ['run', 'analysis', 'compute', 'refresh', 'recalculate'], action: () => { /* trigger celery task */ }, badge: 'Admin' },
    { id: 'act-export-csv', label: 'Export Data', description: 'Download CSV of current view', icon: ArrowRight, category: 'actions', keywords: ['export', 'csv', 'download', 'data', 'spreadsheet'], action: () => { /* trigger export */ } },

    // ── AI Commands ──
    { id: 'ai-underserved', label: 'Show underserved zones', description: 'AI: Find high-demand, low-supply areas', icon: Brain, category: 'ai', keywords: ['underserved', 'gap', 'opportunity', 'ai', 'demand'], action: () => router.push('/intelligence?layer=underserved'), badge: 'AI' },
    { id: 'ai-recommend', label: 'Where should I launch next?', description: 'AI: Top expansion recommendations', icon: Sparkles, category: 'ai', keywords: ['recommend', 'launch', 'expand', 'where', 'best'], action: () => router.push('/intelligence?tab=recommendations'), badge: 'AI' },
    { id: 'ai-forecast-peak', label: 'When is peak demand?', description: 'AI: Seasonal demand forecast', icon: TrendingUp, category: 'ai', keywords: ['peak', 'demand', 'season', 'when', 'forecast'], action: () => router.push('/forecast?highlight=peak'), badge: 'AI' },
    { id: 'ai-compare', label: 'Compare two zones', description: 'AI: Side-by-side zone comparison', icon: Layers, category: 'ai', keywords: ['compare', 'versus', 'vs', 'zone', 'benchmark'], action: () => router.push('/landscape?mode=compare'), badge: 'AI' },
  ], [router]);
}

// ─── Fuzzy Search ───────────────────────────────────────────

function fuzzyMatch(query: string, targets: string[]): number {
  const q = query.toLowerCase();
  let bestScore = 0;
  for (const target of targets) {
    const t = target.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) bestScore = Math.max(bestScore, 80);
    if (t.includes(q)) bestScore = Math.max(bestScore, 60);
    // Fuzzy: check if all chars of query appear in order
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) qi++;
    }
    if (qi === q.length) bestScore = Math.max(bestScore, 40);
  }
  return bestScore;
}

// ─── Category Labels ────────────────────────────────────────

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  recent: 'Recent',
  navigation: 'Go to',
  actions: 'Actions',
  search: 'Search',
  ai: 'AI Assistant',
};

const CATEGORY_ORDER: CommandCategory[] = ['recent', 'ai', 'actions', 'navigation'];

// ─── Component ──────────────────────────────────────────────

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const commands = useCommands();

  // Load recent from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gaya-cmd-recent');
      if (stored) setRecentIds(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Global keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter + sort results
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent + all categories
      const recents: CommandItem[] = recentIds
        .map(id => commands.find(c => c.id === id))
        .filter(Boolean)
        .slice(0, 3) as CommandItem[];

      const grouped = new Map<CommandCategory, CommandItem[]>();
      if (recents.length) grouped.set('recent', recents);
      for (const cmd of commands) {
        const cat = cmd.category;
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(cmd);
      }
      return grouped;
    }

    const scored = commands.map(cmd => ({
      cmd,
      score: fuzzyMatch(query, [cmd.label, cmd.description || '', ...cmd.keywords]),
    })).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    const grouped = new Map<CommandCategory, CommandItem[]>();
    for (const { cmd } of scored) {
      if (!grouped.has(cmd.category)) grouped.set(cmd.category, []);
      grouped.get(cmd.category)!.push(cmd);
    }
    return grouped;
  }, [query, commands, recentIds]);

  // Flatten for keyboard navigation
  const flatItems = useMemo(() => {
    const items: CommandItem[] = [];
    for (const cat of CATEGORY_ORDER) {
      const catItems = results.get(cat);
      if (catItems) items.push(...catItems);
    }
    // Also include any categories not in order
    for (const [cat, catItems] of results) {
      if (!CATEGORY_ORDER.includes(cat)) items.push(...catItems);
    }
    return items;
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      e.preventDefault();
      executeCommand(flatItems[selectedIndex]);
    }
  }, [flatItems, selectedIndex]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Execute
  const executeCommand = (cmd: CommandItem) => {
    // Track recent
    const newRecent = [cmd.id, ...recentIds.filter(id => id !== cmd.id)].slice(0, 5);
    setRecentIds(newRecent);
    try { localStorage.setItem('gaya-cmd-recent', JSON.stringify(newRecent)); } catch { /* */ }

    setOpen(false);
    cmd.action();
  };

  if (!open) return null;

  let globalIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)} />

      {/* Command Palette */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
        <div className="w-full max-w-[580px] pointer-events-auto animate-slide-up">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/8 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
              <Search className="w-5 h-5 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, pages, actions..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none font-body"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-text-muted bg-slate-100/50 px-2 py-1 rounded-md border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[380px] overflow-y-auto py-2 scrollbar-thin">
              {flatItems.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Brain className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-text-muted">No results for &quot;{query}&quot;</p>
                  <p className="text-xs text-text-muted/60 mt-1">Try a different search term</p>
                </div>
              ) : (
                <>
                  {CATEGORY_ORDER.map(cat => {
                    const items = results.get(cat);
                    if (!items?.length) return null;

                    return (
                      <div key={cat}>
                        <div className="px-5 pt-3 pb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/50">
                            {CATEGORY_LABELS[cat]}
                          </span>
                        </div>
                        {items.map((cmd) => {
                          const idx = globalIndex++;
                          const isSelected = idx === selectedIndex;
                          return (
                            <button
                              key={cmd.id}
                              data-index={idx}
                              onClick={() => executeCommand(cmd)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={cn(
                                'w-full flex items-center gap-3 px-5 py-2.5 transition-colors text-left',
                                isSelected
                                  ? 'bg-atlas-500/10 text-text-primary'
                                  : 'text-text-secondary hover:bg-slate-50'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                                isSelected
                                  ? 'bg-atlas-500/20 text-atlas-400'
                                  : 'bg-slate-100/50 text-text-muted'
                              )}>
                                <cmd.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{cmd.label}</span>
                                  {cmd.badge && (
                                    <span className={cn(
                                      'text-[9px] font-semibold px-1.5 py-0.5 rounded',
                                      cmd.badge === 'AI'
                                        ? 'bg-purple-500/15 text-purple-400'
                                        : cmd.badge === 'Admin'
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-blue-500/10 text-blue-400'
                                    )}>
                                      {cmd.badge}
                                    </span>
                                  )}
                                </div>
                                {cmd.description && (
                                  <p className="text-xs text-text-muted truncate">{cmd.description}</p>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                  {cmd.shortcut.split(' ').map((k, i) => (
                                    <kbd key={i} className="text-[10px] text-text-muted bg-slate-100/50 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                      {k}
                                    </kbd>
                                  ))}
                                </div>
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
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 text-[10px] text-text-muted/50">
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
              <span className="text-[10px] text-text-muted/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gaya
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Trigger Button (for Navbar) ────────────────────────────

export function CommandBarTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-sm text-text-muted hover:text-text-secondary hover:bg-slate-100 transition-all group"
    >
      <Search className="w-3.5 h-3.5" />
      <span className="text-xs hidden lg:inline">Search...</span>
      <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] bg-slate-100/50 px-1.5 py-0.5 rounded border border-slate-200">
        <Command className="w-2.5 h-2.5" />K
      </kbd>
    </button>
  );
}
