# Content Studio

**Route:** `/content-studio`
**File:** `src/app/(dashboard)/content-studio/page.tsx`

---

## Product

**Purpose:** AI-powered marketing content generator that creates platform-specific copy for social posts, emails, ad copy, and SEO/blog content on behalf of coaches and organizations.

**Target users:** Coaches and org admins who need to promote events, run re-engagement campaigns, or build a social presence without writing copy manually.

**Key features:**
- Content type selector: Social Post, Email, Ad Copy, SEO/Blog
- Platform targeting for social (Instagram, Twitter, Facebook, LinkedIn)
- Tone selector: Professional, Casual, Exciting, Inspiring
- Free-text prompt input with quick-prompt chip shortcuts
- AI generation (simulated 2s delay) producing scored content cards
- Content cards show body, hashtags, CTA, engagement prediction, and quality score (0–100)
- Per-card actions: Copy, Regenerate, Edit, Schedule
- Weekly content calendar mini-view (7 days, color-coded by type)
- Content performance stats panel: avg engagement, best platform, pieces generated, time saved

**User flow:** Select type → choose platform/tone → enter prompt (or tap quick prompt) → Generate → review card → copy or schedule.

---

## Technical

**Components:** All inline; no external component imports beyond `cn` from `@/lib/utils`.

**Key imports:**
- `lucide-react` — Sparkles, Wand2, Calendar, Instagram, Twitter, Mail, Globe, Megaphone, etc.
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `activeType` | `ContentType` | Selected content type tab |
| `selectedTone` | `Tone` | Active tone pill |
| `selectedPlatform` | `Platform` | Active platform pill (social only) |
| `prompt` | `string` | User prompt textarea value |
| `generating` | `boolean` | Spinner/loading state during generation |
| `copiedId` | `string \| null` | Tracks which card's copy button was clicked |

**Mock data shapes:**
```ts
interface GeneratedContent {
  id: string; type: ContentType; platform?: Platform;
  title: string; content: string; hashtags?: string[];
  subject?: string; cta?: string; tone: Tone;
  score: number; engagement?: string; timestamp: string;
}
// contentCalendar: { day: string, items: { type, title, time, platform? }[] }[]
```

**UI patterns:**
- 5/7 column grid split (generator left, results right)
- Active pill selected state uses `bg-purple-500/10 text-purple-400 border-purple-500/20`
- Platform panel conditionally renders only when `activeType === 'social'`
- Score badge uses `bg-green-500/10` with `Star` icon
- Calendar uses 7-column CSS grid with color-coded type pills
