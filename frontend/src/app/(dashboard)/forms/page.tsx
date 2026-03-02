/* ═══════════════════════════════════════════════════════════════════════
   Gaya — Form Builder
   Visual form creator for custom registration, waiver, and
   feedback forms. Field palette, live preview, templates,
   conditional logic, and submission analytics.
   ═══════════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  FormInput, Type, Hash, Mail, Phone, Calendar, List,
  CheckSquare, ToggleLeft, Upload, MapPin, Star, Clock,
  Plus, Trash2, GripVertical, Eye, Settings, Copy, Save,
  ChevronDown, ChevronRight, Sparkles, FileText, Users,
  Shield, BarChart3, ArrowUp, ArrowDown, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Tab = 'builder' | 'templates' | 'submissions';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  icon: React.ElementType;
}

// ─── Mock Data ──────────────────────────────────────────────────────

const fieldPalette = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date Picker', icon: Calendar },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'toggle', label: 'Toggle', icon: ToggleLeft },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'location', label: 'Location', icon: MapPin },
  { type: 'rating', label: 'Star Rating', icon: Star },
];

const initialFields: FormField[] = [
  { id: 'f1', type: 'text', label: 'Child\'s Full Name', placeholder: 'Enter full name', required: true, icon: Type },
  { id: 'f2', type: 'number', label: 'Age', placeholder: '8-18', required: true, icon: Hash },
  { id: 'f3', type: 'select', label: 'Skill Level', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Elite'], icon: List },
  { id: 'f4', type: 'email', label: 'Parent Email', placeholder: 'parent@email.com', required: true, icon: Mail },
  { id: 'f5', type: 'phone', label: 'Emergency Contact', placeholder: '+1 (416) 000-0000', required: true, icon: Phone },
  { id: 'f6', type: 'select', label: 'Preferred Position', required: false, options: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'], icon: List },
  { id: 'f7', type: 'toggle', label: 'Photo/Video Consent', required: true, icon: ToggleLeft },
  { id: 'f8', type: 'checkbox', label: 'I agree to the terms and waiver', required: true, icon: CheckSquare },
];

const templates = [
  { name: 'Camp Registration', fields: 8, submissions: 342, icon: '⛺', description: 'Standard camp registration with emergency contacts and waivers' },
  { name: 'Clinic Signup', fields: 6, submissions: 198, icon: '🏃', description: 'Quick clinic signup for drop-in sessions' },
  { name: 'Trial Session Request', fields: 5, submissions: 87, icon: '🎯', description: 'Lightweight form for trial session inquiries' },
  { name: 'Post-Session Feedback', fields: 7, submissions: 1240, icon: '⭐', description: 'Parent/athlete feedback with star ratings and comments' },
  { name: 'Medical Information', fields: 10, submissions: 156, icon: '🏥', description: 'Detailed medical and allergy form for safety compliance' },
  { name: 'Coach Application', fields: 12, submissions: 34, icon: '🎓', description: 'Coach onboarding form with certifications and experience' },
];

const submissions = [
  { id: 's1', form: 'Camp Registration', name: 'Alex W.', email: 'sarah.m@email.com', date: '2 hours ago', status: 'complete' },
  { id: 's2', form: 'Camp Registration', name: 'Jayden K.', email: 'michael.k@email.com', date: '5 hours ago', status: 'complete' },
  { id: 's3', form: 'Trial Session', name: 'Sofia R.', email: 'carlos.r@email.com', date: 'Yesterday', status: 'incomplete' },
  { id: 's4', form: 'Post-Session Feedback', name: 'Kemi O.', email: 'aisha.o@email.com', date: 'Yesterday', status: 'complete' },
  { id: 's5', form: 'Clinic Signup', name: 'Lucas T.', email: 'emily.t@email.com', date: '2 days ago', status: 'complete' },
];

// ─── Page ───────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const [tab, setTab] = useState<Tab>('builder');
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formName, setFormName] = useState('Spring Elite Camp Registration');

  const addField = (type: string, label: string, icon: React.ElementType) => {
    const newField: FormField = {
      id: `f${Date.now()}`, type, label, placeholder: '', required: false, icon,
      options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const moveField = (id: string, dir: 'up' | 'down') => {
    const idx = fields.findIndex(f => f.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === fields.length - 1)) return;
    const newFields = [...fields];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [newFields[idx], newFields[swap]] = [newFields[swap], newFields[idx]];
    setFields(newFields);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'builder', label: 'Builder', icon: FormInput },
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'submissions', label: 'Submissions', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ═══ Header ═══ */}
      <div className="border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                <FormInput className="w-5 h-5 text-orange-400" /> Form Builder
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Create custom registration, waiver, and feedback forms</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5/60 shadow-sm text-xs text-text-secondary">
                <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-atlas-500 to-cyan-400 text-xs font-semibold text-white">
                <Save className="w-3.5 h-3.5" /> Save Form
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  tab === t.id ? 'bg-atlas-500/10 text-atlas-400 border border-atlas-500/20' : 'text-text-muted hover:text-text-secondary')}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ═══ Builder Tab ═══ */}
        {tab === 'builder' && (
          <div className="grid grid-cols-12 gap-6 animate-fade-in">
            {/* Field Palette */}
            {!showPreview && (
              <div className="col-span-3 space-y-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Fields</h3>
                <div className="space-y-1.5">
                  {fieldPalette.map(fp => (
                    <button key={fp.type} onClick={() => addField(fp.type, fp.label, fp.icon)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-slate-300 text-left transition-all group">
                      <fp.icon className="w-4 h-4 text-text-muted group-hover:text-atlas-400 transition-colors" />
                      <span className="text-xs text-text-secondary">{fp.label}</span>
                      <Plus className="w-3 h-3 text-text-muted/30 ml-auto group-hover:text-atlas-400 transition-colors" />
                    </button>
                  ))}
                </div>

                {/* AI Suggestion */}
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 mt-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-semibold text-purple-400">AI Suggests</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed mb-2">
                    Add a &ldquo;Preferred Session Time&rdquo; field — 73% of similar forms include time preferences, improving fill rates by 18%.
                  </p>
                  <button className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-[10px] text-purple-400">Add Field</button>
                </div>
              </div>
            )}

            {/* Form Canvas */}
            <div className={cn(showPreview ? 'col-span-8 col-start-3' : 'col-span-6')}>
              <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                {/* Form Title */}
                <div className="mb-6">
                  {showPreview ? (
                    <h2 className="text-lg font-display font-bold text-text-primary">{formName}</h2>
                  ) : (
                    <input value={formName} onChange={e => setFormName(e.target.value)}
                      className="text-lg font-display font-bold text-text-primary bg-transparent outline-none border-b border-dashed border-slate-200 pb-1 w-full focus:border-atlas-500/40" />
                  )}
                  <p className="text-xs text-text-muted mt-1">Please fill out all required fields to complete registration.</p>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  {fields.map(field => (
                    <div key={field.id} onClick={() => !showPreview && setSelectedField(field.id)}
                      className={cn('group p-4 rounded-xl border transition-all',
                        showPreview ? 'border-slate-200' :
                        selectedField === field.id ? 'border-atlas-500/30 bg-atlas-500/5' : 'border-slate-200 hover:border-white/[0.1] cursor-pointer')}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                          <field.icon className="w-3.5 h-3.5 text-text-muted" />
                          {field.label}
                          {field.required && <span className="text-red-400 text-[10px]">*</span>}
                        </label>
                        {!showPreview && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }} className="p-1 rounded hover:bg-slate-50">
                              <ArrowUp className="w-3 h-3 text-text-muted" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }} className="p-1 rounded hover:bg-slate-50">
                              <ArrowDown className="w-3 h-3 text-text-muted" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 rounded hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Field Preview */}
                      {field.type === 'select' ? (
                        <select className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/60 text-xs text-text-muted outline-none">
                          <option>Select {field.label.toLowerCase()}...</option>
                          {field.options?.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                          <div className="w-4 h-4 rounded border border-slate-300 bg-slate-50" />
                          {field.label}
                        </label>
                      ) : field.type === 'toggle' ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">{field.label}</span>
                          <div className="w-10 h-5 rounded-full bg-slate-100 relative">
                            <div className="w-4 h-4 rounded-full bg-white/20 absolute top-0.5 left-0.5" />
                          </div>
                        </div>
                      ) : field.type === 'file' ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                          <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                          <p className="text-[10px] text-text-muted">Click or drag to upload</p>
                        </div>
                      ) : field.type === 'rating' ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-5 h-5 text-white/[0.12] cursor-pointer hover:text-amber-400 transition-colors" />
                          ))}
                        </div>
                      ) : (
                        <input type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/60 text-xs text-text-muted placeholder:text-text-muted/30 outline-none" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit Button Preview */}
                <button className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-atlas-500 to-cyan-400 text-sm font-semibold text-white">
                  Submit Registration
                </button>
              </div>
            </div>

            {/* Field Settings */}
            {!showPreview && selectedField && (
              <div className="col-span-3">
                <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 sticky top-6">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Field Settings</h3>
                  {(() => {
                    const field = fields.find(f => f.id === selectedField);
                    if (!field) return null;
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-text-muted mb-1 block">Label</label>
                          <input value={field.label}
                            onChange={e => setFields(fields.map(f => f.id === selectedField ? { ...f, label: e.target.value } : f))}
                            className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/60 text-xs text-text-primary outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-text-muted mb-1 block">Placeholder</label>
                          <input value={field.placeholder || ''}
                            onChange={e => setFields(fields.map(f => f.id === selectedField ? { ...f, placeholder: e.target.value } : f))}
                            className="w-full px-3 py-2 rounded-lg bg-white/40 border border-white/60 text-xs text-text-primary outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Required</span>
                          <button onClick={() => setFields(fields.map(f => f.id === selectedField ? { ...f, required: !f.required } : f))}
                            className={cn('w-10 h-5 rounded-full relative transition-colors',
                              field.required ? 'bg-atlas-500' : 'bg-slate-100')}>
                            <div className={cn('w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
                              field.required ? 'right-0.5' : 'left-0.5')} />
                          </button>
                        </div>
                        <div className="text-[10px] text-text-muted/50">Type: {field.type}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Templates Tab ═══ */}
        {tab === 'templates' && (
          <div className="grid grid-cols-3 gap-4 animate-fade-in">
            {templates.map(t => (
              <div key={t.name} className="p-5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 hover:border-white/[0.1] transition-all">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="text-sm font-semibold text-text-primary">{t.name}</h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{t.description}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-text-muted">
                  <span>{t.fields} fields</span>
                  <span>·</span>
                  <span>{t.submissions} submissions</span>
                </div>
                <button className="w-full mt-3 py-2 rounded-lg bg-white/40 border border-white/60 text-xs text-text-secondary hover:bg-slate-100 transition-all">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ═══ Submissions Tab ═══ */}
        {tab === 'submissions' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Submissions', value: '1,857', icon: FileText },
                { label: 'Completion Rate', value: '89%', icon: BarChart3 },
                { label: 'Avg Time to Fill', value: '3.2 min', icon: Clock },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5">
                  <s.icon className="w-5 h-5 text-atlas-400 mb-2" />
                  <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Form', 'Name', 'Email', 'Date', 'Status'].map(h => (
                      <th key={h} className="text-left text-[10px] text-text-muted font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(s => (
                    <tr key={s.id} className="border-b border-white/[0.03] hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-text-secondary">{s.form}</td>
                      <td className="px-4 py-3 text-xs font-medium text-text-primary">{s.name}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">{s.email}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">{s.date}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium',
                          s.status === 'complete' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400')}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
