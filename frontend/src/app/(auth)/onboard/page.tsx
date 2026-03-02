// coach onboarding wizard - multi-step registration

'use client';

import { useState, useCallback } from 'react';
import {
  User, MapPin, Calendar, Award, Shield, Camera,
  ChevronRight, ChevronLeft, Check, Zap, Globe,
  Star, Clock, DollarSign, Upload, Plus, X,
  CheckCircle, Sparkles, ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, Badge, Button } from '@/components/ui';

interface OnboardState {
  // Step 1: Basics
  display_name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
  // Step 2: Expertise
  sport: string;
  specialties: string[];
  certifications: string[];
  experience_years: number;
  age_groups: string[];
  // Step 3: Location & Availability
  locations: { name: string; address: string; primary: boolean }[];
  availability: Record<string, boolean>;
  timezone: string;
  // Step 4: Pricing
  hourly_rate: number;
  group_rate: number;
  currency: string;
  // Step 5: Verification
  id_verified: boolean;
  background_check: boolean;
  terms_accepted: boolean;
}

const INITIAL_STATE: OnboardState = {
  display_name: '', email: '', phone: '', bio: '', avatar_url: '',
  sport: 'Soccer', specialties: [], certifications: [], experience_years: 0, age_groups: [],
  locations: [{ name: '', address: '', primary: true }], availability: {}, timezone: 'America/Toronto',
  hourly_rate: 0, group_rate: 0, currency: 'CAD',
  id_verified: false, background_check: false, terms_accepted: false,
};

const STEPS = [
  { id: 1, title: 'Your Profile', icon: User, desc: 'Basic info & bio' },
  { id: 2, title: 'Expertise', icon: Award, desc: 'Skills & certs' },
  { id: 3, title: 'Locations', icon: MapPin, desc: 'Where you train' },
  { id: 4, title: 'Pricing', icon: DollarSign, desc: 'Set your rates' },
  { id: 5, title: 'Verification', icon: Shield, desc: 'Trust & safety' },
];

const SPECIALTIES = ['Technical Skills', 'Tactical Awareness', 'Goalkeeping', 'Speed & Agility', 'Shooting & Finishing', 'Passing & Playmaking', 'Defensive Skills', 'Set Pieces', 'Youth Development', 'Fitness & Conditioning', 'Mental Performance', 'Position-Specific'];
const CERTIFICATIONS = ['UEFA B License', 'UEFA A License', 'Canada Soccer C License', 'USSF D License', 'NCCP', 'First Aid/CPR', 'Background Check', 'Coaching Degree'];
const AGE_GROUPS = ['U6-U8', 'U9-U10', 'U11-U12', 'U13-U14', 'U15-U17', 'U18+', 'Adult'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// progress ring component
function ProgressRing({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#3b82f6" strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-500" />
      </svg>
      <span className="absolute text-xs font-display font-bold text-text-primary">{step}/{total}</span>
    </div>
  );
}

// multi-select chip input
function ChipSelect({ options, selected, onChange, max }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void; max?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            selected.includes(opt)
              ? 'bg-atlas-500/15 border-atlas-500/25 text-atlas-400'
              : 'bg-slate-100/50 border-slate-200 text-text-muted hover:text-text-secondary hover:border-slate-300'
          )}
        >
          {selected.includes(opt) && <Check className="w-3 h-3 inline mr-1" />}
          {opt}
        </button>
      ))}
    </div>
  );
}

