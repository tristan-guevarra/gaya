# Goal Tracker (OKRs)

**Route:** `/goals`
**File:** `src/app/(dashboard)/goals/page.tsx`

---

## Product

**Purpose:** OKR-style quarterly goal management for organizations, providing visibility into objectives, key result progress, ownership, and AI-suggested goals for the next quarter.

**Target users:** Org founders and leadership teams (e.g., Marcus T., Sarah C., David P.) managing strategic business targets.

**Key features:**
- Quarter progress card: overall % progress bar, 5-stat summary (objectives, KRs completed, on-track, at-risk, time elapsed)
- Collapsible objective cards: category badge, owner, due date, inline progress bar + %, expand to reveal key results
- Per key result: status icon (on_track/at_risk/behind/completed), title, owner, progress bar, numeric current/target values, status badge
- Completed KRs show strikethrough title
- AI Goal Recommendations panel for Q3: 3 suggested objectives with rationale and "Add to Q3" button

**User flow:** View quarter overview → expand objectives → drill into KR status → identify at-risk items → read AI suggestions → add Q3 goals.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — Target, TrendingUp, Users, DollarSign, CheckCircle, Clock, Plus, ChevronRight, ChevronDown, Star, Zap, AlertTriangle, Award, Flag, Sparkles, Calendar, BarChart3, MapPin, Layers, Eye
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `objectives` | `Objective[]` | Full list with `expanded` boolean per item |

**Mock data shapes:**
```ts
interface KeyResult {
  id: string; title: string; current: number; target: number;
  unit: string; // '$' | '%' | '★' | 'NPS' | plain unit label
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  owner: string;
}
interface Objective {
  id: string; title: string; category: string; categoryColor: string;
  progress: number; owner: string; dueDate: string;
  keyResults: KeyResult[]; expanded: boolean;
}
// quarter: { name, start, end, daysLeft, totalDays }
```

**Helper functions:**
- `getProgressColor(progress)` — maps 0–100 to bg-red/amber/atlas/green
- `formatValue(value, unit)` — formats `$` with toLocaleString, appends `★` for ratings, raw number otherwise
- `toggleExpand(id)` — maps `objectives` setting `expanded` on target item

**UI patterns:**
- Status config maps status → `{ label, color, icon }` for KR rows
- Progress bar color on KR matches its status (green/atlas/amber/red)
- KR percentage capped at 100 via `Math.min(..., 100)`
- AI suggestions panel uses `bg-purple-500/5 border-purple-500/15`
- `overallProgress` is a static constant (58); not computed from KR data
