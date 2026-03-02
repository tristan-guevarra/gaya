# Health — Customer Health Score

**App:** Gaya — Intelligence Platform
**Route:** `/health`

---

## Product

### Purpose
Customer success dashboard for monitoring the health of sports organization accounts. Surfaces churn risk, engagement signals, and NPS data, and provides AI-generated retention playbooks for at-risk accounts.

### Target Users
Customer success managers (CSMs) and leadership who oversee B2B accounts (sports clubs and academies).

### Key Features
- Four-tab layout: Overview, Accounts, NPS Tracking, Playbooks
- Health scores (0–100) per account with status tiers: thriving / healthy / at-risk / critical
- Health signal matrix table: DAU, events created, fill rate, NPS, MRR, trend
- At-risk MRR calculation and "Revenue at Risk" panel
- NPS trend chart (6 months) with promoter/passive/detractor breakdown and recent verbatim feedback
- AI-generated retention playbooks with step-by-step intervention plans

### User Flows
1. Check Overview for aggregate health distribution and flagged revenue at risk
2. Switch to Accounts tab, filter by status, and review individual account metrics and risk factors
3. Open NPS tab to track score trend and read customer feedback
4. Use Playbooks tab to action AI-recommended interventions for critical/at-risk accounts

---

## Technical

### Components
- `HealthScorePage` — root page component with tab switching and status filter
- Inline render logic for each of the four tabs (no extracted sub-components)

### Imports / Dependencies
- `react`: `useState`, `useMemo`
- `lucide-react`: Heart, TrendingUp, TrendingDown, AlertTriangle, Shield, Sparkles, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
interface Account {
  id: string;
  name: string;
  logo: string;           // 2-letter initials
  health: number;         // 0–100 composite score
  status: 'thriving' | 'healthy' | 'at-risk' | 'critical';
  mrr: number;
  nps: number;
  lastActive: string;
  trend: 'up' | 'down' | 'flat';
  riskFactors: string[];
  dau: number;            // daily active users %
  eventsCreated: number;
  fillRate: number;
  csm: string;
}

// NPS time series
{ month: string; promoters: number; passives: number; detractors: number; score: number }

// Retention playbook
{ id: string; account: string; status: HealthStatus;
  title: string; steps: string[]; impact: string; urgency: string; owner: string }
```

### State Management
- `tab` — active tab ('overview' | 'accounts' | 'nps' | 'playbooks')
- `statusFilter` — account list filter ('all' | 'thriving' | 'healthy' | 'at-risk' | 'critical')
- `filteredAccounts` and `stats` derived via `useMemo`

### UI Patterns
- Color-coded health status badges and bar fills (green/atlas/amber/red)
- Segmented horizontal bar showing portfolio health distribution
- Gradient revenue-at-risk progress bar (red → amber)
- NPS stacked bar chart built with flex divs (no chart library)
- Playbook steps rendered as numbered list items inside each playbook card
- "Run Playbook" button only appears on at-risk and critical account cards
