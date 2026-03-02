# Financials — Financial Modeling

**App:** Gaya — Intelligence Platform
**Route:** `/financials`

---

## Product

### Purpose
Investor-grade financial modeling dashboard presenting unit economics, quarterly projections, and runway/cash flow analysis. Designed to give founders and stakeholders a clear picture of business viability and scaling trajectory.

### Target Users
Founders, CFO, and investors performing due diligence or internal financial review.

### Key Features
- Three-tab layout: Unit Economics, Projections, Runway
- Key unit economics: LTV ($2,840), CAC ($142), LTV:CAC (20x), payback period (1.8 months)
- Visual LTV vs CAC bar comparison with explanatory copy
- Gross margin (78%), ARPU ($89/month), and monthly churn (3.2%) cards
- Cost breakdown by category: Coach Payouts, Venue Fees, Marketing, Platform & Ops, Insurance, Other
- Monthly revenue vs costs stacked bar chart (Sep–Mar)
- Quarterly forward projections: Q2 2025 through Q1 2026 (revenue, customers, ARR)
- Runway tab confirming cash-flow-positive status with 12-month cash projection chart

### User Flows
1. Unit Economics tab: validate LTV:CAC ratio and payback period health; review cost structure
2. Projections tab: review historical monthly performance and quarterly growth targets
3. Runway tab: confirm the business is self-sustaining; project cash balance growth

---

## Technical

### Components
- `FinancialModelingPage` — root page component; all tab content rendered inline

### Imports / Dependencies
- `react`: `useState`
- `lucide-react`: DollarSign, TrendingUp, Calculator, Target, Clock, Wallet, CreditCard, Sparkles, etc.
- `@/lib/utils`: `cn`

### Mock Data Shapes
```ts
// Unit economics (static object)
{ ltv, cac, ltvCacRatio, paybackMonths, grossMargin,
  netMargin, arpu, churnRate, avgLifespan }

// Monthly metrics
{ month: string; revenue: number; costs: number; profit: number; customers: number }

// Cost category
{ category: string; amount: number; pct: number; color: string }

// Runway (static object)
{ cashBalance, monthlyBurn, monthlyRevenue, netBurn,
  runwayMonths: string, breakEvenDate: string, arr }

// Quarterly projection
{ quarter: string; revenue: number; customers: number; arr: number }
```

### State Management
- `tab` — active tab ('unit-economics' | 'projections' | 'runway')
- `maxRevenue` — derived constant for bar chart scaling (`Math.max` over monthlyMetrics)

### UI Patterns
- LTV vs CAC visualization: two side-by-side gradient bars; CAC bar height proportional to `cac/ltv`
- Cost breakdown: segmented horizontal pill (colored divs) + 3-column legend grid
- Monthly chart: stacked flex column per month — profit segment (green) stacked above costs segment (red)
- 12-month cash projection: bars grow from left to right, each computed as `cashBalance + (netBurn × i)`
- Active tab highlight uses green (`bg-green-500/10 text-green-400`) instead of the atlas color used elsewhere
- Cash-flow-positive state displayed with a full-width celebration banner (Sparkles icon)
