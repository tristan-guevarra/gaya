# Market Reports

**Route:** `/reports`
**File:** `src/app/(dashboard)/reports/page.tsx`

---

## Product

**Purpose:** AI-generated zone intelligence reports that surface supply/demand analysis, key findings, and ranked recommendations for each geographic market area.

**Target users:** Org admins and platform operators making expansion and resource allocation decisions.

**Key features:**
- Report list with opportunity score badge (0–100) and status indicator (ready / generating / draft)
- Expandable report cards with: AI key finding, 6-metric grid, 6-month area chart, numbered AI recommendations
- Summary stats bar: reports generated, zones analyzed, avg opportunity score, actions taken
- "Generate Report" button (simulated loading state)
- PDF export, share, and full report view actions per card
- Generating state shows pulsing icon; chart/recommendations hidden until ready

**User flow:** View list → click card to expand → read key finding + metrics + chart → act on recommendations → export PDF or share.

---

## Technical

**Components:**
- `ReportCard` — sub-component handling expand/collapse, chart, metrics, and actions
- `ChartTooltip` — custom Recharts tooltip
- `Card`, `Badge`, `Button` from `@/components/ui`

**Key imports:**
- `recharts` — AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
- `@/lib/utils` — `cn`, `formatPercent`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `expandedId` | `string \| null` | ID of currently expanded report (accordion) |
| `generating` | `boolean` | "Generate Report" loading state |

**Mock data shape:**
```ts
interface Report {
  id: string; title: string; zone: string;
  generated_at: string; status: 'ready' | 'generating' | 'draft';
  opportunity_score: number; key_finding: string;
  metrics: {
    demand_index: number; supply_index: number; gap_score: number;
    fill_rate: number; leads_30d: number; coaches: number;
  };
  monthly_data: { month: string; demand: number; supply: number }[];
  recommendations: string[];
}
```

**UI patterns:**
- Accordion pattern: only one report expanded at a time
- Opportunity score color-mapped: `>=80` success badge, `>=60` info, else default
- Chart uses per-report gradient IDs (`d_${report.id}`, `s_${report.id}`) to avoid SVG conflicts
- Generating reports show animate-pulse on the icon; body content hidden
