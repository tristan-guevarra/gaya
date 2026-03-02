# Season Planner — Gaya Intelligence Platform

## Product

**Purpose:** Multi-month visual programming tool for planning an entire sporting season — allocating events across zones, tracking capacity and revenue projections, and managing scheduling conflicts with AI assistance.

**Target users:** Platform operators and head coaches planning a full season (e.g., Spring 2025: 13 weeks) across multiple geographic zones.

**Key features:**
- Gantt-style timeline grid with one row per event (Timeline view) or one row per zone (By Zone view)
- Color-coded event bars span their start week through their duration, proportionally scaled to the season
- Five summary KPI cards: Total Events, Total Capacity, Projected Revenue, Avg Fill Rate, Active Zones
- Season phase strip: Pre-Season → Launch → Peak Season → Wind Down (with week ranges)
- Click any event bar to open an inline detail panel with duration, capacity, price, projected fill, and estimated revenue
- AI Season Optimization panel surfaces three contextual tips (gap detection, conflict resolution, revenue growth)
- Event status badges: `planned` / `confirmed` / `active` / `completed`

**User flows:**
1. Open Season Planner; review the 13-week timeline for the current season
2. Toggle between Timeline and By Zone view modes using the segmented control
3. Click an event bar to see its detail panel below the grid
4. Review AI optimization tips and act on them (Add Event / Resolve / Explore)
5. Click Add Event to schedule a new event into the season

---

## Technical

**Component:** `SeasonPlannerPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface SeasonEvent {
  id: string; title: string;
  type: 'camp' | 'clinic' | 'private' | 'tournament';
  zone: string; startWeek: number; duration: number;
  capacity: number; price: number; projectedFill: number;
  status: 'planned' | 'confirmed' | 'active' | 'completed';
  coach: string; color: string;
}

interface SeasonPhase {
  name: string; weeks: [number, number];
  description: string; icon: React.ElementType;
}
```

**Mock data:**
- `seasonConfig` — Spring 2025 config with 4 named phases and 13 total weeks
- `events` — 8 `SeasonEvent` items across 6 zones
- `zones` — 6 zone name strings used for the By Zone rows

**State:**
- `selectedEvent: SeasonEvent | null` — drives the inline detail panel beneath the grid
- `viewMode: 'timeline' | 'zone'` — switches row grouping in the Gantt grid

**Derived values (inline):**
- `totalCapacity`, `projectedRevenue`, `avgFill` — computed from `events` array on each render
- Event bar position and width: `left: ((startWeek - 1) / totalWeeks) * 100%`, `width: (duration / totalWeeks) * 100%`

**UI patterns:**
- Timeline grid uses a flex row with a fixed `w-48` label column and `flex-1` week columns
- Event bars are `absolute` positioned inside the week track area
- In Zone view, multiple bars can overlap in the same row using `absolute` stacking
- Phase strip labels are derived from `seasonConfig.phases` and rendered with their icon component
