# Intelligence Page

**Route:** `/intelligence`
**Component:** `IntelligencePage` (`intelligence/page.tsx`)

---

## Product

### Purpose
Admin-facing geo analytics dashboard that surfaces supply-vs-demand imbalances, ecosystem health, and ML-ranked expansion opportunities across the GTA market.

### Target Users
Internal operators and admins who need a single-pane view of market performance and where to direct growth efforts.

### Key Features
- **5 KPI stat cards** — Coaches, Events, Leads, Avg Fill Rate, Bookings (each with trend indicators)
- **Supply vs Demand area chart** — 30-day rolling time-series with supply, demand, and leads series
- **Ecosystem Health radar chart** — Current vs expansion potential across 6 dimensions (Supply, Demand, Conversion, Coverage, Retention, Growth)
- **Supply-Demand Gap bar chart** — Horizontal grouped bars by zone; highlights 3 critical gap zones
- **AI Expansion Recommendations** — Ranked list of 5 zones with predicted fill rate, opportunity score, and event type. Selecting a card shows a detailed factor breakdown panel with animated progress bars, best day/time, and confidence score
- **Regenerate button** — Simulates an async data refresh (2-second delay)

### User Flows
1. Land on page → scan KPI stats → identify high-level trends
2. Read Supply vs Demand chart to spot demand spikes
3. Check radar chart to assess ecosystem health vs potential
4. Scan the zone gap bar chart for the worst-performing areas
5. Click a recommendation card → review factor breakdown → click "Launch Event Here" or "Simulate"

---

## Technical

### Components Used
`Card`, `Badge`, `Button`, `StatCard`, `Spinner` from `@/components/ui`; custom `CustomTooltip`

### Imports / Dependencies
- `recharts`: `BarChart`, `Bar`, `LineChart`, `Line`, `AreaChart`, `Area`, `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Cell`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`
- `next/dynamic` (imported but not used in current code)
- `lucide-react`: `BarChart3`, `TrendingUp`, `MapPin`, `Users`, `Zap`, `Brain`, `RefreshCw`, `Target`, `Activity`, `Flame`, `AlertTriangle`
- `@/lib/utils`: `cn`, `formatPercent`, `confidenceLabel`, `getEventTypeInfo`

### Mock Data Shapes
```ts
MOCK_STATS: { total_coaches, total_events, total_leads, total_bookings, avg_fill_rate, revenue_this_month, coaches_trend, events_trend, leads_trend }

DEMAND_TIMESERIES[]: { date: string, demand: number, supply: number, leads: number }  // 30 items

ZONE_METRICS[]: { zone: string, supply: number, demand: number, gap: number, conversion: number }  // 8 zones

RECOMMENDATIONS[]: {
  id, rank, area_name, recommended_event_type: 'camp'|'clinic'|'private',
  predicted_fill_rate, confidence, opportunity_score,
  recommended_day, recommended_time, latitude, longitude,
  explanation: { factor, impact, description }[]
}  // 5 items

RADAR_DATA[]: { metric: string, current: number, potential: number }  // 6 metrics
```

### State Management
- `selectedRec` — currently active recommendation card (defaults to rank #1)
- `refreshing` — boolean for button loading state, toggled by a 2-second `setTimeout`

### UI Patterns
- Master-detail layout: recommendation list (2 cols) + sticky detail panel (3 cols)
- Color-coded confidence badges: High = success, Medium = warning, Low = danger
- Rank badge coloring: #1 = atlas, #2 = blue, #3+ = muted
- Animated gradient progress bars for factor breakdown
- SVG gradient fills on area charts via `<defs>` / `<linearGradient>`
