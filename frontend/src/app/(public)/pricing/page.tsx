// pricing page - three-tier saas pricing with comparison and faq

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, Zap, Star, Building2, ArrowRight, Crown,
  MapPin, BarChart3, Brain, Shield, Users, Globe,
  ChevronDown, Sparkles, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  icon: React.ElementType;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  accent: string;
  accentBg: string;
  popular?: boolean;
  features: string[];
  limits: { label: string; value: string }[];
  cta: string;
  ctaStyle: string;
}

const TIERS: PricingTier[] = [
  {
    name: 'Starter',
    icon: Zap,
    description: 'For individual coaches getting started with zone intelligence.',
    monthlyPrice: 0,
    annualPrice: 0,
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10 border-blue-500/20',
    features: [
      'Discovery map access',
      'Basic zone analytics',
      'Up to 5 event listings',
      'Lead capture (50/month)',
      'Email notifications',
      'Community support',
    ],
    limits: [
      { label: 'Zones', value: '3' },
      { label: 'Team Members', value: '1' },
      { label: 'API Calls', value: '1K/mo' },
      { label: 'Reports', value: '2/mo' },
    ],
    cta: 'Start Free',
    ctaStyle: 'bg-white border border-slate-200/60 shadow-sm text-text-primary hover:bg-slate-100',
  },
  {
    name: 'Pro',
    icon: Star,
    description: 'For growing academies with serious expansion ambitions.',
    monthlyPrice: 99,
    annualPrice: 79,
    accent: 'text-atlas-400',
    accentBg: 'bg-atlas-500/10 border-atlas-500/20',
    popular: true,
    features: [
      'Everything in Starter, plus:',
      'Full intelligence dashboard',
      'AI expansion recommendations',
      'What-If simulator',
      'Unlimited event listings',
      'Revenue forecasting',
      'Lead pipeline (unlimited)',
      'Priority support',
      'Custom reports',
      'API access',
    ],
    limits: [
      { label: 'Zones', value: '20' },
      { label: 'Team Members', value: '10' },
      { label: 'API Calls', value: '50K/mo' },
      { label: 'Reports', value: 'Unlimited' },
    ],
    cta: 'Start 14-Day Trial',
    ctaStyle: 'bg-atlas-500 text-white font-bold hover:bg-atlas-400 shadow-lg shadow-atlas-500/20',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    description: 'For organizations scaling across regions with dedicated support.',
    monthlyPrice: 349,
    annualPrice: 279,
    accent: 'text-purple-400',
    accentBg: 'bg-purple-500/10 border-purple-500/20',
    features: [
      'Everything in Pro, plus:',
      'Unlimited zones',
      'Multi-region support',
      'Custom ML models',
      'White-label options',
      'SSO / SAML',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee (99.9%)',
      'Advanced audit logs',
      'Bulk data import/export',
    ],
    limits: [
      { label: 'Zones', value: 'Unlimited' },
      { label: 'Team Members', value: 'Unlimited' },
      { label: 'API Calls', value: 'Unlimited' },
      { label: 'Reports', value: 'Unlimited' },
    ],
    cta: 'Contact Sales',
    ctaStyle: 'bg-slate-100/50 border border-purple-500/20 text-purple-400 hover:bg-purple-500/10',
  },
];

