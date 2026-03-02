/* ═══════════════════════════════════════════════════════════════════
   Gaya — Kanban Lead Pipeline
   Drag-and-drop lead management with columns for each stage,
   deal values, coach assignment, urgency indicators, and
   stage analytics.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState, useRef } from 'react';
import {
  Inbox, UserCheck, Calendar, CreditCard, CheckCircle,
  MoreHorizontal, Plus, Search, Filter, ArrowUpRight,
  MapPin, Clock, DollarSign, User, Mail, Phone,
  Star, AlertTriangle, Flame, GripVertical, X, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: Stage;
  type: 'camp' | 'clinic' | 'private';
  zone: string;
  value: number;
  assignedTo?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lastActivity: string;
  notes?: string;
  childAge?: number;
  source: string;
}

type Stage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

interface Column {
  id: Stage;
  label: string;
  icon: React.ElementType;
  color: string;
  headerBg: string;
}

// ─── Columns ────────────────────────────────────────────────────

const COLUMNS: Column[] = [
  { id: 'new', label: 'New Leads', icon: Inbox, color: 'text-blue-400', headerBg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'contacted', label: 'Contacted', icon: Mail, color: 'text-amber-400', headerBg: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'qualified', label: 'Qualified', icon: UserCheck, color: 'text-purple-400', headerBg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'proposal', label: 'Proposal Sent', icon: Calendar, color: 'text-cyan-400', headerBg: 'bg-cyan-500/10 border-cyan-500/20' },
  { id: 'won', label: 'Won 🎉', icon: CheckCircle, color: 'text-green-400', headerBg: 'bg-green-500/10 border-green-500/20' },
];

// ─── Mock Data ──────────────────────────────────────────────────

const INITIAL_LEADS: Lead[] = [
  { id: 'l1', name: 'Jennifer Park', email: 'jennifer.park@email.com', phone: '416-555-0142', stage: 'new', type: 'camp', zone: 'Scarborough East', value: 349, urgency: 'high', createdAt: '2h ago', lastActivity: '2h ago', childAge: 12, source: 'Map Search', notes: 'Looking for summer camp for son, asked about July dates' },
  { id: 'l2', name: 'Ahmed Hassan', email: 'ahmed.h@gmail.com', stage: 'new', type: 'private', zone: 'North York', value: 85, urgency: 'medium', createdAt: '4h ago', lastActivity: '4h ago', childAge: 14, source: 'Referral' },
  { id: 'l3', name: 'Lisa Wang', email: 'lwang@outlook.com', phone: '647-555-0198', stage: 'new', type: 'clinic', zone: 'Mississauga', value: 199, urgency: 'low', createdAt: '1d ago', lastActivity: '1d ago', childAge: 10, source: 'Google' },
  { id: 'l4', name: 'Michael Brown', email: 'mbrown@yahoo.com', phone: '905-555-0134', stage: 'contacted', type: 'camp', zone: 'Etobicoke', value: 299, urgency: 'high', createdAt: '2d ago', lastActivity: '6h ago', assignedTo: 'MT', source: 'Map Search', notes: 'Very interested, wants callback Tuesday' },
  { id: 'l5', name: 'Priya Sharma', email: 'priya.s@email.com', stage: 'contacted', type: 'private', zone: 'Brampton', value: 85, urgency: 'medium', createdAt: '3d ago', lastActivity: '1d ago', assignedTo: 'SC', source: 'Instagram' },
  { id: 'l6', name: 'David Kim', email: 'dkim@hotmail.com', phone: '416-555-0167', stage: 'qualified', type: 'camp', zone: 'Scarborough East', value: 349, urgency: 'critical', createdAt: '5d ago', lastActivity: '3h ago', assignedTo: 'MT', source: 'Waitlist', notes: 'Ready to book, needs payment link ASAP' },
  { id: 'l7', name: 'Sarah O\'Brien', email: 'sobrien@gmail.com', stage: 'qualified', type: 'clinic', zone: 'North York', value: 199, urgency: 'medium', createdAt: '4d ago', lastActivity: '1d ago', assignedTo: 'DP', source: 'Map Search' },
  { id: 'l8', name: 'Carlos Mendes', email: 'carlos.m@email.com', phone: '647-555-0201', stage: 'proposal', type: 'camp', zone: 'Vaughan', value: 599, urgency: 'high', createdAt: '7d ago', lastActivity: '12h ago', assignedTo: 'AO', source: 'Referral', notes: 'Sent pricing for 2 kids, following up Friday' },
  { id: 'l9', name: 'Emma Thompson', email: 'emma.t@outlook.com', stage: 'proposal', type: 'private', zone: 'Ajax', value: 340, urgency: 'medium', createdAt: '6d ago', lastActivity: '2d ago', assignedTo: 'SC', source: 'Google' },
  { id: 'l10', name: 'James Lee', email: 'jlee@gmail.com', phone: '905-555-0145', stage: 'won', type: 'camp', zone: 'Scarborough East', value: 349, urgency: 'low', createdAt: '10d ago', lastActivity: 'today', assignedTo: 'MT', source: 'Map Search' },
  { id: 'l11', name: 'Fatima Al-Rashid', email: 'fatima.ar@email.com', stage: 'won', type: 'clinic', zone: 'Mississauga', value: 199, urgency: 'low', createdAt: '8d ago', lastActivity: 'yesterday', assignedTo: 'DP', source: 'Referral' },
];

// ─── Urgency Badge ──────────────────────────────────────────────

const URGENCY_STYLES = {
  low: 'bg-slate-50 text-text-muted border-slate-200',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  critical: 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse',
};

const TYPE_LABELS = {
  camp: { label: 'Camp', color: 'text-atlas-400 bg-atlas-500/10' },
  clinic: { label: 'Clinic', color: 'text-blue-400 bg-blue-500/10' },
  private: { label: 'Private', color: 'text-purple-400 bg-purple-500/10' },
};

// ─── Lead Card ──────────────────────────────────────────────────

function LeadCard({
  lead, onDragStart, onView
}: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onView: (lead: Lead) => void;
}) {
  const typeStyle = TYPE_LABELS[lead.type];

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onClick={() => onView(lead)}
      className="group p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-slate-300 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-primary">
            {lead.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary leading-tight">{lead.name}</p>
            <p className="text-[10px] text-text-muted">{lead.email}</p>
          </div>
        </div>
        <GripVertical className="w-3.5 h-3.5 text-text-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium', typeStyle.color)}>{typeStyle.label}</span>
        <span className={cn('px-1.5 py-0.5 rounded border text-[9px] font-medium', URGENCY_STYLES[lead.urgency])}>
          {lead.urgency === 'critical' && <Flame className="w-2.5 h-2.5 inline mr-0.5" />}
          {lead.urgency}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <MapPin className="w-3 h-3" /> {lead.zone}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <Clock className="w-3 h-3" /> {lead.lastActivity}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <span className="text-sm font-display font-bold text-atlas-400">${lead.value}</span>
        <div className="flex items-center gap-1">
          {lead.assignedTo && (
            <div className="w-5 h-5 rounded-md bg-atlas-500/20 flex items-center justify-center text-[8px] font-bold text-atlas-400">
              {lead.assignedTo}
            </div>
          )}
          <span className="text-[10px] text-text-muted">{lead.source}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Lead Detail Modal ──────────────────────────────────────────

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-text-primary">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{lead.name}</p>
              <p className="text-xs text-text-muted">{lead.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100/50 text-text-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Type', value: TYPE_LABELS[lead.type].label, icon: Calendar },
              { label: 'Value', value: `$${lead.value}`, icon: DollarSign },
              { label: 'Zone', value: lead.zone, icon: MapPin },
              { label: 'Source', value: lead.source, icon: ArrowUpRight },
              { label: 'Urgency', value: lead.urgency, icon: AlertTriangle },
              { label: 'Age', value: lead.childAge ? `${lead.childAge} years` : 'N/A', icon: User },
            ].map(item => (
              <div key={item.label} className="px-3 py-2 rounded-lg bg-white/40 border border-white/60">
                <p className="text-[10px] text-text-muted flex items-center gap-1"><item.icon className="w-3 h-3" />{item.label}</p>
                <p className="text-sm font-medium text-text-primary">{item.value}</p>
              </div>
            ))}
          </div>
          {lead.notes && (
            <div className="p-3 rounded-lg bg-atlas-500/5 border border-atlas-500/10">
              <p className="text-[10px] text-atlas-400 font-medium mb-1">Notes</p>
              <p className="text-xs text-text-secondary">{lead.notes}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-atlas-500 text-white text-sm font-semibold hover:bg-atlas-400 transition-all flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Send Email
            </button>
            {lead.phone && (
              <button className="flex-1 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-text-primary text-sm font-medium hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Stage | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColumnLeads = (stage: Stage) => filteredLeads.filter(l => l.stage === stage);

  const getColumnValue = (stage: Stage) =>
    getColumnLeads(stage).reduce((sum, l) => sum + l.value, 0);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(stage);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!dragIdRef.current) return;
    setLeads(prev => prev.map(l =>
      l.id === dragIdRef.current ? { ...l, stage: targetStage, lastActivity: 'just now' } : l
    ));
    dragIdRef.current = null;
  };

  // Pipeline stats
  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
  const wonValue = leads.filter(l => l.stage === 'won').reduce((sum, l) => sum + l.value, 0);
  const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.stage === 'won').length / leads.length) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-full mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary">Lead Pipeline</h1>
              <p className="text-xs text-text-muted mt-0.5">Manage and track leads through the conversion funnel</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-atlas-500 text-white text-sm font-semibold hover:bg-atlas-400 transition-all">
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {[
                { label: 'Total Pipeline', value: `$${totalValue.toLocaleString()}`, color: 'text-text-primary' },
                { label: 'Won Revenue', value: `$${wonValue.toLocaleString()}`, color: 'text-green-400' },
                { label: 'Conversion', value: `${conversionRate}%`, color: 'text-atlas-400' },
                { label: 'Active Leads', value: leads.filter(l => l.stage !== 'won').length.toString(), color: 'text-blue-400' },
              ].map(stat => (
                <div key={stat.label} className="px-4 py-2 rounded-lg bg-white/40 border border-white/60">
                  <p className="text-[10px] text-text-muted">{stat.label}</p>
                  <p className={cn('text-lg font-display font-bold', stat.color)}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads..." className="pl-9 pr-4 py-2 rounded-xl bg-white/40 border border-white/60 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-atlas-500/30 w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Kanban Board ═══ */}
      <div className="overflow-x-auto px-6 py-6">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map(column => {
            const columnLeads = getColumnLeads(column.id);
            const columnValue = getColumnValue(column.id);

            return (
              <div
                key={column.id}
                className={cn(
                  'w-72 shrink-0 rounded-2xl border transition-colors',
                  dragOverColumn === column.id ? 'bg-atlas-500/5 border-atlas-500/20' : 'bg-slate-50/30 border-slate-200'
                )}
                onDragOver={e => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', column.headerBg)}>
                        <column.icon className={cn('w-3.5 h-3.5', column.color)} />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">{column.label}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-text-muted">
                        {columnLeads.length}
                      </span>
                    </div>
                    <button className="p-1 rounded hover:bg-slate-100/50 text-text-muted"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    ${columnValue.toLocaleString()} total value
                  </p>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {columnLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onView={setSelectedLead} />
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-text-muted/30 text-xs">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Lead Detail Modal ═══ */}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
