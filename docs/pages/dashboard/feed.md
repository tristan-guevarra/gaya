# Feed — Gaya Intelligence Platform

## Product

**Purpose:** Real-time platform-wide activity stream that gives operators a live view of all significant events — leads, bookings, reviews, coach milestones, and system updates — as they occur.

**Target users:** Platform operators and coaches who want live visibility into platform momentum without navigating individual sections.

**Key features:**
- Live / Pause toggle controls whether the feed is treated as actively streaming
- Animated "LIVE" indicator badge when feed is running
- Four summary KPI cards at the top: Leads Today, Bookings Today, Revenue Today, Reviews Today
- Category filter sidebar with item counts for: All Activity, Leads, Bookings, Reviews, Events, Coaches, System
- New activity banner indicates count of unread/unseen items at the top of the feed
- Each feed item shows: icon, title, description, actor avatar initials, timestamp, optional zone badge, and optional revenue amount
- Visual distinction between new items (white card) and historical items (dim card)

**User flows:**
1. Open Feed; live badge pulses and new-item count banner appears at top
2. Click a category in the left sidebar to narrow the stream
3. Click Pause to freeze the feed for review; Resume to continue
4. Scan feed items — zone badge indicates geographic context; green revenue amount highlights financial events

---

## Technical

**Component:** `LiveFeedPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState`, `useEffect` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key type:**
```ts
type Category = 'all' | 'leads' | 'bookings' | 'reviews' | 'events' | 'coaches' | 'system';

interface FeedItem {
  id: string; type: string; category: Category;
  title: string; description: string;
  actor: string; actorAvatar: string; time: string;
  zone?: string; amount?: string;
  icon: React.ElementType; iconColor: string;
  isNew: boolean;
}
```

**Mock data:**
- `feedItems` — 14 items covering all categories; first 4 marked `isNew: true`
- `liveStats` — `{ today: { leads, bookings, revenue, reviews } }` used for KPI cards

**State:**
- `category: Category` — current filter selection
- `isLive: boolean` — controls Pause / Resume button label and badge visibility

**Derived values (inline):**
- `filtered` — `feedItems` filtered by `category`
- `newCount` — count of `isNew: true` items in the full unfiltered list

**UI patterns:**
- Layout: `grid grid-cols-12`; sidebar = `col-span-3`; feed = `col-span-9`
- Category sidebar buttons derive item counts by filtering `feedItems` at render time
- New items styled with `bg-slate-50`; historical items with `bg-midnight-900/40`
- `isNew` dot indicator is a 1.5×1.5 `bg-atlas-500` rounded circle inline with the title
- No actual WebSocket integration — `isLive` is presentational only
