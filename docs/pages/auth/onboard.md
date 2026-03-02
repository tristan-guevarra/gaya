# Coach Onboarding Page

**Route:** `/onboard`
**File:** `src/app/(auth)/onboard/page.tsx`

---

## Product

### Purpose
A multi-step registration wizard that collects all information needed to create a verified coach profile on Gaya — Intelligence Platform. Designed to reduce friction through progressive disclosure across five focused steps.

### Target Users
New coaches registering on the platform who need to publish a public profile, appear on the discovery map, and accept bookings from athletes.

### Key Features
- 5-step wizard: Profile, Expertise, Locations, Pricing, Verification.
- Animated step transitions with per-step validation gating the "Continue" button.
- SVG progress ring showing current step out of five.
- Sidebar navigation on desktop (lg+) showing completed, current, and locked steps.
- Live pricing preview showing how athletes will see the coach's rates.
- Completion screen with profile-completeness progress bar and next-action CTAs.

### User Flow
1. **Step 1 — Profile:** Enter name (required), email (required), phone, bio, and upload avatar.
2. **Step 2 — Expertise:** Set years of experience, pick up to 5 specialties, certifications, and age groups coached.
3. **Step 3 — Locations:** Add one or more training venues with name and address; toggle weekly availability by day.
4. **Step 4 — Pricing:** Set hourly (1-on-1) and group session rates; preview auto-calculates a weekly camp rate.
5. **Step 5 — Verification:** Toggle ID verification and background check; accept Terms of Service (required to proceed).
6. **Complete:** Profile enters review queue; user is shown completeness score (78%) and CTAs to go to dashboard or create a first event.

---

## Technical

### Components Used
- `Card` — location cards and the pricing preview container.
- `Badge` — "Primary" label on the first location; verification item badges.
- `Button` — Back, Continue, Save & Exit, and completion-screen CTAs.
- `ProgressRing` (local) — SVG circle indicating step progress.
- `ChipSelect` (local) — reusable multi-select toggle chip input with optional max selection count.
- `Input` (local, inline) — thin wrapper around `<input>` / `<textarea>` with label and required indicator.

### Imports & Dependencies
| Import | Source |
|---|---|
| `useState`, `useCallback` | `react` |
| `cn` | `@/lib/utils` |
| `Card`, `Badge`, `Button` | `@/components/ui` |
| Icons (User, MapPin, Award, Shield, DollarSign, etc.) | `lucide-react` |

No external form library or API call is present; this page is currently UI-only (no submission handler wired to `authApi`).

### State Shape (`OnboardState`)
```ts
{
  // Step 1
  display_name: string; email: string; phone: string; bio: string; avatar_url: string;
  // Step 2
  sport: string; specialties: string[]; certifications: string[];
  experience_years: number; age_groups: string[];
  // Step 3
  locations: { name: string; address: string; primary: boolean }[];
  availability: Record<string, boolean>; // key = day name
  timezone: string;
  // Step 4
  hourly_rate: number; group_rate: number; currency: string;
  // Step 5
  id_verified: boolean; background_check: boolean; terms_accepted: boolean;
}
```

### Static Reference Data
- `SPECIALTIES` — 12 options (e.g. "Technical Skills", "Mental Performance").
- `CERTIFICATIONS` — 8 options (e.g. "UEFA B License", "NCCP").
- `AGE_GROUPS` — 7 brackets from U6-U8 through Adult.
- `DAYS` — Monday through Sunday.
- `STEPS` — 5 step descriptors `{ id, title, icon, desc }`.

### State Management
- Single `OnboardState` object in `useState`; updated via a memoised `update(key, value)` helper.
- `step: number` controls which panel renders.
- `complete: boolean` swaps the entire layout for the completion screen.
- `canProceed()` enforces per-step minimum requirements before enabling the Continue button.

### UI Patterns
- Two-column layout on desktop: fixed 288 px sidebar + scrollable content area.
- Sidebar step items show a checkmark icon for completed steps, the step icon for future steps, and are non-interactive for locked (future) steps.
- `animate-fade-in` class keyed to `step` provides a re-mount fade on each navigation.
- Pricing preview card derives the weekly camp figure as `group_rate * 8` client-side, showing `—` when the rate is zero.
- Custom toggle switches built from plain `<button>` elements with absolute-positioned white thumb divs.
