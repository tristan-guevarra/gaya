// centralized http client with jwt refresh and error handling

import { useAuthStore } from './auth';
import type {
  AuthTokens, LoginPayload, RegisterPayload, MapMarker,
  MapFilters, Coach, TrainingEvent, Recommendation, WhatIfRequest,
  WhatIfResult, Lead, HeatmapLayer,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// core fetch wrapper

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(auth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (auth) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // try refresh
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        useAuthStore.getState().logout();
        throw new Error('Session expired');
      }
      throw new Error('RETRY');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  async get<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(auth),
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body?: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(auth),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async patch<T>(path: string, body: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(auth),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(path: string, auth = true): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(auth),
    });
    return this.handleResponse<T>(res);
  }

  private async refreshToken(): Promise<boolean> {
    const { refreshToken, setTokens, logout } = useAuthStore.getState();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        logout();
        return false;
      }
      const data: AuthTokens = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      logout();
      return false;
    }
  }
}

const client = new ApiClient(API_BASE);

// auth endpoints

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<AuthTokens>('/api/v1/auth/login', payload),

  register: (payload: RegisterPayload) =>
    client.post<AuthTokens>('/api/v1/auth/register', payload),

  me: () =>
    client.get<{ user: typeof import('@/types').User }>('/api/v1/auth/me', true),
};

// map / discovery endpoints

export const mapApi = {
  getMarkers: (params: MapFilters & { latitude?: number; longitude?: number }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        searchParams.append(key, String(value));
      }
    });
    return client.get<{ markers: MapMarker[] }>(
      `/api/v1/map/markers?${searchParams.toString()}`
    );
  },

  getHeatmap: (layer: HeatmapLayer) =>
    client.get<GeoJSON.FeatureCollection>(`/api/v1/map/heatmap/${layer}`),

  getCoach: (id: string) =>
    client.get<Coach>(`/api/v1/map/coaches/${id}`),

  getEvent: (id: string) =>
    client.get<TrainingEvent>(`/api/v1/map/events/${id}`),

  submitLead: (lead: Partial<Lead>) =>
    client.post<Lead>('/api/v1/leads', lead),
};

// intelligence endpoints (auth required)

export const intelligenceApi = {
  getMetrics: (params?: { cell_key?: string; date_from?: string; date_to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    return client.get<{ metrics: import('@/types').GeoMetrics[] }>(
      `/api/v1/intelligence/metrics?${searchParams.toString()}`,
      true
    );
  },

  getRecommendations: (limit = 10) =>
    client.get<{ recommendations: Recommendation[] }>(
      `/api/v1/recommendations?limit=${limit}`,
      true
    ),

  whatIf: (request: WhatIfRequest) =>
    client.post<WhatIfResult>('/api/v1/simulator/what-if', request, true),

  regenerateRecommendations: () =>
    client.post<{ status: string }>('/api/v1/recommendations/regenerate', undefined, true),
};

// coach management endpoints

export const coachApi = {
  list: (page = 1, perPage = 20) =>
    client.get<{ items: Coach[]; total: number }>(
      `/api/v1/coaches?page=${page}&per_page=${perPage}`,
      true
    ),

  create: (data: Partial<Coach>) =>
    client.post<Coach>('/api/v1/coaches', data, true),

  update: (id: string, data: Partial<Coach>) =>
    client.patch<Coach>(`/api/v1/coaches/${id}`, data, true),
};

// event management endpoints

export const eventApi = {
  list: (page = 1, perPage = 20) =>
    client.get<{ items: TrainingEvent[]; total: number }>(
      `/api/v1/events?page=${page}&per_page=${perPage}`,
      true
    ),

  create: (data: Partial<TrainingEvent>) =>
    client.post<TrainingEvent>('/api/v1/events', data, true),

  update: (id: string, data: Partial<TrainingEvent>) =>
    client.patch<TrainingEvent>(`/api/v1/events/${id}`, data, true),
};

export { client };
