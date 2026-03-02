/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Content Studio
   AI-powered marketing content generator. Templates for social
   posts, emails, ads. Tone selector, platform targeting,
   content calendar, and generated preview cards.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Sparkles, Wand2, Copy, Check, RefreshCw, Send, Calendar,
  Instagram, Twitter, Mail, Globe, Megaphone, FileText,
  Image, Video, Zap, Target, Users, TrendingUp, Clock,
  ChevronRight, Heart, MessageCircle, Share2, Bookmark,
  ArrowUpRight, Star, MapPin, DollarSign, Hash, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type ContentType = 'social' | 'email' | 'ad' | 'seo';
type Platform = 'instagram' | 'twitter' | 'facebook' | 'linkedin';
type Tone = 'professional' | 'casual' | 'exciting' | 'inspiring';

interface GeneratedContent {
  id: string;
  type: ContentType;
  platform?: Platform;
  title: string;
  content: string;
  hashtags?: string[];
  subject?: string;
  cta?: string;
  tone: Tone;
  score: number;
  engagement?: string;
  timestamp: string;
}

// ─── Mock Generated Content ─────────────────────────────────────────

const generatedContent: GeneratedContent[] = [
  {
    id: '1', type: 'social', platform: 'instagram', tone: 'exciting',
    title: 'Camp Launch Post',
    content: '🔥 Spring Elite Camp is LIVE! 5 days of next-level soccer training in Scarborough. Limited to 40 spots — last year sold out in 72 hours.\n\nWhat you get:\n⚡ Elite-level coaching\n📊 AI-powered performance tracking\n🏆 Skills assessment & certificate\n\nDon\'t wait. Link in bio. 👆',
    hashtags: ['#SoccerCamp', '#TorontoSoccer', '#EliteTraining', '#Gaya', '#YouthSoccer'],
    score: 92,
    engagement: '~2.4K reach predicted',
    timestamp: '2 min ago',
  },
  {
    id: '2', type: 'email', tone: 'professional',
    title: 'Re-engagement Email',
    subject: 'We noticed you haven\'t booked in a while, {name}',
    content: 'Hi {name},\n\nWe wanted to check in — it\'s been a few weeks since your last session, and we miss seeing {child_name} on the field!\n\nHere\'s what\'s new:\n• 3 new coaches joined your area\n• Evening clinics now available Mon-Thu\n• New speed & agility program for ages 10-14\n\nBook your next session and get 15% off with code COMEBACK15.\n\nSee you on the pitch!\n—The Gaya Team',
    cta: 'Book Now — 15% Off',
    score: 88,
    engagement: '~34% open rate predicted',
    timestamp: '5 min ago',
  },
  {
    id: '3', type: 'ad', tone: 'exciting',
    title: 'Facebook Ad — Summer Camp',
    content: 'Your kid deserves the best summer training.\n\nGaya connects families with top-rated soccer coaches — camps, clinics, and private sessions across the GTA.\n\n✅ Verified coaches\n✅ AI-matched to your child\'s level\n✅ Spots filling fast',
    cta: 'Find Training Near You →',
    score: 85,
    engagement: '~$1.20 CPC estimated',
    timestamp: '8 min ago',
  },
  {
    id: '4', type: 'social', platform: 'twitter', tone: 'casual',
    title: 'Coach Spotlight Thread',
    content: '🧵 Coach spotlight: Marcus Thompson just hit 4.97 ★ across 142 reviews.\n\nHis secret? Every session has a plan. Every kid gets individual attention. No wasted time on the field.\n\nThis is what elite coaching looks like. 🔗',
    hashtags: ['#CoachSpotlight', '#SoccerTraining'],
    score: 79,
    engagement: '~840 impressions predicted',
    timestamp: '12 min ago',
  },
];

