# Event Detail Page — `events/[id]`

**App:** Gaya — Intelligence Platform
**Route:** `/events/[id]`
**File:** `src/app/events/[id]/page.tsx`

---

## Product

### Purpose
A full-detail view for a single training event (camp, clinic, or private session). Gives athletes and parents everything needed to evaluate the event and commit to booking in one screen.

### Target Users
- Parents comparing training programs for youth athletes
- Competitive players evaluating skill-specific camps or clinics
- Coaches/organisations reviewing how their event is presented publicly

### Key Features
- Event type, skill level, and sold-out status badges in the hero
- Live capacity ring (Recharts donut) showing enrolled vs. total spots with colour feedback
- "Almost Full" urgency alert showing recent viewer count when ≤3 spots remain
- Day-by-day agenda embedded in the description; schedule notes card below
- Side-by-side "What's Included" and "What to Bring" panels
- Location card with a direct "Open in Google Maps" link using lat/lng coordinates
- Coach mini-card linking to the full coach profile (`/coaches/[id]`)
- "More from This Coach" related events grid with per-card spot availability colouring
- Save (heart) and Share actions in the hero; sticky booking sidebar card

### User Flows
1. User arrives from `/map` or a coach profile event link → breadcrumb back to Map
2. Hero gives immediate context: event type, dates, location, age range, status
3. User scrolls main column: description → schedule → inclusions/requirements → location → related events
4. Sticky sidebar keeps price, capacity ring, and booking CTA visible throughout scroll
5. If full: primary CTA switches to "Join Waitlist"; urgency banner appears when almost full
6. Coach card in sidebar links to the full coach profile for further evaluation

---

## Technical

### Components Used
| Component | Source | Role |
|-----------|--------|------|
| `Card` | `@/components/ui` | All content section containers |
| `Badge` | `@/components/ui` | Event type, skill level, sold-out, urgency |
| `Button` | `@/components/ui` | Book Now / Join Waitlist, Request Info |
| `CapacityRing` | Local (file-level) | Recharts donut chart showing enrollment |
| `Link` | `next/link` | Breadcrumb, coach card navigation |

### Key Imports / Dependencies
- `recharts` — `PieChart`, `Pie`, `Cell`, `ResponsiveContainer` (capacity ring)
- `lucide-react` — MapPin, Calendar, Clock, Users, Star, Heart, Share2, AlertTriangle, etc.
- `@/lib/utils` — `cn`, `formatPrice`, `formatPercent`, `timeAgo`
- `@/types` — `TrainingEvent`, `Coach`, `EventType`
- React `useState`

### Mock Data Shapes

**TrainingEvent (extended)**
```ts
TrainingEvent & {
  amenities: string[];       // e.g. ['Indoor turf facility', 'Lunch provided']
  requirements: string[];    // e.g. ['Soccer cleats', 'Shin guards']
  schedule_notes: string;    // e.g. "Monday-Friday, 9:00 AM - 4:00 PM ..."
  // Core TrainingEvent fields:
  id, coach_id, organization_id: string;
  title, description: string;
  event_type: 'camp' | 'clinic' | 'private';
  sport: string;
  skill_levels: string[];
  age_min, age_max: number;
  latitude, longitude: number;
  address: string;
  capacity, enrolled: number;
  price_cents: number;
  start_date, end_date: string; // ISO 8601
  status: 'published' | 'full';
  created_at: string;
}
```

**Coach (sidebar card — partial)**
```ts
{
  id, user_id, organization_id: string;
  display_name, bio, sport: string;
  specialties, certifications: string[];
  rating: number; review_count: number;
  hourly_rate_cents: number;
  verified: boolean;
  locations: [];
  created_at: string;
}
```

**Related event (RELATED array)**
```ts
{
  id: string;
  title: string;
  event_type: EventType;
  price_cents: number;
  spots: number;       // remaining spots; 0 = full
  date: string;        // display string, e.g. "Mar 22"
  zone: string;        // venue short name, e.g. "Centennial Park"
}
```

### UI Patterns
- `bg-midnight-950` base; `atlas-500` accent colour throughout
- Capacity ring fill colour: blue (normal) → amber (>85% full) → red (100% full)
- "Almost Full" urgency: amber border banner with `AlertTriangle` icon and social-proof viewer count
- Spot availability text in related events: red = full, amber = 1–3 left, atlas-green = available
- `typeEmoji` map: `{ camp: '🏕️', clinic: '⚡', private: '👤' }` used in badges across page
- Booking card is `sticky top-20` so it persists while the user reads the main column
- Location card generates a live Google Maps URL from `latitude`/`longitude` fields

### Local Sub-component
```tsx
// CapacityRing — renders a Recharts PieChart donut
function CapacityRing({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  // Two segments: filled (enrolled) + empty (remaining)
  // Fill colour driven by pct threshold: >=1 red, >0.85 amber, else blue
  // Centre label shows enrolled count and "of {capacity}"
}
```

### State Management
```ts
saved: boolean          // useState — heart toggle (save event)
showBooking: boolean    // useState — declared, booking modal not yet implemented
```

Derived values computed inline (not in state):
```ts
const spotsLeft = EVENT.capacity - EVENT.enrolled;
const isFull = spotsLeft <= 0;
const isAlmostFull = spotsLeft <= 3 && !isFull;
```

All state is local; no global store or server fetching (mock data only).
