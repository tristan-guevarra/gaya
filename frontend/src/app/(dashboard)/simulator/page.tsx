/* ═══════════════════════════════════════════════════════════
   Gaya — What-If Simulator
   Interactive ML simulator: place a pin, set parameters,
   get fill-rate predictions with explainability
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { Card, Badge, Button, Input, Select, Spinner, StatCard } from '@/components/ui';
import { cn, formatPrice, formatPercent, confidenceLabel, getEventTypeInfo } from '@/lib/utils';
import {
  FlaskConical, MapPin, Crosshair, Zap, TrendingUp,
  DollarSign, Users, Target, Brain, Sparkles,
  RotateCcw, Download, ArrowRight
} from 'lucide-react';
import type { EventType, WhatIfResult } from '@/types';

// ─── Simulated Prediction Engine ──────────────────────────
// In production, this calls the FastAPI /api/v1/simulator/what-if endpoint.

function simulatePrediction(
  lat: number, lng: number,
  eventType: EventType, capacity: number, price: number
): WhatIfResult {
  // Simulate ML model behavior
  const baseDemand = 0.6 + Math.random() * 0.2;
  const priceImpact = Math.max(0, 1 - (price / 30000)); // Cheaper = higher fill
  const capacityImpact = capacity > 30 ? 0.85 : capacity > 20 ? 0.95 : 1.0;
  const typeBonus: Record<string, number> = { camp: 0.1, clinic: 0.05, private: 0.15 };
  const seasonality = 0.92; // Near summer

  const rawFill = baseDemand * (0.5 + priceImpact * 0.3) * capacityImpact * (1 + (typeBonus[eventType] || 0)) * seasonality;
  const fillRate = Math.min(Math.max(rawFill, 0.15), 0.95);
  const signups = Math.round(fillRate * capacity);
  const confidence = 0.55 + Math.random() * 0.3;

  return {
    predicted_fill_rate: fillRate,
    confidence,
    predicted_signups: signups,
    predicted_revenue_cents: signups * price,
    factors: [
      { factor: 'Area Demand', impact: baseDemand * 0.3, description: `${Math.round(baseDemand * 50)} leads within 5km in last 90 days` },
      { factor: 'Price Competitiveness', impact: priceImpact * 0.25, description: `${formatPrice(price)} vs $${Math.round(price * 1.2 / 100)} area average` },
      { factor: 'Seasonality', impact: seasonality * 0.15, description: 'Summer approaching — peak demand period' },
      { factor: 'Capacity Fit', impact: capacityImpact * 0.15, description: `${capacity} spots — ${capacity > 25 ? 'consider smaller' : 'good size for area'}` },
      { factor: 'Competition', impact: 0.12, description: `${Math.round(3 + Math.random() * 5)} similar events within 10km` },
      { factor: 'Event Type', impact: (typeBonus[eventType] || 0) * 0.1, description: `${eventType}s have ${Math.round(55 + Math.random() * 20)}% avg fill in this zone` },
    ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
    recommendation: fillRate > 0.7
      ? `Strong opportunity. Predicted ${formatPercent(fillRate)} fill rate with ${signups} signups. Consider pricing at ${formatPrice(Math.round(price * 0.9))} to maximize.`
      : fillRate > 0.5
      ? `Moderate opportunity. ${formatPercent(fillRate)} predicted fill. Try lowering price or capacity to improve conversion.`
      : `Challenging zone. Consider different location, lower price point, or smaller group size.`,
  };
}

// ─── GaugeChart Component ─────────────────────────────────

function GaugeChart({ value, size = 160 }: { value: number; size?: number }) {
  const data = [
    { value: value * 100, fill: value > 0.7 ? '#3b82f6' : value > 0.5 ? '#ffb84d' : '#ff4d6a' },
    { value: (1 - value) * 100, fill: 'rgba(255,255,255,0.04)' },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={210}
            endAngle={-30}
            innerRadius="75%"
            outerRadius="95%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-text-primary">
          {formatPercent(value)}
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Fill Rate</span>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────

export default function SimulatorPage() {
  const [eventType, setEventType] = useState<EventType>('camp');
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(14900); // cents
  const [latitude, setLatitude] = useState(43.6532);
  const [longitude, setLongitude] = useState(-79.3832);
  const [locationLabel, setLocationLabel] = useState('Downtown Toronto');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const presetLocations = [
    { label: 'Downtown Toronto', lat: 43.6532, lng: -79.3832 },
    { label: 'Scarborough', lat: 43.7731, lng: -79.2572 },
    { label: 'Brampton North', lat: 43.7315, lng: -79.7624 },
    { label: 'Mississauga West', lat: 43.5890, lng: -79.6441 },
    { label: 'North York', lat: 43.7615, lng: -79.4111 },
    { label: 'Ajax / Pickering', lat: 43.8509, lng: -79.0204 },
    { label: 'Vaughan', lat: 43.8361, lng: -79.4983 },
    { label: 'Oakville', lat: 43.4675, lng: -79.6877 },
  ];

  const runSimulation = useCallback(async () => {
    setIsSimulating(true);
    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 1200));
    const prediction = simulatePrediction(latitude, longitude, eventType, capacity, price);
    setResult(prediction);
    setIsSimulating(false);
    setHasRun(true);
  }, [latitude, longitude, eventType, capacity, price]);

  const reset = () => {
    setResult(null);
    setHasRun(false);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* ─── Header ─── */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-text-primary">
                What-If Simulator
              </h1>
              <p className="text-sm text-text-muted">
                Predict fill rates for hypothetical events · Powered by gradient boosting
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* ─── Input Panel ─── */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-text-primary mb-1">Configure Scenario</h3>
              <p className="text-xs text-text-muted mb-5">Set parameters for your hypothetical event</p>

              {/* Location Picker */}
              <div className="mb-5">
                <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {presetLocations.map((loc) => (
                    <button
                      key={loc.label}
                      onClick={() => {
                        setLatitude(loc.lat);
                        setLongitude(loc.lng);
                        setLocationLabel(loc.label);
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
                        locationLabel === loc.label
                          ? 'bg-atlas-500/15 text-atlas-400 border border-atlas-500/25'
                          : 'bg-slate-100/50 text-text-secondary hover:bg-slate-100 border border-transparent'
                      )}
                    >
                      <MapPin className="w-3 h-3 inline mr-1 opacity-50" />
                      {loc.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-[10px] text-text-muted font-mono">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Event Type */}
              <div className="mb-5">
                <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
                  Event Type
                </label>
                <div className="flex gap-2">
                  {(['camp', 'clinic', 'private'] as EventType[]).map((type) => {
                    const info = getEventTypeInfo(type);
                    return (
                      <button
                        key={type}
                        onClick={() => setEventType(type)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                          eventType === type
                            ? 'bg-atlas-500/15 text-atlas-400 border border-atlas-500/25'
                            : 'bg-slate-100/50 text-text-secondary hover:bg-slate-100 border border-transparent'
                        )}
                      >
                        <span>{info.icon}</span>
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacity */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    Capacity
                  </label>
                  <span className="text-sm font-mono text-atlas-400">{capacity}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  className="w-full accent-atlas-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-atlas-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-atlas-500/30"
                />
                <div className="flex justify-between text-[9px] text-text-muted mt-1">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    Price
                  </label>
                  <span className="text-sm font-mono text-atlas-400">{formatPrice(price)}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={50000}
                  step={500}
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  className="w-full accent-atlas-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-atlas-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-atlas-500/30"
                />
                <div className="flex justify-between text-[9px] text-text-muted mt-1">
                  <span>$20</span>
                  <span>$250</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Run Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={runSimulation}
                loading={isSimulating}
              >
                {isSimulating ? (
                  'Running ML Model…'
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Run Prediction
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>

              {hasRun && (
                <button
                  onClick={reset}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </Card>
          </div>

          {/* ─── Results Panel ─── */}
          <div className="lg:col-span-8">
            {!hasRun && !isSimulating ? (
              /* Empty state */
              <Card className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/5 flex items-center justify-center mb-6">
                  <FlaskConical className="w-10 h-10 text-purple-400/40" />
                </div>
                <h3 className="font-display font-semibold text-xl text-text-primary mb-2">
                  Configure your scenario
                </h3>
                <p className="text-sm text-text-muted max-w-md text-center mb-6">
                  Choose a location, event type, capacity, and price — then hit
                  &quot;Run Prediction&quot; to see ML-powered fill rate estimates
                  with feature importance explanations.
                </p>
                <div className="flex items-center gap-6 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-atlas-500" />
                    H3 cell analysis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    Gradient boosting
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    Seasonality aware
                  </span>
                </div>
              </Card>
            ) : isSimulating ? (
              /* Loading state */
              <Card className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-atlas-500/20 animate-spin" style={{ borderTopColor: '#3b82f6' }} />
                  <Brain className="absolute inset-0 m-auto w-8 h-8 text-atlas-500/60" />
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                  Running ML prediction…
                </h3>
                <p className="text-sm text-text-muted">
                  Analyzing H3 cells, demand signals, competition, and seasonality
                </p>
              </Card>
            ) : result ? (
              /* Results */
              <div className="space-y-6 animate-fade-in">
                {/* Top Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Predicted Fill"
                    value={formatPercent(result.predicted_fill_rate)}
                    icon={<Target className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Est. Signups"
                    value={result.predicted_signups}
                    suffix={`/ ${capacity}`}
                    icon={<Users className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Est. Revenue"
                    value={formatPrice(result.predicted_revenue_cents)}
                    icon={<DollarSign className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Confidence"
                    value={formatPercent(result.confidence)}
                    icon={<Zap className="w-5 h-5" />}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Gauge + Recommendation */}
                  <Card>
                    <div className="flex flex-col items-center mb-4">
                      <GaugeChart value={result.predicted_fill_rate} size={180} />
                    </div>

                    <div className={cn(
                      'p-4 rounded-xl border',
                      result.predicted_fill_rate > 0.7
                        ? 'bg-atlas-500/5 border-atlas-500/20'
                        : result.predicted_fill_rate > 0.5
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    )}>
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className={cn(
                          'w-4 h-4 mt-0.5 shrink-0',
                          result.predicted_fill_rate > 0.7 ? 'text-atlas-500' :
                          result.predicted_fill_rate > 0.5 ? 'text-amber-400' : 'text-red-400'
                        )} />
                        <p className="text-sm text-text-primary leading-relaxed">
                          {result.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-1">
                      <div className="text-center">
                        <p className="text-xs font-medium text-text-secondary">{locationLabel}</p>
                        <p className="text-[10px] text-text-muted">Location</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-text-secondary">{getEventTypeInfo(eventType).label}</p>
                        <p className="text-[10px] text-text-muted">Type</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-text-secondary">{formatPrice(price)}</p>
                        <p className="text-[10px] text-text-muted">Price</p>
                      </div>
                    </div>
                  </Card>

                  {/* Factor Importance */}
                  <Card>
                    <h3 className="font-display font-semibold text-text-primary mb-1">
                      Feature Importance
                    </h3>
                    <p className="text-xs text-text-muted mb-4">
                      Factors driving this prediction
                    </p>

                    <div className="space-y-4">
                      {result.factors.map((factor, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-text-secondary">
                              {factor.factor}
                            </span>
                            <span className={cn(
                              'text-xs font-mono font-medium',
                              factor.impact > 0.2 ? 'text-atlas-400' :
                              factor.impact > 0.1 ? 'text-blue-400' : 'text-text-muted'
                            )}>
                              {(factor.impact * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-1000',
                                factor.impact > 0.2
                                  ? 'bg-gradient-to-r from-atlas-700 to-atlas-400'
                                  : factor.impact > 0.1
                                  ? 'bg-gradient-to-r from-blue-700 to-blue-400'
                                  : 'bg-gradient-to-r from-white/10 to-white/20'
                              )}
                              style={{
                                width: `${Math.min(factor.impact * 300, 100)}%`,
                                animationDelay: `${i * 100}ms`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-text-muted mt-1">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
