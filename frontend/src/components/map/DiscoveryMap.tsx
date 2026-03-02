/* ═══════════════════════════════════════════════════════════
   Gaya — Discovery Map Component
   Full-screen Leaflet map with light tiles, custom markers,
   heatmap overlay, and popup cards
   ═══════════════════════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapMarker, HeatmapLayer } from '@/types';
import { formatPrice, getEventTypeInfo } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────

const TORONTO_CENTER: [number, number] = [43.6895, -79.3832];
const DEFAULT_ZOOM = 11;

// CartoDB Positron tiles — clean light basemap
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ─── Marker Icon Factory ──────────────────────────────────

function createMarkerIcon(type: string, eventType?: string): L.DivIcon {
  const colors: Record<string, string> = {
    coach: '#3b82f6',
    camp: '#4d9fff',
    clinic: '#ffb84d',
    private: '#c084fc',
    event: '#4d9fff',
  };
  const icons: Record<string, string> = {
    coach: '👤',
    camp: '⛺',
    clinic: '🏥',
    private: '🎯',
    event: '📍',
  };

  const color = colors[eventType || type] || colors.event;
  const icon = icons[eventType || type] || icons.event;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 2.5px solid rgba(255,255,255,0.9);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 15px ${color}44, 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

// ─── Popup Content Factory ────────────────────────────────

function createPopupContent(marker: MapMarker): string {
  const typeInfo = getEventTypeInfo(marker.event_type || 'event');
  const price = marker.price_cents ? formatPrice(marker.price_cents) : '';
  const rating = marker.rating ? `<span style="color: #ffb84d;">★</span> ${marker.rating.toFixed(1)}` : '';

  return `
    <div style="
      min-width: 220px; padding: 4px;
      font-family: 'DM Sans', system-ui, sans-serif;
    ">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
        <span style="
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 9999px;
          background: ${marker.type === 'coach' ? 'rgba(59,130,246,0.15)' : 'rgba(77,159,255,0.15)'};
          color: ${marker.type === 'coach' ? '#3b82f6' : '#4d9fff'};
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
        ">
          ${typeInfo.icon} ${marker.type === 'coach' ? 'Coach' : typeInfo.label}
        </span>
        ${rating ? `<span style="font-size: 12px; color: #475569;">${rating}</span>` : ''}
      </div>
      <h3 style="
        font-family: 'Outfit', system-ui; font-weight: 600;
        font-size: 15px; color: #0f172a; margin: 0 0 4px;
        line-height: 1.3;
      ">${marker.title}</h3>
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 10px;">${marker.subtitle}</p>
      <div style="display: flex; align-items: center; gap: 10px;">
        ${price ? `<span style="font-size: 14px; font-weight: 700; color: #0f172a;">${price}</span>` : ''}
        ${marker.spots_left !== undefined ? `
          <span style="
            font-size: 11px;
            color: ${marker.spots_left > 5 ? '#3b82f6' : marker.spots_left > 0 ? '#ffb84d' : '#ff4d6a'};
          ">
            ${marker.spots_left > 0 ? `${marker.spots_left} spots left` : 'Full'}
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

// ─── Map Component ────────────────────────────────────────

interface DiscoveryMapProps {
  markers: MapMarker[];
  heatmapData?: GeoJSON.FeatureCollection | null;
  activeLayer?: HeatmapLayer | null;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
  className?: string;
}

export function DiscoveryMap({
  markers,
  heatmapData,
  activeLayer,
  onMarkerClick,
  onMapMove,
  className = '',
}: DiscoveryMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.GeoJSON | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: TORONTO_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Light tiles
    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution bottom-left
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    // Marker layer group
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Map move handler
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapMove?.([center.lat, center.lng], zoom);
    });

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers
  useEffect(() => {
    if (!mapReady || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach((marker) => {
      const icon = createMarkerIcon(marker.type, marker.event_type);
      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
        .bindPopup(createPopupContent(marker), {
          maxWidth: 280,
          className: 'atlas-popup',
        });

      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker));
      }

      markersLayerRef.current?.addLayer(leafletMarker);
    });
  }, [markers, mapReady, onMarkerClick]);

  // Update heatmap overlay
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // Remove existing
    if (heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (!heatmapData || !activeLayer) return;

    const colorScales: Record<string, (v: number) => string> = {
      supply: (v) => `rgba(59, 130, 246, ${0.1 + v * 0.5})`,
      demand: (v) => `rgba(77, 159, 255, ${0.1 + v * 0.5})`,
      underserved: (v) => {
        if (v < 0.3) return `rgba(59, 130, 246, ${0.1 + v})`;
        if (v < 0.7) return `rgba(255, 184, 77, ${0.1 + v * 0.6})`;
        return `rgba(255, 77, 106, ${0.2 + v * 0.5})`;
      },
      hotspot: (v) => {
        if (v < 0.5) return `rgba(255, 184, 77, ${0.1 + v * 0.5})`;
        return `rgba(255, 77, 106, ${0.2 + v * 0.5})`;
      },
    };

    const getColor = colorScales[activeLayer] || colorScales.supply;

    heatmapLayerRef.current = L.geoJSON(heatmapData, {
      style: (feature) => {
        const score = feature?.properties?.[`${activeLayer}_score`] ?? feature?.properties?.score ?? 0;
        const maxScore = feature?.properties?.max_score ?? 1;
        const normalized = Math.min(score / (maxScore || 1), 1);
        return {
          fillColor: getColor(normalized),
          fillOpacity: 0.6,
          color: 'rgba(0, 0, 0, 0.06)',
          weight: 0.5,
        };
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const p = feature.properties;
          layer.bindTooltip(
            `<div style="font-family: 'DM Sans', sans-serif; font-size: 12px;">
              <strong>${activeLayer?.charAt(0).toUpperCase()}${activeLayer?.slice(1)} Score:</strong> ${(p[`${activeLayer}_score`] ?? p.score ?? 0).toFixed(2)}
              ${p.coach_count !== undefined ? `<br/>Coaches: ${p.coach_count}` : ''}
              ${p.event_count !== undefined ? `<br/>Events: ${p.event_count}` : ''}
              ${p.lead_count !== undefined ? `<br/>Leads: ${p.lead_count}` : ''}
            </div>`,
            { sticky: true }
          );
        }
      },
    }).addTo(mapRef.current);
  }, [heatmapData, activeLayer, mapReady]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Map overlay gradient at top for navbar blend */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-[400]" />
    </div>
  );
}
