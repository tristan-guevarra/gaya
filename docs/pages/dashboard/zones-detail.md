# Zone Deep-Dive (Detail)

**Route:** `/zones/[id]`
**File:** `src/app/(dashboard)/zones/[id]/page.tsx`

---

## Product

**Purpose:** Comprehensive single-zone analytics page providing deep supply/demand analysis, coach directory, active event listing, and ML-generated insights with actionable recommendations.

**Target users:** Org admins and platform operators making data-driven decisions about where to expand, recruit coaches, and price events within a specific H3 geographic zone.

**Key features:**
- Hero section with zone name, H3 index, opportunity score badge, demand/supply badges, and breadcrumb back to Intelligence
- 6 stat cards across top: Opportunity Score, Demand Index, Supply Index, Active Coaches, Avg Fill Rate, Leads (30d)
- 4-tab layout: Overview, Coaches, Events, Insights
- **Overview:** Supply vs Demand 12-month area chart; Radar comparison chart vs city average (6 axes); Leads vs Bookings bar chart; Event Type Performance breakdown (Camps/Clinics/Private) with fill rate bars and trend
- **Coaches:** Ranked list of coaches in zone with rating, review count, verified badge, event count, fill rate, specialty; "Recruit Coach" CTA card
- **Events:** Active event list with type badge, coach name, date, price, fill %; links to `/events/[id]`
- **Insights:** ML insight cards with confidence scores (ARIMA + Gradient Boosting attribution note); Recommended Actions list with numbered priority and impact/revenue estimates
- Run Simulator and Compare Zone CTAs in hero

**User flow:** Arrive from Intelligence map → read hero stats → Overview tab for trend analysis → Coaches tab to assess supply → Insights tab to review ML recommendations → act (recruit / run simulator / adjust pricing).

---

## Technical

**Components:**
- `ChartTooltip` — custom Recharts tooltip
- `StatCard` — reusable stat tile with icon, value, trend arrow, subtitle
- `Card`, `Badge`, `Button` from `@/components/ui`

**Key imports:**
- `recharts` — AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
- `next/link` — `Link` for coach and event deep-links
- `@/lib/utils` — `cn`, `formatPrice`, `formatPercent`
- `@/types` — none directly; data is locally typed

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `activeTab` | `'overview' \| 'coaches' \| 'events' \| 'insights'` | Active tab |

**Mock data shapes:**
```ts
// ZONE (static object)
{ id, name, h3_index, center: {lat, lng}, population, youth_population,
  area_km2, opportunity_score, demand_index, supply_index, trend,
  top_sport, coaches, events_active, avg_fill_rate, avg_price,
  leads_30d, searches_30d, bookings_30d, conversion_rate,
  underserved_score, coach_density, event_density }

// MONTHLY_METRICS: Array<{ month, demand, supply, leads, bookings, searches, revenue }>
// EVENT_BREAKDOWN: { type, count, fill_rate, avg_price, trend }[]
// ZONE_COACHES: { id, name, rating, reviews, verified, events, fill, specialty }[]
// RADAR_DATA: { metric, zone, city_avg }[]
// INSIGHTS: { type: 'opportunity'|'timing'|'pricing'|'warning', title, desc, confidence }[]
```

**UI patterns:**
- Hero uses `relative overflow-hidden` with gradient + blurred radial glow background
- `StatCard` accepts `trend?: { value: number, label: string }` — positive=atlas ArrowUpRight, negative=red ArrowDownRight
- Radar chart uses two `<Radar>` overlays: solid for zone, dashed for city avg
- Insight type→icon/color mapped via `insightIcons` record
- Coaches list links to `/coaches/[id]` via Next.js `<Link>` wrapping `<Card hover>`
- Events tab links to `/events/[id]` similarly
