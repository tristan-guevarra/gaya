/* ═══════════════════════════════════════════════════════════
   Gaya — Competitive Landscape Analyzer
   Zone-vs-zone benchmarking, scatter plot analysis,
   opportunity matrix, and competitive positioning
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ZAxis, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Card, Badge, Button, StatCard } from '@/components/ui';
import { cn, formatPrice, formatPercent } from '@/lib/utils';
import {
  Globe, Crosshair, TrendingUp, TrendingDown, Minus,
  ArrowUpRight, ArrowDownRight, BarChart3, Target, Users,
  MapPin, Zap, Brain, Layers, ArrowRight, Crown, Shield
} from 'lucide-react';
import type { ZoneBenchmark, EventType } from '@/types';

// ─── Zone Benchmark Data ──────────────────────────────────

const ZONES: ZoneBenchmark[] = [
  { zone: 'Downtown', latitude: 43.6532, longitude: -79.3832, coach_density: 8.2, event_density: 12.5, avg_price: 18500, avg_fill_rate: 0.82, demand_index: 92, supply_index: 85, opportunity_score: 65, trend: 'stable', top_event_type: 'clinic' },
  { zone: 'North York', latitude: 43.7615, longitude: -79.4111, coach_density: 5.1, event_density: 8.3, avg_price: 15200, avg_fill_rate: 0.71, demand_index: 78, supply_index: 62, opportunity_score: 74, trend: 'rising', top_event_type: 'camp' },
  { zone: 'Scarborough', latitude: 43.7731, longitude: -79.2572, coach_density: 2.8, event_density: 4.1, avg_price: 12800, avg_fill_rate: 0.64, demand_index: 71, supply_index: 35, opportunity_score: 92, trend: 'rising', top_event_type: 'camp' },
  { zone: 'Etobicoke', latitude: 43.6205, longitude: -79.5132, coach_density: 3.4, event_density: 5.2, avg_price: 14100, avg_fill_rate: 0.69, demand_index: 58, supply_index: 41, opportunity_score: 72, trend: 'stable', top_event_type: 'private' },
  { zone: 'Mississauga', latitude: 43.5890, longitude: -79.6441, coach_density: 4.5, event_density: 7.8, avg_price: 16300, avg_fill_rate: 0.76, demand_index: 83, supply_index: 55, opportunity_score: 84, trend: 'rising', top_event_type: 'camp' },
  { zone: 'Brampton', latitude: 43.7315, longitude: -79.7624, coach_density: 2.1, event_density: 3.2, avg_price: 11500, avg_fill_rate: 0.58, demand_index: 65, supply_index: 28, opportunity_score: 91, trend: 'rising', top_event_type: 'clinic' },
  { zone: 'Vaughan', latitude: 43.8361, longitude: -79.4983, coach_density: 2.6, event_density: 3.8, avg_price: 15800, avg_fill_rate: 0.61, demand_index: 45, supply_index: 32, opportunity_score: 68, trend: 'stable', top_event_type: 'private' },
  { zone: 'Markham', latitude: 43.8561, longitude: -79.3370, coach_density: 3.1, event_density: 4.5, avg_price: 14500, avg_fill_rate: 0.65, demand_index: 52, supply_index: 38, opportunity_score: 70, trend: 'stable', top_event_type: 'clinic' },
  { zone: 'Ajax / Pickering', latitude: 43.8509, longitude: -79.0204, coach_density: 1.2, event_density: 1.8, avg_price: 13200, avg_fill_rate: 0.52, demand_index: 48, supply_index: 15, opportunity_score: 88, trend: 'rising', top_event_type: 'camp' },
  { zone: 'Oakville', latitude: 43.4675, longitude: -79.6877, coach_density: 3.8, event_density: 5.5, avg_price: 19200, avg_fill_rate: 0.74, demand_index: 55, supply_index: 48, opportunity_score: 62, trend: 'declining', top_event_type: 'private' },
];

// ─── Scatter Plot Colors ──────────────────────────────────

const trendColors: Record<string, string> = {
  rising: '#3b82f6',
  stable: '#4d9fff',
  declining: '#ff4d6a',
};

// ─── Quadrant Labels ──────────────────────────────────────

const quadrants = [
  { label: 'High Demand, Low Supply', position: 'top-left', emoji: '🔥', color: 'text-red-400', desc: 'Prime expansion targets' },
  { label: 'High Demand, High Supply', position: 'top-right', emoji: '⚔️', color: 'text-amber-400', desc: 'Competitive battlegrounds' },
  { label: 'Low Demand, Low Supply', position: 'bottom-left', emoji: '🌱', color: 'text-blue-400', desc: 'Emerging markets' },
  { label: 'Low Demand, High Supply', position: 'bottom-right', emoji: '⚠️', color: 'text-text-muted', desc: 'Oversaturated zones' },
];

// ─── Scatter Tooltip ──────────────────────────────────────

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="glass-card !p-3 !border-slate-300 text-xs min-w-[180px]">
      <p className="font-display font-semibold text-text-primary mb-2">{data.zone}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between"><span className="text-text-muted">Supply Index</span><span className="font-mono text-text-primary">{data.supply_index}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Demand Index</span><span className="font-mono text-text-primary">{data.demand_index}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Opportunity</span><span className="font-mono text-atlas-400">{data.opportunity_score}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Fill Rate</span><span className="font-mono">{formatPercent(data.avg_fill_rate)}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Trend</span>
          <span className={cn('font-medium capitalize', `text-[${trendColors[data.trend]}]`)}>{data.trend}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────

export default function LandscapePage() {
  const [selectedZone, setSelectedZone] = useState<ZoneBenchmark | null>(null);
  const [compareZone, setCompareZone] = useState<ZoneBenchmark | null>(null);
  const [sortBy, setSortBy] = useState<'opportunity_score' | 'demand_index' | 'avg_fill_rate'>('opportunity_score');

  const sorted = useMemo(() =>
    [...ZONES].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number)),
  [sortBy]);

  // Radar comparison data
  const radarData = useMemo(() => {
    if (!selectedZone) return [];
    const metrics = ['demand_index', 'supply_index', 'avg_fill_rate', 'coach_density', 'event_density', 'opportunity_score'] as const;
    const labels = ['Demand', 'Supply', 'Fill Rate', 'Coach Density', 'Event Density', 'Opportunity'];
    const maxVals = { demand_index: 100, supply_index: 100, avg_fill_rate: 1, coach_density: 10, event_density: 15, opportunity_score: 100 };

    return metrics.map((m, i) => ({
      metric: labels[i],
      zone1: Math.round(((selectedZone[m] as number) / maxVals[m]) * 100),
      zone2: compareZone ? Math.round(((compareZone[m] as number) / maxVals[m]) * 100) : undefined,
    }));
  }, [selectedZone, compareZone]);

  const TrendIcon = ({ trend }: { trend: string }) => (
    trend === 'rising' ? <ArrowUpRight className="w-3 h-3 text-atlas-400" /> :
    trend === 'declining' ? <ArrowDownRight className="w-3 h-3 text-red-400" /> :
    <Minus className="w-3 h-3 text-blue-400" />
  );

  return (
    <div className="min-h-screen pb-16">
      {/* ─── Header ─── */}
      <div className="border-b border-white/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-text-primary">Competitive Landscape</h1>
              <p className="text-sm text-text-muted">
                Zone benchmarking · Opportunity matrix · Supply-demand positioning
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        {/* ─── Scatter Plot (Opportunity Matrix) ─── */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-text-primary">Opportunity Matrix</h3>
              <p className="text-xs text-text-muted mt-0.5">Supply vs Demand positioning · Bubble size = opportunity score</p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              {Object.entries(trendColors).map(([trend, color]) => (
                <span key={trend} className="flex items-center gap-1.5 capitalize text-text-muted">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} /> {trend}
                </span>
              ))}
            </div>
          </div>

          {/* Quadrant labels */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  type="number" dataKey="supply_index" name="Supply"
                  tick={{ fontSize: 10, fill: '#6985c6' }} axisLine={false} tickLine={false}
                  label={{ value: 'Supply Index →', position: 'insideBottomRight', offset: -5, style: { fontSize: 10, fill: '#6985c6' } }}
                  domain={[0, 100]}
                />
                <YAxis
                  type="number" dataKey="demand_index" name="Demand"
                  tick={{ fontSize: 10, fill: '#6985c6' }} axisLine={false} tickLine={false}
                  label={{ value: '↑ Demand Index', position: 'insideTopLeft', offset: 10, style: { fontSize: 10, fill: '#6985c6' } }}
                  domain={[0, 100]}
                />
                <ZAxis type="number" dataKey="opportunity_score" range={[100, 600]} name="Opportunity" />
                <Tooltip content={<ScatterTooltip />} />

                {/* Median lines */}
                {/* We'll use reference lines via manual SVG in real impl, but Recharts doesn't support them in scatter natively */}

                <Scatter data={ZONES}>
                  {ZONES.map((zone, i) => (
                    <Cell
                      key={zone.zone}
                      fill={trendColors[zone.trend]}
                      fillOpacity={0.6}
                      stroke={trendColors[zone.trend]}
                      strokeWidth={selectedZone?.zone === zone.zone ? 3 : 1}
                      cursor="pointer"
                      onClick={() => setSelectedZone(zone)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            {/* Zone labels overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Quadrant labels */}
              <div className="absolute top-6 left-12 text-[10px] text-red-400/40 font-medium">🔥 High Demand, Low Supply</div>
              <div className="absolute top-6 right-8 text-[10px] text-amber-400/40 font-medium">⚔️ Competitive</div>
              <div className="absolute bottom-10 left-12 text-[10px] text-blue-400/40 font-medium">🌱 Emerging</div>
              <div className="absolute bottom-10 right-8 text-[10px] text-text-muted/30 font-medium">⚠️ Oversaturated</div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ─── Zone Rankings ─── */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text-primary">Zone Rankings</h3>
              <div className="flex items-center gap-1">
                {[
                  { key: 'opportunity_score' as const, label: 'Opportunity' },
                  { key: 'demand_index' as const, label: 'Demand' },
                  { key: 'avg_fill_rate' as const, label: 'Fill Rate' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all',
                      sortBy === s.key
                        ? 'bg-atlas-500/15 text-atlas-400'
                        : 'text-text-muted hover:text-text-secondary'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {sorted.map((zone, i) => {
                const isSelected = selectedZone?.zone === zone.zone;
                const isCompare = compareZone?.zone === zone.zone;

                return (
                  <Card
                    key={zone.zone}
                    padding="sm"
                    hover
                    className={cn(
                      'cursor-pointer relative overflow-hidden',
                      isSelected && '!border-atlas-500/25 !bg-atlas-500/5',
                      isCompare && '!border-blue-500/25 !bg-blue-500/5',
                    )}
                    onClick={() => {
                      if (selectedZone?.zone === zone.zone) return;
                      if (!selectedZone) setSelectedZone(zone);
                      else if (!compareZone) setCompareZone(zone);
                      else { setSelectedZone(zone); setCompareZone(null); }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0',
                        i === 0 ? 'bg-atlas-500/15 text-atlas-400' :
                        i === 1 ? 'bg-blue-500/15 text-blue-400' :
                        i === 2 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-slate-100/50 text-text-muted'
                      )}>
                        {i === 0 ? <Crown className="w-4 h-4" /> : `#${i + 1}`}
                      </div>

                      {/* Zone info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{zone.zone}</span>
                          <TrendIcon trend={zone.trend} />
                          <Badge variant={
                            zone.top_event_type === 'camp' ? 'info' :
                            zone.top_event_type === 'clinic' ? 'warning' : 'premium'
                          } size="sm">
                            {zone.top_event_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[10px] text-text-muted">
                          <span>{zone.coach_density.toFixed(1)} coaches/km²</span>
                          <span>{formatPercent(zone.avg_fill_rate)} fill</span>
                          <span>{formatPrice(zone.avg_price)} avg</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'text-xl font-display font-bold',
                          zone.opportunity_score >= 85 ? 'text-atlas-400' :
                          zone.opportunity_score >= 70 ? 'text-blue-400' :
                          'text-text-secondary'
                        )}>
                          {zone[sortBy] < 1 ? formatPercent(zone[sortBy] as number) : zone[sortBy]}
                        </p>
                        <p className="text-[10px] text-text-muted capitalize">{sortBy.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <p className="text-[10px] text-text-muted text-center mt-3">
              Click a zone to select, click another to compare. Click selected zone again to deselect.
            </p>
          </div>

          {/* ─── Comparison Panel ─── */}
          <div className="lg:col-span-5 space-y-6">
            {selectedZone ? (
              <>
                {/* Radar comparison */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary">
                        {selectedZone.zone}
                        {compareZone && ` vs ${compareZone.zone}`}
                      </h3>
                      <p className="text-xs text-text-muted">Normalized benchmark comparison</p>
                    </div>
                    {compareZone && (
                      <button
                        onClick={() => setCompareZone(null)}
                        className="text-xs text-text-muted hover:text-text-secondary"
                      >
                        Clear comparison
                      </button>
                    )}
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(0,0,0,0.06)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6985c6' }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar name={selectedZone.zone} dataKey="zone1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                      {compareZone && (
                        <Radar name={compareZone.zone} dataKey="zone2" stroke="#4d9fff" fill="#4d9fff" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                      )}
                    </RadarChart>
                  </ResponsiveContainer>

                  <div className="flex items-center justify-center gap-6 text-xs">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-atlas-500" /> {selectedZone.zone}
                    </span>
                    {compareZone && (
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400" /> {compareZone.zone}
                      </span>
                    )}
                  </div>
                </Card>

                {/* Zone Detail Stats */}
                <Card>
                  <h3 className="font-display font-semibold text-text-primary mb-4">Zone Profile</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Demand Index', value: selectedZone.demand_index, compare: compareZone?.demand_index, unit: '' },
                      { label: 'Supply Index', value: selectedZone.supply_index, compare: compareZone?.supply_index, unit: '' },
                      { label: 'Opportunity Score', value: selectedZone.opportunity_score, compare: compareZone?.opportunity_score, unit: '' },
                      { label: 'Coach Density', value: selectedZone.coach_density, compare: compareZone?.coach_density, unit: '/km²' },
                      { label: 'Avg Fill Rate', value: Math.round(selectedZone.avg_fill_rate * 100), compare: compareZone ? Math.round(compareZone.avg_fill_rate * 100) : undefined, unit: '%' },
                      { label: 'Avg Price', value: selectedZone.avg_price / 100, compare: compareZone ? compareZone.avg_price / 100 : undefined, unit: '$' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">{stat.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-medium text-text-primary">
                            {stat.unit === '$' ? '$' : ''}{typeof stat.value === 'number' ? stat.value.toFixed(stat.unit === '/km²' ? 1 : 0) : stat.value}{stat.unit !== '$' ? stat.unit : ''}
                          </span>
                          {stat.compare !== undefined && (
                            <>
                              <ArrowRight className="w-3 h-3 text-text-muted/30" />
                              <span className={cn(
                                'text-sm font-mono font-medium',
                                (stat.compare as number) > (stat.value as number) ? 'text-atlas-400' : 'text-red-400'
                              )}>
                                {stat.unit === '$' ? '$' : ''}{typeof stat.compare === 'number' ? stat.compare.toFixed(stat.unit === '/km²' ? 1 : 0) : stat.compare}{stat.unit !== '$' ? stat.unit : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AI Recommendation */}
                <Card className="!border-atlas-500/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-atlas-500/10 flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-atlas-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-1">ML Recommendation</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {selectedZone.opportunity_score >= 85
                          ? `${selectedZone.zone} has significant untapped demand with limited supply. Launch a ${selectedZone.top_event_type} here to capture the market — predicted ${Math.round(selectedZone.avg_fill_rate * 100 + 15)}% fill rate.`
                          : selectedZone.opportunity_score >= 70
                          ? `${selectedZone.zone} shows moderate opportunity. Focus on differentiating with premium ${selectedZone.top_event_type} offerings to capture higher-value segments.`
                          : `${selectedZone.zone} is relatively saturated. Consider niche specialization or expanding to adjacent underserved zones instead.`
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16">
                <Crosshair className="w-12 h-12 text-blue-400/20 mb-4" />
                <h3 className="font-display font-semibold text-text-primary mb-2">Select a Zone</h3>
                <p className="text-sm text-text-muted text-center max-w-xs">
                  Click any zone in the rankings or scatter plot to see detailed benchmarks and AI recommendations.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
