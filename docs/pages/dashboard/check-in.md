# Check-In — Gaya Intelligence Platform

## Product

**Purpose:** Digital attendance system for tracking athlete check-ins at live sessions using QR codes, with real-time status updates, manual check-in capability, attendance analytics, and session history.

**Target users:** Coaches and venue staff managing athlete attendance at training sessions, camps, and clinics.

**Key features:**
- Three tabs: Live Check-In, History, Analytics
- Live tab: QR code display (scan to check in), live session info card with checked-in / late / absent counters and a fill bar
- Upcoming session card shows next session title, time, and registration count
- Attendee roster table with columns: Athlete, Parent, Age, Status, Check-In Time, Actions
- Status badges: `checked-in` (green), `late` (amber), `absent` (red), `pending` (gray)
- Manual Check-In button for staff to record attendance without a scan
- Mark Absent action for pending attendees whose status is unknown
- History tab: session list with attendance ratio and percentage for completed sessions
- Analytics tab: four KPI cards (avg attendance rate, total check-ins, avg late arrivals, no-show rate) and a weekly bar chart
- Export and Share QR buttons in the page header

**User flows:**
1. Open Check-In on a live session day; QR code is displayed for athletes to scan at the venue
2. Monitor the attendee table as athletes arrive; late arrivals flagged with amber badge and a note
3. Manually check in any remaining athletes using the Manual Check-In button
4. Mark absent athletes whose parents have been notified
5. After the session, switch to History or Analytics to review trends

---

## Technical

**Component:** `CheckInPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
type Tab = 'live' | 'history' | 'analytics';

interface Attendee {
  id: string; name: string; avatar: string;
  checkedIn: boolean; checkInTime?: string;
  status: 'checked-in' | 'late' | 'absent' | 'pending';
  parentName?: string; age: number; notes?: string;
}

interface Session {
  id: string; title: string; date: string; time: string;
  coach: string; venue: string;
  capacity: number; registered: number; checkedIn: number;
  status: 'upcoming' | 'active' | 'completed';
  attendees: Attendee[];
}
```

**Mock data:**
- `sessions` — 3 entries: one active (9 attendees), one upcoming (0 attendees), one completed
- `weeklyStats` — 7-day attendance rate and session count array for the analytics chart

**State:**
- `tab: Tab` — active tab; drives conditional render with `animate-fade-in`
- `selectedSession: Session` — initialized to `sessions[0]` (the active session)
- `search: string` — filters `attendees` by name client-side

**Derived values (inline):**
- `checkedIn`, `late`, `absent` — filtered counts from `attendees` array
- Attendance percentage: `(checkedIn / attendees.length) * 100`

**UI patterns:**
- QR code visual is a CSS `repeating-conic-gradient` pattern (placeholder)
- Tab bar styled with `bg-blue-500/10 text-blue-400` for active; all tabs use `lucide-react` icons
- Attendee table uses a `grid grid-cols-12` layout per row (no `<table>` element)
- Avatar gradient color driven by status: green = checked-in, amber = late, red = absent, gray = pending
