# Landing Page — `src/app/page.tsx`

**Route:** `/`

---

## Product

### Purpose
Public marketing homepage for Gaya — Intelligence Platform. Converts visitors into
platform users by communicating the dual value proposition: athletes find training
opportunities, operators get geospatial intelligence to expand smarter.

### Target Users
- Athletes / parents browsing for coaches, camps, and clinics in the GTA
- Academy operators and coaches evaluating the intelligence platform

### Key Features
- Animated hero with gradient headline and live-count social proof metrics
- Simulated map preview (browser chrome mockup with pulsing pins and a floating
  coach card)
- Feature grid (6 cards): Discovery Map, Supply vs Demand, AI Predictions,
  What-If Simulator, Revenue Forecasting, Multi-Tenant RBAC
- Intelligence showcase section with a 2-column stat grid (12 underserved zones,
  240 active coaches, +34% demand growth, 91% ML confidence)
- Dual CTA section linking to `/onboard` (primary) and `/map` (demo)
- Minimal footer with Privacy, Terms, API Docs, Contact links

### User Flows
1. Visitor lands → reads hero → clicks "Explore the Map" → `/map`
2. Visitor lands → reads Intelligence section → clicks "Explore Intelligence" → `/intelligence`
3. Operator lands → scrolls to CTA → clicks "Get Started Free" → `/onboard`

---

## Technical

### Components Used
| Component | Source |
|-----------|--------|
| `Counter` | Inline — intersection-observer animated number counter |
| `PingDot` | Inline — pulsing live-indicator badge |
| `FeatureCard` | Inline — icon + title + description card |
| `LBadge` | Inline — small pill badge (variants: `info`, `premium`) |
| `Navbar` | `@/components/shared/Navbar` (imported but navbar is inline here) |

### Imports / Dependencies
- `next/link` — client-side navigation
- `lucide-react` — icons (MapPin, BarChart3, Brain, Zap, TrendingUp, Shield, etc.)
- `@/lib/utils` — `cn` (clsx/tailwind-merge helper)

### Mock / Static Data
Hero stats (hardcoded):
```ts
{ value: 240, suffix: '+', label: 'Coaches' }
{ value: 1200, suffix: '+', label: 'Events Listed' }
{ value: 48, suffix: '',  label: 'Zones Mapped' }
{ value: 92, suffix: '%', label: 'Avg Fill Rate' }
```
Intelligence grid (hardcoded strings):
```ts
{ label: 'Underserved Zones', value: '12', trend: '+3 this month' }
{ label: 'Active Coaches',    value: '240', trend: '+18 new' }
{ label: 'Demand Growth',     value: '+34%', trend: 'YoY increase' }
{ label: 'ML Confidence',     value: '91%', trend: 'Model R² score' }
```

### State Management
- `scrollY: number` — tracks `window.scrollY` via passive scroll listener to
  toggle navbar from transparent to frosted-glass (`bg-white/80 backdrop-blur-xl`)

### UI Patterns
- Parallax blobs: two radial-gradient divs shift `translateY` by `scrollY * factor`
- Dot-grid background: CSS `radial-gradient` at 24 px intervals, `opacity-[0.015]`
- Floating card animation: inline `@keyframes float` (0 → -8 px → 0, 4 s ease-in-out)
- `Counter` uses `IntersectionObserver` with `threshold: 0.5` and cubic ease-out
- Navbar transition fires at `scrollY > 50`
