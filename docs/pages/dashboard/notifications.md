# Notifications — Gaya Intelligence Platform

## Product

**Purpose:** Centralized notification center that surfaces leads, event updates, revenue events, AI insights, team milestones, and system alerts in a single prioritized feed.

**Target users:** Coaches and operators who need to stay on top of time-sensitive actions without context-switching between sections.

**Key features:**
- Category sidebar with unread badge counts per category (All, Leads, Events, Revenue, AI Insights, Team, System)
- Priority system: `urgent` and `high` display colored inline badges; `normal` and `low` are unstyled
- Unread state drives visual hierarchy — unread items render on white cards; read items on dimmed backgrounds
- Individual actions: mark as read (click row or check icon), delete (trash icon on hover)
- Bulk action: Mark All Read button in the header
- Unread Only toggle filters the list to show only unread items
- Today's Summary panel shows aggregate counts for leads, events, revenue, and AI insights
- Action buttons on individual notifications (e.g., "View Lead", "Run Playbook") link to the relevant feature area

**User flows:**
1. Open Notifications; unread count in page header indicates pending items
2. Click a category in the sidebar to filter; counts update per category
3. Toggle Unread Only to focus on items needing attention
4. Click a notification row to mark it read; hover to reveal individual mark-read or delete actions
5. Click an action button (e.g., "View Analysis") to navigate to the relevant page

---

## Technical

**Component:** `NotificationsPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState`, `useMemo` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
type NotifCategory = 'all' | 'leads' | 'events' | 'revenue' | 'system' | 'ai' | 'team';
type Priority = 'urgent' | 'high' | 'normal' | 'low';

interface Notification {
  id: string; title: string; body: string;
  category: Exclude<NotifCategory, 'all'>;
  priority: Priority;
  icon: React.ElementType; iconColor: string;
  read: boolean;
  actionLabel?: string; actionHref?: string;
  timestamp: string; relativeTime: string; actor?: string;
}
```

**Mock data:** `initialNotifications` — 12 items spanning all categories and priorities; mix of read/unread.

**State:**
- `notifications: Notification[]` — mutable; `markAsRead` and `deleteNotification` produce new arrays via `map`/`filter`
- `activeCategory: NotifCategory` — drives `useMemo` filter
- `showUnreadOnly: boolean` — secondary filter applied after category filter

**Derived state (useMemo):**
- `filtered` — notifications after category and unread-only filters
- `categoryCounts` — `Record<string, number>` of unread counts per category for sidebar badges

**UI patterns:**
- Layout: `grid grid-cols-12`; sidebar = `col-span-3` sticky; feed = `col-span-9`
- `priorityBadge` lookup table maps `Priority` to `{ color, label }` for inline display
- Hover-only action buttons use `opacity-0 group-hover:opacity-100` on the actions wrapper
- `e.stopPropagation()` on action buttons prevents the row click (mark-as-read) from firing
