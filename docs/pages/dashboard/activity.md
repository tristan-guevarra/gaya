# Activity — Gaya Intelligence Platform

## Product

**Purpose:** GitHub-style engagement heatmap that visualizes a coach's full year of platform activity — events hosted, leads captured, bookings, and XP earned — alongside a chronological activity timeline.

**Target users:** Individual coaches reviewing their own historical engagement patterns, streaks, and coaching milestones; operators assessing coach consistency.

**Key features:**
- 52-week contribution calendar grid with color intensity driven by daily XP (or switchable to events, leads, bookings)
- Metric toggle: XP / Events / Leads / Bookings — each changes the intensity scale and cell shading
- Hover tooltip on each day cell showing date, event count, lead count, booking count, and XP earned
- Six summary stat cards in the header: Total XP, Events Hosted, Leads Captured, Bookings, Current Streak, Active Days
- Current streak and longest streak displayed beneath the heatmap
- Monthly breakdown bar chart shows the last 6 months with events, leads, and XP per month
- Recent Activity timeline sidebar with event-type icons, descriptions, timestamps, and XP earned per action
- Activity data is procedurally generated to simulate realistic seasonal patterns (summer peaks, winter dips, weekend boosts)

**User flows:**
1. Open Activity; heatmap loads with the XP metric selected by default
2. Hover over any cell to see the day's breakdown in a tooltip
3. Switch the metric toggle to explore the same year colored by events, leads, or bookings
4. Read the Monthly Breakdown chart to identify peak months
5. Review the Recent Activity timeline for the latest individual milestones

---

## Technical

**Component:** `ActivityPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState`, `useMemo` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
interface DayData {
  date: string;  // ISO date string YYYY-MM-DD, or '' for padding cells
  events: number; leads: number; bookings: number; xp: number;
}

interface TimelineItem {
  id: string;
  type: 'event' | 'lead' | 'booking' | 'review' | 'milestone' | 'streak';
  title: string; description: string; timestamp: string;
  xp: number; icon: React.ElementType; accent: string;
}
```

**Mock / generated data:**
- `generateHeatmapData()` — pure function generating 365 `DayData` entries; uses season multipliers (summer 2.5×, winter 0.6×), weekend multiplier (1.3×), and `Math.random()` for daily variation
- `TIMELINE` — 8 static `TimelineItem` entries covering the most recent coaching events

**Internal sub-component:** `HeatmapCalendar`
- Props: `data: DayData[]`, `metric: 'xp' | 'events' | 'leads' | 'bookings'`
- Groups days into `weeks` (arrays of 7) via `useMemo`; pads start to align Sunday
- Derives `months` label list from `weeks` via `useMemo`
- Own state: `hoveredDay: DayData | null`, `tooltipPos: { x, y }` — tooltip uses `fixed` positioning from `getBoundingClientRect()`

**Activity level mapping:**
```ts
function getActivityLevel(xp: number): 0 | 1 | 2 | 3 | 4
// 0 = no activity, 4 = 300+ XP; maps to LEVEL_COLORS (atlas-500/20 → atlas-500/90)
```

**State:**
- `metric` — drives `getValue()` inside `HeatmapCalendar` and the metric toggle buttons
- `heatmapData` — memoized once on mount via `useMemo(() => generateHeatmapData(), [])`

**Derived values (inline on `ActivityPage`):**
- `totalXP`, `totalEvents`, `totalLeads`, `totalBookings`, `activeDays` — summed from `heatmapData`
- `currentStreak` — iterates from end of array while `xp > 0`
- `longestStreak` — single-pass max-streak scan

**UI patterns:**
- Layout: `lg:grid-cols-3`; heatmap + monthly breakdown = `lg:col-span-2`; timeline = `lg:col-span-1`
- Heatmap grid: cells are `w-[10px] h-[10px] rounded-[2px]` with `gap-[2px]`; weeks are flex columns
- Monthly breakdown bar uses inline `width` percentage against `maxXP` for relative scaling
- Tooltip rendered in `HeatmapCalendar` with `fixed` position — no portal needed
