/* ═══════════════════════════════════════════════════════════════════
   Gaya — Product Changelog
   Beautiful release timeline with version badges, categorized
   features, breaking changes, and improvement tracking.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Bug, Zap, Shield, Globe, ArrowRight,
  Star, Check, AlertTriangle, Rocket, Wrench, Eye,
  Brain, MapPin, BarChart3, Users, Bell, Crown,
  ChevronDown, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface ChangeItem {
  type: 'feature' | 'improvement' | 'fix' | 'breaking';
  text: string;
  tag?: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  description: string;
  badge: 'major' | 'minor' | 'patch';
  icon: React.ElementType;
  items: ChangeItem[];
  highlights?: string[];
}

// ─── Releases Data ──────────────────────────────────────────────

const RELEASES: Release[] = [
  {
    version: '1.6.0', date: 'Feb 28, 2026', title: 'AI Chat Assistant & Gamification', description: 'Introducing Atlas AI — your personal zone intelligence assistant, plus a complete gamification system for coaches.',
    badge: 'major', icon: Brain,
    highlights: ['AI Chat Assistant', 'Coach Leaderboard & XP System', 'Kanban Lead Pipeline'],
    items: [
      { type: 'feature', text: 'AI Chat Assistant with natural language zone queries', tag: 'AI' },
      { type: 'feature', text: 'Coach leaderboard with XP, tiers, and achievements', tag: 'Gamification' },
      { type: 'feature', text: 'Kanban-style lead pipeline with drag-and-drop', tag: 'CRM' },
      { type: 'feature', text: 'Interactive API Playground with code generation', tag: 'Developer' },
      { type: 'feature', text: 'SaaS pricing page with tier comparison', tag: 'Growth' },
      { type: 'feature', text: 'Activity heatmap (GitHub-style contributions)', tag: 'Analytics' },
      { type: 'improvement', text: 'Command bar now supports AI query commands' },
      { type: 'improvement', text: 'Notification center performance improvements' },
      { type: 'fix', text: 'Fixed zone deep-dive chart tooltip positioning' },
    ],
  },
  {
    version: '1.5.0', date: 'Feb 25, 2026', title: 'Command Bar & Discovery Feed', description: 'Power-user productivity features including ⌘K command palette and TikTok-style event discovery.',
    badge: 'major', icon: Zap,
    highlights: ['⌘K Command Bar', 'Discovery Feed', 'Zone Deep-Dive'],
    items: [
      { type: 'feature', text: '⌘K command palette with fuzzy search and keyboard nav', tag: 'UX' },
      { type: 'feature', text: 'Swipeable discovery feed (TikTok-style event browsing)', tag: 'Discovery' },
      { type: 'feature', text: 'Zone deep-dive analytics page with 4 tabs', tag: 'Intelligence' },
      { type: 'feature', text: 'Coach onboarding wizard (5-step registration)', tag: 'Onboarding' },
      { type: 'feature', text: 'Notification center with real-time updates', tag: 'Engagement' },
      { type: 'feature', text: 'Market reports generator with AI recommendations', tag: 'Intelligence' },
      { type: 'feature', text: 'Settings & preferences page with 6 sections', tag: 'Admin' },
      { type: 'feature', text: 'Stunning animated landing page', tag: 'Growth' },
      { type: 'improvement', text: 'Navbar now integrates command bar trigger' },
      { type: 'fix', text: 'Fixed map clustering at low zoom levels' },
    ],
  },
  {
    version: '1.4.0', date: 'Feb 22, 2026', title: 'Revenue Forecasting & Competitive Intel', description: 'Advanced analytics expansion with ARIMA forecasting, competitive landscape analysis, and admin center.',
    badge: 'major', icon: BarChart3,
    highlights: ['Revenue Forecasting', 'Competitive Landscape', 'Admin Center'],
    items: [
      { type: 'feature', text: 'Revenue forecasting with ARIMA + GBM ensemble', tag: 'Analytics' },
      { type: 'feature', text: 'Competitive landscape analysis (5 competitors)', tag: 'Intelligence' },
      { type: 'feature', text: 'Admin center with audit logs and feature flags', tag: 'Admin' },
      { type: 'feature', text: 'Pulse activity feed with real-time events', tag: 'Engagement' },
      { type: 'feature', text: 'Coach profile pages with badges and stats', tag: 'Discovery' },
      { type: 'feature', text: 'Event detail pages with booking flow', tag: 'Discovery' },
      { type: 'improvement', text: 'Intelligence dashboard redesigned with new metrics' },
      { type: 'improvement', text: 'Map filter panel now supports date range' },
    ],
  },
  {
    version: '1.3.0', date: 'Feb 18, 2026', title: 'Intelligence Dashboard & Simulator', description: 'Core B2B intelligence features with supply/demand analytics and what-if simulation.',
    badge: 'major', icon: Globe,
    items: [
      { type: 'feature', text: 'Intelligence dashboard with zone metrics grid', tag: 'Intelligence' },
      { type: 'feature', text: 'What-If simulator for event planning', tag: 'ML' },
      { type: 'feature', text: 'Heatmap overlay for underserved zones', tag: 'Map' },
      { type: 'feature', text: 'Expansion recommendations with confidence scores', tag: 'ML' },
      { type: 'improvement', text: 'Added H3 hex grid visualization' },
      { type: 'improvement', text: 'API response times improved by 40%' },
      { type: 'fix', text: 'Fixed PostGIS distance calculations at high latitudes' },
      { type: 'breaking', text: 'Changed /api/v1/zones response format (see migration guide)' },
    ],
  },
  {
    version: '1.2.0', date: 'Feb 14, 2026', title: 'Auth, RBAC & Multi-Tenancy', description: 'Security and access control with JWT auth, role-based permissions, and organization isolation.',
    badge: 'minor', icon: Shield,
    items: [
      { type: 'feature', text: 'JWT authentication with refresh token rotation', tag: 'Auth' },
      { type: 'feature', text: 'Role-based access control (4 roles)', tag: 'Security' },
      { type: 'feature', text: 'Multi-tenant data isolation per organization', tag: 'Architecture' },
      { type: 'feature', text: 'Audit logging for all state changes', tag: 'Security' },
      { type: 'improvement', text: 'Rate limiting on public API endpoints' },
      { type: 'fix', text: 'Fixed session expiration edge case' },
    ],
  },
  {
    version: '1.1.0', date: 'Feb 10, 2026', title: 'Discovery Map MVP', description: 'First public release with interactive map, filters, and coach/event listings.',
    badge: 'minor', icon: MapPin,
    items: [
      { type: 'feature', text: 'Interactive discovery map with Mapbox GL', tag: 'Map' },
      { type: 'feature', text: 'Search filters: sport, type, age, price, distance', tag: 'Discovery' },
      { type: 'feature', text: 'Coach listing sidebar with rating and details', tag: 'Discovery' },
      { type: 'feature', text: 'Lead capture form (request info / join waitlist)', tag: 'Leads' },
      { type: 'feature', text: 'Seed data generator (Toronto / GTA)', tag: 'Data' },
      { type: 'improvement', text: 'Marker clustering at low zoom levels' },
    ],
  },
  {
    version: '1.0.0', date: 'Feb 5, 2026', title: 'Initial Release', description: 'Project foundation: database schema, API scaffolding, Docker setup, and CI/CD.',
    badge: 'patch', icon: Rocket,
    items: [
      { type: 'feature', text: 'PostgreSQL + PostGIS database with full schema', tag: 'Backend' },
      { type: 'feature', text: 'FastAPI backend with OpenAPI documentation', tag: 'Backend' },
      { type: 'feature', text: 'Next.js 14 frontend scaffolding', tag: 'Frontend' },
      { type: 'feature', text: 'Docker Compose setup (frontend, backend, db, redis)', tag: 'DevOps' },
      { type: 'feature', text: 'Alembic migrations and seed scripts', tag: 'Database' },
      { type: 'feature', text: 'Celery workers for background job processing', tag: 'Backend' },
    ],
  },
];

// ─── Change Type Styles ─────────────────────────────────────────

const CHANGE_STYLES = {
  feature: { icon: Sparkles, color: 'text-atlas-400', bg: 'bg-atlas-500/10', label: 'New' },
  improvement: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Improved' },
  fix: { icon: Bug, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Fixed' },
  breaking: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Breaking' },
};

const BADGE_STYLES = {
  major: 'bg-atlas-500/15 text-atlas-400 border-atlas-500/20',
  minor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  patch: 'bg-slate-100 text-text-muted border-slate-200',
};

// ─── Page Component ─────────────────────────────────────────────

export default function ChangelogPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedVersion, setExpandedVersion] = useState<string>('1.6.0');

  const typeFilters = ['all', 'feature', 'improvement', 'fix', 'breaking'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ Nav ═══ */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-atlas-500 to-atlas-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary">
              Gaya
            </span>
          </Link>
          <Link href="/map" className="px-4 py-2 rounded-xl bg-atlas-500 text-white text-sm font-semibold hover:bg-atlas-400 transition-all">
            Launch Map →
          </Link>
        </div>
      </nav>

      {/* ═══ Header ═══ */}
      <section className="relative pt-16 pb-8 px-6 text-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-atlas-500/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-atlas-500/10 border border-atlas-500/20 mb-6">
            <Tag className="w-3.5 h-3.5 text-atlas-400" />
            <span className="text-xs font-medium text-atlas-400">What&apos;s New</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl text-text-primary mb-3">Changelog</h1>
          <p className="text-base text-text-muted">Stay up to date with the latest features, improvements, and fixes.</p>
        </div>
      </section>

      {/* ═══ Filters ═══ */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex gap-2">
          {typeFilters.map(type => (
            <button key={type} onClick={() => setFilterType(type)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filterType === type ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50')}>
              {type === 'all' ? 'All Changes' : CHANGE_STYLES[type as keyof typeof CHANGE_STYLES]?.label || type}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Timeline ═══ */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-slate-100" />

          <div className="space-y-8">
            {RELEASES.map(release => {
              const filteredItems = filterType === 'all'
                ? release.items
                : release.items.filter(i => i.type === filterType);

              if (filteredItems.length === 0) return null;
              const isExpanded = expandedVersion === release.version;

              return (
                <div key={release.version} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center',
                      release.badge === 'major' ? 'bg-atlas-500/15 border border-atlas-500/20' :
                      release.badge === 'minor' ? 'bg-blue-500/15 border border-blue-500/20' :
                      'bg-slate-100 border border-slate-200'
                    )}>
                      <release.icon className={cn('w-5 h-5',
                        release.badge === 'major' ? 'text-atlas-400' :
                        release.badge === 'minor' ? 'text-blue-400' : 'text-text-muted'
                      )} />
                    </div>
                  </div>

                  {/* Release Card */}
                  <div className="rounded-2xl bg-white backdrop-blur-xl border border-slate-200 overflow-hidden">
                    <button onClick={() => setExpandedVersion(isExpanded ? '' : release.version)}
                      className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={cn('px-2 py-0.5 rounded-md border text-xs font-mono font-bold', BADGE_STYLES[release.badge])}>
                            v{release.version}
                          </span>
                          <h3 className="font-display font-semibold text-text-primary">{release.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">{release.date}</span>
                          <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', isExpanded && 'rotate-180')} />
                        </div>
                      </div>
                      <p className="text-xs text-text-muted">{release.description}</p>

                      {/* Highlight Tags */}
                      {release.highlights && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {release.highlights.map(h => (
                            <span key={h} className="px-2 py-0.5 rounded-md bg-atlas-500/10 text-atlas-400 text-[10px] font-medium border border-atlas-500/15">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-6 pb-5 space-y-2 border-t border-slate-200 pt-4 animate-fade-in">
                        {filteredItems.map((item, i) => {
                          const style = CHANGE_STYLES[item.type];
                          return (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5', style.bg)}>
                                <style.icon className={cn('w-3 h-3', style.color)} />
                              </div>
                              <div className="flex-1 flex items-start gap-2">
                                <span className="text-xs text-text-secondary leading-relaxed">{item.text}</span>
                                {item.tag && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium text-text-muted bg-slate-50">
                                    {item.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs text-text-muted/50">© 2026 Gaya</span>
          <div className="flex gap-4 text-xs text-text-muted">
            <Link href="/" className="hover:text-text-secondary">Home</Link>
            <Link href="/map" className="hover:text-text-secondary">Map</Link>
            <Link href="/pricing" className="hover:text-text-secondary">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
