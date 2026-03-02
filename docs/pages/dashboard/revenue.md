# Revenue — Revenue Analytics

**App:** Gaya — Intelligence Platform
**Route:** `/revenue`

---

## Product

### Purpose
Deep-dive revenue analytics dashboard covering MRR composition, cohort revenue retention, revenue attribution by source/zone/type, and a 10-month AI-powered MRR forecast with confidence intervals and scenario modeling.

### Target Users
Leadership, finance, and investor relations teams tracking revenue health, growth drivers, and forward projections.

### Key Features
- Four-tab layout: MRR Waterfall, Cohort Retention, Attribution, Forecast
- MRR bridge/waterfall chart showing new, expansion, reactivation, contraction, and churn contributions
- SaaS quality metrics: Quick Ratio (4.6x), Net Revenue Retention (138%), ARR run rate
- Revenue cohort retention heatmap with color-coded cells (≥96% to <84%)
- Attribution breakdowns: by source (Organic, Referral, Social, etc.), by event type (Camps, Clinics, Private), by geographic zone
- 10-month MRR forecast chart (SVG polyline with confidence band polygon) using ARIMA + XGBoost ensemble
- Conservative / Base / Optimistic scenario cards
- Model assumptions panel

### User Flows
1. Waterfall tab: understand where MRR grew and where it leaked this month
2. Cohorts tab: validate that newer cohorts are retaining better than older ones
3. Attribution tab: identify highest-value revenue sources and top-performing zones
4. Forecast tab: review scenarios and share projections with investors or board

---

## Technical

### Components
- `RevenueAnalyticsPage` — root page component; all tab content rendered inline

### Imports / Dependencies
- `react`: `useState`, `useMemo`
- `lucide-react`: DollarSign, TrendingUp, BarChart3, PieChart, Brain, Sparkles, Layers, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
// Waterfall step
{ label: string; value: number; cumulative: number;
  type: 'neutral' | 'add' | 'sub' | 'total' }

// Cohort row (revenue retention)
{ label: string; size: number; data: number[] }  // data[i] = % at month i

// Attribution by source
{ source: string; revenue: number; pct: number; color: string }

// Attribution by zone
{ zone: string; revenue: number; coaches: number; fill: number; trend: number }

// Attribution by event type
{ type: string; revenue: number; pct: number; count: number; avgPrice: string }

// Forecast arrays (parallel indexed by month)
{ actual: number[]; predicted: number[]; upper: number[]; lower: number[] }
```

### State Management
- `activeTab` — active tab ('waterfall' | 'cohorts' | 'attribution' | 'forecast')

### UI Patterns
- Waterfall bars use absolute positioning within a flex column to float bars at the correct cumulative baseline
- Cohort heatmap cells use `getCohortColor(value)` mapping to six color tiers
- Forecast chart is a raw SVG `viewBox="0 0 600 200"` with a confidence polygon, dashed predicted polyline, and endpoint circles
- Attribution source bar is a segmented horizontal flex strip
- Zone cards are a 3-column grid with trend arrows colored green/red
- Scenario cards center the MRR value in color-coded text (amber / atlas / green)
