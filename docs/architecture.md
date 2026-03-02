# Gaya — Intelligence Platform: Architecture

**Last updated:** March 2026
**Version:** 0.1.0
**Repository:** `tenpo-atlas`

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Route Architecture](#route-architecture)
5. [State Management](#state-management)
6. [Component Hierarchy](#component-hierarchy)
7. [Styling Approach](#styling-approach)
8. [Backend Integration](#backend-integration)
9. [Authentication Flow](#authentication-flow)
10. [Data Layer & Custom Hooks](#data-layer--custom-hooks)

---

## Overview

Gaya is a geospatial intelligence platform for sports coaching and training organisations. It enables coaches and administrators to discover underserved markets, model demand, manage leads, and track revenue — all driven by PostGIS-backed geospatial analytics.

The frontend is a Next.js 14 application using the App Router. It is served as a standalone Docker container and communicates with a FastAPI backend over a JSON REST API.

---

## Tech Stack

| Concern | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.15 |
| UI Runtime | React | 18.3.1 |
| Language | TypeScript | 5.6 |
| Styling | Tailwind CSS | 3.4.13 |
| Client State | Zustand | 4.5.5 |
| Server State | TanStack React Query | 5.59.0 |
| Forms | React Hook Form + Zod | 7.53 / 3.23 |
| Maps | Leaflet + React-Leaflet | 1.9.4 / 4.2.1 |
| Charts | Recharts | 2.13.0 |
| Animation | Framer Motion | 11.11.0 |
| Icons | Lucide React | 0.451.0 |
| Toasts | Sonner | 1.5.0 |
| Date Utilities | date-fns | 4.1.0 |
| Class Utilities | clsx + tailwind-merge | — |
| Backend | FastAPI (Python) | — |
| Database | PostgreSQL + PostGIS | — |
| Container | Docker | — |

**Fonts:** Outfit (display), DM Sans (body), JetBrains Mono (code) — loaded from Google Fonts.

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router root
│   │   ├── layout.tsx              # Root layout — wraps all routes in <Providers>
│   │   ├── providers.tsx           # QueryClientProvider (React Query)
│   │   ├── globals.css             # CSS custom properties, Leaflet overrides, utility classes
│   │   ├── page.tsx                # Landing page (root "/")
│   │   │
│   │   ├── (auth)/                 # Route group — auth flows
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── onboard/page.tsx
│   │   │
│   │   ├── (public)/               # Route group — public pages with Navbar
│   │   │   ├── layout.tsx          # Wraps children with <Navbar>
│   │   │   ├── map/page.tsx
│   │   │   ├── discover/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   └── changelog/page.tsx
│   │   │
│   │   ├── (dashboard)/            # Route group — authenticated sidebar app
│   │   │   ├── layout.tsx          # Collapsible sidebar nav (DashboardLayout)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── intelligence/page.tsx
│   │   │   ├── simulator/page.tsx
│   │   │   ├── forecast/page.tsx
│   │   │   ├── landscape/page.tsx
│   │   │   ├── competitive/page.tsx
│   │   │   ├── territories/page.tsx
│   │   │   ├── expansion/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── revenue/page.tsx
│   │   │   ├── financials/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── pulse/page.tsx
│   │   │   ├── feed/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── health/page.tsx
│   │   │   ├── coach-matching/page.tsx
│   │   │   ├── cohorts/page.tsx
│   │   │   ├── parent-portal/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   │   ├── gamification/page.tsx
│   │   │   ├── collaboration/page.tsx
│   │   │   ├── content-studio/page.tsx
│   │   │   ├── templates/page.tsx
│   │   │   ├── season-planner/page.tsx
│   │   │   ├── check-in/page.tsx
│   │   │   ├── venues/page.tsx
│   │   │   ├── certifications/page.tsx
│   │   │   ├── automations/page.tsx
│   │   │   ├── integrations/page.tsx
│   │   │   ├── experiments/page.tsx
│   │   │   ├── data-room/page.tsx
│   │   │   ├── goals/page.tsx
│   │   │   ├── admin/page.tsx
│   │   │   ├── permissions/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── api-playground/page.tsx
│   │   │   ├── mobile-preview/page.tsx
│   │   │   ├── activity/page.tsx
│   │   │   ├── forms/page.tsx
│   │   │   └── zones/[id]/page.tsx
│   │   │
│   │   ├── coaches/                # Standalone detail layout
│   │   │   ├── layout.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   └── events/                 # Standalone detail layout
│   │       ├── layout.tsx
│   │       └── [id]/page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.tsx           # Core UI component library
│   │   ├── shared/
│   │   │   ├── Navbar.tsx
│   │   │   ├── CommandBar.tsx
│   │   │   ├── AIChatAssistant.tsx
│   │   │   └── NotificationCenter.tsx
│   │   ├── map/
│   │   │   ├── DiscoveryMap.tsx
│   │   │   ├── MapFilterPanel.tsx
│   │   │   └── MapListingSidebar.tsx
│   │   ├── collaboration/
│   │   │   ├── PresenceBar.tsx
│   │   │   └── LiveCursorsOverlay.tsx
│   │   └── CommandPalette.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                  # HTTP client + all endpoint definitions
│   │   ├── auth.ts                 # Zustand auth store + role helpers
│   │   └── utils.ts                # cn(), formatPrice(), getEventTypeInfo()
│   │
│   ├── hooks/
│   │   └── index.ts                # TanStack Query hooks (useMapMarkers, useRecommendations, etc.)
│   │
│   └── types/
│       └── index.ts                # All shared TypeScript interfaces
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── Dockerfile
```

---

## Route Architecture

The application uses Next.js 14 App Router route groups to isolate layouts without affecting URL segments.

### Route Groups

**`(auth)`** — `/login`, `/onboard`
Auth flows with a minimal centered layout. No navigation. Redirects authenticated users away on load.

**`(public)`** — `/map`, `/discover`, `/pricing`, `/changelog`
Marketing and discovery pages. The group layout renders `<Navbar>` above all children. Accessible without authentication; some features degrade gracefully when unauthenticated.

**`(dashboard)`** — 40+ pages under a collapsible sidebar
The core application shell. `DashboardLayout` renders a fixed left sidebar with nav groups, a live search filter, and a collapse toggle. The main content area shifts right to accommodate the sidebar width (240px expanded, 64px collapsed). No top navbar is present; navigation is entirely sidebar-driven.

**Standalone** — `/coaches/[id]`, `/events/[id]`
Entity detail pages with their own isolated layouts. These are rendered outside all route groups to allow fully custom chrome (e.g. a back button, breadcrumbs, or a minimal header).

### Dashboard Sidebar Navigation Groups

The sidebar organises 40+ pages into eight collapsible groups:

| Group | Pages |
|---|---|
| Core | Dashboard, Calendar, Messages, Notifications, Activity Feed |
| Discovery & Events | Event Templates, Season Planner, QR Check-In, Leaderboard |
| Intelligence | Zone Intelligence, Expansion Recs, Demand Forecast, What-If Simulator, Landscape View, Competitive Intel, Territory Manager |
| CRM & Growth | Lead Pipeline, Customer Health, AI Coach Matching, Parent Portal, Cohort Analysis |
| Revenue & Finance | Revenue Analytics, Financial Modeling, A/B Testing Lab, Data Room |
| Marketing & Content | Content Studio, Reports Builder, Pulse Survey |
| Engagement | Gamification Hub, Collaboration |
| Operations | Venue Intelligence, Certifications, Automations, Integrations |
| Administration | Admin Panel, Permissions, Goals & OKRs, Settings, API Playground, Mobile Preview |

Each nav item tracks active state via `usePathname()`. Badge counts are rendered inline on items like Messages and Notifications.

---

## State Management

State is split into two distinct layers by concern.

### Client / Auth State — Zustand

`src/lib/auth.ts` exports a single Zustand store: `useAuthStore`.

**Shape:**
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Persistence:** The store hydrates from `localStorage` (key: `gaya_auth`) on initialisation. `login()`, `setTokens()`, and `logout()` all write back to `localStorage` synchronously. There is no Zustand middleware — persistence is implemented manually to remain framework-agnostic.

**Role Hierarchy:** Three helper functions are exported alongside the store:

```typescript
hasMinRole(userRole, minRole)  // numeric hierarchy: athlete(0) coach(1) org_admin(2) superadmin(3)
isAdmin(user)                  // true if org_admin or above
isSuperAdmin(user)             // true if superadmin
```

These are consumed by `Navbar` to filter visible nav items, and by individual pages to gate access to admin-only UI.

### Server State — TanStack React Query

`src/app/providers.tsx` mounts a single `QueryClient` at the application root with the following defaults:

```typescript
{
  staleTime: 60_000,          // 1 minute before background refetch
  refetchOnWindowFocus: false,
  retry: 1,
}
```

All data fetching is done through custom hooks defined in `src/hooks/index.ts` (see [Data Layer](#data-layer--custom-hooks)). Query keys are structured as `[resource, params]` tuples for precise cache invalidation.

---

## Component Hierarchy

### Global Shell

```
RootLayout (src/app/layout.tsx)
  └── Providers (QueryClientProvider)
        ├── {children}             ← route group layouts inject here
        └── Toaster (Sonner)       ← global toast overlay
```

### Public Pages

```
PublicLayout
  ├── Navbar
  │     ├── Logo link
  │     ├── Role-filtered nav links
  │     └── Auth: profile dropdown | login/register buttons
  └── <main>
        └── {page content}
```

### Dashboard Pages

```
DashboardLayout
  ├── <aside> (fixed sidebar)
  │     ├── Logo / branding
  │     ├── Search input (filters nav groups in-memory)
  │     ├── <nav> — NavGroups (collapsible)
  │     │     └── NavItem links (active state from usePathname)
  │     └── Collapse toggle button
  └── <main> (margin-left matches sidebar width)
        └── {page content}
```

### Shared Overlays (available globally, rendered per-page or via root layout)

| Component | Trigger | Location |
|---|---|---|
| `CommandBar` | `⌘K` / `Ctrl+K` global keydown | Fixed overlay, `z-[100]` |
| `AIChatAssistant` | Floating button (bottom-right) | Fixed overlay, `z-50` |
| `NotificationCenter` | Bell icon in navbar | Dropdown, `z-50` |
| `PresenceBar` | Avatar stack in navbar | Dropdown, `z-50` |
| `LiveCursorsOverlay` | Rendered on collaboration-enabled pages | Absolute overlay |

### UI Component Library (`src/components/ui/index.tsx`)

All primitive UI components are defined in a single barrel file:

| Component | Variants / Notes |
|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `danger`, `outline` — sizes `sm/md/lg` — `loading` spinner state |
| `Card` | `hover`, `glow` props — padding scale `none/sm/md/lg` |
| `Badge` | `default`, `success`, `warning`, `danger`, `info`, `premium` — optional `dot` indicator |
| `Input` | Forwarded ref, optional `label`, `error`, `icon` |
| `Select` | Forwarded ref, options array prop |
| `StatCard` | Wraps `Card` — displays metric value, label, trend arrow, icon |
| `EmptyState` | Icon, title, description, optional action slot |
| `Skeleton` | Animated pulse placeholder |
| `Tooltip` | CSS group-hover tooltip, no JS portal |
| `Spinner` | SVG spin animation, size prop |

### Map Components (`src/components/map/`)

| Component | Responsibility |
|---|---|
| `DiscoveryMap` | Imperative Leaflet map — initialised once via `useEffect`, marker layer managed via `L.LayerGroup`, GeoJSON heatmap overlay swapped on layer change |
| `MapFilterPanel` | Filter controls (sport, event type, skill level, price, date range, radius) |
| `MapListingSidebar` | Scrollable listing panel alongside the map |

`DiscoveryMap` does not use `react-leaflet` declarative components. It manages the `L.Map` instance via refs to avoid React re-render overhead on map tile events.

---

## Styling Approach

### Tailwind Configuration

`tailwind.config.ts` extends the default theme with two custom colour scales:

**`atlas`** — The primary brand blue (based on Tailwind blue-500 `#3b82f6`). Used for interactive elements, active states, focus rings, and accent indicators.

**`midnight`** — Inverted scale where `midnight-950` maps to `#ffffff` (white) and lower values approach dark slate. This naming convention supports a future dark mode toggle where `midnight-950` would become `#0a0f1a` without changing any className references in components.

**`volt`** — A high-contrast lime accent (`#c8ff2e`) reserved for special callouts.

### CSS Custom Properties

Global design tokens are defined in `src/app/globals.css` under `:root`:

```css
--atlas-primary: #3b82f6;
--midnight-bg: #ffffff;
--midnight-surface: #f8fafc;
--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #94a3b8;
```

These allow non-Tailwind contexts (Leaflet popup HTML strings, inline styles) to reference the same design token values.

### Typography

Three font roles are declared via CSS variables and registered in `tailwind.config.ts`:

- `font-display` → Outfit (headings, logotype, stat values)
- `font-body` → DM Sans (body text, UI labels)
- `font-mono` → JetBrains Mono (code, data tables)

### Utility Classes

`src/lib/utils.ts` exports `cn()` — a `clsx` + `tailwind-merge` composition that resolves Tailwind class conflicts. All conditional className logic in components uses `cn()`.

### Reusable CSS Classes (defined in `globals.css`)

| Class | Purpose |
|---|---|
| `.glass-card` | White background, subtle border and shadow — base card surface |
| `.glass-card-hover` | Adds blue-tinted border and lift on hover |
| `.gradient-text` | Blue-to-purple gradient text via `background-clip: text` |
| `.heatmap-gradient` | Blue-to-red gradient for heatmap legend bar |
| `.atlas-marker` | Rotated-diamond Leaflet marker shape |
| `.pulse-dot` | Animated pulsing status indicator |
| `.animated-border` | Rotating conic gradient border (for premium callouts) |
| `.scrollbar-hide` | Hides scrollbar cross-browser |

### Animation

Framer Motion is available as a dependency for page transitions and complex entrance animations. Tailwind keyframe animations (`fade-in`, `slide-up`, `slide-in-right`, `pulse-glow`, `scan-line`) cover the majority of UI motion needs without JavaScript overhead.

---

## Backend Integration

### API Client (`src/lib/api.ts`)

A typed `ApiClient` class wraps the native `fetch` API:

```
ApiClient
  ├── get<T>(path, auth?)
  ├── post<T>(path, body?, auth?)
  ├── patch<T>(path, body, auth?)
  ├── delete<T>(path, auth?)
  └── refreshToken()       ← called automatically on 401 responses
```

The base URL is read from `NEXT_PUBLIC_API_URL` at build time (defaults to `http://localhost:8000`).

**Token Injection:** When `auth = true`, the client reads the current `accessToken` from `useAuthStore.getState()` — a direct Zustand store read outside of React (valid in non-render contexts) — and appends `Authorization: Bearer <token>`.

**Automatic Token Refresh:** On any `401` response, `refreshToken()` is called. It posts the stored refresh token to `/api/v1/auth/refresh`. On success, `setTokens()` updates both the store and `localStorage`. On failure, `logout()` is called and the session is cleared.

### API Namespaces

| Namespace | Prefix | Auth Required | Purpose |
|---|---|---|---|
| `authApi` | `/api/v1/auth` | No (login/register) | Login, register, `/me` |
| `mapApi` | `/api/v1/map` | No | Markers, heatmap GeoJSON, coach/event detail |
| `intelligenceApi` | `/api/v1/intelligence` | Yes | Geo metrics, AI recommendations, what-if simulation |
| `coachApi` | `/api/v1/coaches` | Yes | Paginated coach list, create, update |
| `eventApi` | `/api/v1/events` | Yes | Paginated event list, create, update |

Lead submission (`/api/v1/leads`) is called via `mapApi.submitLead()` — it is unauthenticated to allow public inquiry forms.

### Backend Service

The FastAPI backend runs in a separate Docker container defined in `../backend/`. It exposes a PostgreSQL/PostGIS database. Geospatial indexing uses H3 hexagonal cells for supply/demand scoring. The two services communicate over Docker Compose networking; no server-side rendering fetches occur from the Next.js container to the backend (all fetching is client-side).

---

## Authentication Flow

```
1. User visits /login
2. Submits credentials → authApi.login()
3. On success: authStore.login(user, accessToken, refreshToken)
   - Writes gaya_auth to localStorage
   - Sets isAuthenticated = true in Zustand
4. Redirect to /dashboard

5. On any protected API call:
   - ApiClient reads accessToken from store
   - Appends Authorization header

6. On 401 response:
   - ApiClient calls /api/v1/auth/refresh with refreshToken
   - On success: updates tokens in store + localStorage
   - On failure: authStore.logout() → clears localStorage → user must re-login

7. On logout:
   - authStore.logout() clears store and localStorage
   - User redirected to /login
```

On page load, the Zustand store constructor reads from `localStorage` (guarded by `typeof window !== 'undefined'`), restoring the prior session without a network round-trip.

---

## Data Layer & Custom Hooks

All TanStack Query usage is encapsulated in `src/hooks/index.ts`. Pages import hooks directly; no hook logic lives inside page components.

### Map Hooks

```typescript
useMapMarkers(filters, enabled?)   // queryKey: ['map-markers', filters] — staleTime 30s
useHeatmap(layer)                  // queryKey: ['heatmap', layer]        — staleTime 5min
useCoachDetail(id)                 // queryKey: ['coach', id]
useEventDetail(id)                 // queryKey: ['event', id]
```

### Intelligence Hooks

```typescript
useGeoMetrics(params?)             // queryKey: ['geo-metrics', params]   — staleTime 60s
useRecommendations(limit?)         // queryKey: ['recommendations', limit] — staleTime 5min
useWhatIf()                        // useMutation — posts to /api/v1/simulator/what-if
```

### Management Hooks

```typescript
useCoaches(page?)                  // queryKey: ['coaches', page]         — staleTime 30s
useEvents(page?)                   // queryKey: ['events', page]          — staleTime 30s
```

All queries use the global `QueryClient` defaults (1-minute stale time, no window-focus refetch, 1 retry). Map marker queries override stale time to 30 seconds to keep the discovery map responsive to filter changes. Heatmap and recommendation queries use 5 minutes as they are expensive computed results.
