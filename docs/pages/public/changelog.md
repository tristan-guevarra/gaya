# Changelog Page — `src/app/(public)/changelog/page.tsx`

**Route:** `/changelog`

---

## Product

### Purpose
Public product changelog presenting Gaya's full release history as a vertically
scrolling timeline. Keeps users and operators informed of new features, fixes, and
breaking changes with enough detail to evaluate upgrade impact.

### Target Users
- Existing users checking what changed after an update
- Evaluators wanting proof of active development velocity
- Developers tracking API breaking changes

### Key Features
- Vertical timeline with icon nodes colour-coded by release badge (major / minor / patch)
- Seven releases documented from v1.0.0 (Feb 5 2026) to v1.6.0 (Feb 28 2026)
- Per-release: version badge, title, date, description, optional highlight tags, and
  expandable change list
- Change items tagged by type: New (feature), Improved, Fixed, Breaking
- Each item may carry an optional domain tag (e.g. "AI", "Map", "Security")
- Filter pills at top: All Changes / New / Improved / Fixed / Breaking — hides
  releases with no matching items when filtered
- Releases default to collapsed; v1.6.0 is expanded on first render

### User Flows
1. User lands → sees timeline → clicks a release header → change list expands
2. User clicks "Fixed" filter → only releases with fix items visible; others hidden
3. Developer spots breaking change in v1.3.0 → reads migration note in change item

---

## Technical

### Components Used
All UI is inline within the page file. No shared components imported beyond icons.

### Imports / Dependencies
- `next/link` — footer nav links (Home, Map, Pricing)
- `lucide-react` — Sparkles, Bug, Zap, Shield, Globe, Brain, MapPin, BarChart3,
  AlertTriangle, Rocket, Tag, ChevronDown, etc.
- `@/lib/utils` — `cn`

### Data Shapes

**`Release`**
```ts
interface Release {
  version: string;                        // e.g. '1.6.0'
  date: string;                           // e.g. 'Feb 28, 2026'
  title: string;
  description: string;
  badge: 'major' | 'minor' | 'patch';
  icon: React.ElementType;               // lucide icon for timeline node
  items: ChangeItem[];
  highlights?: string[];                 // short tag chips shown on collapsed card
}
```

**`ChangeItem`**
```ts
interface ChangeItem {
  type: 'feature' | 'improvement' | 'fix' | 'breaking';
  text: string;
  tag?: string;   // domain label e.g. 'AI', 'CRM', 'Auth'
}
```

**`CHANGE_STYLES`** — maps type to `{ icon, color, bg, label }` used for rendering
each item's icon dot and text colour.

**`BADGE_STYLES`** — maps badge level to Tailwind classes for the version pill:
- `major` → atlas green tint
- `minor` → blue tint
- `patch` → muted slate

### State Management
| State | Type | Purpose |
|-------|------|---------|
| `filterType` | `string` | Active type filter; `'all'` shows everything |
| `expandedVersion` | `string` | Version string of currently expanded release card; defaults to `'1.6.0'` |

### UI Patterns
- Timeline spine: `absolute` 1 px `bg-slate-100` line running full height of the
  list container at `left-[23px]`; each release is `pl-14` to clear the node icon
- Release node icon: 48×48 rounded-xl with badge-colour background and lucide icon
- Collapse/expand: single controlled `expandedVersion` string (only one release open
  at a time); chevron rotates 180° when expanded
- Filter logic: `filteredItems = filterType === 'all' ? items : items.filter(...)`;
  if `filteredItems.length === 0` the entire release block returns `null`
- Change item icon dot: 20×20 rounded-md with type-specific `bg` and `color` classes
  from `CHANGE_STYLES`
- Tag chips on expanded items use `text-[9px]` and `bg-slate-50` for low visual weight
