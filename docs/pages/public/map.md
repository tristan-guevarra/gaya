# Map Page — `src/app/(public)/map/page.tsx`

**Route:** `/map`

---

## Product

### Purpose
Full-screen interactive discovery map — the core consumer surface of Gaya. Lets
athletes and parents visually browse coaches and training events across the Greater
Toronto Area, filter results in real time, and share filtered views via URL.

### Target Users
- Athletes / parents looking for nearby camps, clinics, or private sessions
- Coaches verifying their own listing visibility
- Operators doing lightweight competitive discovery

### Key Features
- Full-viewport Leaflet map with clustered marker pins for coaches and events
- Heatmap overlay toggled via filter panel (demand / supply layers)
- Left panel: `MapFilterPanel` — filter by event type, price range, availability,
  skill level, and radius; also triggers heatmap layer changes
- Right sidebar: `MapListingSidebar` — scrollable list of up to 50 filtered markers;
  selecting a listing highlights its pin on the map
- URL param hydration on mount (filters persisted in querystring for sharing)
- One-click shareable URL copied to clipboard via `buildShareUrl`
- Heatmap legend bar appears at bottom-center when an overlay layer is active

### User Flows
1. User visits `/map` → map loads → browses pins → clicks pin → sidebar highlights listing
2. User applies filters → `filteredMarkers` recomputes client-side → map and sidebar update
3. User clicks Share → filtered URL copied to clipboard → toast confirmation shown
4. User arrives via shared link → URL params parsed → filters pre-applied on mount

---

## Technical

### Components Used
| Component | Source |
|-----------|--------|
| `DiscoveryMap` | `@/components/map/DiscoveryMap` — dynamic import, SSR disabled |
| `MapFilterPanel` | `@/components/map/MapFilterPanel` |
| `MapListingSidebar` | `@/components/map/MapListingSidebar` |
| `Spinner` | `@/components/ui` |

### Imports / Dependencies
- `next/dynamic` — Leaflet loaded client-only (`ssr: false`)
- `sonner` — `toast` for clipboard confirmation and favorite toasts
- `@/lib/utils` — `buildShareUrl` (serialises filter state to querystring)
- `@/types` — `MapMarker`, `MapFilters`, `HeatmapLayer`

### Mock Data Shape (`MapMarker`)
```ts
// Coach marker
{
  id: 'coach-1',
  type: 'coach',
  latitude: number,
  longitude: number,
  title: string,          // coach name
  subtitle: string,       // "North York · Soccer · $85/hr"
  rating: number,         // 3.5–5.0
  price_cents: number,
}

// Event marker
{
  id: 'event-42',
  type: 'event',
  event_type: 'camp' | 'clinic' | 'private',
  latitude: number,
  longitude: number,
  title: string,
  subtitle: string,
  price_cents: number,
  spots_left: number,
  rating: number,
}
```
Generator: `generateMockMarkers()` produces ~20 coaches and ~60 events across
15 GTA neighbourhoods with ±0.02–0.03° lat/lng jitter.

### State Management
| State | Type | Purpose |
|-------|------|---------|
| `filters` | `MapFilters` | Active filter values; drives `filteredMarkers` |
| `activeLayer` | `HeatmapLayer \| null` | Which heatmap overlay is shown |
| `selectedMarkerId` | `string \| undefined` | Syncs map pin ↔ sidebar highlight |
| `sidebarVisible` | `boolean` | Toggles right sidebar open/closed |
| `allMarkers` | `MapMarker[]` | Stable reference; initialised once from generator |

### UI Patterns
- `filteredMarkers` derived with `useMemo` — filters applied client-side for demo
- Sidebar capped at 50 items (`markers.slice(0, 50)`) to limit DOM size
- Heatmap legend uses `animate-slide-up` class and renders only when `activeLayer` is set
- Layout: `h-[calc(100vh-64px)]` container with map as base layer, panels as
  absolutely-positioned overlays (z-indexed above map tiles)