// input component
function Input({ label, value, onChange, placeholder, type = 'text', textarea, required }: {
  label: string; value: string | number; onChange: (v: any) => void;
  placeholder?: string; type?: string; textarea?: boolean; required?: boolean;
}) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <Tag
        type={type}
        value={value}
        onChange={(e: any) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        rows={textarea ? 4 : undefined}
        className={cn(
          'w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/60 shadow-sm text-sm text-text-primary',
          'placeholder:text-text-muted/40 outline-none focus:border-atlas-500/30 focus:bg-slate-100 transition-all',
          textarea && 'resize-none'
        )}
      />
    </div>
  );
}

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardState>(INITIAL_STATE);
  const [complete, setComplete] = useState(false);

  const update = useCallback(<K extends keyof OnboardState>(key: K, value: OnboardState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 1: return state.display_name.length >= 2 && state.email.includes('@');
      case 2: return state.specialties.length >= 1;
      case 3: return state.locations[0]?.address.length > 0;
      case 4: return state.hourly_rate > 0;
      case 5: return state.terms_accepted;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(s => s + 1);
    else setComplete(true);
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-atlas-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-atlas-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-3">Welcome aboard, {state.display_name}!</h1>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            Your coach profile is being reviewed. You&apos;ll be able to publish events and appear on the
            discovery map within 24 hours.
          </p>
          <div className="space-y-2">
            <Button size="lg" className="w-full">
              <Sparkles className="w-4 h-4" /> Go to Dashboard
            </Button>
            <Button variant="secondary" size="md" className="w-full">
              Create Your First Event
            </Button>
          </div>
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-text-muted">Profile completeness</p>
            <div className="w-full h-2 bg-slate-100/50 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-atlas-500 to-blue-500 rounded-full" style={{ width: '78%' }} />
            </div>
            <p className="text-xs text-text-muted mt-1">78% — Add a profile photo and complete certifications to reach 100%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* left sidebar - steps */}
      <div className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-atlas-500/15 flex items-center justify-center">
            <Globe className="w-4 h-4 text-atlas-400" />
          </div>
          <Image src="/logo.png" alt="Gaya" width={130} height={40} className="h-10 w-auto" />
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/50 mb-4">Setup Steps</p>
          <div className="space-y-1">
            {STEPS.map(s => (
              <button
                key={s.id}
                onClick={() => s.id <= step && setStep(s.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  step === s.id ? 'bg-atlas-500/10 text-atlas-400' :
                  s.id < step ? 'text-atlas-400/60 hover:bg-slate-50' :
                  'text-text-muted/40 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  step === s.id ? 'bg-atlas-500/20' :
                  s.id < step ? 'bg-atlas-500/10' : 'bg-slate-100/50'
                )}>
                  {s.id < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-[10px] opacity-60">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <ProgressRing step={step} total={5} />
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* mobile progress */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <ProgressRing step={step} total={5} />
            <div>
              <p className="text-sm font-display font-semibold text-text-primary">{STEPS[step - 1].title}</p>
              <p className="text-xs text-text-muted">{STEPS[step - 1].desc}</p>
            </div>
          </div>

          <div className="animate-fade-in" key={step}>
            {/* step 1: profile */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">Tell us about yourself</h2>
                  <p className="text-sm text-text-muted">This info appears on your public coach profile.</p>
                </div>

                {/* avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-xl font-bold text-atlas-400 border-2 border-dashed border-slate-300">
                    {state.display_name ? state.display_name.split(' ').map(n => n[0]).join('').slice(0, 2) : <Camera className="w-6 h-6 text-text-muted" />}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm"><Upload className="w-3 h-3" /> Upload Photo</Button>
                    <p className="text-[10px] text-text-muted mt-1">JPG or PNG · Max 5MB</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={state.display_name} onChange={v => update('display_name', v)} placeholder="Marcus Thompson" required />
                  <Input label="Email" value={state.email} onChange={v => update('email', v)} placeholder="marcus@example.com" type="email" required />
                </div>
                <Input label="Phone" value={state.phone} onChange={v => update('phone', v)} placeholder="+1 (416) 555-0123" />
                <Input label="Bio" value={state.bio} onChange={v => update('bio', v)} placeholder="Tell athletes and parents about your coaching experience, philosophy, and what makes your training unique..." textarea />
              </div>
            )}

            {/* step 2: expertise */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">Your expertise</h2>
                  <p className="text-sm text-text-muted">Help athletes find you based on your skills.</p>
                </div>

                <Input label="Years of Experience" value={state.experience_years} onChange={v => update('experience_years', v)} type="number" placeholder="5" />

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Specialties (select up to 5)</label>
                  <ChipSelect options={SPECIALTIES} selected={state.specialties} onChange={v => update('specialties', v)} max={5} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Certifications</label>
                  <ChipSelect options={CERTIFICATIONS} selected={state.certifications} onChange={v => update('certifications', v)} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Age Groups You Coach</label>
                  <ChipSelect options={AGE_GROUPS} selected={state.age_groups} onChange={v => update('age_groups', v)} />
                </div>
              </div>
            )}

            {/* step 3: locations */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">Training locations</h2>
                  <p className="text-sm text-text-muted">Where do you conduct your training sessions?</p>
                </div>

                {state.locations.map((loc, i) => (
                  <Card key={i} className="relative">
                    {i > 0 && (
                      <button onClick={() => update('locations', state.locations.filter((_, j) => j !== i))}
                        className="absolute top-3 right-3 w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-atlas-400" />
                      <span className="text-xs font-medium text-text-primary">Location {i + 1}</span>
                      {loc.primary && <Badge variant="success" size="sm">Primary</Badge>}
                    </div>
                    <div className="space-y-3">
                      <Input label="Location Name" value={loc.name}
                        onChange={v => {
                          const locs = [...state.locations];
                          locs[i] = { ...locs[i], name: v };
                          update('locations', locs);
                        }} placeholder="Downsview Park" required />
                      <Input label="Address" value={loc.address}
                        onChange={v => {
                          const locs = [...state.locations];
                          locs[i] = { ...locs[i], address: v };
                          update('locations', locs);
                        }} placeholder="70 Canuck Ave, North York, ON" required />
                    </div>
                  </Card>
                ))}

                <button
                  onClick={() => update('locations', [...state.locations, { name: '', address: '', primary: false }])}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-text-muted hover:text-text-secondary hover:border-slate-300 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Another Location
                </button>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Weekly Availability</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => update('availability', { ...state.availability, [day]: !state.availability[day] })}
                        className={cn(
                          'py-2.5 rounded-lg text-xs font-medium border transition-all text-center',
                          state.availability[day]
                            ? 'bg-atlas-500/15 border-atlas-500/25 text-atlas-400'
                            : 'bg-slate-100/50 border-slate-200 text-text-muted'
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* step 4: pricing */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">Set your rates</h2>
                  <p className="text-sm text-text-muted">You can always change these later.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input label="Hourly Rate (1-on-1)" value={state.hourly_rate} onChange={v => update('hourly_rate', v)} type="number" placeholder="125" required />
                    <p className="text-[10px] text-text-muted mt-1">Average in your area: $95–$140/hr</p>
                  </div>
                  <div>
                    <Input label="Group Session Rate" value={state.group_rate} onChange={v => update('group_rate', v)} type="number" placeholder="45" />
                    <p className="text-[10px] text-text-muted mt-1">Per athlete for group clinics</p>
                  </div>
                </div>

                {/* pricing preview */}
                <Card className="!border-atlas-500/10">
                  <h4 className="text-xs font-medium text-text-muted mb-3">Preview: How athletes will see your pricing</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Private Session', price: state.hourly_rate, per: '/hr' },
                      { label: 'Group Clinic', price: state.group_rate, per: '/athlete' },
                      { label: 'Weekly Camp (5d)', price: state.group_rate * 8, per: '/week' },
                    ].map(p => (
                      <div key={p.label} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-lg font-display font-bold text-atlas-400">
                          ${p.price || '—'}
                        </p>
                        <p className="text-[10px] text-text-muted">{p.per}</p>
                        <p className="text-[10px] text-text-muted mt-1">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* step 5: verification */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">Trust & safety</h2>
                  <p className="text-sm text-text-muted">Verified coaches get 3× more bookings.</p>
                </div>

                <Card>
                  <div className="space-y-4">
                    {[
                      { key: 'id_verified' as const, label: 'ID Verification', desc: 'Upload a government-issued ID', icon: Shield, badge: 'Recommended' },
                      { key: 'background_check' as const, label: 'Background Check', desc: 'We partner with Certn for instant checks', icon: CheckCircle, badge: 'Required for camps' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                          state[item.key] ? 'bg-atlas-500/15 text-atlas-400' : 'bg-slate-100/50 text-text-muted')}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary">{item.label}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">{item.badge}</span>
                          </div>
                          <p className="text-xs text-text-muted">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => update(item.key, !state[item.key])}
                          className={cn(
                            'w-11 h-6 rounded-full transition-all relative',
                            state[item.key] ? 'bg-atlas-500' : 'bg-slate-100'
                          )}
                        >
                          <div className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                            state[item.key] ? 'left-[22px]' : 'left-0.5'
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* terms */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <button
                    onClick={() => update('terms_accepted', !state.terms_accepted)}
                    className={cn(
                      'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      state.terms_accepted
                        ? 'bg-atlas-500 border-atlas-500 text-white'
                        : 'border-slate-300 bg-transparent'
                    )}
                  >
                    {state.terms_accepted && <Check className="w-3 h-3" />}
                  </button>
                  <div>
                    <p className="text-sm text-text-primary">I agree to the Terms of Service and Coach Code of Conduct</p>
                    <p className="text-xs text-text-muted mt-1">
                      By checking this, you confirm the information provided is accurate and you agree to
                      Gaya&apos;s coach guidelines.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <Button variant="ghost" size="md" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step < 5 && (
                <Button variant="ghost" size="sm" className="text-text-muted">
                  Save & Exit
                </Button>
              )}
              <Button size="md" onClick={handleNext} disabled={!canProceed()}>
                {step === 5 ? (
                  <><CheckCircle className="w-4 h-4" /> Complete Setup</>
                ) : (
                  <>Continue <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