const COMPARISON_FEATURES = [
  { category: 'Discovery', features: [
    { name: 'Public discovery map', starter: true, pro: true, enterprise: true },
    { name: 'Advanced search filters', starter: true, pro: true, enterprise: true },
    { name: 'Coach profiles & verification', starter: true, pro: true, enterprise: true },
    { name: 'Saved favorites & alerts', starter: '10', pro: 'Unlimited', enterprise: 'Unlimited' },
  ]},
  { category: 'Intelligence', features: [
    { name: 'Zone supply/demand analytics', starter: 'Basic', pro: true, enterprise: true },
    { name: 'Heatmap overlays', starter: false, pro: true, enterprise: true },
    { name: 'H3 hex-level drill-down', starter: false, pro: true, enterprise: true },
    { name: 'Custom zone boundaries', starter: false, pro: false, enterprise: true },
  ]},
  { category: 'AI / ML', features: [
    { name: 'Demand forecasting', starter: false, pro: true, enterprise: true },
    { name: 'Fill-rate prediction', starter: false, pro: true, enterprise: true },
    { name: 'What-If simulator', starter: false, pro: true, enterprise: true },
    { name: 'Custom ML models', starter: false, pro: false, enterprise: true },
    { name: 'AI chat assistant', starter: false, pro: true, enterprise: true },
  ]},
  { category: 'Operations', features: [
    { name: 'Lead capture & pipeline', starter: '50/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Revenue forecasting', starter: false, pro: true, enterprise: true },
    { name: 'Market reports', starter: '2/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Bulk import/export', starter: false, pro: true, enterprise: true },
    { name: 'API access', starter: false, pro: '50K/mo', enterprise: 'Unlimited' },
  ]},
  { category: 'Admin', features: [
    { name: 'Role-based access', starter: false, pro: true, enterprise: true },
    { name: 'Audit logs', starter: false, pro: '30 days', enterprise: 'Unlimited' },
    { name: 'Feature flags', starter: false, pro: true, enterprise: true },
    { name: 'SSO / SAML', starter: false, pro: false, enterprise: true },
    { name: 'SLA guarantee', starter: false, pro: false, enterprise: '99.9%' },
  ]},
];

const FAQS = [
  { q: 'Can I switch plans at any time?', a: 'Yes! You can upgrade or downgrade at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.' },
  { q: 'What happens after the 14-day trial?', a: 'After your Pro trial ends, you can continue on the Starter (free) plan or upgrade to Pro. All your data and settings are preserved.' },
  { q: 'Do you offer discounts for non-profits?', a: 'Yes! We offer 50% off all paid plans for registered non-profit youth sports organizations. Contact us with proof of non-profit status.' },
  { q: 'Can I add more team members?', a: 'Each plan includes a set number of seats. Additional seats are $15/month on Pro and $25/month on Enterprise. Volume discounts available.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex), plus ACH/wire for Enterprise annual plans. All payments are processed securely through Stripe.' },
  { q: 'Is there a commitment or contract?', a: 'No long-term contracts. Monthly plans can be cancelled anytime. Annual plans are paid upfront with a 20% discount. Enterprise plans have optional annual agreements.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-sm font-medium text-text-primary group-hover:text-atlas-400 transition-colors">{q}</span>
        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <p className="text-sm text-text-muted pb-4 leading-relaxed animate-fade-in">{a}</p>
      )}
    </div>
  );
}

