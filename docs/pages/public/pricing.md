# Pricing Page — `src/app/(public)/pricing/page.tsx`

**Route:** `/pricing`

---

## Product

### Purpose
SaaS pricing page communicating Gaya's three-tier subscription model. Designed to
convert free users to Pro and route enterprise leads to sales, with full feature
transparency via an expandable comparison matrix.

### Target Users
- Individual coaches evaluating the free Starter tier
- Growing academies comparing Pro vs Enterprise
- Procurement / ops teams at large sports organisations looking for enterprise terms

### Key Features
- Monthly / Annual billing toggle with live price recalculation (20% annual discount)
- Three-tier card grid: Starter (free), Pro ($99/$79 mo), Enterprise ($349/$279 mo)
- Per-tier: description, pricing, limits grid (Zones / Team Members / API Calls /
  Reports), feature checklist, and CTA button
- Pro card highlighted with "MOST POPULAR" crown badge and elevated shadow
- Expandable full feature comparison matrix across 5 categories (Discovery,
  Intelligence, AI/ML, Operations, Admin)
- FAQ accordion (6 questions) covering plan switching, trial policy, non-profit
  discounts, seat add-ons, payment methods, and contracts
- Enterprise CTA banner with "Talk to Sales" and "Book a Demo" buttons

### User Flows
1. Visitor lands → reads cards → clicks "Start Free" (Starter) → `/onboard`
2. Visitor toggles Annual → prices update → clicks "Start 14-Day Trial" (Pro) → `/onboard`
3. Visitor clicks "Show detailed feature comparison" → matrix expands → evaluates differences
4. Enterprise visitor clicks "Talk to Sales" / "Book a Demo" → contact/sales flow

---

## Technical

### Components Used
| Component | Source |
|-----------|--------|
| `FAQItem` | Inline — accordion item with `ChevronDown` rotation |
| `FeatureCell` | Inline — renders `Check` icon, `X` icon, or string value |

### Imports / Dependencies
- `next/link` — CTA navigation to `/onboard`
- `lucide-react` — Check, X, Zap, Star, Building2, Crown, ChevronDown, Sparkles, etc.
- `@/lib/utils` — `cn`

### Data Shapes

**`PricingTier`**
```ts
interface PricingTier {
  name: string;
  icon: React.ElementType;
  description: string;
  monthlyPrice: number;      // 0 for free
  annualPrice: number;
  accent: string;            // Tailwind text colour class
  accentBg: string;          // Tailwind bg + border classes
  popular?: boolean;
  features: string[];
  limits: { label: string; value: string }[];
  cta: string;
  ctaStyle: string;
}
```

**Comparison matrix entry:**
```ts
{ category: 'Intelligence', features: [
  { name: 'Heatmap overlays', starter: false, pro: true, enterprise: true },
  { name: 'H3 hex-level drill-down', starter: false, pro: true, enterprise: true },
  // value is boolean | string — string used for quota display e.g. '50/mo'
]}
```

**`FAQS`:** array of `{ q: string; a: string }` — 6 entries.

### State Management
| State | Type | Purpose |
|-------|------|---------|
| `isAnnual` | `boolean` | Toggles price display; defaults to `true` |
| `showComparison` | `boolean` | Expands/collapses full comparison table |
| `open` (FAQItem) | `boolean` | Per-item accordion open state (local to each `FAQItem`) |

### UI Patterns
- Price rendered as `price === 0 ? 'Free' : '$${price}'`; annual strike-through
  shows monthly price alongside discounted annual price
- `FeatureCell` is a simple discriminated renderer: `true` → green check,
  `false` → muted X, `string` → inline text (quota labels)
- Feature checklist: lines starting with "Everything in" get a `Sparkles` icon
  and atlas accent colour; all others get a standard `Check` icon
- Comparison table uses a 4-column CSS grid (`grid-cols-4`) with sticky header row
- Enterprise CTA uses a `bg-gradient-to-br from-purple-500/10 … to-atlas-500/10`
  banner to visually separate it from the main tier cards
