// ai chat assistant - floating chat bubble with zone intelligence queries and typing animation

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, X, Send, Bot, User, Sparkles,
  MapPin, TrendingUp, Brain, Zap, ChevronDown,
  Loader2, RotateCcw, Copy, Check, Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// types

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { label: string; zone?: string }[];
}

interface SuggestedPrompt {
  icon: React.ElementType;
  label: string;
  prompt: string;
  accent: string;
}

// mock ai responses

const AI_RESPONSES: Record<string, { content: string; sources?: { label: string; zone?: string }[] }> = {
  'underserved': {
    content: `Based on our latest geospatial analysis, the **top 5 underserved zones** in the GTA are:\n\n1. **Scarborough East** — Opportunity Score: 92/100. Demand outpaces supply by 2.5×. Only 4 active coaches serving 12,000+ youth athletes.\n\n2. **Brampton North** — Score: 87. Fastest growing youth population in the GTA (+18% YoY). Zero camps within 5km radius.\n\n3. **Ajax-Pickering** — Score: 84. High search volume (340/month) with only 2 registered coaches.\n\n4. **Vaughan West** — Score: 78. Premium demographic ($120k avg HHI) but limited private training options.\n\n5. **Etobicoke South** — Score: 71. Emerging demand for speed & agility training, currently unmet.\n\n💡 **Recommendation:** Launch a summer camp in Scarborough East first — projected 94% fill rate at $299/week.`,
    sources: [
      { label: 'H3 Demand Index', zone: 'Scarborough East' },
      { label: 'Census 2024 Youth Pop.', zone: 'Brampton North' },
      { label: 'Search Analytics Q1', zone: 'Ajax-Pickering' },
    ],
  },
  'launch': {
    content: `Great question! Here's my analysis for the **optimal next launch location**:\n\n📍 **Scarborough East (H3: 882a91)**\n\n**Why here:**\n- Demand Index: 87 (top 5% of all zones)\n- Supply Index: 34 (bottom 20%)\n- Opportunity Gap: 2.5× — largest in the GTA\n- 12,400 youth athletes ages 6-17 within 3km\n- Avg household income: $78K (matches $249-$349 price point)\n\n**Optimal Configuration:**\n- 🏕️ Type: Week-long summer camp\n- 📅 Best start: July 7 (school break + low existing competition)\n- 💰 Price: $299/week (sweet spot per elasticity model)\n- 👥 Capacity: 40 athletes (fills at 94% confidence)\n- ⏰ Time: 9 AM - 3 PM (parent work schedule aligned)\n\n**Projected Revenue:** $11,960/week × 8 weeks = **$95,680 summer season**\n\nShall I run a full What-If simulation with these parameters?`,
    sources: [
      { label: 'ML Fill-Rate Model v2.1', zone: 'Scarborough East' },
      { label: 'Price Elasticity Analysis' },
      { label: 'Census + StatsCan Data' },
    ],
  },
  'peak': {
    content: `Here's the **demand seasonality breakdown** across all GTA zones:\n\n📈 **Peak Demand Windows:**\n\n| Period | Index | Notes |\n|--------|-------|-------|\n| Jun 15 - Aug 31 | **100** | Summer camps drive 3× baseline |\n| Mar 15 - May 15 | **78** | Spring break + pre-season prep |\n| Sep 1 - Oct 15 | **65** | Back-to-school clinics |\n| Dec 20 - Jan 5 | **52** | Holiday camps (indoor only) |\n\n🕐 **Optimal Days/Times:**\n- **Weekdays:** 4 PM - 7 PM (after school) — 42% of all bookings\n- **Saturdays:** 9 AM - 12 PM — 31% of bookings\n- **Sundays:** 10 AM - 1 PM — 18% of bookings\n\n⚡ **Key Insight:** Tuesday and Thursday evenings have the highest conversion rate (8.2%) but lowest supply. This is your biggest quick-win.\n\n💡 Adding Tuesday 5-7 PM clinics in top 5 zones would capture an estimated **$24,000/month** in unmet demand.`,
    sources: [
      { label: 'Booking Seasonality Model' },
      { label: 'Lead Conversion Analytics' },
    ],
  },
  'compare': {
    content: `Here's a head-to-head comparison of the two zones:\n\n| Metric | Scarborough East | North York Central |\n|--------|-----------------|-------------------|\n| Opportunity Score | **92** 🏆 | 71 |\n| Demand Index | **87** | 64 |\n| Supply Index | 34 | 58 |\n| Active Coaches | 4 | **12** |\n| Avg Fill Rate | 91% | **94%** |\n| Avg Price Point | $289 | **$349** |\n| Youth Population | **12,400** | 8,200 |\n| Leads (30d) | **156** | 89 |\n| Conversion Rate | 6.2% | **7.8%** |\n| Competition Density | Low 🟢 | High 🟡 |\n\n**Verdict:** Scarborough East has more raw opportunity (higher demand, lower competition), but North York Central has proven unit economics with higher prices and conversion. \n\n🎯 **My recommendation:** Scarborough East for volume growth, North York for premium positioning. Ideally, launch in both with differentiated pricing.`,
    sources: [
      { label: 'Zone Comparison Engine' },
      { label: 'Supply-Demand Model v3' },
    ],
  },
  'default': {
    content: `I can help you with geospatial intelligence and zone analytics! Here are some things I can do:\n\n🗺️ **Zone Analysis** — Identify underserved areas, compare zones, analyze demographics\n📊 **Demand Forecasting** — Predict peak times, seasonal trends, and fill rates\n🎯 **Launch Planning** — Recommend where, when, and how to launch new events\n💰 **Revenue Projections** — Estimate revenue potential for specific configurations\n🤖 **What-If Scenarios** — Model different pricing, capacity, and timing options\n\nTry asking me something like:\n- "Where should I launch my next camp?"\n- "Compare Scarborough East vs North York"\n- "When is peak demand for clinics?"`,
  },
};

