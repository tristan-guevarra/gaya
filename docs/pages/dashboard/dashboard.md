# Dashboard — Gaya Intelligence Platform

## Product

**Purpose:** Configurable home dashboard giving operators a personalized, at-a-glance view of their business health across revenue, events, coaches, leads, and AI insights.

**Target users:** Platform operators and club managers who need a daily overview without navigating individual sections.

**Key features:**
- Eight distinct widget types arranged in a responsive two-column grid
- Customize mode: toggle widget visibility, resize widgets (sm / md / lg), and drag-and-drop reordering
- AI Insights widget surfaces opportunity and pricing recommendations with confidence scores
- Revenue trend bar chart with time-range selector (3M / 6M / 12M)
- Lead pipeline funnel with stage counts and dollar values
- Upcoming events calendar widget with fill-rate progress bars
- Top coaches list with tier badges and fill rates
- Top zones list with demand/supply scores

**User flows:**
1. Land on dashboard for the daily overview across all KPIs
2. Click Customize to enter edit mode; toggle, resize, or drag widgets
3. Click Done to save layout; widgets persist in component state
4. Drill into any insight or event by following the widget's chevron link

---

## Technical

**Component:** `DashboardPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState` from React
- `lucide-react` — extensive icon set (LayoutGrid, Brain, DollarSign, etc.)
- `@/lib/utils` — `cn` class-name helper

**Internal sub-components:**
| Component | Widget type |
|---|---|
| `KPIWidget` | `kpi` — 6-metric grid |
| `ChartWidget` | `chart` — bar chart, 12-month |
| `ZonesWidget` | `zones` — ranked zone list |
| `ActivityWidget` | `activity` — timestamped event feed |
| `CoachesWidget` | `coaches` — ranked coach list |
| `PipelineWidget` | `pipeline` — funnel bar + stage table |
| `AIInsightsWidget` | `ai` — confidence-scored insight cards |
| `CalendarWidget` | `calendar` — upcoming event list |
| `WidgetContent` | switch renderer dispatching by widget type |

**Widget type shape:**
```ts
interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'zones' | 'activity' | 'coaches' | 'pipeline' | 'ai' | 'calendar';
  title: string;
  size: 'sm' | 'md' | 'lg';
  visible: boolean;
}
```

**State:**
- `widgets: Widget[]` — ordered array; mutations drive visibility, size, and order
- `isEditing: boolean` — toggles edit mode UI (grip handles, resize button, X button, toggle panel)
- `dragId: string | null` — tracks the widget being dragged for HTML5 drag-and-drop reordering

**UI patterns:**
- Grid layout: `md:grid-cols-2`; `lg` widgets span both columns via `md:col-span-2`
- All data is static mock data defined at module level
- Hover tooltips on chart bars via absolute-positioned divs with `group-hover` opacity
- `cn()` used throughout for conditional class merging
