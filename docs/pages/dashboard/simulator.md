# Simulator Page

**Route:** `/simulator`
**Component:** `SimulatorPage` (`simulator/page.tsx`)

---

## Product

### Purpose
Interactive what-if tool that lets operators configure a hypothetical event (location, type, capacity, price) and receive ML-powered fill rate predictions with explainability breakdowns.

### Target Users
Operators and coaches planning where and how to launch new events; also useful for pricing experiments before committing to a listing.

### Key Features
- **Location picker** — 8 preset GTA locations (grid of toggle buttons); displays lat/lng in a monospace readout
- **Event type selector** — Camp / Clinic / Private toggle buttons using `getEventTypeInfo` for icons and labels
- **Capacity slider** — Range 1–50; live display of selected value
- **Price slider** — Range $20–$500 (stored as cents, 2000–50000); live display via `formatPrice`
- **"Run Prediction" button** — Triggers a 1.2-second simulated API call and populates results panel
- **Empty state** — Illustrated prompt with feature callouts (H3 cell analysis, gradient boosting, seasonality aware)
- **Loading state** — Spinning ring with `Brain` icon and descriptive message
- **Results panel:**
  - 4 stat cards: Predicted Fill, Est. Signups (x/capacity), Est. Revenue, Confidence
  - `GaugeChart` — custom semi-circular `PieChart` (start 210°, end -30°) colored green/amber/red by threshold
  - Recommendation text block — color-coded by fill rate tier (>70% = atlas, >50% = amber, else red)
  - Scenario summary: Location, Type, Price
  - Feature Importance bars — sorted by impact, gradient-colored by magnitude
- **Reset button** — Clears results and returns to empty state

### User Flows
1. Select a preset location → choose event type → drag capacity and price sliders
2. Click "Run Prediction" → watch loading animation
3. Read fill rate gauge and recommendation text
4. Review feature importance bars to understand which factors dominate
5. Adjust parameters → re-run to compare scenarios
6. Click "Reset" to start fresh

---

## Technical

### Components Used
`Card`, `Badge`, `Button`, `Input`, `Select`, `Spinner`, `StatCard` from `@/components/ui`; custom `GaugeChart`

### Imports / Dependencies
- `recharts`: `PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`
- `react`: `useState`, `useCallback`
- `next/dynamic` (imported)
- `lucide-react`: `FlaskConical`, `MapPin`, `Crosshair`, `Zap`, `TrendingUp`, `DollarSign`, `Users`, `Target`, `Brain`, `Sparkles`, `RotateCcw`, `Download`, `ArrowRight`
- `@/lib/utils`: `cn`, `formatPrice`, `formatPercent`, `confidenceLabel`, `getEventTypeInfo`
- `@/types`: `EventType`, `WhatIfResult`

### Mock Data Shapes
```ts
// Input state
{ latitude, longitude, locationLabel, eventType: EventType, capacity: number, price: number (cents) }

// WhatIfResult (returned by simulatePrediction())
{
  predicted_fill_rate: number,
  confidence: number,
  predicted_signups: number,
  predicted_revenue_cents: number,
  factors: { factor: string, impact: number, description: string }[],
  recommendation: string
}

presetLocations[]: { label: string, lat: number, lng: number }  // 8 items
```

### State Management
- `eventType`, `capacity`, `price`, `latitude`, `longitude`, `locationLabel` — controlled form inputs
- `result: WhatIfResult | null` — prediction output
- `isSimulating: boolean` — loading state for button and panel display
- `hasRun: boolean` — gates between empty / loading / results panel render

### UI Patterns
- Three-state results panel: empty → loading → results (conditional render on `!hasRun && !isSimulating`, `isSimulating`, `result`)
- `GaugeChart` is a self-contained component: takes `value` (0–1) and `size`; renders a `PieChart` with a centered absolute-positioned text overlay
- 12-column grid: 4-col input panel + 8-col results panel
- `simulatePrediction` function lives client-side and mimics ML model behavior; in production it calls `POST /api/v1/simulator/what-if`
- Feature importance bars use `style={{ width: Math.min(factor.impact * 300, 100) + '%' }}` to scale the impact value into a 0–100% bar width
