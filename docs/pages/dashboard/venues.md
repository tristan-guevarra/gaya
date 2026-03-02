# Venue Intelligence

**Route:** `/venues`
**File:** `src/app/(dashboard)/venues/page.tsx`

---

## Product

**Purpose:** Facility management hub for tracking training venue quality, booking performance, weather impact, and maintenance schedules across all zones.

**Target users:** Org admins and platform operators overseeing the network of training locations.

**Key features:**
- Summary stats: total venues, total fields, weekly revenue, avg utilization, active coaches
- Venue type filter: All / Indoor / Outdoor / Turf / Hybrid
- Venue list (master panel): each card shows quality score, star rating, field count, utilization %, weather chip, and venue type badge
- Venue detail panel (right): quality score prominently displayed, 4 quick-stat tiles, facility details table, weather + maintenance card, amenities chip list, weekly utilization heatmap (6 time slots × 7 days with emerald intensity)
- Add Venue button in header
- Quality score color mapped: `>=85`=green, `>=70`=atlas, `>=55`=amber, else=red
- Status: excellent / good / fair / maintenance — each with distinct color

**User flow:** Apply type filter → select venue from list → review detail panel → check weather impact → note next maintenance date.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — MapPin, Star, Users, Clock, Sun, CloudRain, Wind, Shield, CheckCircle, AlertTriangle, Calendar, DollarSign, TrendingUp, Wrench, BarChart3, Layers, etc.
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `selectedVenue` | `Venue` | Currently displayed in detail panel |
| `filter` | `'all' \| 'indoor' \| 'outdoor' \| 'turf' \| 'hybrid'` | Active type filter |

**Mock data shape:**
```ts
interface Venue {
  id: string; name: string; type: 'outdoor'|'indoor'|'turf'|'hybrid';
  address: string; zone: string; rating: number; qualityScore: number;
  fields: number; capacity: number; utilizationRate: number;
  weeklyBookings: number; revenue: number; amenities: string[];
  surfaceType: string; lighting: boolean; parking: number;
  status: 'excellent'|'good'|'fair'|'maintenance'; nextMaintenance: string;
  weather: { temp: number; condition: string; wind: number; impact: 'none'|'low'|'moderate'|'high' };
  peakHours: string; coaches: number;
}
```

**UI patterns:**
- 5/7 column grid: list left, detail right
- Heatmap uses `Math.random()` intensity per cell — purely visual mock, not data-driven
- Selected venue list row gets `bg-emerald-500/5 border-emerald-500/20`
- Weather icon resolved dynamically: Sunny/Indoor→Sun, Rainy→CloudRain, else→Wind
- `totalRevenue` and `avgUtilization` derived via `Array.reduce` in the render
