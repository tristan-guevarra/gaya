# Settings

**Route:** `/settings`
**File:** `src/app/(dashboard)/settings/page.tsx`

---

## Product

**Purpose:** Account management hub covering personal profile, notification preferences, team management, API key access, billing details, and destructive account actions.

**Target users:** Any authenticated user for personal preferences; superadmins for team and billing management.

**Key features:**
- Sidebar tab navigation: Profile, Notifications, Team & Roles, API Keys, Billing, Danger Zone
- **Profile:** Name/email/phone/timezone fields, avatar with change photo, organization card, appearance theme picker (Dark/Light/System)
- **Notifications:** Toggle groups for Email (bookings, leads, alerts, digest), Push (bookings, leads, critical), and Other (in-app, SMS urgent)
- **Team & Roles:** Member list with role badges; pending invite indicator; Invite button
- **API Keys:** Masked live key with show/hide and copy actions; usage stats (API calls, data points, webhooks vs plan limits); Regenerate and API Docs buttons
- **Billing:** Current plan card (Pro, $99/month), feature list, payment method display
- **Danger Zone:** Export all data (ZIP) and Delete Organization with destructive styling

**User flow:** Click sidebar tab → make changes → save (per-section save buttons where applicable).

---

## Technical

**Components:**
- `Toggle` — inline sub-component (`enabled`, `onChange`, `label`, `desc`)
- `Card`, `Badge`, `Button` from `@/components/ui`

**Key imports:**
- `lucide-react` — User, Bell, Users, Key, Download, Shield, Globe, Check, X, Eye, EyeOff, Copy, Moon, Sun, Monitor, Mail, MessageSquare, Smartphone, MapPin, Calendar, Zap, AlertTriangle, Settings, Lock, Trash2, CreditCard, Building2
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `tab` | `SettingsTab` | Active sidebar tab |
| `showKey` | `boolean` | Show/mask API key |
| `copied` | `boolean` | Copy success flash (2s timeout) |
| `notifSettings` | `Record<string, boolean>` | All notification toggles |

**`notifSettings` keys:**
`email_bookings`, `email_leads`, `email_alerts`, `email_digest`, `push_bookings`, `push_leads`, `push_alerts`, `in_app_all`, `sms_urgent`

**Mock data:**
- `mockApiKey = 'ta_live_sk_7f8e3a2b1c9d4e5f6a7b8c9d0e1f2a3b'`
- Team members: Marcus Thompson (Superadmin), Sarah Chen (Org Admin), David Okafor (Coach), Pending Invite
- Plan: Pro, $99/month, 5 seats; payment: Visa 4242 exp 12/27

**UI patterns:**
- Sidebar uses `lg:grid-cols-[220px_1fr]` layout
- Active tab key re-renders content div with `key={tab}` to trigger `animate-fade-in`
- Danger zone tab styled with `text-red-400/60` in sidebar, `!border-red-500/15` on card
- `Toggle` component is a styled `<button>` that calls `onChange(!enabled)` on click
