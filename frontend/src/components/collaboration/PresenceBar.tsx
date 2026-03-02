'use client';

import { useState } from 'react';
import {
  Users, Eye, Edit3, MessageCircle, Circle, Crown,
  X, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

// types

interface PresenceUser {
  id: string;
  name: string;
  initials: string;
  role: 'admin' | 'coach' | 'viewer';
  color: string;
  cursorColor: string;
  avatar?: string;
  status: 'active' | 'idle' | 'editing';
  currentPage: string;
  lastSeen: string;
  cursor?: { x: number; y: number };
}

interface LiveActivity {
  id: string;
  user: string;
  userColor: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'edit' | 'view' | 'create' | 'comment';
}

// mock data

export const PRESENCE_USERS: PresenceUser[] = [
  { id: 'u1', name: 'You', initials: 'YO', role: 'admin', color: 'bg-atlas-500', cursorColor: '#00d1b2', status: 'active', currentPage: 'Dashboard', lastSeen: 'Now' },
  { id: 'u2', name: 'Sarah Chen', initials: 'SC', role: 'coach', color: 'bg-blue-500', cursorColor: '#3b82f6', status: 'editing', currentPage: 'Calendar', lastSeen: 'Now', cursor: { x: 340, y: 180 } },
  { id: 'u3', name: 'Marcus Thompson', initials: 'MT', role: 'coach', color: 'bg-purple-500', cursorColor: '#8b5cf6', status: 'active', currentPage: 'Leaderboard', lastSeen: '2m ago', cursor: { x: 620, y: 320 } },
  { id: 'u4', name: 'David Park', initials: 'DP', role: 'coach', color: 'bg-amber-500', cursorColor: '#f59e0b', status: 'idle', currentPage: 'Pipeline', lastSeen: '5m ago' },
  { id: 'u5', name: 'Aisha Okafor', initials: 'AO', role: 'admin', color: 'bg-red-500', cursorColor: '#ef4444', status: 'active', currentPage: 'Intelligence', lastSeen: '1m ago', cursor: { x: 180, y: 420 } },
];

export const LIVE_ACTIVITIES: LiveActivity[] = [
  { id: 'a1', user: 'Sarah Chen', userColor: 'bg-blue-500', action: 'is editing', target: 'Speed Clinic schedule', timestamp: 'just now', type: 'edit' },
  { id: 'a2', user: 'Marcus Thompson', userColor: 'bg-purple-500', action: 'viewed', target: 'Leaderboard rankings', timestamp: '30s ago', type: 'view' },
  { id: 'a3', user: 'Aisha Okafor', userColor: 'bg-red-500', action: 'created', target: 'New lead in Scarborough', timestamp: '1m ago', type: 'create' },
  { id: 'a4', user: 'David Park', userColor: 'bg-amber-500', action: 'commented on', target: 'Q2 Expansion Plan', timestamp: '3m ago', type: 'comment' },
  { id: 'a5', user: 'Sarah Chen', userColor: 'bg-blue-500', action: 'moved', target: 'Johnson lead to Qualified', timestamp: '5m ago', type: 'edit' },
];

// presence bar component (navbar integration)

export function PresenceBar() {
  const [showPanel, setShowPanel] = useState(false);
  const activeUsers = PRESENCE_USERS.filter(u => u.status !== 'idle');

  return (
    <div className="relative">
      {/* avatar stack */}
      <button onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100/50 transition-all">
        <div className="flex -space-x-2">
          {PRESENCE_USERS.slice(0, 4).map(user => (
            <div key={user.id} className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-2 ring-white',
              user.color, user.status === 'idle' && 'opacity-50')}>
              {user.initials}
              {user.status === 'editing' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-white animate-pulse" />
              )}
            </div>
          ))}
          {PRESENCE_USERS.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-text-muted ring-2 ring-white">
              +{PRESENCE_USERS.length - 4}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-[10px] text-text-muted">{activeUsers.length} online</span>
        </div>
      </button>

      {/* presence panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/10 overflow-hidden animate-fade-in z-50">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-atlas-400" /> Team Online
            </span>
            <button onClick={() => setShowPanel(false)} className="text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* users */}
          <div className="p-2 max-h-60 overflow-y-auto">
            {PRESENCE_USERS.map(user => (
              <div key={user.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="relative">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white', user.color)}>
                    {user.initials}
                  </div>
                  <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-50',
                    user.status === 'active' ? 'bg-green-400' :
                    user.status === 'editing' ? 'bg-green-400 animate-pulse' :
                    'bg-text-muted/30')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-text-primary truncate">{user.name}</span>
                    {user.role === 'admin' && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    {user.status === 'editing' ? (
                      <><Edit3 className="w-2.5 h-2.5 text-green-400" /> Editing</>
                    ) : user.status === 'active' ? (
                      <><Eye className="w-2.5 h-2.5" /> Viewing</>
                    ) : (
                      <><Circle className="w-2.5 h-2.5" /> Idle</>
                    )}
                    <span>·</span>
                    <span>{user.currentPage}</span>
                  </div>
                </div>
                <span className="text-[9px] text-text-muted/50">{user.lastSeen}</span>
              </div>
            ))}
          </div>

          {/* live activity feed */}
          <div className="border-t border-slate-200">
            <div className="px-4 py-2">
              <span className="text-[10px] font-medium text-text-muted">Live Activity</span>
            </div>
            <div className="px-2 pb-2 space-y-0.5 max-h-40 overflow-y-auto">
              {LIVE_ACTIVITIES.map(act => (
                <div key={act.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg text-[10px]">
                  <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5', act.userColor)}>
                    {act.type === 'edit' ? <Edit3 className="w-2 h-2 text-white" /> :
                     act.type === 'view' ? <Eye className="w-2 h-2 text-white" /> :
                     act.type === 'create' ? <span className="text-[7px] text-white font-bold">+</span> :
                     <MessageCircle className="w-2 h-2 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-text-secondary">
                      <span className="font-medium">{act.user.split(' ')[0]}</span>
                      {' '}{act.action}{' '}
                      <span className="text-text-primary">{act.target}</span>
                    </span>
                  </div>
                  <span className="text-text-muted/40 shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
