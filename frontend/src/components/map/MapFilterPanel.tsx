// map filter panel - collapsible filters with search and layer toggles

'use client';

import { useState } from 'react';
import { Button, Badge, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { MapFilters, HeatmapLayer, EventType, SkillLevel } from '@/types';
import {
  Search, SlidersHorizontal, X, MapPin, Layers,
  ChevronDown, ChevronUp, Share2, Heart, RotateCcw
} from 'lucide-react';

interface MapFilterPanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  activeLayer: HeatmapLayer | null;
  onLayerChange: (layer: HeatmapLayer | null) => void;
  resultCount?: number;
  onShare?: () => void;
}

export function MapFilterPanel({
  filters,
  onFiltersChange,
  activeLayer,
  onLayerChange,
  resultCount = 0,
  onShare,
}: MapFilterPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const updateFilter = <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== '' && v !== 'all'
  );

  const eventTypes: { value: EventType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '📍' },
    { value: 'camp', label: 'Camps', icon: '⛺' },
    { value: 'clinic', label: 'Clinics', icon: '🏥' },
    { value: 'private', label: 'Private', icon: '🎯' },
  ];

  const skillLevels: { value: SkillLevel | undefined; label: string }[] = [
    { value: undefined, label: 'Any Level' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'elite', label: 'Elite' },
  ];

  const heatmapLayers: { value: HeatmapLayer; label: string; color: string; desc: string }[] = [
    { value: 'supply', label: 'Supply', color: 'bg-atlas-500', desc: 'Coach & event density' },
    { value: 'demand', label: 'Demand', color: 'bg-blue-400', desc: 'Search & lead volume' },
    { value: 'underserved', label: 'Underserved', color: 'bg-amber-400', desc: 'High demand, low supply' },
    { value: 'hotspot', label: 'Hotspot', color: 'bg-red-400', desc: 'High conversion zones' },
  ];

  return (
    <div className="absolute top-4 left-4 z-[500] w-[340px] max-h-[calc(100vh-120px)] flex flex-col">
      {/* search bar */}
      <div className="glass-card p-3 mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coaches, camps, locations…"
            className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-atlas-500/40 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-lg hover:bg-white/40 text-text-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* result count + actions */}
        <div className="flex items-center justify-between mt-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">
              <span className="text-atlas-400 font-medium">{resultCount}</span> results
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[10px] text-text-muted hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onShare}
              className="p-1.5 rounded-lg hover:bg-white/40 text-text-muted hover:text-text-primary transition-colors"
              title="Share map view"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showLayers || activeLayer
                  ? 'bg-atlas-500/10 text-atlas-400'
                  : 'hover:bg-white/40 text-text-muted hover:text-text-primary'
              )}
              title="Map layers"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-white/40 text-text-muted hover:text-text-primary transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* layer selector */}
      {showLayers && (
        <div className="glass-card p-3 mb-2 animate-slide-up">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
            Intelligence Layers
          </p>
          <div className="space-y-1">
            {heatmapLayers.map((layer) => (
              <button
                key={layer.value}
                onClick={() =>
                  onLayerChange(activeLayer === layer.value ? null : layer.value)
                }
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all',
                  activeLayer === layer.value
                    ? 'bg-white/40 border border-white/60'
                    : 'hover:bg-white/40'
                )}
              >
                <div className={cn('w-2.5 h-2.5 rounded-full', layer.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary">{layer.label}</p>
                  <p className="text-[10px] text-text-muted">{layer.desc}</p>
                </div>
                {activeLayer === layer.value && (
                  <Badge variant="success" size="sm">Active</Badge>
                )}
              </button>
            ))}
          </div>
          {activeLayer && (
            <button
              onClick={() => onLayerChange(null)}
              className="w-full mt-2 px-3 py-1.5 text-[10px] text-text-muted hover:text-red-400 transition-colors"
            >
              Clear overlay
            </button>
          )}
        </div>
      )}

      {/* filters panel */}
      {expanded && (
        <div className="glass-card p-4 overflow-y-auto animate-slide-up">
          {/* event type */}
          <div className="mb-5">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Training Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFilter('event_type', type.value === 'all' ? undefined : type.value as EventType)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    (filters.event_type === type.value || (!filters.event_type && type.value === 'all'))
                      ? 'bg-atlas-500/15 text-atlas-400 border border-atlas-500/25'
                      : 'bg-white/40 text-text-secondary hover:bg-white/60 border border-white/40'
                  )}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* skill level */}
          <div className="mb-5">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Skill Level
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillLevels.map((level) => (
                <button
                  key={level.label}
                  onClick={() => updateFilter('skill_level', level.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    filters.skill_level === level.value ||
                      (!filters.skill_level && !level.value)
                      ? 'bg-atlas-500/15 text-atlas-400 border border-atlas-500/25'
                      : 'bg-white/40 text-text-secondary hover:bg-white/60 border border-white/40'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* age range */}
          <div className="mb-5">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Age Range
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.age_min ?? ''}
                onChange={(e) => updateFilter('age_min', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40"
                min={3}
                max={18}
              />
              <span className="text-text-muted text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.age_max ?? ''}
                onChange={(e) => updateFilter('age_max', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40"
                min={3}
                max={18}
              />
            </div>
          </div>

          {/* price range */}
          <div className="mb-5">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Price Range (CAD)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="$0"
                value={filters.price_min ?? ''}
                onChange={(e) => updateFilter('price_min', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40"
              />
              <span className="text-text-muted text-xs">to</span>
              <input
                type="number"
                placeholder="$500"
                value={filters.price_max ?? ''}
                onChange={(e) => updateFilter('price_max', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40"
              />
            </div>
          </div>

          {/* radius */}
          <div className="mb-5">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Distance
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 25, 50].map((km) => (
                <button
                  key={km}
                  onClick={() => updateFilter('radius_km', filters.radius_km === km ? undefined : km)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    filters.radius_km === km
                      ? 'bg-atlas-500/15 text-atlas-400 border border-atlas-500/25'
                      : 'bg-white/40 text-text-secondary hover:bg-white/60 border border-white/40'
                  )}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>

          {/* availability toggle */}
          <label className="flex items-center gap-3 px-1 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.has_availability ?? false}
                onChange={(e) => updateFilter('has_availability', e.target.checked || undefined)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/40 rounded-full peer-checked:bg-atlas-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
              Open spots only
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
