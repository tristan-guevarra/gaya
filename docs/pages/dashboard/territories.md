# Territories Page

**Route:** `/territories`
**Component:** `TerritoryPage` (`territories/page.tsx`)

---

## Product

### Purpose
Geographic territory assignment and franchise management tool that tracks which areas are owned, shared, or open; monitors performance of active territories; and highlights expansion opportunities.

### Target Users
Operations and franchise managers who assign coaches to geographic zones, track territorial performance, and identify unclaimed markets for growth.

### Key Features
- **5 summary stat cards** — Total Territories, Assigned (x/total), Total Athletes, Monthly Revenue, Open Territories
- **Territory list** — 6 territory rows showing name, type badge (exclusive / shared / open), owner, coach count, zone count, status badge, monthly revenue, athlete count, market penetration %, and growth rate
- **Territory detail panel** — Activated by clicking a list item; shows:
  - Type and status badges + territory name + population + zone codes
  - Owner avatar and name (or "Assign Owner" button if unassigned)
  - 5 metric tiles: Revenue, Athletes, Coaches, Events, Growth
  - Market Penetration gauge — percentage bar with addressable market estimate
  - Performance Score gauge — color-coded bar (green ≥80, amber ≥60, red <60)
  - Territory Boundaries placeholder — map container with zone code list (interactive map not yet implemented)
- **"Create Territory" CTA** — Header button (not yet wired)

### User Flows
1. Scan 5 summary stats to get portfolio overview
2. Browse territory list to spot open or underperforming territories
3. Click a territory → review penetration, performance score, and growth rate in the detail panel
4. Identify unassigned territories → click "Assign Owner" to allocate
5. Use growth rate and penetration data to prioritize where to add coaches

---

## Technical

### Components Used
No imports from `@/components/ui`; all UI is inline Tailwind with local type/status config objects.

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: `Map`, `MapPin`, `Users`, `DollarSign`, `TrendingUp`, `Shield`, `Layers`, `Target`, `AlertTriangle`, `CheckCircle`, `Clock`, `ChevronRight`, `Plus`, `Eye`, `Lock`, `Unlock`, `BarChart3`, `ArrowUpRight`, `Star`, `Zap`, `Crown`, `Maximize`
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
Territory: {
  id, name,
  type: 'exclusive'|'shared'|'open',
  owner: string,           // 'Unassigned' if no owner
  ownerAvatar: string,     // 2-letter initials or '??'
  coaches, events: number,
  population: string,      // e.g. '142K'
  revenue: number,         // dollars/month
  penetration: number,     // percent of addressable market
  performance: number,     // 0-100 score
  status: 'active'|'expanding'|'new'|'saturated',
  color: string,           // Tailwind bg+border classes
  zones: string[],         // zone codes e.g. ['E01', 'E02']
  athletes, growthRate: number
}  // 6 territories

typeConfig: Record<'exclusive'|'shared'|'open', { label, icon, color }>
statusConfig: Record<'active'|'expanding'|'new'|'saturated', { label, color }>
```

### State Management
- `selectedTerritory: Territory` — active territory for the detail panel (defaults to `territories[0]`)
- `totalRevenue`, `totalAthletes`, `assignedTerritories` — derived inline from `territories` array using `reduce` / `filter` (no `useMemo`)

### UI Patterns
- 12-column grid: 5-col territory list + 7-col detail panel
- `typeConfig` and `statusConfig` lookup objects decouple badge styles from render logic
- Performance score bar color changes class based on threshold: `bg-green-500` ≥80, `bg-amber-500` ≥60, `bg-red-500` <60
- Penetration bar width: `penetration * 5` (capped visually; 20% penetration = 100% bar width)
- Addressable market estimate: `parseInt(population) * 0.15` (15% of metro population assumed as youth athletes)
- Territory boundaries section is a styled placeholder div; actual map integration is pending
