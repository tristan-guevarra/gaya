'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PRESENCE_USERS } from './PresenceBar';

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

function LiveCursor({ user }: { user: PresenceUser }) {
  const [pos, setPos] = useState(user.cursor || { x: 0, y: 0 });

  useEffect(() => {
    if (!user.cursor) return;
    const interval = setInterval(() => {
      setPos(prev => ({
        x: prev.x + (Math.random() - 0.5) * 20,
        y: prev.y + (Math.random() - 0.5) * 15,
      }));
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [user.cursor]);

  if (!user.cursor) return null;

  return (
    <div className="absolute pointer-events-none transition-all duration-1000 ease-out z-30"
      style={{ left: pos.x, top: pos.y }}>
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
        <path d="M1 1L7 20L9.5 12.5L17 10L1 1Z" fill={user.cursorColor} stroke="white" strokeWidth="1.5" />
      </svg>
      <div className={cn('absolute left-4 top-4 px-1.5 py-0.5 rounded text-[9px] font-medium text-white whitespace-nowrap', user.color)}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        {user.name.split(' ')[0]}
      </div>
    </div>
  );
}

export function LiveCursorsOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {PRESENCE_USERS.filter(u => u.cursor && u.id !== 'u1').map(user => (
        <LiveCursor key={user.id} user={user} />
      ))}
    </div>
  );
}
