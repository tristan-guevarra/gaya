// qr check-in - digital attendance with qr codes, live tracking, session analytics, and attendance history

'use client';

import { useState } from 'react';
import {
  QrCode, Users, CheckCircle, Clock, AlertTriangle, XCircle,
  Calendar, TrendingUp, Download, Share2, RefreshCw, Search,
  UserCheck, UserX, Timer, BarChart3, ArrowUpRight, Eye,
  Smartphone, Shield, Zap, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';


type Tab = 'live' | 'history' | 'analytics';

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  checkedIn: boolean;
  checkInTime?: string;
  status: 'checked-in' | 'late' | 'absent' | 'pending';
  parentName?: string;
  age: number;
  notes?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  coach: string;
  venue: string;
  capacity: number;
  registered: number;
  checkedIn: number;
  status: 'upcoming' | 'active' | 'completed';
  attendees: Attendee[];
}


const sessions: Session[] = [
  {
    id: 's1', title: 'Elite Skills Camp — Day 3', date: 'Today', time: '4:00 - 6:00 PM',
    coach: 'Marcus Thompson', venue: 'Scarborough Sportsplex', capacity: 24, registered: 22, checkedIn: 18,
    status: 'active',
    attendees: [
      { id: 'a1', name: 'Alex W.', avatar: 'AW', checkedIn: true, checkInTime: '3:52 PM', status: 'checked-in', parentName: 'Sarah W.', age: 12 },
      { id: 'a2', name: 'Jayden K.', avatar: 'JK', checkedIn: true, checkInTime: '3:55 PM', status: 'checked-in', parentName: 'Michael K.', age: 10 },
      { id: 'a3', name: 'Maya S.', avatar: 'MS', checkedIn: true, checkInTime: '3:58 PM', status: 'checked-in', parentName: 'Raj S.', age: 11 },
      { id: 'a4', name: 'Ethan L.', avatar: 'EL', checkedIn: true, checkInTime: '4:03 PM', status: 'late', parentName: 'Jennifer L.', age: 13, notes: '3 min late' },
      { id: 'a5', name: 'Kemi O.', avatar: 'KO', checkedIn: true, checkInTime: '3:50 PM', status: 'checked-in', parentName: 'Aisha O.', age: 14 },
      { id: 'a6', name: 'Daniel P.', avatar: 'DP', checkedIn: true, checkInTime: '3:56 PM', status: 'checked-in', parentName: 'David P.', age: 12 },
      { id: 'a7', name: 'Sofia R.', avatar: 'SR', checkedIn: true, checkInTime: '4:08 PM', status: 'late', parentName: 'Carlos R.', age: 11, notes: '8 min late' },
      { id: 'a8', name: 'Lucas H.', avatar: 'LH', checkedIn: false, status: 'pending', parentName: 'Emma H.', age: 10 },
      { id: 'a9', name: 'Aria Z.', avatar: 'AZ', checkedIn: false, status: 'absent', parentName: 'Kevin Z.', age: 12, notes: 'Parent notified' },
    ],
  },
  {
    id: 's2', title: 'Speed & Agility Clinic', date: 'Today', time: '6:30 - 8:00 PM',
    coach: 'Sarah Chen', venue: 'North York Community Fields', capacity: 16, registered: 14, checkedIn: 0,
    status: 'upcoming', attendees: [],
  },
  {
    id: 's3', title: 'GK Masterclass', date: 'Yesterday', time: '4:00 - 5:30 PM',
    coach: 'David Park', venue: 'Ajax Indoor Centre', capacity: 12, registered: 12, checkedIn: 11,
    status: 'completed', attendees: [],
  },
];

const weeklyStats = [
  { day: 'Mon', attendance: 94, sessions: 3 },
  { day: 'Tue', attendance: 88, sessions: 2 },
  { day: 'Wed', attendance: 91, sessions: 4 },
  { day: 'Thu', attendance: 96, sessions: 3 },
  { day: 'Fri', attendance: 85, sessions: 2 },
  { day: 'Sat', attendance: 97, sessions: 5 },
  { day: 'Sun', attendance: 92, sessions: 3 },
];