function getAIResponse(query: string): { content: string; sources?: { label: string; zone?: string }[] } {
  const q = query.toLowerCase();
  if (q.includes('underserved') || q.includes('opportunity') || q.includes('top zone')) return AI_RESPONSES.underserved;
  if (q.includes('launch') || q.includes('where should') || q.includes('next camp') || q.includes('expand')) return AI_RESPONSES.launch;
  if (q.includes('peak') || q.includes('when') || q.includes('season') || q.includes('demand')) return AI_RESPONSES.peak;
  if (q.includes('compare') || q.includes('vs') || q.includes('versus') || q.includes('head to head')) return AI_RESPONSES.compare;
  return AI_RESPONSES.default;
}

// suggested prompts

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { icon: MapPin, label: 'Find underserved zones', prompt: 'Show me the top underserved zones in the GTA', accent: 'bg-atlas-500/15 text-atlas-400 border-atlas-500/20' },
  { icon: TrendingUp, label: 'Launch recommendation', prompt: 'Where should I launch my next camp?', accent: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { icon: Brain, label: 'Peak demand analysis', prompt: 'When is peak demand for training?', accent: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  { icon: Zap, label: 'Compare two zones', prompt: 'Compare Scarborough East vs North York Central', accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
];

// typing animation hook

function useTypingAnimation(text: string, speed: number = 8) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        // type in chunks of 2-4 chars for natural feel
        const chunk = Math.min(Math.floor(Math.random() * 3) + 2, text.length - i);
        setDisplayed(text.slice(0, i + chunk));
        i += chunk;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isComplete };
}

// chat message component

