# Landscape Page

**Route:** `/landscape`
**Component:** `LandscapePage` (`landscape/page.tsx`)

---

## Product

### Purpose
Competitive landscape analyzer providing zone-vs-zone benchmarking, supply-demand scatter plot positioning, sortable opportunity rankings, and a radar chart comparison between any two selected zones.

### Target Users
Ops and strategy teams identifying where to expand, compete, or defend within the GTA market.

### Key Features
- **Opportunity Matrix (scatter plot)** — Supply Index (x-axis) vs Demand Index (y-axis); bubble size encodes opportunity score; color encodes trend (rising = blue, stable = atlas, declining = red). Four quadrant labels overlaid via absolute-positioned divs (High Demand Low Supply, Competitive, Emerging, Oversaturated)
- **Zone Rankings list** — Sortable by Opportunity Score, Demand Index, or Fill Rate. Each row shows zone name, trend icon, top event type badge, coach density, avg fill, avg price, and the active sort metric value. Top zone gets a Crown icon
- **Click-to-compare** — First click selects a zone; second click sets a compare zone; third click resets. Clicking the already-selected zone is a no-op
- **Radar comparison chart** — Normalized 0–100 comparison across 6 metrics (Demand, Supply, Fill Rate, Coach Density, Event Density, Opportunity). Single zone or overlaid dual-zone
- **Zone Profile stats** — Side-by-side stat list with optional compare column and directional color (atlas = compare is higher, red = compare is lower)
- **ML Recommendation callout** — Contextual text based on the selected zone's opportunity score tier (≥85: prime expansion, ≥70: differentiate, <70: niche or adjacent zone)
- **Empty state** — Shown in comparison panel when no zone is selected

### User Flows
1. Read scatter plot quadrants to get high-level positioning at a glance
2. Click a bubble or row to select a zone
3. Click a second zone to activate side-by-side comparison
4. Read radar chart and zone profile stats for detailed benchmarking
5. Read ML recommendation to inform next action
6. Toggle sort key to re-rank zones by different criteria

---

## Technical

### Components Used
`Card`, `Badge`, `Button`, `StatCard` from `@/components/ui`; custom `ScatterTooltip`; local `TrendIcon` component

### Imports / Dependencies
- `recharts`: `ScatterChart`, `Scatter`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `Cell`, `ZAxis`, `BarChart`, `Bar`, `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`
- `react`: `useState`, `useMemo`
- `lucide-react`: `Globe`, `Crosshair`, `TrendingUp`, `TrendingDown`, `Minus`, `ArrowUpRight`, `ArrowDownRight`, `BarChart3`, `Target`, `Users`, `MapPin`, `Zap`, `Brain`, `Layers`, `ArrowRight`, `Crown`, `Shield`
- `@/lib/utils`: `cn`, `formatPrice`, `formatPercent`
- `@/types`: `ZoneBenchmark`, `EventType`

### Mock Data Shapes
```ts
ZoneBenchmark: {
  zone: string, latitude, longitude,
  coach_density: number,   // per km²
  event_density: number,   // per km²
  avg_price: number,       // cents
  avg_fill_rate: number,   // 0-1
  demand_index: number,    // 0-100
  supply_index: number,    // 0-100
  opportunity_score: number, // 0-100
  trend: 'rising'|'stable'|'declining',
  top_event_type: 'camp'|'clinic'|'private'
}  // 10 zones

trendColors: Record<'rising'|'stable'|'declining', string>
```

### State Management
- `selectedZone: ZoneBenchmark | null` — primary selected zone
- `compareZone: ZoneBenchmark | null` — optional second zone for radar comparison
- `sortBy: 'opportunity_score'|'demand_index'|'avg_fill_rate'` — drives `sorted` memo
- `sorted` — `useMemo` sort of `ZONES` by `sortBy` descending
- `radarData` — `useMemo` normalizes selected/compare zone metrics to 0–100 scale using `maxVals`

### UI Patterns
- `ZAxis` on scatter chart encodes `opportunity_score` to bubble size range `[100, 600]`
- Quadrant labels implemented as absolute-positioned text divs overlaid on the `ResponsiveContainer` wrapper
- Compare selection logic: 3-state click handler (select → compare → reset) using `onClick` on zone rows
- `ScatterTooltip` reads `payload[0].payload` to display all zone fields
- 12-column grid: 7-col zone rankings + 5-col comparison panel