export default function CheckInPage() {
  const [tab, setTab] = useState<Tab>('live');
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [search, setSearch] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'live', label: 'Live Check-In', icon: QrCode },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const activeSession = sessions[0]; // current active
  const attendees = activeSession.attendees;
  const filtered = search ? attendees.filter(a => a.name.toLowerCase().includes(search.toLowerCase())) : attendees;
  const checkedIn = attendees.filter(a => a.checkedIn).length;
  const late = attendees.filter(a => a.status === 'late').length;
  const absent = attendees.filter(a => a.status === 'absent').length;

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" /> QR Check-In
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Digital attendance tracking with live check-in</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                <Share2 className="w-3.5 h-3.5" /> Share QR
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  tab === t.id ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-text-muted hover:text-text-secondary')}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'live' && (
          <div className="grid grid-cols-12 gap-6 animate-fade-in">
            {/* left: qr + session info */}
            <div className="col-span-4 space-y-4">
              {/* qr code */}
              <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 text-center">
                <div className="w-48 h-48 mx-auto rounded-2xl bg-white p-4 mb-4">
                  <div className="w-full h-full rounded-lg bg-[repeating-conic-gradient(#1a1a2e_0%_25%,#fff_0%_50%)] bg-[length:12px_12px] opacity-80" />
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1">Scan to Check In</p>
                <p className="text-[10px] text-text-muted mb-3">Athletes scan this QR code at the venue</p>
                <div className="flex items-center justify-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-[10px] text-blue-400">
                    <Smartphone className="w-3 h-3 inline mr-1" /> Open on Phone
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-slate-100/50 text-[10px] text-text-muted">
                    <Download className="w-3 h-3 inline mr-1" /> Download
                  </button>
                </div>
              </div>

              {/* active session */}
              <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-400">LIVE SESSION</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{activeSession.title}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">{activeSession.time} · {activeSession.venue}</p>
                <p className="text-[10px] text-text-muted">Coach: {activeSession.coach}</p>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="p-2 rounded-lg bg-white/40 text-center">
                    <p className="text-lg font-display font-bold text-green-400">{checkedIn}</p>
                    <p className="text-[8px] text-text-muted">Checked In</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/40 text-center">
                    <p className="text-lg font-display font-bold text-amber-400">{late}</p>
                    <p className="text-[8px] text-text-muted">Late</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/40 text-center">
                    <p className="text-lg font-display font-bold text-red-400">{absent}</p>
                    <p className="text-[8px] text-text-muted">Absent</p>
                  </div>
                </div>

                {/* progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-text-muted">Attendance</span>
                    <span className="text-text-primary font-bold">{checkedIn}/{attendees.length}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${(checkedIn / attendees.length) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* upcoming */}
              {sessions.filter(s => s.status === 'upcoming').map(s => (
                <div key={s.id} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-atlas-400" />
                    <span className="text-[10px] text-atlas-400 font-medium">UPCOMING</span>
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary">{s.title}</h4>
                  <p className="text-[10px] text-text-muted">{s.time} · {s.registered} registered</p>
                </div>
              ))}
            </div>

            {/* right: attendee list */}
            <div className="col-span-8">
              <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                {/* search */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 border border-white/60">
                    <Search className="w-3.5 h-3.5 text-text-muted" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search athletes..."
                      className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted/50 outline-none" />
                  </div>
                  <button className="px-3 py-2 rounded-lg bg-green-500/10 text-xs text-green-400 font-medium">
                    <UserCheck className="w-3.5 h-3.5 inline mr-1" /> Manual Check-In
                  </button>
                </div>

                {/* attendee table */}
                <div className="space-y-1">
                  {/* header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-text-muted/60 uppercase tracking-wider">
                    <div className="col-span-3">Athlete</div>
                    <div className="col-span-2">Parent</div>
                    <div className="col-span-1">Age</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Check-In Time</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {filtered.map(att => (
                    <div key={att.id} className="grid grid-cols-12 gap-2 px-3 py-3 rounded-lg hover:bg-slate-50 items-center">
                      <div className="col-span-3 flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white',
                          att.status === 'checked-in' ? 'from-green-400 to-emerald-400' :
                          att.status === 'late' ? 'from-amber-400 to-orange-400' :
                          att.status === 'absent' ? 'from-red-400 to-pink-400' :
                          'from-gray-400 to-gray-500'
                        )}>{att.avatar}</div>
                        <span className="text-xs font-medium text-text-primary">{att.name}</span>
                      </div>
                      <div className="col-span-2 text-[10px] text-text-muted">{att.parentName}</div>
                      <div className="col-span-1 text-[10px] text-text-muted">{att.age}</div>
                      <div className="col-span-2">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium',
                          att.status === 'checked-in' ? 'bg-green-500/10 text-green-400' :
                          att.status === 'late' ? 'bg-amber-500/10 text-amber-400' :
                          att.status === 'absent' ? 'bg-red-500/10 text-red-400' :
                          'bg-slate-50 text-text-muted'
                        )}>
                          {att.status === 'checked-in' && <CheckCircle className="w-3 h-3" />}
                          {att.status === 'late' && <AlertTriangle className="w-3 h-3" />}
                          {att.status === 'absent' && <XCircle className="w-3 h-3" />}
                          {att.status === 'pending' && <Clock className="w-3 h-3" />}
                          {att.status}
                        </span>
                      </div>
                      <div className="col-span-2 text-[10px] text-text-muted">
                        {att.checkInTime || '—'}
                        {att.notes && <span className="text-amber-400 ml-1">({att.notes})</span>}
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        {!att.checkedIn && att.status !== 'absent' && (
                          <button className="px-2 py-1 rounded text-[9px] bg-green-500/10 text-green-400">Check In</button>
                        )}
                        {att.status === 'pending' && (
                          <button className="px-2 py-1 rounded text-[9px] bg-red-500/10 text-red-400">Mark Absent</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* summary */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Avg Attendance Rate', value: '92.3%', change: '+2.1%', icon: UserCheck, color: 'text-green-400' },
                { label: 'Total Check-Ins This Week', value: '284', change: '+18', icon: QrCode, color: 'text-blue-400' },
                { label: 'Avg Late Arrivals', value: '6.4%', change: '-1.2%', icon: Timer, color: 'text-amber-400' },
                { label: 'No-Show Rate', value: '3.1%', change: '-0.8%', icon: UserX, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <s.icon className={cn('w-5 h-5 mb-1.5', s.color)} />
                  <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                  <span className={cn('text-[10px] font-medium',
                    s.change.startsWith('+') ? 'text-green-400' : 'text-red-400')}>{s.change}</span>
                </div>
              ))}
            </div>

            {/* weekly chart */}
            <div className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Weekly Attendance Rate</h3>
              <div className="flex items-end gap-3 h-40">
                {weeklyStats.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-primary font-mono">{d.attendance}%</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-500/40 to-blue-400/20 transition-all"
                      style={{ height: `${d.attendance * 1.2}px` }} />
                    <span className="text-[10px] text-text-muted">{d.day}</span>
                    <span className="text-[8px] text-text-muted/50">{d.sessions} sess.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            {sessions.map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                    s.status === 'active' ? 'bg-green-500/10' :
                    s.status === 'upcoming' ? 'bg-blue-500/10' : 'bg-slate-50')}>
                    {s.status === 'active' ? <Zap className="w-5 h-5 text-green-400" /> :
                     s.status === 'upcoming' ? <Clock className="w-5 h-5 text-blue-400" /> :
                     <CheckCircle className="w-5 h-5 text-text-muted" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                    <p className="text-[10px] text-text-muted">{s.date} · {s.time} · {s.coach}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-text-primary">{s.checkedIn}/{s.registered}</p>
                  <p className="text-[10px] text-text-muted">
                    {s.registered > 0 ? `${Math.round((s.checkedIn / s.registered) * 100)}% attendance` : 'Not started'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
