# Cohorts — Cohort Analysis

**App:** Gaya — Intelligence Platform
**Route:** `/cohorts`

---

## Product

### Purpose
Deep behavioral analytics page for understanding user retention, lifetime value by acquisition channel, conversion funnel performance, and behavioral segmentation across the platform's user base.

### Target Users
Growth, product, and data teams analyzing retention trends, funnel drop-offs, and segment-level LTV to guide acquisition and engagement strategy.

### Key Features
- Four-tab layout: Retention, LTV Analysis, Funnel, Segments
- Retention cohort heatmap table (month-over-month, color-coded by retention %)
- Survival curve bar chart for the latest cohort with AI-projected future weeks
- LTV by acquisition channel table with CAC, LTV:CAC ratio, and trend
- AI LTV insight panel with actionable budget reallocation recommendation
- Conversion funnel with proportional bars and step-by-step conversion rates
- Drop-off analysis with suggested fixes and benchmark comparisons
- Behavioral segment cards (Power Users, Regular Parents, Seasonal Users, Tire Kickers, Churned) with LTV and sessions/month
- AI segment opportunity callout

### User Flows
1. Retention tab: identify which cohorts are improving or declining over time
2. LTV tab: compare channel efficiency; read AI recommendation on budget reallocation
3. Funnel tab: spot the biggest drop-off stage and compare against benchmarks
4. Segments tab: understand the composition and value of each behavioral segment

---

## Technical

### Components
- `CohortAnalysisPage` — root page component; all tab content rendered inline

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: BarChart3, TrendingUp, Users, DollarSign, Clock, Target, Sparkles, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
// Retention cohort row
{ month: string; users: number; weeks: number[] }  // weeks[i] = % retained at week i

// LTV by channel
{ channel: string; users: number; ltv: number; cac: number; ratio: number; trend: number }

// Funnel stage
{ stage: string; count: number; rate: number; color: string }

// Behavioral segment
{ name: string; description: string; users: number; pct: number;
  avgLtv: number; avgSessions: number; color: string }
```

### State Management
- `tab` — active tab ('retention' | 'ltv' | 'funnel' | 'segments')
- No additional local state; all data is derived from static mock arrays at render time

### UI Patterns
- Heatmap cells use `getCellColor(value)` to map retention % to Tailwind bg/text classes (6 tiers: green → red)
- Survival curve: actual weeks rendered as solid gradient bars, projected weeks as dashed/translucent
- Funnel bars scaled by `Math.max(rate, 5)%` width with opacity interpolated from rate
- Segment distribution shown as a segmented horizontal pill bar (gradient colors per segment)
- AI insight panels use `bg-purple-500/5 border-purple-500/15` with a `Sparkles` icon header
- LTV:CAC ratio displayed as `∞` when CAC is zero (word of mouth)
