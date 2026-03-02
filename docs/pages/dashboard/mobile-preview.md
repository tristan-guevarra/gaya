# Coach Mobile App Preview

**Route:** `/mobile-preview`
**File:** `src/app/(dashboard)/mobile-preview/page.tsx`

---

## Product

**Purpose:** Marketing-ready interactive iPhone frame mockup showcasing the native coach mobile app experience with 4 swipeable screen states.

**Target users:** Internal teams demoing the product; potential coach partners evaluating the platform.

**Key features:**
- Realistic iPhone 15-style frame (320×660px, rounded corners, notch, status bar with 9:41 time, battery, 5G)
- 4 screens switchable via left panel: Home, Events, Insights, Profile
- **Home screen:** greeting, 4 quick-stat cards (revenue, fill rate, streak, rating), today's schedule, AI insight card, recent activity feed
- **Events screen:** filter chips (All/Camps/Clinics/Private), event cards with type badge, date, location, fill-rate progress bar
- **Insights screen:** monthly revenue bar chart (12 bars), top zones list with score/revenue/fill, opportunity AI tip
- **Profile screen:** avatar, badges (Legend/Lv.42/Verified), XP/streak/fill stats, settings menu list
- Right panel: 5 coach app metric cards (DAU, session duration, response time, App Store rating, crash-free rate)
- App Store and Google Play download buttons (decorative)

**User flow:** Read feature list → click screen name in left panel → iPhone frame updates to that screen → review metrics on right.

---

## Technical

**Components:**
- `IPhoneFrame` — renders the phone shell, status bar, bottom nav (Home/Events/Insights/Profile), and home indicator; accepts `screen` for active nav state
- `HomeScreen`, `EventsScreen`, `InsightsScreen`, `ProfileScreen` — standalone render functions for each mock screen

**Key imports:**
- `lucide-react` — MapPin, Calendar, Users, BarChart3, User, Star, Clock, ChevronRight, Bell, Plus, TrendingUp, Target, DollarSign, Flame, Zap, Award, CheckCircle, Heart, Share2, Home, Compass, Brain, Settings, Smartphone, Monitor, QrCode, Download, Apple, Globe
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `activeScreen` | `MobileScreen` | Which screen renders inside the phone frame |

**`MobileScreen` type:** `'home' | 'events' | 'insights' | 'profile'`

**UI patterns:**
- 3-column layout: `w-80` description+switcher left, centered phone frame, `w-64` metrics right
- Phone frame uses `overflow-hidden` inner div with fixed `inset-0 top-12 bottom-16` for content scroll area
- Status bar is purely cosmetic (hardcoded 9:41, signal bars, battery)
- Screen content components are plain functional components — no state, no props (data is all inline)
- Ambient glow behind phone via `absolute inset-0 -m-20 bg-atlas-500/5 blur-[80px]`
- `Sparkles2` is a local alias for the `Zap` icon (comment notes it's a safety redeclaration)
