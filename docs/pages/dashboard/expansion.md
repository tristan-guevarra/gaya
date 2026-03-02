# Expansion Playbook Page

**Route:** `/expansion`
**Component:** `ExpansionPlaybookPage` (`expansion/page.tsx`)

---

## Product

### Purpose
Guided market entry wizard that helps operators evaluate, plan, and track the launch of Gaya into new cities. Combines geo-scored market data with a 5-phase milestone checklist and resource allocation estimates.

### Target Users
Growth and operations teams evaluating new markets and tracking the status of active launches.

### Key Features
- **Market list sidebar** — 6 candidate markets scored 0-100 with status badge (evaluating / planning / launching / active), phase progress bar, and estimated ARR
- **Market overview panel** — Displays metro population, youth population, soccer index (0-100), competitor density, estimated annual revenue, and time to breakeven in a 2x3 stat grid
- **AI Launch Recommendation** — Dynamic text paragraph per market referencing its specific stats and recommended focus corridors
- **Launch Playbook accordion** — 5 collapsible phases (Market Research → Coach Recruitment → Pre-Launch → Soft Launch → Scale), each with task checklist, completion progress bar, phase status (past/current/upcoming), and duration label
- **Resource Allocation card** — Fixed 4-column breakdown: Marketing Spend, Coach Recruitment, Ops Support, Total Investment to Breakeven
- **"Evaluate New Market" CTA** — Header button (not yet wired)

### User Flows
1. Select a market from the left sidebar → overview stats populate on the right
2. Read AI recommendation for the selected market
3. Expand current phase in the accordion to see actionable tasks with completion status
4. Review resource allocation estimates to plan budget

---

## Technical

### Components Used
No shared UI component library imports; all elements are inline `div`/`button` with Tailwind classes. Local `Plus` SVG component defined at the bottom of the file.

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: `Rocket`, `MapPin`, `Users`, `Target`, `BarChart3`, `Check`, `Clock`, `ChevronRight`, `Brain`, `Zap`, `Globe`, `Star`, `TrendingUp`, `ArrowRight`, `Shield`, `Sparkles`, `Building2`, `Calendar`, `DollarSign`, `Search`, `Flag`, `CheckCircle`, `Circle`, `AlertCircle`
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
Market: {
  id, city, country, score: number,
  population, youthPop, soccerIndex: number,
  competitorDensity: 'Low'|'Medium'|'High',
  estimatedARR, timeToBreakeven,
  status: 'evaluating'|'planning'|'launching'|'active',
  phase: number  // 0-5
}

Phase: {
  id: number, title, subtitle,
  icon: React.ElementType,
  duration: string,
  tasks: { text: string, done: boolean }[]
}
```
6 markets and 5 phases defined as module-level constants.

### State Management
- `selectedMarket` — active market from the sidebar list (defaults to Austin)
- `expandedPhase` — which accordion phase is open (defaults to phase 3 for the Austin context)

### UI Patterns
- Sidebar + main content split: `w-80 shrink-0` list + `flex-1` detail area
- Phase accordion: colored border/background based on `isPast` / `isCurrent` / upcoming state; `CheckCircle` vs phase icon for past phases
- Phase progress bar: 5 equal segments, filled up to `market.phase`
- Status badge colors: evaluating = amber, planning = blue, launching = atlas, active = green
- AI recommendation uses template-string interpolation to personalize text per market
