// custom dashboard builder - configurable widget layout with kpi cards, charts, and drag to rearrange

'use client';

import { useState } from 'react';
import {
  LayoutGrid, Plus, Settings, GripVertical, X, Maximize2,
  Minimize2, MoreHorizontal, RefreshCw, MapPin, TrendingUp,
  Users, Calendar, DollarSign, BarChart3, Brain, Target,
  Activity, Star, Flame, Clock, ChevronRight, Zap, Shield,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'zones' | 'activity' | 'coaches' | 'pipeline' | 'ai' | 'calendar';
  title: string;
  size: 'sm' | 'md' | 'lg';
  visible: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'w1', type: 'kpi', title: 'Key Metrics', size: 'lg', visible: true },
  { id: 'w2', type: 'chart', title: 'Revenue Trend', size: 'md', visible: true },
  { id: 'w3', type: 'zones', title: 'Top Zones', size: 'md', visible: true },
  { id: 'w4', type: 'activity', title: 'Recent Activity', size: 'md', visible: true },
  { id: 'w5', type: 'coaches', title: 'Top Coaches', size: 'md', visible: true },
  { id: 'w6', type: 'pipeline', title: 'Lead Pipeline', size: 'md', visible: true },
  { id: 'w7', type: 'ai', title: 'AI Insights', size: 'lg', visible: true },
  { id: 'w8', type: 'calendar', title: 'Upcoming Events', size: 'md', visible: true },
];