function ChatMessage({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isBot = message.role === 'assistant';
  const { displayed, isComplete } = useTypingAnimation(
    isBot && isLatest ? message.content : message.content,
    isBot && isLatest ? 8 : 0
  );
  const [copied, setCopied] = useState(false);

  const content = isBot && isLatest && !isComplete ? displayed : message.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex gap-2.5 group', isBot ? '' : 'flex-row-reverse')}>
      {/* avatar */}
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
        isBot ? 'bg-gradient-to-br from-atlas-500 to-atlas-600' : 'bg-slate-100'
      )}>
        {isBot ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-text-muted" />}
      </div>

      {/* content */}
      <div className={cn('flex-1 min-w-0', isBot ? 'pr-6' : 'pl-6')}>
        <div className={cn(
          'text-[13px] leading-relaxed whitespace-pre-wrap',
          isBot ? 'text-text-secondary' : 'text-text-primary bg-slate-100/50 rounded-xl rounded-tr-sm px-3 py-2'
        )}>
          {/* simple markdown-ish rendering */}
          {content.split('\n').map((line, i) => {
            // bold
            const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');
            // table detection
            if (line.startsWith('|') && line.endsWith('|')) {
              const cells = line.split('|').filter(Boolean).map(c => c.trim());
              if (cells.every(c => c.match(/^-+$/))) return null;
              return (
                <div key={i} className="flex gap-2 text-[11px] font-mono py-0.5">
                  {cells.map((cell, j) => (
                    <span key={j} className="flex-1 truncate">{cell}</span>
                  ))}
                </div>
              );
            }
            return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: boldParsed }} />;
          })}

          {/* typing cursor */}
          {isBot && isLatest && !isComplete && (
            <span className="inline-block w-1.5 h-4 bg-atlas-400 animate-pulse ml-0.5 align-middle rounded-sm" />
          )}
        </div>

        {/* sources */}
        {isBot && message.sources && isComplete && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.sources.map((src, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-text-muted">
                <Sparkles className="w-2.5 h-2.5 text-atlas-400" />
                {src.label}
                {src.zone && <span className="text-atlas-400">· {src.zone}</span>}
              </span>
            ))}
          </div>
        )}

        {/* actions */}
        {isBot && isComplete && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1 rounded hover:bg-slate-100/50 text-text-muted">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// main component

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestMsgId = useRef<string>('');

  // auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // simulate ai thinking delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      };
      latestMsgId.current = botMsg.id;
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }, [isTyping]);

  const handleReset = () => {
    setMessages([]);
    latestMsgId.current = '';
  };

  return (
    <>
      {/* floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-atlas-500 to-atlas-600 shadow-xl shadow-atlas-500/30 hover:shadow-atlas-500/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        >
          <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          {/* pulse ring */}
          <span className="absolute inset-0 rounded-2xl bg-atlas-500/30 animate-ping opacity-50" style={{ animationDuration: '3s' }} />
        </button>
      )}

      {/* ═══ Chat Window ═══ */}
      {isOpen && (
        <div className={cn(
          'fixed z-50 transition-all duration-300',
          isMinimized
            ? 'bottom-6 right-6 w-72'
            : 'bottom-6 right-6 w-[420px] max-h-[680px]'
        )}>
          <div className={cn(
            'rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-black/8 overflow-hidden flex flex-col',
            isMinimized ? 'h-auto' : 'h-[640px]'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-atlas-500 to-atlas-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-text-primary">Atlas AI</p>
                  <p className="text-[10px] text-atlas-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-atlas-400 animate-pulse" />
                    Zone Intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-slate-100/50 text-text-muted transition-colors" title="Reset chat">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-lg hover:bg-slate-100/50 text-text-muted transition-colors">
                  {isMinimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100/50 text-text-muted transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-14 h-14 rounded-2xl bg-atlas-500/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-atlas-400" />
                      </div>
                      <h3 className="font-display font-semibold text-text-primary mb-1">Atlas Intelligence</h3>
                      <p className="text-xs text-text-muted mb-6 max-w-[280px]">
                        Ask me about zones, demand patterns, launch recommendations, or compare areas.
                      </p>

                      {/* Suggested Prompts */}
                      <div className="space-y-2 w-full">
                        {SUGGESTED_PROMPTS.map(prompt => (
                          <button
                            key={prompt.label}
                            onClick={() => sendMessage(prompt.prompt)}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all hover:-translate-y-0.5 text-left',
                              prompt.accent
                            )}
                          >
                            <prompt.icon className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-medium">{prompt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          isLatest={msg.id === latestMsgId.current}
                        />
                      ))}
                      {isTyping && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-atlas-500 to-atlas-600 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-50">
                            <div className="w-1.5 h-1.5 rounded-full bg-atlas-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-atlas-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-atlas-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Actions (shown after first message) */}
                {messages.length > 0 && !isTyping && (
                  <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {SUGGESTED_PROMPTS.slice(0, 3).map(p => (
                      <button
                        key={p.label}
                        onClick={() => sendMessage(p.prompt)}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-text-muted hover:text-text-secondary hover:bg-slate-100 transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="px-3 py-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-atlas-500/30 transition-colors">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                      placeholder="Ask about zones, demand, launches..."
                      className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none"
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isTyping}
                      className={cn(
                        'p-1.5 rounded-lg transition-all',
                        input.trim() && !isTyping
                          ? 'bg-atlas-500 text-white hover:bg-atlas-400'
                          : 'text-text-muted/30'
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[9px] text-text-muted/40 text-center mt-1.5">
                    Atlas AI · Powered by geospatial intelligence
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Trigger Button (for Navbar integration) ────────────────────

export function AIChatTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-atlas-500/10 border border-atlas-500/20 text-atlas-400 text-xs font-medium hover:bg-atlas-500/15 transition-all"
    >
      <Brain className="w-3.5 h-3.5" />
      <span>Ask AI</span>
    </button>
  );
}
