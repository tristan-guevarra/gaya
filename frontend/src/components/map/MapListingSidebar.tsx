// map listing sidebar - scrollable list of results synced with map markers

'use client';

import { cn, formatPrice, getEventTypeInfo } from '@/lib/utils';
import type { MapMarker } from '@/types';
import { Badge, Skeleton } from '@/components/ui';
import { MapPin, Star, Users, Clock, Heart, ChevronRight } from 'lucide-react';

interface MapListingSidebarProps {
  markers: MapMarker[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (marker: MapMarker) => void;
  onFavorite?: (marker: MapMarker) => void;
  visible: boolean;
  onToggle: () => void;
}

export function MapListingSidebar({
  markers,
  isLoading,
  selectedId,
  onSelect,
  onFavorite,
  visible,
  onToggle,
}: MapListingSidebarProps) {
  return (
    <>
      {/* toggle button when hidden */}
      {!visible && (
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 z-[500] glass-card px-3 py-2 flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          {markers.length} listings
          <ChevronRight className="w-3 h-3 rotate-180" />
        </button>
      )}

      {/* sidebar */}
      <div
        className={cn(
          'absolute top-4 right-4 z-[500] w-[360px] max-h-[calc(100vh-120px)] flex flex-col transition-all duration-300',
          visible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
        )}
      >
        {/* header */}
        <div className="glass-card p-3 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs font-medium text-text-primary">
              {markers.length} listings found
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-white/40 text-text-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* listing cards */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : markers.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MapPin className="w-8 h-8 text-text-muted/30 mx-auto mb-3" />
              <p className="text-sm text-text-muted">No results in this area</p>
              <p className="text-xs text-text-muted/60 mt-1">Try adjusting filters or zoom out</p>
            </div>
          ) : (
            markers.map((marker) => {
              const typeInfo = getEventTypeInfo(marker.event_type || marker.type);
              const isSelected = marker.id === selectedId;

              return (
                <div
                  key={marker.id}
                  onClick={() => onSelect(marker)}
                  className={cn(
                    'glass-card p-4 cursor-pointer transition-all duration-200 group',
                    isSelected
                      ? 'border-atlas-500/30 bg-atlas-500/5'
                      : 'hover:border-white/80 hover:bg-white/40'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          marker.type === 'coach' ? 'success' :
                          marker.event_type === 'camp' ? 'info' :
                          marker.event_type === 'clinic' ? 'warning' : 'premium'
                        }
                        size="sm"
                      >
                        {typeInfo.icon} {marker.type === 'coach' ? 'Coach' : typeInfo.label}
                      </Badge>
                      {marker.rating && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {marker.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {onFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavorite(marker);
                        }}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/40 text-text-muted hover:text-red-400 transition-all"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="font-display font-semibold text-sm text-text-primary mb-1 leading-tight">
                    {marker.title}
                  </h4>
                  <p className="text-xs text-text-muted mb-3 line-clamp-1">
                    {marker.subtitle}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {marker.price_cents && (
                        <span className="text-sm font-bold text-text-primary">
                          {formatPrice(marker.price_cents)}
                        </span>
                      )}
                    </div>
                    {marker.spots_left !== undefined && (
                      <span className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full',
                        marker.spots_left > 5
                          ? 'bg-atlas-500/10 text-atlas-400'
                          : marker.spots_left > 0
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      )}>
                        {marker.spots_left > 0 ? `${marker.spots_left} spots left` : 'Full'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
