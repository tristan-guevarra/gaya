# Experiments — A/B Testing Lab

**App:** Gaya — Intelligence Platform
**Route:** `/experiments`

---

## Product

### Purpose
A/B testing management interface for running and analyzing experiments on pricing, scheduling, copy, capacity, and acquisition channels. Surfaces statistical confidence, variant comparison, and AI-powered ship/wait recommendations.

### Target Users
Growth and product teams running controlled experiments to optimize conversion rates and revenue across the platform.

### Key Features
- Summary stats: active experiments, completed count, average confidence, total revenue impact
- Filterable experiment list (all / running / completed / paused) with traffic progress bar and confidence score
- Detail panel for the selected experiment: description, statistical confidence meter, variant bars, and data table
- Variant comparison: visual proportional bars labeling CONTROL and WINNER, plus tabular data (visitors, conversions, conversion rate, revenue, vs control %)
- AI recommendation panel (shown when confidence ≥ 80%) advising whether to ship or continue running
- "New Experiment" button (UI only)
- "Stop" button shown on running experiments

### User Flows
1. Scan the experiment list; filter by status
2. Select an experiment to load its detail on the right
3. Review the confidence meter and variant bars to assess readiness to ship
4. Read the AI recommendation; click "Stop" to end a running experiment if appropriate

---

## Technical

### Components
- `ABTestingPage` — root page component; all rendering is inline

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: FlaskConical, Play, Pause, CheckCircle, Clock, Target, Sparkles, Plus, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
interface Variant {
  name: string;
  description: string;
  visitors: number;
  conversions: number;
  revenue: number;
  convRate: number;
  isControl: boolean;
  isWinner?: boolean;
}

interface Experiment {
  id: string;
  name: string;
  type: 'pricing' | 'timing' | 'copy' | 'capacity' | 'channel';
  status: 'running' | 'completed' | 'paused' | 'draft';
  startDate: string;
  endDate?: string;
  traffic: number;        // % of traffic routed to experiment
  confidence: number;     // statistical confidence %
  variants: Variant[];
  description: string;
  zone: string;
  uplift?: number;        // % uplift on completed experiments
}
```

### State Management
- `selectedExperiment` — currently displayed experiment (initialized to experiments[0])
- `statusFilter` — list filter ('all' | 'running' | 'completed' | 'paused')
- `filtered` — derived array; computed inline (not memoized)

### UI Patterns
- 12-column grid: 5-col list + 7-col detail panel
- Confidence meter: colored progress bar (green ≥95%, atlas ≥80%, amber <80%) with 95% labeled as threshold
- Variant bars: width = `convRate / maxRate * 100%`; winner bar green, control bar atlas, others slate
- vs Control column: calculates `(variant.convRate - control.convRate) / control.convRate * 100`
- Traffic bar on list cards uses green when at 95%+ and atlas otherwise
- `statusConfig` map drives icon and color for each status badge
- Type badges use `typeColors` map (pricing=green, timing=blue, copy=purple, capacity=amber, channel=pink)
