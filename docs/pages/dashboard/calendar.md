# Calendar — Gaya Intelligence Platform

## Product

**Purpose:** AI-powered weekly scheduling interface that helps coaches and operators plan events with awareness of real-time demand patterns, scheduling conflicts, and revenue potential.

**Target users:** Coaches and platform operators managing event schedules across multiple zones.

**Key features:**
- Full weekly grid calendar (Mon–Sun, 6 AM–9 PM in 1-hour rows)
- Demand heatmap overlay shows unmet demand intensity per time slot using atlas-green opacity gradients
- AI Suggestions sidebar recommends event types, zones, and time slots with predicted fill rate and estimated revenue
- Conflict detection — overlapping coach assignments are visually flagged with a pulsing red ring and `AlertTriangle` icon
- Week navigation (previous / today / next) with dynamic date calculation
- Coach filter to isolate a single coach's schedule
- Event detail modal on click showing type, coach, zone, schedule, fill-rate, and conflict resolution message

**User flows:**
1. Open calendar; default week shown with demand overlay active and AI suggestions panel open
2. Toggle Demand overlay to reveal/hide heatmap; toggle AI Suggest to show/hide sidebar
3. Filter by coach using the dropdown to focus on one schedule
4. Navigate weeks with chevron buttons or click Today
5. Click any event block to open the detail modal; use Edit or View Full Details

---

## Technical

**Component:** `SmartCalendarPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState`, `useMemo`, `useRef` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
interface CalEvent {
  id: string; title: string; coach: string; coachInitials: string;
  zone: string; day: number; startHour: number; duration: number;
  type: 'camp' | 'clinic' | 'private';
  filled: number; capacity: number; color: string; conflict?: boolean;
}

interface AISuggestion {
  title: string; zone: string; day: string; time: string;
  type: 'camp' | 'clinic' | 'private';
  predictedFill: number; revenue: string; reason: string;
}
```

**Mock data:**
- `EVENTS` — 11 `CalEvent` items across all 7 days; one flagged `conflict: true`
- `AI_SUGGESTIONS` — 3 items with zone, predicted fill %, estimated revenue, and reasoning text
- `DEMAND_OVERLAY` — array of `{ day, hour, intensity }` objects used to tint grid cells

**State:**
- `showDemand`, `showAI` — boolean toggles
- `selectedEvent: CalEvent | null` — drives the detail modal
- `filterCoach: string` — `'all'` or a specific coach name; filtered via `useMemo`
- `weekOffset: number` — integer offset from base date `Mar 2, 2026`

**UI patterns:**
- Calendar grid: `grid-cols-[60px_repeat(7,1fr)]`; each hour row is `h-14` (56px); event bars use absolute positioning with `height: duration * 56 - 4px`
- Demand intensity maps to Tailwind opacity classes at render time
- Modal uses `fixed inset-0` backdrop with `stopPropagation` on the inner card
- `useMemo` for coach list deduplication and filtered events
