# Data Room — Investor Data Room

**App:** Gaya — Intelligence Platform
**Route:** `/data-room`

---

## Product

### Purpose
Series B fundraising dashboard presenting investor-grade metrics for due diligence. Consolidates ARR growth, unit economics, TAM/SAM/SOM market sizing, cohort retention, competitive moats, growth levers, and the funding ask into a single shareable view.

### Target Users
Founders sharing metrics with prospective investors; internal leadership preparing for fundraising conversations.

### Key Features
- "CONFIDENTIAL" badge in header with Redact toggle (blurs sensitive figures) and Export PDF / Share Room actions
- Four-tab layout: Overview, Unit Economics, Market & TAM, Growth Levers
- Overview: 6 headline metric cards (ARR, MRR, Active Orgs, NRR, Gross Margin, CAC Payback), MRR growth bar chart with hover tooltips, ARR bridge/waterfall
- Unit Economics: 8 unit econ metric cards, LTV:CAC ratio progression bars (Q1 2025 → Q1 2026), cohort revenue retention heatmap
- Market & TAM: TAM/SAM/SOM concentric bar visualization ($4.2B / $890M / $124M), current market list (5 Canadian cities), expansion pipeline (5 US/UK metros with readiness scores), competitive moats panel
- Growth Levers: 5 growth lever cards with impact rating and confidence %, Series B funding ask breakdown ($15M at $120M pre-money across Engineering, GTM, Expansion, Operations)

### User Flows
1. Toggle Redact on/off before sharing screen with external parties
2. Walk investors through tabs in order: Overview → Unit Economics → Market → Growth
3. Use Export PDF for async sharing; Share Room for controlled access link generation (UI only)

---

## Technical

### Components
- `DataRoomPage` — root page component; all tab content rendered inline

### Imports / Dependencies
- `react`: `useState`, `useMemo`
- `lucide-react`: TrendingUp, DollarSign, Users, Target, Globe, Lock, Shield, Download, Briefcase, Rocket, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
interface MetricCard {
  label: string; value: string; change: string; up: boolean;
  icon: React.ElementType; accent: string; footnote?: string;
}

// ARR waterfall step
{ label: string; value: number; type: 'start' | 'add' | 'sub' | 'end' }

// Monthly ARR series
{ month: string; arr: number }  // arr in $K

// Unit economics entry
{ label: string; value: string; desc: string }

// TAM tier
{ label: 'TAM' | 'SAM' | 'SOM'; value: string; desc: string; width: number }

// Cohort retention row
{ cohort: string; m0: number; m1?: number; m2?: number; m3?: number; m4?: number }

// Growth lever
{ icon: React.ElementType; title: string; desc: string;
  impact: 'High' | 'Medium'; confidence: number }
```

### State Management
- `activeTab` — active tab ('overview' | 'unit-economics' | 'market' | 'growth')
- `isRedacted` — boolean; when true, sensitive values get `blur-sm select-none` classes applied
- `maxArr` — derived constant for MRR chart bar scaling

### UI Patterns
- Redact toggle applies `blur-sm` CSS class directly to value text elements (no conditional rendering)
- MRR chart bars have a hover tooltip (absolute positioned div, opacity controlled by `group-hover`)
- ARR waterfall uses the same floating-bar technique as the Revenue page (absolute positioning within flex column)
- LTV:CAC progression renders bars with `opacity: 0.4` and an absolutely positioned ratio label that tracks the bar end
- Cohort heatmap uses four color tiers: green ≥95%, atlas ≥90%, blue ≥85%, amber <85%
- TAM/SAM/SOM bars are scaled by `width%` property on each tier object
- Competitive moats and funding allocations use `bg-midnight-900/40` glassmorphism cards
