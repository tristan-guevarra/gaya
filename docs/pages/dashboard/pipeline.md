# Pipeline — Lead Pipeline

**App:** Gaya — Intelligence Platform
**Route:** `/pipeline`

---

## Product

### Purpose
A Kanban-style CRM board for managing inbound leads through a sales funnel. Enables staff to track, prioritize, and act on leads from initial contact through to won deals.

### Target Users
Sales/admin staff at sports academies and clubs who handle parent/athlete inquiries for camps, clinics, and private training sessions.

### Key Features
- Five-stage Kanban board: New Leads, Contacted, Qualified, Proposal Sent, Won
- Drag-and-drop lead cards between columns
- Urgency indicators (low / medium / high / critical) with animated pulse on critical
- Lead detail modal with contact info, notes, and quick actions (email, call)
- Pipeline summary stats: total value, won revenue, conversion rate, active leads
- Search/filter by name or zone

### User Flows
1. View board and scan urgency badges to prioritize outreach
2. Drag a card to advance it to the next stage (updates `lastActivity` to "just now")
3. Click a card to open the detail modal; send email or initiate a call
4. Use the search input to filter leads across all columns by name or zone

---

## Technical

### Components
- `LeadCard` — draggable card with avatar initials, urgency badge, type tag, zone, last activity, deal value, and assigned coach initials
- `LeadDetailModal` — overlay with 2-column detail grid (type, value, zone, source, urgency, child age), notes panel, and action buttons
- `PipelinePage` — root page component

### Imports / Dependencies
- `react`: `useState`, `useRef`
- `lucide-react`: icon set (Inbox, UserCheck, Calendar, CreditCard, CheckCircle, etc.)
- `@/lib/utils`: `cn` (class merging utility)

### Mock Data Shape
```ts
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  type: 'camp' | 'clinic' | 'private';
  zone: string;
  value: number;          // deal value in dollars
  assignedTo?: string;    // coach initials
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lastActivity: string;
  notes?: string;
  childAge?: number;
  source: string;         // e.g. 'Map Search', 'Referral', 'Google'
}
```

### State Management
- `leads` — full lead array (useState); mutations update stage on drop
- `searchQuery` — filters leads by name/zone across all columns
- `selectedLead` — controls modal visibility
- `dragOverColumn` — highlights the column being dragged over
- `dragIdRef` (useRef) — stores the id of the card currently being dragged (avoids stale closure)

### UI Patterns
- Native HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`)
- Horizontal scroll for the board (`overflow-x-auto`, `min-w-max`)
- `animate-pulse` on critical urgency badges
- Column headers show card count badge and total column value
- Empty column state renders a "Drop leads here" placeholder
