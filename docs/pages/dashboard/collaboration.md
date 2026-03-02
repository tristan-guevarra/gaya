# Live Collaboration

**Route:** `/collaboration`
**File:** `src/app/(dashboard)/collaboration/page.tsx`

---

## Product

**Purpose:** Figma-style real-time presence page showing which team members are active, what they are editing, and a live activity log — making multi-user dashboard coordination visible.

**Target users:** Admin and coach teams working concurrently on the platform who need awareness of who is doing what.

**Key features:**
- Team member grid (2-column) with status indicators: editing (green pulse), active, or idle
- Per-user card shows: initials avatar, name, role badge (admin crown / coach shield), current page, last-seen time
- "Currently editing" banner appears on cards where `status === 'editing'`, showing the specific item being edited
- Live Activity Feed sidebar: timestamped micro-actions (edit, view, create, comment) with user color-coded avatars
- WebSocket connection status card: latency (12ms) and uptime (99.97%) display

**User flow:** Page loads with static presence snapshot → team members visible in grid → sidebar shows recent collaborative actions → connection status confirms live sync.

---

## Technical

**Components:** All inline; no sub-components.

**Key imports:**
- `lucide-react` — Users, Eye, Edit3, MessageCircle, Crown, Shield, Wifi
- `@/lib/utils` — `cn`
- `@/components/collaboration/PresenceBar` — `PRESENCE_USERS`, `LIVE_ACTIVITIES` (imported constants, not hooks)

**State:** None — page is fully static, driven by imported mock data constants.

**Mock data shapes (from PresenceBar):**
```ts
// PRESENCE_USERS items (inferred shape):
{ id: string; name: string; initials: string; color: string;
  role: 'admin' | 'coach' | 'viewer';
  status: 'active' | 'editing' | 'idle';
  currentPage: string; lastSeen: string; }

// LIVE_ACTIVITIES items (inferred shape):
{ id: string; user: string; userColor: string;
  type: 'edit' | 'view' | 'create' | 'comment';
  action: string; target: string; timestamp: string; }
```

**UI patterns:**
- 2/3 + 1/3 column grid (team left, activity + status right)
- Card border color varies by status: `border-green-500/20` (editing), `border-atlas-500/10` (active), `border-slate-200` (idle)
- Status dot uses `animate-pulse` for editing state
- Activity type mapped to icon: edit→Edit3, view→Eye, create→`+` text, else→MessageCircle
- Connection status card is purely presentational (hardcoded values)
