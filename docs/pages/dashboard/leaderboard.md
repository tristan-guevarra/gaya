# Leaderboard — Gaya Intelligence Platform

## Product

**Purpose:** Gamified coach ranking system that motivates engagement and performance through XP accumulation, tier progression, achievement badges, and public rankings.

**Target users:** Coaches competing for visibility and status on the platform; platform operators monitoring coach engagement.

**Key features:**
- Three tabs: Rankings, Achievements, Tier System
- Rankings tab: top-3 podium display with gold/silver/bronze styling, plus a full sortable table with rank delta indicators
- Table columns: Rank, Coach (with tier gradient avatar and emoji badges), Tier badge, Level, XP, Rating, Fill %, Streak, Weekly XP sparkline
- Time range selector: Week / Month / All Time (UI only; data is static)
- Achievements tab: grid of 8 achievement cards with rarity tiers (Common / Rare / Epic / Legendary), unlock state, progress bars, and XP rewards
- Tier System tab: five tier cards (Bronze → Silver → Gold → Diamond → Legend) with XP thresholds, level ranges, and a progress bar to the next milestone
- XP Earning Guide shows the six ways to earn XP with per-action values

**User flows:**
1. Open Leaderboard; Rankings tab shown by default with the podium and table
2. Change time range (Week / Month / All Time) to compare different periods
3. Switch to Achievements to track personal badge progress and see locked achievements
4. Switch to Tier System to understand tier thresholds and review the XP earning guide

---

## Technical

**Component:** `LeaderboardPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState` from React
- `next/link` — `Link` (imported but not actively used in rendered output)
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
interface Coach {
  id: string; name: string; initials: string; title: string; zone: string;
  xp: number; level: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';
  rank: number; previousRank: number;
  rating: number; reviews: number; fillRate: number;
  eventsThisMonth: number; streak: number;
  badges: string[]; weeklyXP: number[];
}

interface Achievement {
  id: string; name: string; description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number; progress?: number; total?: number; unlocked: boolean;
}
```

**Mock data:**
- `COACHES` — 8 coaches with full stats; tiers range from Silver to Legend
- `ACHIEVEMENTS` — 8 items; 4 unlocked, 4 in-progress
- `TIER_CONFIG` — constant lookup object mapping tier key to label, colors, icon, XP minimum, and gradient

**Internal sub-components:**
- `RankDelta` — renders an up/down/neutral indicator from `current` and `previous` rank numbers
- `SparkLine` — SVG polyline rendering 7-day XP trend; uses `min/max` normalization

**State:**
- `activeTab: 'rankings' | 'achievements' | 'tiers'`
- `timeRange: 'week' | 'month' | 'alltime'` — UI only; does not filter mock data

**UI patterns:**
- Podium renders `[COACHES[1], COACHES[0], COACHES[2]]` (2nd, 1st, 3rd visual order)
- Table rows use `grid grid-cols-12` layout per row
- Achievement rarity drives border, background, and label color via `RARITY_STYLES` and `RARITY_LABELS` lookup objects
- Tier System current tier is hard-coded to `'legend'` for the demo profile
