# Form Builder

**Route:** `/forms`
**File:** `src/app/(dashboard)/forms/page.tsx`

---

## Product

**Purpose:** Visual drag-and-order form creator for building custom registration, waiver, and feedback forms with live preview, reusable templates, and submission analytics.

**Target users:** Coaches and org admins who need to collect structured data for camp sign-ups, medical info, waivers, or feedback.

**Key features:**
- 3-tab layout: Builder, Templates, Submissions
- **Builder:** 3-panel layout — field palette (left), form canvas (center), field settings (right, appears on selection)
  - Field palette: 11 field types (text, email, phone, number, date, select, checkbox, toggle, file upload, location, star rating)
  - Canvas: editable form title, field list with type-appropriate previews, add/reorder (up/down arrows)/delete per field, submit button preview
  - Preview mode toggle collapses palette and settings, showing clean form view
  - AI suggestion card in palette recommending additional fields with conversion rationale
- **Templates:** 6 pre-built form templates (Camp Registration, Clinic Signup, Trial, Feedback, Medical, Coach Application) with field count and submission stats
- **Submissions:** 3 summary stats, tabular list of recent submissions with form name, name, email, date, complete/incomplete status

**User flow:** Choose template or start from Builder → add fields from palette → click field to edit label/placeholder/required → toggle Preview to review → Save Form.

---

## Technical

**Components:**
- All inline; no external component imports beyond `cn`

**Key imports:**
- `lucide-react` — FormInput, Type, Hash, Mail, Phone, Calendar, List, CheckSquare, ToggleLeft, Upload, MapPin, Star, Clock, Plus, Trash2, GripVertical, Eye, Settings, Copy, Save, ChevronDown, ChevronRight, Sparkles, FileText, Users, Shield, BarChart3, ArrowUp, ArrowDown, Layers
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `tab` | `'builder' \| 'templates' \| 'submissions'` | Active tab |
| `fields` | `FormField[]` | Current form fields (mutable) |
| `selectedField` | `string \| null` | ID of field with settings panel open |
| `showPreview` | `boolean` | Toggles preview mode in builder |
| `formName` | `string` | Editable form title |

**Mock data shapes:**
```ts
interface FormField {
  id: string; type: string; label: string;
  placeholder?: string; required: boolean;
  options?: string[]; icon: React.ElementType;
}
// templates: { name, fields, submissions, icon, description }[]
// submissions: { id, form, name, email, date, status: 'complete'|'incomplete' }[]
```

**Key operations:**
- `addField(type, label, icon)` — appends new field with generated timestamp ID
- `removeField(id)` — filters field out; clears `selectedField` if it was selected
- `moveField(id, dir)` — swaps adjacent array items with boundary check

**UI patterns:**
- Builder uses `grid-cols-12`: palette=3, canvas=6, settings=3 (settings only when `selectedField` set)
- In preview mode: palette hidden, canvas shifts to `col-span-8 col-start-3`
- Field canvas renders type-specific preview: `<select>`, `<input>`, checkbox div, toggle div, upload drop zone, star rating, or generic input
- Field settings panel is `sticky top-6` to stay in view while scrolling the canvas
