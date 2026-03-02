/* ═══════════════════════════════════════════════════════════════════════
   Gaya — In-App Messaging
   Real-time chat between parents and coaches with conversation
   list, message bubbles, typing indicators, read receipts,
   and AI-powered quick reply suggestions.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, Search, Send, Paperclip, Image, Smile,
  Phone, Video, MoreVertical, Check, CheckCheck, Clock,
  Star, MapPin, Calendar, Users, Sparkles, ChevronDown,
  Pin, Archive, Bell, BellOff, ArrowLeft, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  read: boolean;
  type?: 'text' | 'booking' | 'image';
  bookingData?: { title: string; date: string; time: string; status: string };
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  role: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  typing: boolean;
  pinned: boolean;
  messages: Message[];
}

// ─── Mock Data ──────────────────────────────────────────────────────

const conversations: Conversation[] = [
  {
    id: '1', name: 'Sarah M.', avatar: 'SM', avatarColor: 'from-blue-400 to-indigo-400',
    role: 'Parent — Alex (12)', lastMessage: 'That sounds perfect! We\'ll be there at 5 PM.',
    lastTime: '2 min ago', unread: 2, online: true, typing: false, pinned: true,
    messages: [
      { id: 'm1', text: 'Hi Marcus! I saw your Spring Elite Camp listing. Is there still room for my son Alex?', sender: 'them', timestamp: '2:15 PM', read: true },
      { id: 'm2', text: 'Hi Sarah! Yes, we have 3 spots remaining. Alex is 12 and plays midfielder, right?', sender: 'me', timestamp: '2:18 PM', read: true },
      { id: 'm3', text: 'Yes! He\'s been working on his weak foot and game IQ. Your camp focuses on those areas?', sender: 'them', timestamp: '2:20 PM', read: true },
      { id: 'm4', text: 'Absolutely! Day 2 is specifically focused on weak-foot development, and Days 3-4 cover tactical awareness and game intelligence. It\'s perfect for where Alex is in his development.', sender: 'me', timestamp: '2:22 PM', read: true },
      { id: 'm5', text: 'That sounds amazing. What should he bring?', sender: 'them', timestamp: '2:25 PM', read: true },
      { id: 'm6', text: 'Just shin guards, cleats, water bottle, and a positive attitude 😄 We provide all training equipment. I\'ll send you the booking confirmation.', sender: 'me', timestamp: '2:27 PM', read: true },
      { id: 'm7', text: '', sender: 'me', timestamp: '2:28 PM', read: true, type: 'booking', bookingData: { title: 'Spring Elite Camp — Day 1', date: 'Mon, Apr 14', time: '9:00 AM - 1:00 PM', status: 'Confirmed' } },
      { id: 'm8', text: 'That sounds perfect! We\'ll be there at 5 PM.', sender: 'them', timestamp: '2:30 PM', read: false },
      { id: 'm9', text: 'Actually, should we arrive earlier for check-in?', sender: 'them', timestamp: '2:31 PM', read: false },
    ],
  },
  {
    id: '2', name: 'Michael K.', avatar: 'MK', avatarColor: 'from-green-400 to-emerald-400',
    role: 'Parent — Jayden (10)', lastMessage: 'Is there a trial session available?',
    lastTime: '1 hour ago', unread: 1, online: true, typing: true, pinned: false,
    messages: [
      { id: 'm1', text: 'Hello! I found your profile on Gaya. My son Jayden is 10 and interested in private training.', sender: 'them', timestamp: '1:00 PM', read: true },
      { id: 'm2', text: 'Hi Michael! I\'d love to work with Jayden. What areas is he looking to improve?', sender: 'me', timestamp: '1:05 PM', read: true },
      { id: 'm3', text: 'Mainly dribbling and confidence on the ball. He\'s a bit shy in games.', sender: 'them', timestamp: '1:08 PM', read: true },
      { id: 'm4', text: 'Is there a trial session available?', sender: 'them', timestamp: '1:10 PM', read: false },
    ],
  },
  {
    id: '3', name: 'David Park', avatar: 'DP', avatarColor: 'from-purple-400 to-pink-300',
    role: 'Fellow Coach', lastMessage: 'Let\'s collab on the weekend clinic!',
    lastTime: '3 hours ago', unread: 0, online: false, typing: false, pinned: false,
    messages: [
      { id: 'm1', text: 'Hey Marcus! I saw you\'re running camps in Scarborough. I\'m doing clinics in Ajax. Want to cross-promote?', sender: 'them', timestamp: '11:00 AM', read: true },
      { id: 'm2', text: 'Great idea David! Our audiences overlap. Let\'s set up a joint weekend session.', sender: 'me', timestamp: '11:15 AM', read: true },
      { id: 'm3', text: 'Let\'s collab on the weekend clinic!', sender: 'them', timestamp: '11:20 AM', read: true },
    ],
  },
  {
    id: '4', name: 'Aisha O.', avatar: 'AO', avatarColor: 'from-amber-400 to-orange-400',
    role: 'Parent — Kemi (14)', lastMessage: 'Thank you for the great session today!',
    lastTime: 'Yesterday', unread: 0, online: false, typing: false, pinned: false,
    messages: [
      { id: 'm1', text: 'Thank you for the great session today! Kemi said it was the best training she\'s had.', sender: 'them', timestamp: 'Yesterday', read: true },
      { id: 'm2', text: 'That means so much! Kemi has incredible potential. I\'d love to talk about a development plan for her.', sender: 'me', timestamp: 'Yesterday', read: true },
    ],
  },
];

const quickReplies = [
  'Yes, I have availability this week!',
  'Let me send you the booking link.',
  'Great question! Here\'s more info...',
  'I\'d recommend starting with a trial session.',
];

// ─── Page ───────────────────────────────────────────────────────────

export default function MessagingPage() {
  const [activeConvo, setActiveConvo] = useState(conversations[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo]);

  const filteredConvos = searchQuery
    ? conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="min-h-screen">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-atlas-400" /> Messages
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">{totalUnread}</span>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-0">
        <div className="flex h-[calc(100vh-120px)] border-x border-b border-slate-200 rounded-b-xl overflow-hidden">
          {/* ─── Conversation List ─── */}
          <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/30">
            {/* Search */}
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 border border-white/60">
                <Search className="w-3.5 h-3.5 text-text-muted" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..." className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted/50 outline-none" />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvos.map(convo => (
                <button key={convo.id} onClick={() => setActiveConvo(convo)}
                  className={cn('w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-b border-white/[0.03]',
                    activeConvo.id === convo.id ? 'bg-atlas-500/5' : 'hover:bg-slate-50')}>
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white', convo.avatarColor)}>
                      {convo.avatar}
                    </div>
                    {convo.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {convo.pinned && <Pin className="w-2.5 h-2.5 text-text-muted/50" />}
                        <span className={cn('text-xs font-medium', convo.unread > 0 ? 'text-text-primary' : 'text-text-secondary')}>{convo.name}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">{convo.lastTime}</span>
                    </div>
                    <p className="text-[10px] text-text-muted/60">{convo.role}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={cn('text-[10px] truncate', convo.unread > 0 ? 'text-text-secondary font-medium' : 'text-text-muted/50')}>
                        {convo.typing ? (
                          <span className="text-atlas-400 italic">typing...</span>
                        ) : convo.lastMessage}
                      </p>
                      {convo.unread > 0 && (
                        <span className="ml-2 w-4 h-4 rounded-full bg-atlas-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Chat Area ─── */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/20">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white', activeConvo.avatarColor)}>
                  {activeConvo.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{activeConvo.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {activeConvo.typing ? (
                      <span className="text-atlas-400">typing...</span>
                    ) : activeConvo.online ? (
                      <span className="text-green-400">Online</span>
                    ) : 'Offline'}
                    {' · '}{activeConvo.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-50"><Phone className="w-4 h-4 text-text-muted" /></button>
                <button className="p-2 rounded-lg hover:bg-slate-50"><Video className="w-4 h-4 text-text-muted" /></button>
                <button className="p-2 rounded-lg hover:bg-slate-50"><MoreVertical className="w-4 h-4 text-text-muted" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {activeConvo.messages.map(msg => (
                <div key={msg.id} className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5',
                    msg.sender === 'me'
                      ? 'bg-atlas-500/15 border border-atlas-500/20 rounded-br-md'
                      : 'bg-slate-50 border border-slate-200 rounded-bl-md')}>
                    {msg.type === 'booking' && msg.bookingData ? (
                      <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                        <p className="text-[10px] text-atlas-400 font-semibold mb-1">📅 Booking Confirmation</p>
                        <p className="text-xs font-medium text-text-primary">{msg.bookingData.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{msg.bookingData.date} · {msg.bookingData.time}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] bg-green-500/10 text-green-400 mt-1">{msg.bookingData.status}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-text-primary leading-relaxed">{msg.text}</p>
                    )}
                    <div className={cn('flex items-center gap-1 mt-1', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                      <span className="text-[9px] text-text-muted/40">{msg.timestamp}</span>
                      {msg.sender === 'me' && (
                        msg.read ? <CheckCheck className="w-3 h-3 text-atlas-400" /> : <Check className="w-3 h-3 text-text-muted/40" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Quick Replies */}
            <div className="px-5 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                {quickReplies.map(qr => (
                  <button key={qr} onClick={() => setMessage(qr)}
                    className="px-2.5 py-1 rounded-full text-[10px] bg-purple-500/10 text-purple-300 hover:bg-purple-500/15 whitespace-nowrap shrink-0 transition-all">
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/20">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-50">
                  <Paperclip className="w-4 h-4 text-text-muted" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-50">
                  <Image className="w-4 h-4 text-text-muted" />
                </button>
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/40 border border-white/60">
                  <input value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..." onKeyDown={e => { if (e.key === 'Enter' && message.trim()) setMessage(''); }}
                    className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted/50 outline-none" />
                  <button className="p-1 rounded-lg hover:bg-slate-50">
                    <Smile className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
                <button className={cn('p-2.5 rounded-xl transition-all',
                  message.trim() ? 'bg-atlas-500 text-white' : 'bg-slate-50 text-text-muted')}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
