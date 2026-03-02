/* ═══════════════════════════════════════════════════════════════════
   Gaya — Mobile App Preview
   Interactive iPhone frame mockup showing the coach mobile
   experience. Swipeable screens with bottom navigation,
   native-feeling UI, and marketing-ready presentation.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  MapPin, Calendar, Users, BarChart3, User, Star, Clock,
  ChevronRight, Bell, Search, Plus, TrendingUp, Target,
  DollarSign, Flame, Zap, Award, CheckCircle, ArrowUpRight,
  Heart, Share2, MessageCircle, Home, Compass, Brain, Settings,
  Smartphone, Monitor, QrCode, Download, Apple, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

type MobileScreen = 'home' | 'events' | 'insights' | 'profile';

// ─── iPhone Frame Component ─────────────────────────────────────

function IPhoneFrame({ children, screen }: { children: React.ReactNode; screen: MobileScreen }) {
  const navItems: { id: MobileScreen; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'insights', icon: BarChart3, label: 'Insights' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="relative w-[320px] h-[660px] rounded-[42px] bg-black p-[10px] shadow-2xl shadow-black/10 ring-1 ring-white/10">
      {/* Notch */}
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-30" />
      {/* Screen */}
      <div className="w-full h-full rounded-[32px] bg-white overflow-hidden relative">
        {/* Status Bar */}
        <div className="h-12 flex items-end justify-between px-6 pb-1 text-[10px] font-semibold text-white relative z-20">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1,2,3,4].map(i => <div key={i} className="w-[3px] h-[3px] rounded-sm bg-white" />)}
            </div>
            <span className="text-[8px]">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-white/60 relative">
              <div className="absolute inset-[1px] right-[3px] rounded-sm bg-green-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 top-12 bottom-16 overflow-y-auto scrollbar-hide">
          {children}
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-4">
          {navItems.map(item => (
            <div key={item.id} className="flex flex-col items-center gap-0.5">
              <item.icon className={cn('w-5 h-5', screen === item.id ? 'text-atlas-400' : 'text-text-muted/50')} />
              <span className={cn('text-[9px] font-medium', screen === item.id ? 'text-atlas-400' : 'text-text-muted/50')}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// ─── Home Screen ────────────────────────────────────────────────

function HomeScreen() {
  return (
    <div className="px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-text-muted">Good morning</p>
          <h2 className="text-base font-display font-bold text-text-primary">Marcus 👋</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-text-muted" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 flex items-center justify-center text-[10px] font-bold text-white">MT</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'This Week', value: '$2,840', change: '+12%', icon: DollarSign, color: 'text-green-400' },
          { label: 'Fill Rate', value: '94%', change: '+3%', icon: Target, color: 'text-atlas-400' },
          { label: 'Streak', value: '47 days', change: '', icon: Flame, color: 'text-orange-400' },
          { label: 'Rating', value: '4.97', change: '', icon: Star, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="p-2.5 rounded-xl bg-white/40 border border-white/60">
            <s.icon className={cn('w-3.5 h-3.5 mb-1', s.color)} />
            <p className="text-sm font-display font-bold text-text-primary">{s.value}</p>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-text-muted">{s.label}</span>
              {s.change && <span className="text-[9px] text-green-400">{s.change}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-text-primary mb-2">Today&apos;s Schedule</h3>
        {[
          { time: '9:00 AM', title: 'Elite Camp', location: 'Scarborough Field', filled: '37/40', color: 'border-l-atlas-500' },
          { time: '2:00 PM', title: 'Private Session', location: 'North York Centre', filled: '1/1', color: 'border-l-purple-500' },
          { time: '5:00 PM', title: 'Speed Clinic', location: 'Ajax Sports Hub', filled: '18/20', color: 'border-l-blue-500' },
        ].map(e => (
          <div key={e.time} className={cn('flex items-center gap-2 p-2 rounded-lg bg-slate-50 border-l-2 mb-1.5', e.color)}>
            <div className="w-10 text-center shrink-0">
              <p className="text-[9px] text-text-muted">{e.time.split(' ')[0]}</p>
              <p className="text-[8px] text-text-muted">{e.time.split(' ')[1]}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-text-primary truncate">{e.title}</p>
              <p className="text-[9px] text-text-muted flex items-center gap-0.5"><MapPin className="w-2 h-2" />{e.location}</p>
            </div>
            <span className="text-[9px] text-text-muted">{e.filled}</span>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="p-3 rounded-xl bg-atlas-500/5 border border-atlas-500/15 mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Brain className="w-3 h-3 text-atlas-400" />
          <span className="text-[10px] font-semibold text-atlas-400">AI Insight</span>
        </div>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          Your Tuesday evening clinics have a 94% fill rate. Consider adding a Thursday slot — predicted fill: 88%.
        </p>
      </div>

      {/* Recent Activity */}
      <h3 className="text-xs font-semibold text-text-primary mb-2">Recent</h3>
      {[
        { icon: Star, text: 'New 5-star review from Alex M.', time: '2h ago', color: 'text-amber-400 bg-amber-500/10' },
        { icon: Users, text: 'New lead interested in private training', time: '4h ago', color: 'text-blue-400 bg-blue-500/10' },
        { icon: Award, text: 'You reached Level 42! +500 XP', time: '1d ago', color: 'text-purple-400 bg-purple-500/10' },
      ].map(a => (
        <div key={a.text} className="flex items-start gap-2 mb-2">
          <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0', a.color)}>
            <a.icon className="w-3 h-3" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-text-secondary">{a.text}</p>
            <p className="text-[8px] text-text-muted">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Events Screen ──────────────────────────────────────────────

function EventsScreen() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-bold text-text-primary">My Events</h2>
        <button className="w-7 h-7 rounded-lg bg-atlas-500 flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-3">
        {['All', 'Camps', 'Clinics', 'Private'].map((f, i) => (
          <span key={f} className={cn('px-2.5 py-1 rounded-full text-[10px] font-medium',
            i === 0 ? 'bg-atlas-500/10 text-atlas-400' : 'bg-slate-100/50 text-text-muted')}>
            {f}
          </span>
        ))}
      </div>

      {/* Event Cards */}
      {[
        { title: 'Spring Elite Camp', date: 'Apr 14-18', time: '9 AM - 1 PM', location: 'Scarborough', filled: 37, cap: 40, price: '$299', type: 'camp' },
        { title: 'Speed & Agility Clinic', date: 'Apr 16', time: '5-7 PM', location: 'North York', filled: 18, cap: 20, price: '$89', type: 'clinic' },
        { title: 'GK Workshop', date: 'Apr 18', time: '10 AM - 12 PM', location: 'Etobicoke', filled: 12, cap: 15, price: '$79', type: 'clinic' },
        { title: 'Private Training', date: 'Apr 20', time: '3-4 PM', location: 'Ajax', filled: 1, cap: 1, price: '$120', type: 'private' },
      ].map(e => (
        <div key={e.title} className="p-3 rounded-xl bg-white/40 border border-white/60 mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium',
              e.type === 'camp' ? 'bg-atlas-500/10 text-atlas-400' :
              e.type === 'clinic' ? 'bg-blue-500/10 text-blue-400' :
              'bg-purple-500/10 text-purple-400'
            )}>{e.type}</span>
            <span className="text-[10px] font-semibold text-text-primary">{e.price}</span>
          </div>
          <p className="text-[11px] font-semibold text-text-primary">{e.title}</p>
          <div className="flex items-center gap-2 mt-1 text-[9px] text-text-muted">
            <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{e.date}</span>
            <span>{e.time}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5 text-[9px] text-text-muted">
            <MapPin className="w-2.5 h-2.5" />{e.location}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-atlas-500" style={{ width: `${(e.filled / e.cap) * 100}%` }} />
            </div>
            <span className="text-[9px] text-text-muted">{e.filled}/{e.cap}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Insights Screen ────────────────────────────────────────────

function InsightsScreen() {
  return (
    <div className="px-4 py-3">
      <h2 className="text-base font-display font-bold text-text-primary mb-3">Zone Insights</h2>

      {/* Revenue Chart */}
      <div className="p-3 rounded-xl bg-white/40 border border-white/60 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted">This Month</span>
          <span className="text-sm font-display font-bold text-text-primary">$8,420</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {[42, 55, 48, 72, 65, 88, 78, 95, 82, 104, 91, 118].map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-atlas-500/30" style={{ height: `${(v / 118) * 100}%` }} />
          ))}
        </div>
      </div>

      {/* Top Zones */}
      <h3 className="text-xs font-semibold text-text-primary mb-2">Your Top Zones</h3>
      {[
        { zone: 'Scarborough East', score: 92, revenue: '$3,200', fill: '94%' },
        { zone: 'North York', score: 87, revenue: '$2,800', fill: '91%' },
        { zone: 'Ajax-Pickering', score: 84, revenue: '$1,420', fill: '88%' },
      ].map(z => (
        <div key={z.zone} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-atlas-500/10 flex items-center justify-center text-[10px] font-bold text-atlas-400">{z.score}</div>
          <div className="flex-1">
            <p className="text-[10px] font-medium text-text-primary">{z.zone}</p>
            <p className="text-[8px] text-text-muted">{z.fill} fill rate</p>
          </div>
          <span className="text-[10px] font-semibold text-green-400">{z.revenue}</span>
        </div>
      ))}

      {/* AI Tip */}
      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 mt-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] font-semibold text-purple-400">Opportunity</span>
        </div>
        <p className="text-[10px] text-text-secondary leading-relaxed">Brampton North is underserved — 0 camps within 5km. Launch score: 91.</p>
      </div>
    </div>
  );
}

// ─── Profile Screen ─────────────────────────────────────────────

function ProfileScreen() {
  return (
    <div className="px-4 py-3">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-300 flex items-center justify-center text-xl font-bold text-white mx-auto mb-2">MT</div>
        <h2 className="text-base font-display font-bold text-text-primary">Marcus Thompson</h2>
        <p className="text-[10px] text-text-muted">Elite Soccer Coach · Scarborough East</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-bold text-text-primary">4.97</span>
          <span className="text-[9px] text-text-muted">(142 reviews)</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex justify-center gap-2 mb-4">
        {[
          { label: 'Legend', color: 'from-purple-400 to-pink-300' },
          { label: 'Lv.42', color: 'from-atlas-500 to-cyan-400' },
          { label: 'Verified', color: 'from-green-500 to-emerald-400' },
        ].map(b => (
          <span key={b.label} className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-gradient-to-r', b.color)}>
            {b.label}
          </span>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-slate-50">
          <p className="text-sm font-display font-bold text-text-primary">84.2K</p>
          <p className="text-[8px] text-text-muted">Total XP</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-50">
          <p className="text-sm font-display font-bold text-text-primary">47</p>
          <p className="text-[8px] text-text-muted">Day Streak</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-50">
          <p className="text-sm font-display font-bold text-text-primary">98%</p>
          <p className="text-[8px] text-text-muted">Fill Rate</p>
        </div>
      </div>

      {/* Menu Items */}
      {[
        { icon: Calendar, label: 'My Schedule' },
        { icon: DollarSign, label: 'Earnings' },
        { icon: Star, label: 'Reviews' },
        { icon: Users, label: 'Clients' },
        { icon: Award, label: 'Achievements' },
        { icon: Settings, label: 'Settings' },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-slate-200">
          <item.icon className="w-4 h-4 text-text-muted" />
          <span className="text-[11px] text-text-primary flex-1">{item.label}</span>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted/30" />
        </div>
      ))}
    </div>
  );
}

// ─── Sparkles helper (imported above but redeclared for safety)
function Sparkles2({ className }: { className?: string }) {
  return <Zap className={className} />;
}

// ─── Page Component ─────────────────────────────────────────────

export default function MobilePreviewPage() {
  const [activeScreen, setActiveScreen] = useState<MobileScreen>('home');

  const screens: { id: MobileScreen; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'events', label: 'Events' },
    { id: 'insights', label: 'Insights' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-atlas-400" /> Coach Mobile App
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Preview the native mobile experience for coaches</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Apple className="w-3.5 h-3.5" /> iOS
              </span>
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Globe className="w-3.5 h-3.5" /> Android
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-12 items-start justify-center">
          {/* Left: Description */}
          <div className="w-80 pt-8">
            <h2 className="font-display font-bold text-2xl text-text-primary mb-3">
              Everything coaches need,
              <span className="text-atlas-400"> in their pocket.</span>
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              Manage events, track earnings, view zone intelligence, and connect with athletes — all from a native mobile experience built for coaches on the go.
            </p>

            {/* Screen Switcher */}
            <div className="space-y-2 mb-8">
              {screens.map(s => (
                <button key={s.id} onClick={() => setActiveScreen(s.id)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                    activeScreen === s.id
                      ? 'bg-atlas-500/10 border border-atlas-500/20'
                      : 'border border-slate-200 hover:border-slate-200')}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                    activeScreen === s.id ? 'bg-atlas-500/20' : 'bg-slate-50')}>
                    <ChevronRight className={cn('w-4 h-4', activeScreen === s.id ? 'text-atlas-400' : 'text-text-muted')} />
                  </div>
                  <span className={cn('text-sm font-medium', activeScreen === s.id ? 'text-atlas-400' : 'text-text-secondary')}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: Zap, text: 'Real-time push notifications for leads & bookings' },
                { icon: Brain, text: 'AI insights surfaced directly in your feed' },
                { icon: MapPin, text: 'GPS-enabled zone intelligence on the go' },
                { icon: DollarSign, text: 'Track earnings and manage payouts' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <f.icon className="w-4 h-4 text-atlas-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-text-muted">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3 mt-8">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-white/15 transition-all">
                <Apple className="w-5 h-5 text-text-primary" />
                <div className="text-left">
                  <p className="text-[8px] text-text-muted leading-none">Download on the</p>
                  <p className="text-xs font-semibold text-text-primary leading-tight">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-white/15 transition-all">
                <Globe className="w-5 h-5 text-text-primary" />
                <div className="text-left">
                  <p className="text-[8px] text-text-muted leading-none">Get it on</p>
                  <p className="text-xs font-semibold text-text-primary leading-tight">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {/* Center: iPhone Mockup */}
          <div className="relative">
            {/* Glow effect behind phone */}
            <div className="absolute inset-0 -m-20 bg-atlas-500/5 rounded-full blur-[80px]" />
            <div className="relative">
              <IPhoneFrame screen={activeScreen}>
                {activeScreen === 'home' && <HomeScreen />}
                {activeScreen === 'events' && <EventsScreen />}
                {activeScreen === 'insights' && <InsightsScreen />}
                {activeScreen === 'profile' && <ProfileScreen />}
              </IPhoneFrame>
            </div>
          </div>

          {/* Right: Key Metrics */}
          <div className="w-64 pt-8 space-y-4">
            <h3 className="text-xs font-semibold text-text-muted">Coach App Metrics</h3>
            {[
              { label: 'Daily Active Coaches', value: '89%', desc: 'of registered coaches open app daily' },
              { label: 'Avg Session Duration', value: '4.2 min', desc: 'focused and efficient' },
              { label: 'Booking Response Time', value: '<30 sec', desc: 'with push notifications' },
              { label: 'App Store Rating', value: '4.8 ★', desc: 'across 342 reviews' },
              { label: 'Crash-Free Sessions', value: '99.8%', desc: 'production stability' },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <p className="text-base font-display font-bold text-atlas-400">{m.value}</p>
                <p className="text-[11px] font-medium text-text-primary">{m.label}</p>
                <p className="text-[9px] text-text-muted">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
