// data fetching hooks with tanstack query

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { mapApi, intelligenceApi, coachApi, eventApi } from '@/lib/api';
import type { MapFilters, HeatmapLayer, WhatIfRequest } from '@/types';

// map hooks

export function useMapMarkers(
  filters: MapFilters & { latitude?: number; longitude?: number },
  enabled = true
) {
  return useQuery({
    queryKey: ['map-markers', filters],
    queryFn: () => mapApi.getMarkers(filters),
    enabled,
    staleTime: 30_000,
  });
}

export function useHeatmap(layer: HeatmapLayer | null) {
  return useQuery({
    queryKey: ['heatmap', layer],
    queryFn: () => mapApi.getHeatmap(layer!),
    enabled: !!layer,
    staleTime: 5 * 60_000,
  });
}

export function useCoachDetail(id: string | null) {
  return useQuery({
    queryKey: ['coach', id],
    queryFn: () => mapApi.getCoach(id!),
    enabled: !!id,
  });
}

export function useEventDetail(id: string | null) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => mapApi.getEvent(id!),
    enabled: !!id,
  });
}

// intelligence hooks

export function useGeoMetrics(params?: { cell_key?: string; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: ['geo-metrics', params],
    queryFn: () => intelligenceApi.getMetrics(params),
    staleTime: 60_000,
  });
}

export function useRecommendations(limit = 10) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => intelligenceApi.getRecommendations(limit),
    staleTime: 5 * 60_000,
  });
}

export function useWhatIf() {
  return useMutation({
    mutationFn: (request: WhatIfRequest) => intelligenceApi.whatIf(request),
  });
}

// management hooks

export function useCoaches(page = 1) {
  return useQuery({
    queryKey: ['coaches', page],
    queryFn: () => coachApi.list(page),
    staleTime: 30_000,
  });
}

export function useEvents(page = 1) {
  return useQuery({
    queryKey: ['events', page],
    queryFn: () => eventApi.list(page),
    staleTime: 30_000,
  });
}
