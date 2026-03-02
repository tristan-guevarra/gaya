# Integrations

**Route:** `/integrations`
**File:** `src/app/(dashboard)/integrations/page.tsx`

---

## Product

**Purpose:** App store-style marketplace for connecting Gaya to third-party tools across payments, communication, scheduling, analytics, CRM, and data/AI categories.

**Target users:** Org admins who want to extend the platform with their existing tool stack.

**Key features:**
- 15 integrations across 6 categories: Payments, Communication, Scheduling, Analytics, CRM, Data & AI
- Category tab bar and live search bar filter the grid simultaneously
- "Active Connections" section at top (category=all, no search) showing 5 connected integrations with settings gear
- Integration cards: gradient icon, name, description, NEW/Popular/Active/Soon badges, install count, tier (free/pro/enterprise)
- Click card → modal overlay with long description, feature checklist, connection status, and action button (Connect / Configure+Disconnect / Notify Me)
- Connected integrations: last sync time shown in modal
- Coming soon integrations: "Notify Me When Available" CTA

**User flow:** Browse grid or search → filter by category → click card → read details → connect or configure.

---

## Technical

**Components:** All inline; modal is conditional render within the page.

**Key imports:**
- `lucide-react` — Puzzle, Search, Check, ExternalLink, Settings, Zap, Shield, CreditCard, Bell, Mail, MessageSquare, Calendar, BarChart3, Users, MapPin, Camera, Code, Brain, DollarSign, X, CheckCircle, Clock, AlertCircle, etc.
- `@/lib/utils` — `cn`
- `react` — `useState`, `useMemo`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `category` | `string` | Active category tab ('all' or category id) |
| `search` | `string` | Search input value |
| `selectedIntegration` | `Integration \| null` | Open detail modal |

**Mock data shape:**
```ts
interface Integration {
  id: string; name: string; description: string; longDesc: string;
  icon: React.ElementType; iconBg: string; category: string;
  status: 'connected' | 'available' | 'coming_soon';
  popular?: boolean; new?: boolean; installs: string;
  features: string[]; tier: 'free' | 'pro' | 'enterprise';
}
```

**UI patterns:**
- `useMemo` for filtered integrations (category + search combined)
- `CATEGORIES` and `INTEGRATIONS` are module-level constants
- Modal uses `fixed inset-0 z-50` with backdrop click to dismiss; `e.stopPropagation()` on inner div
- Tier badge colors: free=green, pro=atlas, enterprise=purple
- Icon backgrounds are Tailwind gradient strings stored on the integration object (`iconBg`)