const contentCalendar = [
  { day: 'Mon', items: [{ type: 'social' as ContentType, title: 'Motivation Monday', time: '9 AM', platform: 'instagram' as Platform }] },
  { day: 'Tue', items: [{ type: 'email' as ContentType, title: 'Newsletter', time: '10 AM' }, { type: 'social' as ContentType, title: 'Tip Tuesday', time: '2 PM', platform: 'twitter' as Platform }] },
  { day: 'Wed', items: [{ type: 'ad' as ContentType, title: 'Camp Promo', time: 'All day' }] },
  { day: 'Thu', items: [{ type: 'social' as ContentType, title: 'Coach Spotlight', time: '12 PM', platform: 'linkedin' as Platform }] },
  { day: 'Fri', items: [{ type: 'social' as ContentType, title: 'Weekend Preview', time: '4 PM', platform: 'instagram' as Platform }] },
  { day: 'Sat', items: [] },
  { day: 'Sun', items: [{ type: 'email' as ContentType, title: 'Week Recap', time: '6 PM' }] },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function ContentStudioPage() {
  const [activeType, setActiveType] = useState<ContentType>('social');
  const [selectedTone, setSelectedTone] = useState<Tone>('exciting');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  const typeOptions: { id: ContentType; icon: React.ElementType; label: string }[] = [
    { id: 'social', icon: Heart, label: 'Social Post' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'ad', icon: Megaphone, label: 'Ad Copy' },
    { id: 'seo', icon: Globe, label: 'SEO / Blog' },
  ];

  const toneOptions: { id: Tone; label: string; emoji: string }[] = [
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'casual', label: 'Casual', emoji: '😎' },
    { id: 'exciting', label: 'Exciting', emoji: '🔥' },
    { id: 'inspiring', label: 'Inspiring', emoji: '✨' },
  ];

  const platformIcons: Record<Platform, React.ElementType> = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Users,
    linkedin: Globe,
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" /> Content Studio
              </h1>
              <p className="text-xs text-text-muted mt-0.5">AI-powered marketing content generator</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Calendar className="w-3.5 h-3.5" /> Content Calendar
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <FileText className="w-3.5 h-3.5" /> Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* ─── Left: Generator ─── */}
          <div className="col-span-5 space-y-4">
            {/* Content Type */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Content Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map(t => (
                  <button key={t.id} onClick={() => setActiveType(t.id)}
                    className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                      activeType === t.id
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-slate-50 text-text-muted border border-slate-200 hover:border-slate-200')}>
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform (for social) */}
            {activeType === 'social' && (
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Platform</h3>
                <div className="flex gap-2">
                  {(['instagram', 'twitter', 'facebook', 'linkedin'] as Platform[]).map(p => {
                    const Icon = platformIcons[p];
                    return (
                      <button key={p} onClick={() => setSelectedPlatform(p)}
                        className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                          selectedPlatform === p
                            ? 'bg-atlas-500/10 text-atlas-400 border border-atlas-500/20'
                            : 'bg-slate-50 text-text-muted border border-slate-200')}>
                        <Icon className="w-3.5 h-3.5" /> {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tone */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tone</h3>
              <div className="flex gap-2">
                {toneOptions.map(t => (
                  <button key={t.id} onClick={() => setSelectedTone(t.id)}
                    className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                      selectedTone === t.id
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-slate-50 text-text-muted border border-slate-200')}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Describe what you need</h3>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g., Announce our new spring camp series in Scarborough, targeting parents of kids ages 8-14..."
                className="w-full h-28 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-xs text-text-primary placeholder:text-text-muted/50 resize-none outline-none focus:border-purple-500/30"
              />

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  'New camp announcement',
                  'Coach spotlight',
                  'Re-engage inactive users',
                  'Waitlist alert',
                  'Event recap',
                  'Testimonial post',
                ].map(q => (
                  <button key={q} onClick={() => setPrompt(q)}
                    className="px-2.5 py-1 rounded-full text-[10px] bg-slate-50 text-text-muted hover:bg-slate-100 hover:text-text-secondary transition-all">
                    {q}
                  </button>
                ))}
              </div>

              <button onClick={handleGenerate}
                className={cn(
                  'w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                  generating
                    ? 'bg-purple-500/20 text-purple-300 cursor-wait'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                )}>
                {generating ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Content</>
                )}
              </button>
            </div>

            {/* Content Calendar */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">This Week&apos;s Calendar</h3>
              <div className="grid grid-cols-7 gap-1">
                {contentCalendar.map(day => (
                  <div key={day.day} className="text-center">
                    <p className="text-[10px] text-text-muted mb-1">{day.day}</p>
                    <div className="min-h-[60px] p-1 rounded-lg bg-white/40 border border-white/60">
                      {day.items.map((item, i) => (
                        <div key={i} className={cn('px-1 py-0.5 rounded text-[8px] font-medium mb-0.5',
                          item.type === 'social' ? 'bg-purple-500/10 text-purple-400' :
                          item.type === 'email' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        )}>
                          {item.title.substring(0, 8)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right: Generated Content ─── */}
          <div className="col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Generated Content</h3>
              <span className="text-[10px] text-text-muted">{generatedContent.length} pieces generated</span>
            </div>

            {generatedContent.map(content => (
              <div key={content.id} className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden hover:border-white/[0.1] transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium',
                      content.type === 'social' ? 'bg-purple-500/10 text-purple-400' :
                      content.type === 'email' ? 'bg-blue-500/10 text-blue-400' :
                      content.type === 'ad' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-green-500/10 text-green-400'
                    )}>
                      {content.type}
                    </span>
                    {content.platform && (
                      <span className="flex items-center gap-1 text-[10px] text-text-muted">
                        {(() => { const I = platformIcons[content.platform]; return <I className="w-3 h-3" />; })()}
                        {content.platform}
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted">{content.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10">
                      <Star className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] font-bold text-green-400">{content.score}/100</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-1">{content.title}</h4>
                  {content.subject && (
                    <p className="text-xs text-atlas-400 mb-2">Subject: {content.subject}</p>
                  )}
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">{content.content}</p>

                  {content.hashtags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {content.hashtags.map(h => (
                        <span key={h} className="px-2 py-0.5 rounded-full text-[10px] bg-atlas-500/10 text-atlas-400">{h}</span>
                      ))}
                    </div>
                  )}

                  {content.cta && (
                    <div className="mt-3 p-2.5 rounded-lg bg-atlas-500/5 border border-atlas-500/15">
                      <p className="text-[10px] text-text-muted mb-0.5">Call to Action:</p>
                      <p className="text-xs font-semibold text-atlas-400">{content.cta}</p>
                    </div>
                  )}

                  {content.engagement && (
                    <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {content.engagement}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200">
                  <button onClick={() => handleCopy(content.id, content.content)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-[10px] text-text-secondary hover:bg-slate-100">
                    {copiedId === content.id ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-[10px] text-text-secondary hover:bg-slate-100">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-[10px] text-text-secondary hover:bg-slate-100">
                    <Wand2 className="w-3 h-3" /> Edit
                  </button>
                  <div className="flex-1" />
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 hover:bg-purple-500/15">
                    <Send className="w-3 h-3" /> Schedule
                  </button>
                </div>
              </div>
            ))}

            {/* Performance Stats */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Content Performance</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Avg Engagement', value: '4.2%', trend: '+0.8%', icon: Heart },
                  { label: 'Best Platform', value: 'Instagram', trend: '67% reach', icon: Instagram },
                  { label: 'Pieces Generated', value: '142', trend: 'this month', icon: FileText },
                  { label: 'Time Saved', value: '23 hrs', trend: 'vs manual', icon: Clock },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-white/40 text-center">
                    <s.icon className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
                    <p className="text-sm font-display font-bold text-text-primary">{s.value}</p>
                    <p className="text-[9px] text-text-muted">{s.label}</p>
                    <p className="text-[9px] text-green-400 mt-0.5">{s.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