// cell renderer for comparison matrix
function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-atlas-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-text-muted/30 mx-auto" />;
  return <span className="text-xs text-text-secondary">{value}</span>;
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* header */}
      <section className="relative pt-16 pb-8 px-6 text-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-atlas-500/5 rounded-full blur-[150px]" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-atlas-500/10 border border-atlas-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-atlas-400" />
            <span className="text-xs font-medium text-atlas-400">Simple, transparent pricing</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mb-4">
            Scale your training{' '}
            <span className="bg-gradient-to-r from-atlas-400 to-blue-400 bg-clip-text text-transparent">empire</span>
          </h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto mb-8">
            Start free. Upgrade when you&apos;re ready. Every plan includes the discovery map and core analytics.
          </p>

          {/* billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white border border-slate-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', !isAnnual ? 'bg-slate-100 text-text-primary' : 'text-text-muted')}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2', isAnnual ? 'bg-slate-100 text-text-primary' : 'text-text-muted')}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded-md bg-atlas-500/15 text-atlas-400 text-[10px] font-bold">SAVE 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* pricing cards */}
      <section className="relative px-6 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {TIERS.map(tier => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div key={tier.name} className={cn(
                'relative p-6 rounded-2xl bg-white backdrop-blur-xl border transition-all hover:-translate-y-1 duration-300',
                tier.popular ? 'border-atlas-500/30 shadow-xl shadow-atlas-500/10' : 'border-slate-200'
              )}>
                {/* popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-atlas-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> MOST POPULAR
                  </div>
                )}

                {/* header */}
                <div className={cn('inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium mb-4', tier.accentBg, tier.accent)}>
                  <tier.icon className="w-3.5 h-3.5" />
                  {tier.name}
                </div>

                <p className="text-sm text-text-muted mb-4 h-10">{tier.description}</p>

                {/* price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-extrabold text-text-primary">
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                  {price > 0 && <span className="text-sm text-text-muted">/month</span>}
                  {isAnnual && price > 0 && (
                    <span className="ml-2 text-xs text-text-muted line-through">
                      ${tier.monthlyPrice}
                    </span>
                  )}
                </div>

                {/* cta */}
                <Link href={tier.name === 'Enterprise' ? '#' : '/onboard'} className={cn('flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all mb-6', tier.ctaStyle)}>
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </Link>

                {/* limits grid */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {tier.limits.map(limit => (
                    <div key={limit.label} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-text-muted">{limit.label}</p>
                      <p className="text-sm font-semibold text-text-primary">{limit.value}</p>
                    </div>
                  ))}
                </div>

                {/* features */}
                <div className="space-y-2.5">
                  {tier.features.map(feature => (
                    <div key={feature} className="flex items-start gap-2">
                      {feature.includes('Everything in') ? (
                        <Sparkles className="w-3.5 h-3.5 text-atlas-400 mt-0.5 shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-atlas-400 mt-0.5 shrink-0" />
                      )}
                      <span className={cn('text-xs', feature.includes('Everything in') ? 'text-atlas-400 font-medium' : 'text-text-muted')}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* feature comparison */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
          >
            {showComparison ? 'Hide' : 'Show'} detailed feature comparison
            <ChevronDown className={cn('w-4 h-4 transition-transform', showComparison && 'rotate-180')} />
          </button>

          {showComparison && (
            <div className="mt-4 rounded-2xl bg-white backdrop-blur-xl border border-slate-200 overflow-hidden animate-fade-in">
              {/* header row */}
              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="text-xs font-semibold text-text-muted">Feature</div>
                <div className="text-xs font-semibold text-blue-400 text-center">Starter</div>
                <div className="text-xs font-semibold text-atlas-400 text-center">Pro</div>
                <div className="text-xs font-semibold text-purple-400 text-center">Enterprise</div>
              </div>

              {/* feature groups */}
              {COMPARISON_FEATURES.map(group => (
                <div key={group.category}>
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{group.category}</span>
                  </div>
                  {group.features.map(feature => (
                    <div key={feature.name} className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <span className="text-xs text-text-muted">{feature.name}</span>
                      <div className="text-center"><FeatureCell value={feature.starter} /></div>
                      <div className="text-center"><FeatureCell value={feature.pro} /></div>
                      <div className="text-center"><FeatureCell value={feature.enterprise} /></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* faq */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl text-text-primary mb-2">Frequently asked questions</h2>
            <p className="text-sm text-text-muted">Can&apos;t find what you&apos;re looking for? <span className="text-atlas-400 cursor-pointer">Contact us</span>.</p>
          </div>
          <div className="rounded-2xl bg-white backdrop-blur-xl border border-slate-200 px-6">
            {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* enterprise cta */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-50/60 to-atlas-500/10 border border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">Enterprise</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
                Need a custom solution?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                We work with large academies, franchises, and sports organizations to build
                custom intelligence solutions. Dedicated support, custom ML models, and white-label options included.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="px-8 py-3 rounded-xl bg-purple-500 text-white font-display font-bold text-sm hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2">
                Talk to Sales <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 rounded-xl bg-white border border-slate-200/60 shadow-sm text-text-primary text-sm font-medium hover:bg-slate-100 transition-all">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-text-muted/50">© 2026 Gaya</span>
          <div className="flex gap-4 text-xs text-text-muted">
            <span className="hover:text-text-secondary cursor-pointer">Privacy</span>
            <span className="hover:text-text-secondary cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
