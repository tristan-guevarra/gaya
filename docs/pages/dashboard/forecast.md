# Forecast Page

**Route:** `/forecast`
**Component:** `ForecastPage` (`forecast/page.tsx`)

---

## Product

### Purpose
Revenue forecasting engine giving operators a 6- or 12-month projection with scenario planning, zone-level revenue breakdown, event-type revenue split, and a full booking conversion funnel.

### Target Users
Operators, founders, and finance stakeholders who need forward-looking revenue visibility and funnel diagnostics.

### Key Features
- **4 KPI stat cards** — YTD Revenue, Projected Annual, Avg Monthly, Dec Projection (all derived from `adjustedForecast`)
- **Main forecast chart** — `ComposedChart` with actual revenue (filled area + dots), predicted line (dashed), and upper/lower confidence band (gradient fill area). A `ReferenceLine` marks "Now". Scenario and time-range controls update the chart live
- **Scenario selector** — Conservative (×0.75), Base (×1.0), Aggressive (×1.35); multipliers applied to all predicted/bound values via `useMemo`
- **Time range toggle** — 6 Months / 12 Months; slices the forecast array
- **Zone Revenue list** — 8 zones ranked by revenue with gradient fill bars, growth % badges, and per-zone bookings / avg ticket / fill rate
- **Revenue by Event Type** — 3 bars for Camps (42%), Clinics (33%), Private (25%) with color-coded progress bars
- **Conversion Funnel** — 5-stage funnel (Map Views → Listing Views → Lead Submitted → Booking Created → Completed) with relative width bars and step-over-step conversion rates. ML insight callout at the bottom

### User Flows
1. Check KPI stat cards for financial health at a glance
2. Toggle scenario and time range to explore upside/downside
3. Hover chart to inspect monthly actuals vs predictions with confidence bands
4. Scroll to zone revenue to identify top and fastest-growing areas
5. Review the funnel to spot drop-off points and read the ML insight

---

## Technical

### Components Used
`Card`, `Badge`, `Button`, `StatCard` from `@/components/ui`; custom `ForecastTooltip`

### Imports / Dependencies
- `recharts`: `AreaChart`, `Area`, `BarChart`, `Bar`, `LineChart`, `Line`, `ComposedChart`, `ReferenceLine`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `Cell`
- `react`: `useState`, `useMemo`
- `lucide-react`: `TrendingUp`, `DollarSign`, `Calendar`, `Target`, `Zap`, `ArrowUpRight`, `ArrowDownRight`, `BarChart3`, `Brain`, `Layers`, `Globe`, `ChevronDown`, `Sparkles`, `PieChart`
- `@/lib/utils`: `cn`, `formatPrice`

### Mock Data Shapes
```ts
FORECAST_DATA[]: {
  month: string, actual?: number, predicted: number,
  lower_bound: number, upper_bound: number,
  isProjected: boolean
}  // 12 items; actual only present for months <= CURRENT_MONTH

ZONE_REVENUE[]: {
  zone, revenue, bookings, avg_ticket,
  growth: number, fill_rate: number
}  // 8 zones, sorted descending by revenue

FUNNEL[]: { stage: string, count: number, color: string }  // 5 stages

MONTHLY_BREAKDOWN[]: { type: string, revenue: number, pct: number, color: string }  // 3 event types

SCENARIO_MULTIPLIERS: Record<'base'|'aggressive'|'conservative', number>
```

### State Management
- `scenario: 'base'|'aggressive'|'conservative'` — multiplier applied to all forecast values
- `timeRange: '6m'|'12m'` — slices `adjustedForecast` to 6 or 12 entries
- `adjustedForecast` — `useMemo` recomputes on scenario/timeRange change; also derives 4 top-stat values inline

### UI Patterns
- `ComposedChart` mixing `Area` (confidence band via upper/lower fields), `Area` (actual), `Line` (predicted dashed)
- `ForecastTooltip` filters out `upper_bound`/`lower_bound` keys from rendered tooltip rows
- Zone revenue bars use gradient classes tied to rank index (atlas for #1, blue for #2, purple for top 4, muted otherwise)
- Model attribution line: "ARIMA + Gradient Boosting ensemble · R² = 0.91"
