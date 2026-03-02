# Coach Profile Page — `coaches/[id]`

**App:** Gaya — Intelligence Platform
**Route:** `/coaches/[id]`
**File:** `src/app/coaches/[id]/page.tsx`

---

## Product

### Purpose
A detailed, SEO-friendly profile page for an individual coach. Allows parents, athletes, and recreational players to evaluate a coach before committing to a session or camp.

### Target Users
- Parents researching coaches for youth athletes
- Competitive athletes seeking specialized training
- Adult recreational players looking for skill improvement

### Key Features
- Verified coach identity with badge, rating, and review count
- Five headline stats: rating, review count, hourly rate, response time, and session completion rate
- Specialty tags and multi-language support displayed prominently
- Credential/certification list with visual verification checkmarks
- 7-day weekly schedule grid color-coded by event type (camp / clinic / private)
- Training location list with primary location badge
- Full review panel with star distribution histogram and helpful-vote counts
- Inline events tab listing all upcoming sessions with capacity fill bars and booking CTAs
- Save (heart) and Share actions; sidebar booking CTA with response-time prompt

### User Flows
1. User lands from `/map` → breadcrumb provides back navigation
2. Tabs switch between About, Events, and Reviews without page reload
3. About tab: bio → certifications → weekly schedule → training locations
4. Events tab: card per event with type/skill badges, date, price, capacity bar → "Book Now" or "Join Waitlist"
5. Reviews tab: aggregate rating + distribution → individual review cards with verified badge and helpful count
6. Sidebar: "Request Session" (primary CTA) and "Send Message" at all times regardless of active tab

---

## Technical

### Components Used
| Component | Source | Role |
|-----------|--------|------|
| `Card` | `@/components/ui` | Section containers throughout |
| `Badge` | `@/components/ui` | Event types, skill levels, verification status |
| `Button` | `@/components/ui` | Book Now, Request Session, Send Message |
| `StatCard` | `@/components/ui` | Imported but stats rendered inline |
| `Link` | `next/link` | Breadcrumb back-navigation |

### Key Imports / Dependencies
- `lucide-react` — 20+ icons (MapPin, Star, Shield, Award, Heart, Share2, etc.)
- `@/lib/utils` — `cn`, `formatPrice`, `formatPercent`, `renderStars`, `timeAgo`
- `@/types` — `Coach`, `CoachReview`, `TrainingEvent`, `EventType`
- React `useState`, `useMemo`

### Mock Data Shapes

**Coach (extended)**
```ts
Coach & {
  tagline: string;
  experience_years: number;      // e.g. 12
  athletes_trained: number;      // e.g. 450
  completion_rate: number;       // 0–1 decimal, e.g. 0.96
  response_time: string;         // e.g. "< 2 hours"
  languages: string[];
  social: { instagram?: string; twitter?: string; website?: string };
  // Core Coach fields:
  id, user_id, organization_id: string;
  display_name, bio, tagline, sport: string;
  specialties, certifications: string[];
  rating: number; review_count: number;
  hourly_rate_cents: number;
  verified: boolean;
  locations: { id, coach_id, label, address, latitude, longitude, is_primary }[];
  created_at: string; // ISO 8601
}
```

**CoachReview**
```ts
{
  id, coach_id: string;
  reviewer_name: string;
  rating: number;           // 1–5
  title, body: string;
  verified_booking: boolean;
  helpful_count: number;
  created_at: string;       // ISO 8601
}
```

**TrainingEvent** (events tab)
```ts
{
  id, coach_id, organization_id: string;
  title, description: string;
  event_type: 'camp' | 'clinic' | 'private';
  sport: string;
  skill_levels: string[];
  age_min?: number; age_max?: number;
  latitude, longitude: number;
  address: string;
  capacity, enrolled: number;
  price_cents: number;
  start_date, end_date: string; // ISO 8601
  status: 'published' | 'full';
  created_at: string;
}
```

**Schedule grid**
```ts
Record<string, { time: string; label: string; type: EventType }[]>
// Keys: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
```

**Rating distribution**
```ts
{ stars: number; count: number; pct: number }[]  // pct = 0–1
```

### UI Patterns
- `bg-midnight-950` base; `atlas-500` accent colour throughout
- Sticky tab bar with `backdrop-blur-xl` on scroll
- Event type colour map: camp = blue, clinic = amber, private = purple
- Capacity bar: green → amber (>80% full) → red (full)
- Avatar rendered as initials inside gradient rounded square; verified badge overlaid bottom-right

### State Management
```ts
activeTab: 'about' | 'events' | 'reviews'   // useState — drives tab content
saved: boolean                                // useState — heart/bookmark toggle
expandedReview: string | null                // useState — review expand (declared, not yet wired)
avgRating: string                            // useMemo — computed from RATING_DIST
```
All state is local; no global store or server fetching (mock data only).
