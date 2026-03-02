# Parent Portal — Parent Portal

**App:** Gaya — Intelligence Platform
**Route:** `/parent-portal`

---

## Product

### Purpose
Athlete progress and booking management dashboard for parents. Provides a gamified view of each child's training journey, upcoming schedule, session history, and primary coach relationship.

### Target Users
Parents of youth athletes enrolled in camps, clinics, or private training through the platform.

### Key Features
- Multi-child selector to switch between profiles
- Four-tab layout: Overview, Progress, Schedule, History
- Gamified profile card with XP bar, level badge, session count, and day streak
- SVG skill radar chart across six dimensions (Dribbling, Passing, Shooting, Speed, Defending, Game IQ)
- Earned badges with icon, name, and date
- Upcoming bookings filtered per child with status (confirmed / waitlist)
- Session history with coach notes, star rating, and XP earned per session
- Progress tab with skill bars showing current score and delta, monthly summary stats, and upcoming milestone tracker

### User Flows
1. Select a child from the header selector
2. Overview tab: scan profile card, radar chart, next session, badges, and primary coach
3. Progress tab: review skill improvement bars and upcoming milestone rewards
4. Schedule tab: view upcoming bookings or find new training
5. History tab: browse past sessions with coach feedback and XP earned

---

## Technical

### Components
- `SkillRadar` — SVG radar chart component; draws grid polygons, axes, a filled data polygon, data point circles, and labels
- `ParentPortalPage` — root page component

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: User, Users, Star, Calendar, MapPin, Clock, TrendingUp, Award, Zap, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;        // 2-letter initials
  level: string;         // 'Elite' | 'Intermediate'
  xp: number;
  nextLevelXp: number;
  position: string;
  sessionsTotal: number;
  streak: number;        // consecutive training days
  skills: { name: string; score: number; change: number }[];
  badges: { name: string; icon: string; date: string }[];
}

// Booking
{ id, title, coach, date, time, location,
  type: 'camp' | 'clinic' | 'private',
  child: string, status: 'confirmed' | 'waitlist' }

// Session history
{ date, title, coach, rating, notes, xpEarned, child }
```

### State Management
- `selectedChild` — active child profile (initialized to children[0])
- `tab` — active tab ('overview' | 'progress' | 'schedule' | 'history')

### UI Patterns
- XP progress bar uses gradient fill scaled to `xp / nextLevelXp`
- Skill radar built with pure SVG math (polar to Cartesian conversion, `getPoint` helper)
- Progress tab skill bars show a dashed vertical line at `score - change` to indicate previous score
- Badge grid renders emoji icons alongside name and date
- Milestone cards show progress bars with reward descriptions
- Bookings and history are filtered by `selectedChild.name` at render time
