// live collaboration presence - figma-style active users, cursors, live editing indicators, and activity sidebar

'use client';

import {
  Users, Eye, Edit3, MessageCircle, Crown, Shield,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRESENCE_USERS, LIVE_ACTIVITIES } from '@/components/collaboration/PresenceBar';


export default function CollaborationPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-atlas-400" /> Live Collaboration
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Real-time team presence and activity tracking</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
        {/* team members */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Team Members</h2>
          <div className="grid grid-cols-2 gap-3">
            {PRESENCE_USERS.map(user => (
              <div key={user.id} className={cn('p-4 rounded-2xl bg-white backdrop-blur-xl border transition-all',
                user.status === 'editing' ? 'border-green-500/20' :
                user.status === 'active' ? 'border-atlas-500/10' : 'border-slate-200')}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white', user.color)}>
                      {user.initials}
                    </div>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-50',
                      user.status === 'active' || user.status === 'editing' ? 'bg-green-400' : 'bg-text-muted/30',
                      user.status === 'editing' && 'animate-pulse')} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary">{user.name}</span>
                      {user.role === 'admin' && <Crown className="w-3 h-3 text-amber-400" />}
                      {user.role === 'coach' && <Shield className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                      <span className={cn(
                        user.status === 'editing' ? 'text-green-400' :
                        user.status === 'active' ? 'text-atlas-400' : 'text-text-muted/50'
                      )}>
                        {user.status === 'editing' ? '✏️ Editing' : user.status === 'active' ? '🟢 Active' : '⚫ Idle'}
                      </span>
                      <span>·</span>
                      <span>{user.currentPage}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted/50">{user.lastSeen}</span>
                </div>
                {user.status === 'editing' && (
                  <div className="mt-2 px-2 py-1 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-[10px] text-green-400">Currently editing: Speed Clinic schedule on Calendar page</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* activity sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Live Activity Feed</h2>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
            <div className="p-3 space-y-1">
              {LIVE_ACTIVITIES.map(act => (
                <div key={act.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5', act.userColor)}>
                    {act.type === 'edit' ? <Edit3 className="w-2.5 h-2.5 text-white" /> :
                     act.type === 'view' ? <Eye className="w-2.5 h-2.5 text-white" /> :
                     act.type === 'create' ? <span className="text-[8px] text-white font-bold">+</span> :
                     <MessageCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text-secondary leading-snug">
                      <span className="font-medium text-text-primary">{act.user}</span>{' '}
                      {act.action}{' '}
                      <span className="text-atlas-400">{act.target}</span>
                    </p>
                    <p className="text-[9px] text-text-muted/50 mt-0.5">{act.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* connection status */}
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-text-primary">WebSocket Connected</span>
            </div>
            <p className="text-[10px] text-text-muted">Real-time sync active. Changes appear instantly across all connected clients.</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
              <span>Latency: <span className="text-green-400">12ms</span></span>
              <span>Uptime: <span className="text-text-primary">99.97%</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
