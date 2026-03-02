// discovery map page - full-screen interactive map

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { MapFilterPanel } from '@/components/map/MapFilterPanel';
import { MapListingSidebar } from '@/components/map/MapListingSidebar';
import { Spinner } from '@/components/ui';
import { buildShareUrl } from '@/lib/utils';
import type { MapMarker, MapFilters, HeatmapLayer } from '@/types';

// dynamic import for leaflet (ssr incompatible)
const DiscoveryMap = dynamic(
  () => import('@/components/map/DiscoveryMap').then((mod) => mod.DiscoveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size={32} className="text-atlas-500 mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading map…</p>
        </div>
      </div>
    ),
  }
);

// mock data generator
// in production this comes from the api via useMapMarkers hook
// for demo we generate realistic gta markers

function generateMockMarkers(): MapMarker[] {
  const neighborhoods = [
    { name: 'Downtown Toronto', lat: 43.6532, lng: -79.3832 },
    { name: 'North York', lat: 43.7615, lng: -79.4111 },
    { name: 'Scarborough', lat: 43.7731, lng: -79.2572 },
    { name: 'Etobicoke', lat: 43.6205, lng: -79.5132 },
    { name: 'Mississauga', lat: 43.5890, lng: -79.6441 },
    { name: 'Brampton', lat: 43.7315, lng: -79.7624 },
    { name: 'Vaughan', lat: 43.8361, lng: -79.4983 },
    { name: 'Markham', lat: 43.8561, lng: -79.3370 },
    { name: 'Richmond Hill', lat: 43.8828, lng: -79.4403 },
    { name: 'Oakville', lat: 43.4675, lng: -79.6877 },
    { name: 'Ajax', lat: 43.8509, lng: -79.0204 },
    { name: 'Pickering', lat: 43.8354, lng: -79.0868 },
    { name: 'The Beaches', lat: 43.6685, lng: -79.2943 },
    { name: 'East York', lat: 43.6911, lng: -79.3280 },
    { name: 'Thornhill', lat: 43.8156, lng: -79.4240 },
  ];

  const coachNames = [
    'Alex Rivera', 'Maya Singh', 'Jordan Park', 'Sarah Chen', 'Marcus Williams',
    'Leila Hassan', 'Tommy Okafor', 'Priya Sharma', 'Diego Fernandez', 'Emily Watson',
    'Chris Adebayo', 'Rachel Kim', 'Kai Nakamura', 'Sofia Rodriguez', 'James O\'Brien',
    'Amara Osei', 'Liam Patel', 'Nina Volkov', 'Hassan Ali', 'Grace Liu',
  ];

  const eventTypes: ('camp' | 'clinic' | 'private')[] = ['camp', 'clinic', 'private'];
  const markers: MapMarker[] = [];
  let id = 1;

  // generate coaches
  coachNames.forEach((name, i) => {
    const hood = neighborhoods[i % neighborhoods.length];
    const jitter = () => (Math.random() - 0.5) * 0.03;
    markers.push({
      id: `coach-${id++}`,
      type: 'coach',
      latitude: hood.lat + jitter(),
      longitude: hood.lng + jitter(),
      title: name,
      subtitle: `${hood.name} · Soccer · $${60 + Math.floor(Math.random() * 90)}/hr`,
      rating: 3.5 + Math.random() * 1.5,
      price_cents: (6000 + Math.floor(Math.random() * 9000)),
    });
  });

  // generate events
  const eventNames: Record<string, string[]> = {
    camp: [
      'Summer Elite Camp', 'Youth Development Camp', 'Holiday Intensive Camp',
      'Spring Break Camp', 'Pre-Season Camp', 'All-Stars Camp',
      'Advanced Skills Camp', 'Goalkeeper Camp', 'U12 Development Camp',
    ],
    clinic: [
      'Finishing Clinic', 'Speed & Agility Clinic', 'Technical Skills Clinic',
      'Defensive Clinic', 'Set Piece Clinic', 'First Touch Clinic',
    ],
    private: [
      '1-on-1 Session', 'Private Coaching', 'Small Group (3-5)',
      'Elite Private Training', 'Skill Assessment',
    ],
  };

  neighborhoods.forEach((hood) => {
    const numEvents = 3 + Math.floor(Math.random() * 4);
    for (let j = 0; j < numEvents; j++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const names = eventNames[type];
      const name = names[Math.floor(Math.random() * names.length)];
      const capacity = type === 'private' ? 1 + Math.floor(Math.random() * 4) : 10 + Math.floor(Math.random() * 30);
      const enrolled = Math.floor(capacity * (0.3 + Math.random() * 0.6));
      const jitter = () => (Math.random() - 0.5) * 0.02;

      markers.push({
        id: `event-${id++}`,
        type: 'event',
        event_type: type,
        latitude: hood.lat + jitter(),
        longitude: hood.lng + jitter(),
        title: name,
        subtitle: `${hood.name} · ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        price_cents: type === 'camp' ? 9900 + Math.floor(Math.random() * 20000)
          : type === 'clinic' ? 4900 + Math.floor(Math.random() * 10000)
          : 5000 + Math.floor(Math.random() * 10000),
        spots_left: capacity - enrolled,
        rating: 3.8 + Math.random() * 1.2,
      });
    }
  });

  return markers;
}

export default function MapPage() {
  const [filters, setFilters] = useState<MapFilters>({});
  const [activeLayer, setActiveLayer] = useState<HeatmapLayer | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [allMarkers] = useState<MapMarker[]>(() => generateMockMarkers());

  // filter markers client-side for demo
  const filteredMarkers = useMemo(() => {
    return allMarkers.filter((m) => {
      if (filters.event_type && filters.event_type !== 'all') {
        if (m.type === 'event' && m.event_type !== filters.event_type) return false;
        if (m.type === 'coach' && filters.event_type !== 'all') return true; // always show coaches
      }
      if (filters.price_min && m.price_cents && m.price_cents < filters.price_min * 100) return false;
      if (filters.price_max && m.price_cents && m.price_cents > filters.price_max * 100) return false;
      if (filters.has_availability && m.spots_left !== undefined && m.spots_left <= 0) return false;
      return true;
    });
  }, [allMarkers, filters]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarkerId(marker.id);
    if (!sidebarVisible) setSidebarVisible(true);
  }, [sidebarVisible]);

  const handleShare = useCallback(() => {
    const url = buildShareUrl(filters as Record<string, unknown>);
    navigator.clipboard?.writeText(url);
    toast.success('Map link copied to clipboard!');
  }, [filters]);

  // parse url params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const newFilters: MapFilters = {};
    if (params.get('event_type')) newFilters.event_type = params.get('event_type') as MapFilters['event_type'];
    if (params.get('skill_level')) newFilters.skill_level = params.get('skill_level') as MapFilters['skill_level'];
    if (params.get('radius_km')) newFilters.radius_km = parseInt(params.get('radius_km')!);
    if (Object.keys(newFilters).length) setFilters(newFilters);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* map fills full viewport below navbar */}
      <DiscoveryMap
        markers={filteredMarkers}
        activeLayer={activeLayer}
        onMarkerClick={handleMarkerClick}
        className="w-full h-full"
      />

      {/* filters */}
      <MapFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        resultCount={filteredMarkers.length}
        onShare={handleShare}
      />

      {/* listings */}
      <MapListingSidebar
        markers={filteredMarkers.slice(0, 50)}
        isLoading={false}
        selectedId={selectedMarkerId}
        onSelect={handleMarkerClick}
        onFavorite={(m) => toast.success(`Saved ${m.title} to favorites`)}
        visible={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      {/* legend when heatmap active */}
      {activeLayer && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] glass-card px-4 py-2.5 flex items-center gap-3 animate-slide-up">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            {activeLayer}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-text-muted">Low</span>
            <div className="w-32 h-2 rounded-full heatmap-gradient" />
            <span className="text-[9px] text-text-muted">High</span>
          </div>
        </div>
      )}
    </div>
  );
}
