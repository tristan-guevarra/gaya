// auth store (zustand) - manages jwt tokens, user state, and persistence

import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  login: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // hydrate from localstorage on init (client-side only)
  let initialState = {
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    isAuthenticated: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('gaya_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        initialState = {
          user: parsed.user || null,
          accessToken: parsed.accessToken || null,
          refreshToken: parsed.refreshToken || null,
          isAuthenticated: !!parsed.accessToken,
        };
      }
    } catch {
      // ignore parse errors
    }
  }

  return {
    ...initialState,
    isLoading: true,

    setUser: (user) => set({ user }),

    setTokens: (access, refresh) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('gaya_auth', JSON.stringify({
          ...JSON.parse(localStorage.getItem('gaya_auth') || '{}'),
          accessToken: access,
          refreshToken: refresh,
        }));
      }
      set({ accessToken: access, refreshToken: refresh });
    },

    login: (user, access, refresh) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('gaya_auth', JSON.stringify({
          user, accessToken: access, refreshToken: refresh,
        }));
      }
      set({
        user,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gaya_auth');
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),
  };
});

// role-based access helpers

const ROLE_HIERARCHY: Record<string, number> = {
  athlete: 0,
  coach: 1,
  org_admin: 2,
  superadmin: 3,
};

export function hasMinRole(userRole: string | undefined, minRole: string): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minRole] ?? 99);
}

export function isAdmin(user: User | null): boolean {
  return hasMinRole(user?.role, 'org_admin');
}

export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'superadmin';
}
