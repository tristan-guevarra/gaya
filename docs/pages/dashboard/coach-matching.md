# Coach Matching — AI Coach Matching

**App:** Gaya — Intelligence Platform
**Route:** `/coach-matching`

---

## Product

### Purpose
AI-powered coach recommendation engine that pairs a given athlete profile with the best available coaches based on weighted compatibility factors. Allows users to explore and compare matches before booking.

### Target Users
Platform operators, parents, and athletes browsing for coaching options; also used internally to validate match quality.

### Key Features
- Athlete profile summary card showing goals, position, level, location, budget, and learning style
- Ranked list of up to four coach matches, each with an SVG circular score ring
- Factor breakdown panel: six weighted dimensions (Skill Alignment, Location, Availability, Price Match, Teaching Style, Track Record)
- Score formula display showing the weighted calculation
- Teaching style, specialties, and language info cards
- Quick-action buttons: Book Session, Save, Message

### User Flows
1. View athlete profile at top of page to understand requirements
2. Browse ranked match list on the left; click a coach to load detail on the right
3. Review the "Why This Match" factor breakdown (toggle show/hide)
4. See price, availability, next slot, and repeat rate at a glance
5. Click "Book Session" to proceed, or "Save" / "Message" for later

---

## Technical

### Components
- `CoachMatchingPage` — root page component; manages selected match and factor panel toggle
- All rendering is inline (no extracted sub-components)

### Imports / Dependencies
- `react`: `useState`, `useMemo`
- `lucide-react`: Brain, Star, MapPin, Clock, DollarSign, Target, Award, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
interface MatchFactor {
  name: string;
  score: number;       // 0–100
  weight: number;      // percentage weight in final score
  explanation: string;
  icon: React.ElementType;
}

interface CoachMatch {
  id: string;
  name: string;
  avatar: string;      // 2-letter initials
  title: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  availability: string;
  matchScore: number;  // 0–100 overall match %
  factors: MatchFactor[];
  specialties: string[];
  style: string;
  experience: string;
  languages: string[];
  nextAvailable: string;
  responseTime: string;
  repeatRate: number;
}

// Athlete profile (static object)
{ name, age, position, level, goals, location, budget, preferredTimes, learningStyle }
```

### State Management
- `selectedMatch` — currently displayed coach (initialized to matches[0])
- `showFactors` — toggles expanded factor explanations
- `weights` — object of factor weights (not yet wired to score recalculation; UI only)

### UI Patterns
- SVG circular progress ring for match score on each list card
- Color thresholds: green ≥90, atlas 80–89, amber 70–79, red <70
- 12-column grid layout: 5 cols for list, 7 cols for detail
- Inline score formula rendered as monospace text
- Gradient avatar backgrounds derived from match score range (`getScoreRing`)
- Factor bars use the same color thresholds as the score ring
