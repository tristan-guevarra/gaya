# Pulse — Real-Time Command Center

**Route:** `/pulse`
**File:** `src/app/(dashboard)/pulse/page.tsx`

---

## Product

**Purpose:** Live activity monitoring dashboard that streams platform events in real time, displays system health, and surfaces active alerts — the operational heartbeat of the platform.

**Target users:** Platform operators and admins who need situational awareness across all zones, coaches, bookings, and leads.

**Key features:**
- Auto-generating activity feed (new event every 3–7s via `setInterval`) with pause/resume control
- 9 activity types: booking_created, lead_submitted, event_published, coach_joined, review_posted, milestone_reached, alert_triggered, recommendation_generated, zone_status_change
- Feed filter bar: All / Alerts / Bookings / Leads
- "N new events" floating badge to scroll back to top
- 4 live metric cards with sparkline area charts: Bookings Today, New Leads, Avg Fill Rate, Revenue Today
- System health panel: 6 services (API, PostgreSQL, Redis, Celery, ML Pipeline, Tile Server) with latency, uptime %, and status dots
- Zone activity heat bar chart: relative event count per zone in current feed
- Active alerts panel: warning/critical severity events

**User flow:** Page loads with 25 seeded events → feed auto-appends → filter by category → pause to review → monitor system health on right panel.

---

## Technical

**Components:**
- `Sparkline` — inline Recharts AreaChart wrapper
- `Card`, `Badge`, `Button`, `StatCard` from `@/components/ui`

**Key imports:**
- `recharts` — AreaChart, Area, BarChart, Bar, ResponsiveContainer
- `@/lib/utils` — `cn`, `formatPrice`, `timeAgo`
- `@/types` — `ActivityItem`, `ActivityType`, `SystemHealth`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `activities` | `ActivityItem[]` | Live feed buffer (max 100 items) |
| `isPaused` | `boolean` | Pause/resume feed interval |
| `filter` | `'all' \| 'alerts' \| 'bookings' \| 'leads'` | Active feed filter |
| `newCount` | `number` | Unseen events badge count |

**Key effects:**
- `useEffect` with `setInterval` (3–7s random) appends generated activities when not paused
- `useMemo` for sparkline data, zone heat map, and filtered feed (avoids re-computation on every render)
- `useRef(feedRef)` used to imperatively scroll feed to top

**Mock data shapes:**
```ts
// SystemHealth (from @/types)
{ service: string; status: 'healthy'|'degraded'|'down';
  latency_ms: number; uptime_percent: number;
  last_check: string; details?: string }

// ActivityItem (from @/types)
{ id: string; type: ActivityType; title: string; description: string;
  metadata: {}; actor_name: string; zone: string;
  severity: 'success'|'info'|'warning'|'critical'; created_at: string }
```

**UI patterns:**
- 7/5 column grid: feed left, health + zone heat + alerts right
- Warning activities get `bg-amber-500/[0.02] border-amber-500/10` row tint
- Newest feed item gets `animate-slide-up` CSS animation
- System health status mapped to color via `healthy→atlas`, `degraded→amber`, `down→red`
