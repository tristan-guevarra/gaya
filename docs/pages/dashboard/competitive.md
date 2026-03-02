# Competitive Intelligence Page

**Route:** `/competitive`
**Component:** `CompetitiveIntelPage` (`competitive/page.tsx`)

---

## Product

### Purpose
Tracks competitors in the GTA youth soccer training market — monitoring their market share, feature coverage, pricing positioning, and strategic moats — to inform Gaya's product and go-to-market decisions.

### Target Users
Founders, product leads, and strategy teams who need ongoing awareness of how Gaya is positioned relative to Upper90, FieldTime Pro, and KickStart Academy.

### Key Features
- **4-tab navigation** — Overview, Feature Matrix, Pricing, Moats & Strategy
- **Overview tab:**
  - Segmented bar showing relative market share across all 4 competitors
  - 2x2 grid of competitor cards: logo, name, founding year, funding stage, trend icon, stat grid (rating, coaches, cities, avg price), and strengths/weaknesses lists
  - Gaya card is highlighted with an atlas ring
- **Feature Matrix tab:**
  - 20-row × 4-column comparison table
  - "Highlight Gaya exclusives" checkbox toggles row background tint and "EXCLUSIVE" badge for features only Gaya has
  - Footer row shows total feature counts per competitor
- **Pricing tab:**
  - Horizontal bar chart ranking competitors by avg event price (low to high)
  - AI Pricing Insight callout with specific pricing recommendations and projected MRR impact
- **Moats & Strategy tab:**
  - 3-column moat cards: Proprietary Geo Intelligence (score 95), Network Effects (72), AI/ML Intelligence Layer (88); each with category label, score bar, and description
  - Win/Loss analysis: 4 KPI tiles + top 4 loss reasons with count, reason, and action item

### User Flows
1. Land on Overview → read market share bar → review competitor cards
2. Switch to Feature Matrix → enable "Highlight Gaya exclusives" to see unique differentiators
3. Switch to Pricing → compare avg prices → read AI pricing insight for recommended price change
4. Switch to Moats → assess defensibility scores → review win/loss analysis

---

## Technical

### Components Used
No imports from `@/components/ui`; all UI is inline Tailwind. Tab state controls conditional renders with `animate-fade-in`.

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: `Crosshair`, `TrendingUp`, `TrendingDown`, `Star`, `Users`, `MapPin`, `DollarSign`, `Shield`, `Eye`, `Target`, `Zap`, `ChevronRight`, `Globe`, `ArrowUpRight`, `ArrowDownRight`, `CheckCircle`, `XCircle`, `Minus`, `AlertTriangle`, `Sparkles`, `BarChart3`, `Activity`, `Award`
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
Competitor: {
  id, name, logo: string,  // 2-letter initials
  color: string,           // Tailwind gradient class
  rating, reviews, coaches, cities, events,
  avgPrice: number,        // dollars
  marketShare: number,     // percent
  trend: 'up'|'down'|'flat',
  founded, funding: string,
  strengths: string[],
  weaknesses: string[]
}  // 4 competitors: tenpo, upper90, fieldtime, kickstart

featureMatrix[]: {
  feature: string,
  tenpo: boolean, upper90: boolean, fieldtime: boolean, kickstart: boolean
}  // 20 rows

Tab: 'overview'|'features'|'pricing'|'moats'
```

### State Management
- `tab: Tab` — controls which content section renders
- `highlightGaya: boolean` — toggles exclusive feature row highlighting in the feature matrix

### UI Patterns
- Tab bar: pill buttons with `atlas-500/10` active state
- Market share bar: `flex` row of `div`s with `width: marketShare%` and gradient backgrounds
- Feature matrix: HTML `<table>` with `<thead>`, `<tbody>`, `<tfoot>`; Gaya column gets a persistent `bg-atlas-500/5` column background
- `isExclusive` flag: `featureMatrix` row where `tenpo === true` and all others are `false`
- Moat score bars use a `from-atlas-500 to-cyan-400` gradient; moat cards are a 3-column grid
- Win/Loss loss reasons: sorted list with count badge, reason text, and action item text in atlas color