function KPIWidget() {
  const metrics = [
    { label: 'Total Revenue', value: '$184,200', change: '+18.3%', up: true, icon: DollarSign, accent: 'text-green-400' },
    { label: 'Active Events', value: '47', change: '+5', up: true, icon: Calendar, accent: 'text-atlas-400' },
    { label: 'Fill Rate', value: '91.2%', change: '+2.1%', up: true, icon: Target, accent: 'text-blue-400' },
    { label: 'Leads (30d)', value: '342', change: '-8%', up: false, icon: Users, accent: 'text-amber-400' },
    { label: 'Coaches', value: '24', change: '+3', up: true, icon: Star, accent: 'text-purple-400' },
    { label: 'Zones Active', value: '18', change: '+2', up: true, icon: MapPin, accent: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="p-3 rounded-xl bg-white/40 border border-white/60 hover:border-slate-200 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <m.icon className={cn('w-4 h-4', m.accent)} />
            <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', m.up ? 'text-green-400' : 'text-red-400')}>
              {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {m.change}
            </span>
          </div>
          <p className="text-lg font-display font-bold text-text-primary">{m.value}</p>
          <p className="text-[10px] text-text-muted">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

function ChartWidget() {
  const data = [42, 55, 48, 72, 65, 88, 78, 95, 82, 104, 91, 118];
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const max = Math.max(...data);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-display font-bold text-text-primary">$118K</p>
          <p className="text-[10px] text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +28.3% vs last year</p>
        </div>
        <div className="flex gap-1 text-[9px]">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-text-primary font-medium">12M</span>
          <span className="px-2 py-0.5 rounded text-text-muted hover:bg-slate-100/50 cursor-pointer">6M</span>
          <span className="px-2 py-0.5 rounded text-text-muted hover:bg-slate-100/50 cursor-pointer">3M</span>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm bg-gradient-to-t from-atlas-500/40 to-atlas-500/20 hover:from-atlas-500/60 hover:to-atlas-500/30 transition-colors cursor-pointer relative group"
              style={{ height: `${(val / max) * 100}%` }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-50 text-[9px] text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-200">
                ${val}K
              </div>
            </div>
            <span className="text-[8px] text-text-muted">{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZonesWidget() {
  const zones = [
    { name: 'Scarborough East', score: 92, demand: 87, supply: 34, trend: 'up' },
    { name: 'Brampton North', score: 87, demand: 78, supply: 29, trend: 'up' },
    { name: 'Ajax-Pickering', score: 84, demand: 71, supply: 31, trend: 'stable' },
    { name: 'Etobicoke South', score: 71, demand: 64, supply: 41, trend: 'down' },
  ];

  return (
    <div className="space-y-2">
      {zones.map(z => (
        <div key={z.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-atlas-500/10 flex items-center justify-center text-xs font-bold text-atlas-400">
            {z.score}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{z.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-text-muted">D:{z.demand}</span>
              <span className="text-[10px] text-text-muted">S:{z.supply}</span>
            </div>
          </div>
          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-atlas-500" style={{ width: `${z.score}%` }} />
          </div>
          <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}

function ActivityWidget() {
  const items = [
    { icon: Users, text: 'New lead from Scarborough East', time: '2m ago', color: 'text-blue-400 bg-blue-500/10' },
    { icon: Calendar, text: 'Spring Camp event filled to 95%', time: '15m ago', color: 'text-atlas-400 bg-atlas-500/10' },
    { icon: Star, text: 'Marcus Thompson received 5-star review', time: '1h ago', color: 'text-amber-400 bg-amber-500/10' },
    { icon: TrendingUp, text: 'North York demand index +12%', time: '3h ago', color: 'text-green-400 bg-green-500/10' },
    { icon: Flame, text: 'Sarah Chen hit 30-day streak!', time: '5h ago', color: 'text-red-400 bg-red-500/10' },
  ];

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', item.color)}>
            <item.icon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary leading-snug">{item.text}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoachesWidget() {
  const coaches = [
    { name: 'Marcus Thompson', initials: 'MT', rating: 4.97, fillRate: 98, tier: 'legend', color: 'from-purple-400 to-pink-300' },
    { name: 'Sarah Chen', initials: 'SC', rating: 4.94, fillRate: 96, tier: 'diamond', color: 'from-cyan-400 to-blue-300' },
    { name: 'David Park', initials: 'DP', rating: 4.91, fillRate: 94, tier: 'diamond', color: 'from-cyan-400 to-blue-300' },
    { name: 'Aisha Okafor', initials: 'AO', rating: 4.89, fillRate: 91, tier: 'gold', color: 'from-amber-400 to-yellow-300' },
  ];

  return (
    <div className="space-y-2">
      {coaches.map((c, i) => (
        <div key={c.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <span className="text-[10px] font-bold text-text-muted w-4">#{i + 1}</span>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br', c.color)}>
            {c.initials}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-text-primary">{c.name}</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />{c.rating}
              </span>
              <span className="text-[10px] text-text-muted">{c.fillRate}% fill</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelineWidget() {
  const stages = [
    { label: 'New', count: 8, value: 2840, color: 'bg-blue-500' },
    { label: 'Contacted', count: 5, value: 1890, color: 'bg-amber-500' },
    { label: 'Qualified', count: 3, value: 2100, color: 'bg-purple-500' },
    { label: 'Proposal', count: 2, value: 1540, color: 'bg-cyan-500' },
    { label: 'Won', count: 12, value: 8400, color: 'bg-green-500' },
  ];
  const total = stages.reduce((s, st) => s + st.count, 0);

  return (
    <div>
      {/* funnel bar */}
      <div className="flex rounded-lg overflow-hidden h-3 mb-4">
        {stages.map(s => (
          <div key={s.label} className={cn('h-full transition-all', s.color)} style={{ width: `${(s.count / total) * 100}%` }} />
        ))}
      </div>
      <div className="space-y-1.5">
        {stages.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-sm', s.color)} />
            <span className="text-[10px] text-text-muted flex-1">{s.label}</span>
            <span className="text-[10px] font-medium text-text-primary">{s.count}</span>
            <span className="text-[10px] text-text-muted w-14 text-right">${s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightsWidget() {
  const insights = [
    { text: 'Scarborough East has a 2.5× demand gap — launching a camp here would yield 94% projected fill rate at $299/week.', confidence: 91, type: 'opportunity' },
    { text: 'Tuesday/Thursday 5-7 PM clinics are under-supplied across 8 zones. Adding these could capture $24K/month in unmet demand.', confidence: 87, type: 'timing' },
    { text: 'Price sensitivity analysis suggests a 12% price increase in North York would reduce fill rate by only 3%.', confidence: 78, type: 'pricing' },
  ];

  return (
    <div className="space-y-3">
      {insights.map((ins, i) => (
        <div key={i} className="p-3 rounded-xl bg-atlas-500/5 border border-atlas-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Brain className="w-3.5 h-3.5 text-atlas-400" />
            <span className="text-[10px] font-medium text-atlas-400 capitalize">{ins.type}</span>
            <span className="ml-auto text-[9px] text-text-muted">{ins.confidence}% confidence</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{ins.text}</p>
        </div>
      ))}
    </div>
  );
}

function CalendarWidget() {
  const events = [
    { title: 'Spring Elite Camp', coach: 'Marcus T.', date: 'Apr 14', time: '9 AM', filled: 37, capacity: 40, color: 'border-atlas-500/30' },
    { title: 'Speed Clinic', coach: 'Sarah C.', date: 'Apr 16', time: '5 PM', filled: 18, capacity: 20, color: 'border-blue-500/30' },
    { title: 'Goalkeeper Workshop', coach: 'David P.', date: 'Apr 18', time: '10 AM', filled: 12, capacity: 15, color: 'border-purple-500/30' },
    { title: 'Technical Skills Camp', coach: 'Aisha O.', date: 'Apr 21', time: '9 AM', filled: 24, capacity: 30, color: 'border-amber-500/30' },
  ];

  return (
    <div className="space-y-2">
      {events.map(e => (
        <div key={e.title} className={cn('flex items-center gap-3 p-2 rounded-lg border-l-2 bg-slate-50 hover:bg-slate-50 transition-colors', e.color)}>
          <div className="text-center w-10">
            <p className="text-[10px] text-text-muted">{e.date.split(' ')[0]}</p>
            <p className="text-sm font-display font-bold text-text-primary">{e.date.split(' ')[1]}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{e.title}</p>
            <p className="text-[10px] text-text-muted">{e.coach} · {e.time}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted">{e.filled}/{e.capacity}</p>
            <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-0.5">
              <div className="h-full rounded-full bg-atlas-500" style={{ width: `${(e.filled / e.capacity) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetContent({ type }: { type: Widget['type'] }) {
  switch (type) {
    case 'kpi': return <KPIWidget />;
    case 'chart': return <ChartWidget />;
    case 'zones': return <ZonesWidget />;
    case 'activity': return <ActivityWidget />;
    case 'coaches': return <CoachesWidget />;
    case 'pipeline': return <PipelineWidget />;
    case 'ai': return <AIInsightsWidget />;
    case 'calendar': return <CalendarWidget />;
    default: return null;
  }
}

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const visibleWidgets = widgets.filter(w => w.visible);

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const items = [...widgets];
    const fromIdx = items.findIndex(w => w.id === dragId);
    const toIdx = items.findIndex(w => w.id === targetId);
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    setWidgets(items);
    setDragId(null);
  };

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const cycleSize = (id: string) => {
    const sizes: Widget['size'][] = ['sm', 'md', 'lg'];
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const nextIdx = (sizes.indexOf(w.size) + 1) % sizes.length;
      return { ...w, size: sizes[nextIdx] };
    }));
  };

  const sizeToCol = (size: Widget['size']) => {
    switch (size) {
      case 'sm': return 'md:col-span-1';
      case 'md': return 'md:col-span-1';
      case 'lg': return 'md:col-span-2';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* header */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-atlas-400" /> My Dashboard
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {isEditing ? 'Drag widgets to rearrange • Click resize to change size' : 'Your personalized intelligence overview'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(!isEditing)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  isEditing ? 'bg-atlas-500 text-white font-bold' : 'bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-primary hover:bg-slate-100')}>
                {isEditing ? <><Check className="w-4 h-4" /> Done</> : <><Settings className="w-4 h-4" /> Customize</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* widget toggle panel (edit mode) */}
        {isEditing && (
          <div className="mb-6 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 animate-fade-in">
            <p className="text-xs font-medium text-text-muted mb-3">Toggle Widgets</p>
            <div className="flex flex-wrap gap-2">
              {widgets.map(w => (
                <button key={w.id} onClick={() => toggleWidget(w.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    w.visible ? 'bg-atlas-500/10 border-atlas-500/20 text-atlas-400' : 'bg-slate-50 border-slate-200 text-text-muted')}>
                  {w.visible ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-30" />}
                  {w.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* widget grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {visibleWidgets.map(widget => (
            <div
              key={widget.id}
              draggable={isEditing}
              onDragStart={() => handleDragStart(widget.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(widget.id)}
              className={cn(
                'rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden transition-all',
                sizeToCol(widget.size),
                isEditing && 'ring-1 ring-atlas-500/20 cursor-grab active:cursor-grabbing',
                dragId === widget.id && 'opacity-50'
              )}
            >
              {/* widget header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  {isEditing && <GripVertical className="w-3.5 h-3.5 text-text-muted/40" />}
                  <span className="text-sm font-semibold text-text-primary">{widget.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isEditing && (
                    <>
                      <button onClick={() => cycleSize(widget.id)} className="p-1 rounded hover:bg-slate-100/50 text-text-muted" title="Resize">
                        <Maximize2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => toggleWidget(widget.id)} className="p-1 rounded hover:bg-slate-100/50 text-text-muted" title="Hide">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  {!isEditing && (
                    <button className="p-1 rounded hover:bg-slate-100/50 text-text-muted">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* widget content */}
              <div className="p-5">
                <WidgetContent type={widget.type} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
