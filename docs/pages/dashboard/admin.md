# Admin Center

**Route:** `/admin`
**File:** `src/app/(dashboard)/admin/page.tsx`

---

## Product

**Purpose:** Internal platform administration console for managing feature flags, reviewing the audit log, and overseeing all registered organizations.

**Target users:** Gaya platform superadmins only.

**Key features:**
- 3-tab layout with sticky tab bar: Feature Flags, Audit Log, Organizations
- **Feature Flags tab:** Searchable list of 10 flags with real toggle switches; shows rollout percentage badge and target org count; footer shows enabled/total count and Redis cache note
- **Audit Log tab:** Searchable chronological log of platform mutations; each entry shows user, action (create/update/delete with color badge), resource type + ID, field-level changes (old → new), timestamp, and IP address; CSV export button
- **Organizations tab:** Card grid of 6 orgs with plan badge (free/starter/pro), status (active/trial), coach count, event count, and Manage/Settings actions; Add Organization button

**User flow:** Admin navigates to Admin Center → toggles flags for gradual rollout → reviews audit log after a change → manages org plans and status.

---

## Technical

**Components:**
- `Card`, `Badge`, `Button` from `@/components/ui`

**Key imports:**
- `lucide-react` — Settings, ToggleLeft, ToggleRight, ScrollText, Building2, Shield, Search, etc.
- `@/lib/utils` — `cn`
- `@/types` — `FeatureFlag`, `AuditLogEntry`
- `react` — `useState`, `useMemo`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `activeTab` | `'flags' \| 'audit' \| 'orgs'` | Active tab |
| `flags` | `FeatureFlag[]` | Local copy of flags (toggle mutates this) |
| `auditSearch` | `string` | Audit log search filter |
| `flagSearch` | `string` | Feature flag search filter |

**Mock data shapes (from `@/types`):**
```ts
interface FeatureFlag {
  id: string; key: string; name: string; description: string;
  enabled: boolean; percentage_rollout: number;
  target_orgs?: string[]; updated_by: string; updated_at: string;
}
interface AuditLogEntry {
  id: string; user_id: string; user_name: string;
  action: 'create' | 'update' | 'delete'; resource_type: string;
  resource_id: string; changes?: Record<string, { old: unknown; new: unknown }>;
  ip_address?: string; created_at: string;
}
// MOCK_ORGS: { id, name, coaches, events, plan: 'free'|'starter'|'pro', status: 'active'|'trial' }[]
```

**UI patterns:**
- `toggleFlag` mutates local `flags` state and sets `updated_at` to `new Date().toISOString()`
- `filteredFlags` and `filteredAudit` via `useMemo` on search strings
- Action colors: create=atlas, update=blue, delete=red
- Resource icons mapped: `feature_flag`→ToggleRight, `event`→MapPin, `coach`→Shield, `lead`→User, `organization`→Building2
- Tab bar is `sticky top-0` with `backdrop-blur-xl`
