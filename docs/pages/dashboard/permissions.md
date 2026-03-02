# Permissions Matrix

**Route:** `/permissions`
**File:** `src/app/(dashboard)/permissions/page.tsx`

---

## Product

**Purpose:** Role-based access control (RBAC) management with a visual permission matrix that lets admins see exactly what each role can and cannot do across all platform capabilities.

**Target users:** Superadmins managing team access and defining role boundaries within their organization.

**Key features:**
- 4 role cards at top: Super Admin, Org Admin, Coach, Viewer — click to highlight that role's column
- Full permission matrix table: rows are individual permissions grouped into 6 categories (Dashboard, Events, Coaches, Leads & CRM, Intelligence, Administration); columns are roles
- Permission values: Full Access (green CheckCircle), Read Only (amber Eye), No Access (grey Minus)
- Selected role column highlighted with `bg-purple-500/5` tint across all rows
- System roles show Lock icon; custom roles do not
- Legend at bottom explaining the three icon states
- "Create Role" button in header (not yet wired)
- User count shown per role card

**User flow:** Select a role card → review highlighted column in matrix → compare against other roles → identify gaps → create new role if needed.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — Shield, Users, Lock, Unlock, Eye, Edit, Trash2, Plus, CheckCircle, XCircle, Minus, Settings, Crown, Star, UserCog, AlertTriangle, Copy, Search
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `selectedRole` | `Role` | Currently highlighted role (defaults to Super Admin) |

**Mock data shapes:**
```ts
type Permission = 'full' | 'read' | 'none';

interface Role {
  id: string; name: string; description: string;
  color: string; icon: React.ElementType;
  userCount: number; isSystem: boolean;
  permissions: Record<string, Permission>; // key = 'category.action'
}
// permissionCategories: { name: string, permissions: { key: string, label: string }[] }[]
```

**Permission keys follow `category.action` pattern:**
- `dashboard.view`, `dashboard.analytics`, `dashboard.export`
- `events.view`, `events.create`, `events.edit`, `events.delete`, `events.pricing`
- `coaches.view`, `coaches.manage`, `coaches.certifications`, `coaches.payroll`
- `leads.view`, `leads.manage`, `leads.export`
- `intel.zones`, `intel.expansion`, `intel.competitive`, `intel.financials`
- `admin.users`, `admin.roles`, `admin.billing`, `admin.audit`, `admin.feature_flags`

**UI patterns:**
- Matrix built as nested `div` rows rather than `<table>` — uses `flex` with fixed-width `w-56` label column and `flex-1` per role column
- Category header rows span full width with a lighter background
- Role column highlight applied conditionally on every row via `selectedRole.id === r.id`
