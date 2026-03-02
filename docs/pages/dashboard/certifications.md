# Certification Tracker

**Route:** `/certifications`
**File:** `src/app/(dashboard)/certifications/page.tsx`

---

## Product

**Purpose:** Coach credential compliance management — tracks required and recommended certifications for each coach, flags expiry risks, and provides renewal/reminder actions.

**Target users:** Org admins responsible for ensuring coach safety compliance (vulnerable sector checks, first aid, sport licenses).

**Key features:**
- Summary stats: total certifications, expiring soon count, expired count, avg compliance score
- Coach list (left panel): avatar with compliance-color gradient, name, role, compliance % score, per-cert status dot row (green/amber/red/blue)
- Verified badge (`BadgeCheck`) on compliant coaches
- Cert detail panel (right): filters by status (all / expiring / expired / pending), each cert card shows: issuer, type badge (required/recommended/optional), expiry date, days remaining/overdue
- Per-cert actions: "Renew Now" (expired), "Remind" with Bell icon (expiring), "View" (all)
- Upload Certificate button in header

**User flow:** Select coach → review compliance score → filter certs by status → identify expired/expiring → trigger renew or set reminder.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — Shield, Award, CheckCircle, AlertTriangle, XCircle, Clock, FileText, Upload, Calendar, BadgeCheck, Bell, Eye, etc.
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `selectedCoach` | `Coach` | Currently displayed in detail panel |
| `filter` | `'all' \| 'expiring' \| 'expired' \| 'pending'` | Cert status filter |

**Mock data shapes:**
```ts
interface Certification {
  id: string; name: string; issuer: string;
  type: 'required' | 'recommended' | 'optional';
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  expiryDate: string; daysLeft?: number; verificationUrl?: string;
}
interface Coach {
  id: string; name: string; avatar: string; role: string;
  complianceScore: number; certifications: Certification[];
  verified: boolean; lastAudit: string;
}
```

**UI patterns:**
- 4/8 column grid: coach list left, cert details right
- Compliance score color: `>=90`=green, `>=70`=amber, else=red (applied to avatar gradient and score text)
- `statusConfig` maps status → `{ icon, color, bg, label }` for cert row icons
- Days remaining color: `>90`=green, `>30`=amber, else=red
- `filteredCerts` derived from `selectedCoach.certifications` filtered by active `filter`
- Summary stats (`totalCerts`, `expiringCerts`, `expiredCerts`, `avgCompliance`) derived via `Array.reduce`
