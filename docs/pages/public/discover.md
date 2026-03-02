# Discover Page — `src/app/(public)/discover/page.tsx`

**Route:** `/discover`

---

## Product

### Purpose
Swipeable card-based training discovery feed — a gesture-driven alternative to the
map for athletes who want a curated, opinionated browse experience. Described in
source as "Tinder meets ClassPass for youth sports training."

### Target Users
- Athletes and parents casually exploring training options without a specific location
  in mind, preferring a card-at-a-time browsing flow

### Key Features
- Stacked swipe cards: swipe right to save, swipe left to skip; 120 px drag threshold
- Three visible cards rendered simultaneously (top card interactive, two behind at
  0.95 scale / 0.6 opacity for depth)
- SKIP / SAVE overlay labels appear during active drag
- Type filter pills: All / Camp / Clinic / Private
- Saved list view toggled by bookmark button; shows count badge
- Action button row: X (skip), Send (request info), Heart (save)
- Session stats bar: saved count, skipped count, remaining in stack
- Stack auto-refills with shuffled cards when exhausted
- Link to `/map` for full map view

### User Flows
1. User lands → swipes right on a card → card added to saved list
2. User swipes left → card removed, skipped counter increments
3. User taps bookmark icon → view switches to saved list → taps card → `/events/:id`
4. User taps a filter pill → `filteredStack` narrows to that event type
5. Stack empties → cards re-shuffled and re-displayed automatically

---

## Technical

### Components Used
| Component | Source |
|-----------|--------|
| `SwipeCard` | Inline — pointer-event drag engine + full card UI |
| `Card`, `Badge`, `Button` | `@/components/ui` (imported, not used directly in JSX) |

### Imports / Dependencies
- `next/link` — navigation to `/map` and `/events/:id`
- `lucide-react` — MapPin, Calendar, Clock, Users, Star, Heart, X, Bookmark, BadgeCheck, etc.
- `@/lib/utils` — `cn`, `formatPrice` (converts `price_cents` to display string)
- `@/types` — `EventType`

### Mock Data Shape (`DiscoverCard`)
```ts
interface DiscoverCard {
  id: string;
  title: string;
  coach_name: string;
  coach_verified: boolean;
  coach_rating: number;        // e.g. 4.9
  coach_reviews: number;
  event_type: 'camp' | 'clinic' | 'private';
  sport: string;
  skill_levels: string[];
  age_min: number;
  age_max: number;
  price_cents: number;
  capacity: number;
  enrolled: number;
  address: string;
  zone: string;
  distance_km: number;
  date_str: string;            // e.g. "Apr 14–18" or "Flexible"
  time_str: string;
  tags: string[];              // e.g. ["Indoor Turf", "Video Analysis"]
  gradient: string;            // Tailwind gradient classes for card header
  emoji: string;               // Decorative emoji overlay
}
```
Six hardcoded `CARDS` entries covering spring camp, technical clinic, private 1-on-1,
goalkeeper masterclass, summer camp, and speed/agility clinic.

### State Management
| State | Type | Purpose |
|-------|------|---------|
| `stack` | `DiscoverCard[]` | Ordered card queue; top element is active |
| `saved` | `DiscoverCard[]` | Cards swiped right |
| `skipped` | `number` | Running count of left-swipes |
| `showSaved` | `boolean` | Toggles between card stack and saved list views |
| `filter` | `EventType \| 'all'` | Drives `filteredStack` derived value |

### UI Patterns
- `SwipeCard` uses `useRef<HTMLDivElement>` + `setPointerCapture` for smooth
  cross-device drag; vertical drag attenuated by 0.3x
- Rotation: `dragX * 0.05` degrees; opacity fades toward 0 as card travels 400 px
- Exit animation: CSS classes `animate-swipe-left` / `animate-swipe-right` applied
  on release; `onSwipe` callback fires after 300 ms delay
- Card header height is fixed at `h-44` with a `bg-gradient-to-br` derived from
  `card.gradient` and an overlay `bg-gradient-to-t from-midnight-900`
- `fillPct` displayed as `Math.round((enrolled / capacity) * 100)%` in info grid
- Price label suffix varies by type: `/hr` (private), `/week` (camp), `/session` (clinic)
- `typeConfig` maps event type to colour classes and emoji label used for both filter
  pills and card type badge
