// utility functions

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** merge tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** format cents to currency string */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** format large numbers */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** format percentage */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** format date */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** format relative time */
export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

/** get event type display info */
export function getEventTypeInfo(type: string) {
  const map: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    camp: { label: 'Camp', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '⛺' },
    clinic: { label: 'Clinic', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: '🏥' },
    private: { label: 'Private', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: '👤' },
  };
  return map[type] || { label: type, color: 'text-gray-400', bg: 'bg-gray-400/10', icon: '📍' };
}

/** get skill level display info */
export function getSkillInfo(level: string) {
  const map: Record<string, { label: string; color: string }> = {
    beginner: { label: 'Beginner', color: 'text-green-400' },
    intermediate: { label: 'Intermediate', color: 'text-yellow-400' },
    advanced: { label: 'Advanced', color: 'text-orange-400' },
    elite: { label: 'Elite', color: 'text-red-400' },
  };
  return map[level] || { label: level, color: 'text-gray-400' };
}

/** generate star rating display */
export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/** truncate text */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

/** debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** generate shareable url with current filters */
export function buildShareUrl(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, String(value));
    }
  });
  return `${window.location.origin}/map?${params.toString()}`;
}

/** score to color mapping for heatmap-style displays */
export function scoreToColor(score: number, max: number = 1): string {
  const normalized = Math.min(score / max, 1);
  if (normalized < 0.25) return 'rgba(0, 55, 37, 0.7)';
  if (normalized < 0.5) return 'rgba(0, 230, 152, 0.5)';
  if (normalized < 0.75) return 'rgba(255, 184, 77, 0.6)';
  return 'rgba(255, 77, 106, 0.7)';
}

/** confidence level label */
export function confidenceLabel(confidence: number): { label: string; color: string } {
  if (confidence >= 0.8) return { label: 'High', color: 'text-atlas-500' };
  if (confidence >= 0.5) return { label: 'Medium', color: 'text-amber-400' };
  return { label: 'Low', color: 'text-red-400' };
}
