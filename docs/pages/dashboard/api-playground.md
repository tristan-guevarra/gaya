# API Playground

**Route:** `/api-playground`
**File:** `src/app/(dashboard)/api-playground/page.tsx`

---

## Product

**Purpose:** Interactive API testing console that lets developers explore, execute, and generate code for all Gaya API endpoints directly from the browser.

**Target users:** Developers and technical integrators building on top of the Gaya API.

**Key features:**
- Left sidebar: collapsible category groups (Discovery, Intelligence, ML/Simulator, Auth, Leads) listing 7 endpoints with method badge and auth lock icon
- Main panel: endpoint header with method badge + path + auth indicator, parameter table (name/type/required/description), request body JSON block, Send Request button
- Simulated execution: latency-matched delay (using `endpoint.latency` ms), then reveals status code + response time + JSON response
- Code snippet generator: cURL, Python, JavaScript tabs — auto-generates correct code for selected endpoint
- Copy buttons on response and code snippet panels
- Method badge colors: GET=green, POST=blue, PUT=amber, DELETE=red, PATCH=purple

**User flow:** Browse sidebar → select endpoint → read params → click Send Request → view response → switch to code snippet tab → copy for use.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — Play, Code, Copy, Check, ChevronRight, ChevronDown, Globe, Lock, Key, Clock, Zap, BookOpen, Terminal, AlertTriangle, CheckCircle, Loader2, RotateCcw, Braces
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `selected` | `Endpoint` | Active endpoint |
| `isRunning` | `boolean` | Loading spinner during simulated request |
| `showResponse` | `boolean` | Whether to render response panel |
| `codeLang` | `'curl' \| 'python' \| 'javascript'` | Active code snippet language |
| `copied` | `boolean` | Copy flash state |
| `expandedCat` | `string` | Open sidebar category |

**Mock data shape:**
```ts
interface Endpoint {
  id: string; method: 'GET'|'POST'|'PUT'|'DELETE'|'PATCH';
  path: string; description: string; category: string; auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: string; // pre-formatted JSON string
  exampleResponse: string; // pre-formatted JSON string
  statusCode: number; latency: number; // ms
}
```

**Code generators:** `generateCurl`, `generatePython`, `generateJS` — pure functions taking an `Endpoint` and returning a formatted string. Base URL hardcoded as `https://api.gaya.app`.

**UI patterns:**
- Two-panel layout: `w-72` fixed sidebar + `flex-1` scrollable main content (uses `min-h-screen flex`)
- `handleRun` sets `isRunning=true`, uses `setTimeout(latency)` then sets `showResponse=true`
- Selected endpoint in sidebar gets `border-l-2 border-atlas-500` and `bg-slate-50`
- Response and code panels use `<pre>` with `text-xs font-mono whitespace-pre`
