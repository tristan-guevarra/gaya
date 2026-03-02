# Login Page

**Route:** `/login`
**File:** `src/app/(auth)/login/page.tsx`

---

## Product

### Purpose
Entry point for returning users to authenticate into the Gaya — Intelligence Platform. Provides credential-based login with a streamlined demo access path for evaluators and developers.

### Target Users
- Coaches, athletes, and admins returning to the platform.
- Developers and evaluators using demo shortcuts to explore role-specific views.

### Key Features
- Email and password login form with inline validation feedback.
- Three one-click demo login buttons (Admin, Coach, Athlete) for quick role-based access.
- Role-aware redirect: admins are sent to `/intelligence`, all others to `/map`.
- Toast notifications for success and error states.
- Link to `/register` for new users.

### User Flow
1. User lands on the login page.
2. Enters email and password, or clicks a demo role button.
3. On success: auth tokens are stored, a success toast fires, and the user is redirected.
4. On failure: an error toast displays the API error message.

---

## Technical

### Components Used
- `Card` — wraps the form container.
- `Input` — email and password fields with icon and error props (from `@/components/ui`).
- `Button` — submit button with loading state and arrow icon.
- Three inline `<button>` elements for demo login shortcuts.

### Imports & Dependencies
| Import | Source |
|---|---|
| `useForm`, `zodResolver` | `react-hook-form`, `@hookform/resolvers/zod` |
| `z` (schema) | `zod` |
| `toast` | `sonner` |
| `useAuthStore` | `@/lib/auth` (Zustand store) |
| `authApi` | `@/lib/api` |
| `Mail`, `Lock`, `ArrowRight` | `lucide-react` |
| `useRouter` | `next/navigation` |

### Validation Schema
```ts
z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
```

### Mock / Demo Data
```ts
{
  admin:   { email: 'admin@gaya.app',       password: 'GayaAdmin2024!' },
  coach:   { email: 'coach@academy.com',    password: 'CoachPass2024!' },
  athlete: { email: 'athlete@example.com',  password: 'AthletePass2024!' },
}
```

### State Management
- `loading: boolean` — local `useState` flag; gates both form submit and demo buttons.
- `useAuthStore().login(user, access_token, refresh_token)` — persists auth session after successful API response.
- Form state managed entirely by `react-hook-form`.

### UI Patterns
- Full-viewport centered layout with absolute-positioned hex-pattern background and radial glow blur.
- Horizontal divider with centered "Quick demo" label separates the form from demo buttons.
- Demo buttons render in a 3-column grid with emoji labels; disabled during any loading state.
