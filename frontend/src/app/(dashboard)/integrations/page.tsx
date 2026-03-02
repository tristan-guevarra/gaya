/* ═══════════════════════════════════════════════════════════════════
   Gaya — Integration Marketplace
   App store-style connector hub with 15 integrations across
   6 categories. Install/configure flow, usage stats, and
   connection status management.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  Puzzle, Search, Check, ExternalLink, Settings, Zap, Shield,
  Globe, CreditCard, Bell, Mail, MessageSquare, Calendar,
  BarChart3, Users, MapPin, Camera, Code, Star, ArrowRight,
  ChevronRight, Layers, Database, Cloud, Smartphone, Brain,
  DollarSign, X, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface Integration {
  id: string;
  name: string;
  description: string;
  longDesc: string;
  icon: React.ElementType;
  iconBg: string;
  category: string;
  status: 'connected' | 'available' | 'coming_soon';
  popular?: boolean;
  new?: boolean;
  installs: string;
  features: string[];
  tier: 'free' | 'pro' | 'enterprise';
}

// ─── Mock Data ──────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'data', label: 'Data & AI', icon: Brain },
];

const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe', name: 'Stripe', description: 'Accept payments, manage subscriptions, and handle refunds.',
    longDesc: 'Connect Stripe to process payments for event bookings, manage recurring subscriptions for coaches, and automate invoicing. Supports Apple Pay, Google Pay, and 135+ currencies.',
    icon: CreditCard, iconBg: 'from-violet-500 to-indigo-600', category: 'payments',
    status: 'connected', popular: true, installs: '12.4K', tier: 'free',
    features: ['Payment processing', 'Subscription management', 'Automatic invoicing', 'Refund handling'],
  },
  {
    id: 'google-calendar', name: 'Google Calendar', description: 'Sync events, manage availability, and prevent double-bookings.',
    longDesc: 'Two-way sync between Gaya events and Google Calendar. Automatically block availability when coaches have personal events. Smart conflict detection.',
    icon: Calendar, iconBg: 'from-blue-500 to-cyan-500', category: 'scheduling',
    status: 'connected', popular: true, installs: '18.2K', tier: 'free',
    features: ['Two-way event sync', 'Availability blocking', 'Conflict detection', 'Timezone handling'],
  },
  {
    id: 'twilio', name: 'Twilio SMS', description: 'Send booking confirmations, reminders, and marketing via SMS.',
    longDesc: 'Automated SMS for booking confirmations, event reminders (24h before), waitlist notifications, and promotional campaigns. Supports MMS for flyers.',
    icon: Smartphone, iconBg: 'from-red-500 to-pink-500', category: 'communication',
    status: 'connected', installs: '8.7K', tier: 'pro',
    features: ['Booking confirmations', 'Event reminders', 'Waitlist alerts', 'Marketing campaigns'],
  },
  {
    id: 'sendgrid', name: 'SendGrid', description: 'Transactional emails and marketing campaigns at scale.',
    longDesc: 'Professional email templates for booking receipts, event updates, coach newsletters, and drip campaigns for lead nurturing. Built-in analytics.',
    icon: Mail, iconBg: 'from-sky-500 to-blue-600', category: 'communication',
    status: 'available', popular: true, installs: '15.1K', tier: 'free',
    features: ['Email templates', 'Drip campaigns', 'Analytics', 'Contact management'],
  },
  {
    id: 'hubspot', name: 'HubSpot CRM', description: 'Sync leads, manage contacts, and track deal pipeline.',
    longDesc: 'Bi-directional sync between Atlas leads and HubSpot contacts. Auto-create deals from event inquiries. Sync coach profiles as company records.',
    icon: Users, iconBg: 'from-orange-500 to-amber-500', category: 'crm',
    status: 'available', installs: '6.3K', tier: 'pro',
    features: ['Contact sync', 'Deal pipeline', 'Lead scoring', 'Activity logging'],
  },
  {
    id: 'google-analytics', name: 'Google Analytics 4', description: 'Track user behavior, conversions, and marketing attribution.',
    longDesc: 'Send events for listing views, search queries, booking conversions, and lead submissions. Custom dimensions for sport, zone, and coach data.',
    icon: BarChart3, iconBg: 'from-amber-500 to-yellow-500', category: 'analytics',
    status: 'available', installs: '22.8K', tier: 'free',
    features: ['Event tracking', 'Conversion funnels', 'Custom dimensions', 'Attribution'],
  },
  {
    id: 'mapbox', name: 'Mapbox', description: 'Premium map tiles, geocoding, and route optimization.',
    longDesc: 'High-performance map rendering with custom styles. Geocoding for address-to-coordinate conversion. Route optimization for multi-location events.',
    icon: MapPin, iconBg: 'from-teal-500 to-emerald-500', category: 'data',
    status: 'connected', installs: '9.4K', tier: 'free',
    features: ['Custom map styles', 'Geocoding API', 'Route optimization', 'Satellite imagery'],
  },
  {
    id: 'slack', name: 'Slack', description: 'Real-time notifications for bookings, leads, and alerts.',
    longDesc: 'Push notifications to Slack channels for new bookings, lead submissions, capacity alerts, and daily summary digests. Custom webhook support.',
    icon: MessageSquare, iconBg: 'from-purple-500 to-violet-500', category: 'communication',
    status: 'available', installs: '11.9K', tier: 'free',
    features: ['Booking notifications', 'Lead alerts', 'Daily digests', 'Custom webhooks'],
  },
  {
    id: 'openai', name: 'OpenAI GPT', description: 'Power AI chat, descriptions, and demand prediction.',
    longDesc: 'GPT-4 integration for the AI Chat Assistant, auto-generating event descriptions, translating listings to multiple languages, and enhancing zone analysis.',
    icon: Brain, iconBg: 'from-green-500 to-emerald-400', category: 'data',
    status: 'connected', new: true, installs: '4.2K', tier: 'pro',
    features: ['AI Chat Assistant', 'Auto-descriptions', 'Translation', 'Sentiment analysis'],
  },
  {
    id: 'salesforce', name: 'Salesforce', description: 'Enterprise CRM sync for large academy operations.',
    longDesc: 'Full Salesforce integration for enterprise customers. Sync coaches as contacts, events as opportunities, and bookings as line items.',
    icon: Cloud, iconBg: 'from-blue-600 to-sky-500', category: 'crm',
    status: 'coming_soon', installs: '—', tier: 'enterprise',
    features: ['Contact sync', 'Opportunity management', 'Custom objects', 'Reports'],
  },
  {
    id: 'zoom', name: 'Zoom', description: 'Virtual training sessions and hybrid event support.',
    longDesc: 'Create Zoom meetings for virtual clinics. Support hybrid events with in-person + remote attendees. Recording management and attendance tracking.',
    icon: Camera, iconBg: 'from-blue-500 to-blue-700', category: 'scheduling',
    status: 'available', installs: '7.1K', tier: 'pro',
    features: ['Auto-meeting creation', 'Hybrid events', 'Recordings', 'Attendance'],
  },
  {
    id: 'quickbooks', name: 'QuickBooks', description: 'Accounting sync for revenue, expenses, and tax prep.',
    longDesc: 'Automatic sync of booking revenue, coach payouts, and platform fees to QuickBooks. Simplifies tax preparation and financial reporting.',
    icon: DollarSign, iconBg: 'from-green-600 to-green-500', category: 'payments',
    status: 'coming_soon', installs: '—', tier: 'pro',
    features: ['Revenue sync', 'Coach payouts', 'Tax categories', 'P&L reports'],
  },
  {
    id: 'zapier', name: 'Zapier', description: 'Connect to 5,000+ apps with no-code automation.',
    longDesc: 'Trigger Zaps from any Atlas event: new booking, lead, review, or milestone. Push data to any of Zapier\'s 5,000+ connected apps.',
    icon: Zap, iconBg: 'from-orange-500 to-red-500', category: 'data',
    status: 'available', new: true, installs: '3.8K', tier: 'pro',
    features: ['5000+ app connections', 'Custom triggers', 'Multi-step workflows', 'Webhooks'],
  },
  {
    id: 'mixpanel', name: 'Mixpanel', description: 'Product analytics with funnel analysis and cohorts.',
    longDesc: 'Deep product analytics: track user journeys from search to booking, analyze retention cohorts, and measure feature adoption rates.',
    icon: BarChart3, iconBg: 'from-purple-600 to-pink-500', category: 'analytics',
    status: 'available', installs: '5.6K', tier: 'pro',
    features: ['Funnel analysis', 'Retention cohorts', 'A/B testing', 'User segmentation'],
  },
  {
    id: 'webhooks', name: 'Custom Webhooks', description: 'Send event data to any endpoint in real-time.',
    longDesc: 'Configurable webhooks for all Atlas events. Set up custom endpoints with retry logic, signatures, and filtering. Developer-friendly.',
    icon: Code, iconBg: 'from-gray-500 to-gray-600', category: 'data',
    status: 'available', installs: '2.1K', tier: 'free',
    features: ['Custom endpoints', 'Event filtering', 'Retry logic', 'Signature verification'],
  },
];

// ─── Page Component ─────────────────────────────────────────────

export default function IntegrationsPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const filtered = useMemo(() => {
    return INTEGRATIONS.filter(i => {
      const matchCat = category === 'all' || i.category === category;
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search]);

  const connected = INTEGRATIONS.filter(i => i.status === 'connected');

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Puzzle className="w-5 h-5 text-atlas-400" /> Integrations
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Connect your favorite tools to supercharge your workflow</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> {connected.length} Connected
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input type="text" placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-primary placeholder:text-text-muted/50 w-52" />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-1">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  category === cat.id ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-slate-100/50')}>
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Connected Section */}
        {category === 'all' && !search && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" /> Active Connections
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {connected.map(i => (
                <button key={i.id} onClick={() => setSelectedIntegration(i)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-green-500/10 hover:border-green-500/20 transition-all group text-left">
                  <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', i.iconBg)}>
                    <i.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{i.name}</p>
                    <p className="text-[10px] text-green-400 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" />Connected</p>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Integrations Grid */}
        <div>
          {category === 'all' && !search && <h2 className="text-sm font-semibold text-text-primary mb-3">All Integrations</h2>}
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(i => (
              <button key={i.id} onClick={() => setSelectedIntegration(i)}
                className="text-left p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-slate-300 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center', i.iconBg)}>
                    <i.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {i.new && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-atlas-500/10 text-atlas-400 border border-atlas-500/15">NEW</span>}
                    {i.popular && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">Popular</span>}
                    {i.status === 'connected' && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-500/10 text-green-400">Active</span>}
                    {i.status === 'coming_soon' && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100/50 text-text-muted">Soon</span>}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{i.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-3">{i.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-text-muted/60">
                    {i.installs !== '—' && <span>{i.installs} installs</span>}
                    <span className={cn('px-1 py-0.5 rounded',
                      i.tier === 'free' ? 'bg-green-500/5 text-green-400/70' :
                      i.tier === 'pro' ? 'bg-atlas-500/5 text-atlas-400/70' :
                      'bg-purple-500/5 text-purple-400/70'
                    )}>{i.tier}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Integration Detail Modal ═══ */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIntegration(null)}>
          <div className="w-[480px] max-h-[80vh] rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 shadow-2xl shadow-black/10 overflow-y-auto animate-fade-in"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', selectedIntegration.iconBg)}>
                    <selectedIntegration.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-text-primary">{selectedIntegration.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium',
                        selectedIntegration.tier === 'free' ? 'bg-green-500/10 text-green-400' :
                        selectedIntegration.tier === 'pro' ? 'bg-atlas-500/10 text-atlas-400' :
                        'bg-purple-500/10 text-purple-400'
                      )}>{selectedIntegration.tier} tier</span>
                      {selectedIntegration.installs !== '—' && (
                        <span className="text-[10px] text-text-muted">{selectedIntegration.installs} installs</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedIntegration(null)} className="text-text-muted hover:text-text-primary p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-xs text-text-secondary leading-relaxed mb-5">{selectedIntegration.longDesc}</p>

              {/* Features */}
              <h4 className="text-xs font-semibold text-text-primary mb-2">Features</h4>
              <div className="grid grid-cols-2 gap-1.5 mb-5">
                {selectedIntegration.features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Check className="w-3 h-3 text-green-400 shrink-0" />{f}
                  </div>
                ))}
              </div>

              {/* Status-specific content */}
              {selectedIntegration.status === 'connected' && (
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-xs font-medium text-green-400">Connected & Active</p>
                      <p className="text-[10px] text-text-muted">Last synced 2 minutes ago</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedIntegration.status === 'coming_soon' && (
                <div className="p-3 rounded-xl bg-white/40 border border-white/60 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-xs font-medium text-text-secondary">Coming Soon</p>
                      <p className="text-[10px] text-text-muted">Sign up to get notified when this integration launches.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-2">
              {selectedIntegration.status === 'connected' ? (
                <>
                  <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary hover:bg-slate-100 flex items-center justify-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Configure
                  </button>
                  <button className="px-4 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                    Disconnect
                  </button>
                </>
              ) : selectedIntegration.status === 'available' ? (
                <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-atlas-500 text-white hover:bg-atlas-400 transition-all flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4" /> Connect {selectedIntegration.name}
                </button>
              ) : (
                <button className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-secondary flex items-center justify-center gap-1.5">
                  <Bell className="w-4 h-4" /> Notify Me When Available
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
