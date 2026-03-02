// landing page with animated hero, features, and cta sections

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Search, BarChart3, Zap, Users, Globe,
  ChevronRight, ArrowRight, Star, Shield, Activity,
  TrendingUp, Brain, Layers, Target, Calendar,
  Sparkles, Play, CheckCircle, ArrowUpRight, Eye,
  Award, Flame, Clock, DollarSign, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// animated counter

function Counter({ end, suffix = '', prefix = '', duration = 2000 }: {
  end: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(end * eased));
          if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// live ping dot

function PingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-atlas-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-atlas-400" />
    </span>
  );
}

// feature card

function FeatureCard({ icon: Icon, title, desc, accent }: {
  icon: React.ElementType; title: string; desc: string; accent: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-1">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', accent)}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-display font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

// inline badge

function LBadge({ variant = 'info', children, className }: { variant?: string; children: React.ReactNode; className?: string }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    premium: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border', styles[variant] || styles.info, className)}>
      {children}
    </span>
  );
}

// page component

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #bfdbfe 0%, #c7d2fe 15%, #ddd6fe 30%, #e0e7ff 45%, #dbeafe 55%, #e0e7ff 70%, #c7d2fe 85%, #bfdbfe 100%)' }}>
      {/* navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6">
        <div className={cn(
          'max-w-5xl mx-auto mt-4 px-4 sm:px-6 py-3 rounded-2xl transition-all duration-500',
          scrollY > 50
            ? 'bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl shadow-black/8'
            : 'bg-white/40 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5'
        )}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/logo.png" alt="Gaya" width={220} height={70} className="h-[52px] w-auto" priority />
            </Link>
            <div className="hidden md:flex items-center gap-1 mx-6">
              <a href="#features" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all">Features</a>
              <a href="#intelligence" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all">Intelligence</a>
              <a href="#" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all">Pricing</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/map" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B9CF7] to-[#7C5FC7] text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* hero section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-blue-400/25 rounded-full blur-[150px]" style={{ transform: `translateY(${scrollY * -0.1}px)` }} />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-400/20 rounded-full blur-[120px]" style={{ transform: `translateY(${scrollY * -0.15}px)` }} />
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 shadow-sm mb-8">
            <PingDot />
            <span className="text-xs font-medium text-atlas-500">Now in Beta — Toronto & GTA</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl text-slate-900 leading-[1.1] mb-6">
            Make Field Time<br />
            <span className="bg-gradient-to-r from-[#7CB3F2] via-[#8B9CF7] to-[#7C5FC7] bg-clip-text text-transparent">
              Easier to Find
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The discovery map and intelligence platform that connects athletes with coaches,
            camps, and clinics — while giving operators the data to expand smarter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/map" className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-atlas-400 to-atlas-500 text-white font-display font-bold text-base hover:from-atlas-500 hover:to-atlas-600 transition-all shadow-xl shadow-atlas-500/25 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Explore the Map <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/intelligence" className="px-8 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 text-slate-700 font-display font-semibold text-base hover:bg-white/90 transition-all shadow-lg shadow-blue-900/5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> View Intelligence
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { value: 240, suffix: '+', label: 'Coaches', icon: Users },
              { value: 1200, suffix: '+', label: 'Events Listed', icon: Calendar },
              { value: 48, suffix: '', label: 'Zones Mapped', icon: MapPin },
              { value: 92, suffix: '%', label: 'Avg Fill Rate', icon: Activity },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/50 flex items-center justify-center text-slate-500">
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-display font-bold text-slate-900"><Counter end={stat.value} suffix={stat.suffix} /></p>
                  <p className="text-[11px] text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* map preview */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 p-2 shadow-2xl shadow-blue-900/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/40 bg-white/60 rounded-t-2xl">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> gaya.app/map
                </div>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-b-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {[
                { top: '20%', left: '35%', color: 'bg-atlas-500 shadow-atlas-500/40' },
                { top: '40%', left: '55%', color: 'bg-indigo-500 shadow-indigo-500/40' },
                { top: '30%', left: '70%', color: 'bg-atlas-500 shadow-atlas-500/40' },
                { top: '60%', left: '25%', color: 'bg-indigo-500 shadow-indigo-500/40' },
                { top: '50%', left: '45%', color: 'bg-atlas-500 shadow-atlas-500/40' },
                { top: '70%', left: '60%', color: 'bg-atlas-500 shadow-atlas-500/40' },
              ].map((pin, i) => (
                <div key={i} className="absolute" style={{ top: pin.top, left: pin.left }}>
                  <div className={cn('w-3.5 h-3.5 rounded-full animate-pulse shadow-lg', pin.color)} style={{ animationDelay: `${i * 300}ms` }} />
                </div>
              ))}
              <div className="absolute top-[25%] left-[45%] w-48 h-48 bg-atlas-500/10 rounded-full blur-[60px]" />
              <div className="absolute top-[55%] left-[20%] w-32 h-32 bg-indigo-500/8 rounded-full blur-[40px]" />

              {/* floating preview card */}
              <div className="absolute top-[30%] right-8 w-56 p-3 rounded-xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10" style={{ animation: 'float 4s ease-in-out infinite' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-atlas-500/15 flex items-center justify-center text-xs font-bold text-atlas-500">MT</div>
                  <div>
                    <p className="text-xs font-medium text-slate-900">Marcus Thompson</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-slate-500">4.9 (127)</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">Spring Elite Camp · Apr 14-18</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-bold text-atlas-500">$349</span>
                  <span className="text-[10px] text-amber-500 font-medium">3 spots left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features grid */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <LBadge variant="info" className="mb-4">Features</LBadge>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-4">Two sides. One platform.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Athletes discover training. Operators discover opportunity. Data connects them both.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={MapPin} title="Discovery Map" desc="Interactive map with clustered pins, heatmaps, and filters for sport, age, skill, price, and distance." accent="bg-blue-500/15 text-blue-500" />
            <FeatureCard icon={BarChart3} title="Supply vs Demand" desc="Per-zone analytics showing where coaches are needed most, powered by H3 hex indexing and PostGIS." accent="bg-indigo-500/15 text-indigo-500" />
            <FeatureCard icon={Brain} title="AI Predictions" desc="ML models forecast fill rates, predict demand peaks, and recommend optimal launch zones and times." accent="bg-purple-500/15 text-purple-500" />
            <FeatureCard icon={Zap} title="What-If Simulator" desc="Model new events before launching. Change capacity, price, and location to see projected outcomes." accent="bg-amber-500/15 text-amber-600" />
            <FeatureCard icon={TrendingUp} title="Revenue Forecasting" desc="ARIMA + Gradient Boosting ensemble projects revenue with confidence bands across 12+ months." accent="bg-cyan-500/15 text-cyan-600" />
            <FeatureCard icon={Shield} title="Multi-Tenant RBAC" desc="Role-based access for athletes, coaches, org admins, and superadmins. Full audit trail and feature flags." accent="bg-rose-500/15 text-rose-500" />
          </div>
        </div>
      </section>

      {/* intelligence showcase */}
      <section id="intelligence" className="relative py-24 px-6">
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <LBadge variant="premium" className="mb-4">Intelligence Layer</LBadge>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-6">
                Know where to <span className="text-atlas-500">expand</span> before your competitors do
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Every zone tells a story. Our geospatial intelligence engine processes thousands of data points to surface opportunities your team can act on.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Target, text: 'Opportunity scoring across 48+ GTA zones' },
                  { icon: Flame, text: 'Real-time demand signals from searches and leads' },
                  { icon: Sparkles, text: 'ML-powered expansion recommendations with confidence scores' },
                  { icon: Activity, text: 'Live activity feed with system health monitoring' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-atlas-500/10 flex items-center justify-center text-atlas-500"><item.icon className="w-4 h-4" /></div>
                    <span className="text-sm text-slate-600">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/intelligence" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 text-sm font-medium text-slate-700 hover:bg-white/80 shadow-sm transition-all">
                  Explore Intelligence <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Underserved Zones', value: '12', trend: '+3 this month', icon: Target, color: 'text-blue-500' },
                { label: 'Active Coaches', value: '240', trend: '+18 new', icon: Users, color: 'text-indigo-500' },
                { label: 'Demand Growth', value: '+34%', trend: 'YoY increase', icon: TrendingUp, color: 'text-amber-500' },
                { label: 'ML Confidence', value: '91%', trend: 'Model R² score', icon: Brain, color: 'text-purple-500' },
              ].map(card => (
                <div key={card.label} className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:bg-white/80 transition-all">
                  <card.icon className="w-5 h-5 text-slate-400 mb-3" />
                  <p className="text-2xl font-display font-bold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                  <p className={cn('text-[11px] mt-2 flex items-center gap-1', card.color)}>
                    <ArrowUpRight className="w-3 h-3" /> {card.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* cta section */}
      <section className="relative py-24 px-6">
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-4">Ready to map your opportunity?</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Join the coaches, academies, and operators already using Gaya to find, fill, and expand training across the GTA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboard" className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-atlas-400 to-atlas-500 text-white font-display font-bold hover:from-atlas-500 hover:to-atlas-600 transition-all shadow-xl shadow-atlas-500/25 flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/map" className="px-8 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 text-slate-700 font-display font-semibold hover:bg-white/90 transition-all shadow-lg shadow-blue-900/5 flex items-center gap-2">
              <Eye className="w-4 h-4" /> View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Gaya" width={160} height={50} className="h-12 w-auto" />
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="hover:text-slate-700 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-700 cursor-pointer">Terms</span>
            <span className="hover:text-slate-700 cursor-pointer">API Docs</span>
            <span className="hover:text-slate-700 cursor-pointer">Contact</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 Gaya</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
