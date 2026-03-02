# Workflow Automations

**Route:** `/automations`
**File:** `src/app/(dashboard)/automations/page.tsx`

---

## Product

**Purpose:** Visual IFTTT-style workflow builder that automates repetitive operational tasks such as lead nurturing, event fill-rate alerts, post-session reviews, and gamification milestones.

**Target users:** Org admins and ops teams who want to reduce manual work through triggered workflows.

**Key features:**
- Summary stats: active automation count, total executions, avg success rate, estimated time saved/month
- Automation list (left panel): category badge, status pill (active/paused/draft/error), run count, success %, last run time
- Visual flow builder (right panel): ordered step cards for selected automation — each step typed as Trigger, Condition, or Action with distinct color
- Connector arrows between steps; "Add Step" button at bottom
- Pause / Activate toggle per automation
- Execution log drawer (toggled via "Execution Log" button): success/error rows with automation name, time, and details
- AI Suggestion card at bottom proposing new automations based on usage patterns

**User flow:** Browse automations → select one → view visual flow → pause/activate → open execution log to diagnose → read AI suggestion for next automation.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — Workflow, Play, Pause, Plus, Zap, Bell, Mail, MessageCircle, Calendar, Users, DollarSign, Clock, Target, TrendingUp, Star, Shield, CheckCircle, XCircle, AlertTriangle, Sparkles, ArrowDown, Activity, etc.
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `selectedAutomation` | `Automation` | Displayed in the flow builder panel |
| `showLog` | `boolean` | Toggles the execution log drawer |

**Mock data shapes:**
```ts
interface AutomationStep {
  type: 'trigger' | 'condition' | 'action';
  icon: React.ElementType; label: string;
  description: string; color: string; // Tailwind classes
}
interface Automation {
  id: string; name: string; description: string;
  status: 'active' | 'paused' | 'draft' | 'error';
  trigger: string; actions: string[];
  runs: number; successRate: number; lastRun: string;
  steps: AutomationStep[]; category: string;
}
// executionLog: { automation, status: 'success'|'error', time, details }[]
```

**UI patterns:**
- 5/7 column grid: list left, flow builder right
- Step cards color-coded by type: trigger=blue, condition=amber, action=green; card border uses same color token as inner icon
- `ArrowDown` connector between steps via centered `div` spacer
- Status badge: active=green, paused=amber, draft=slate, error=red
- AI Suggestion card uses `bg-purple-500/5 border-purple-500/15` styling
