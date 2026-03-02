# Gamification Hub

**Route:** `/gamification`
**File:** `src/app/(dashboard)/gamification/page.tsx`

---

## Product

**Purpose:** Full XP and progression system for coaches, designed to drive engagement and retention through quests, achievements, tier advancement, and a reward marketplace.

**Target users:** Coaches on the Gaya platform who earn XP through platform activity (bookings, reviews, fill rates, streaks).

**Key features:**
- 4-tab layout: Overview, Quests, Achievements, Rewards
- **Overview:** Tier/level card with 6-tier progression bar (Bronze → Legend), season card with XP progress, stats grid, active quests preview
- **Quests:** Weekly quests (reset in 3 days) with difficulty tags + progress bars, Seasonal quests (5x XP bonus)
- **Achievements:** 2-column grid of unlocked/locked achievements by rarity (common, rare, epic, legendary); locked ones show progress bars toward unlock
- **Rewards:** Coin marketplace — items redeemable with coin balance; disabled state when balance insufficient
- Header always shows coin balance and day streak regardless of active tab

**User flow:** Overview → check progress → Quests tab → track completions → Achievements tab → see collection → Rewards tab → spend coins.

---

## Technical

**Components:** All inline; no external component imports beyond `cn`.

**Key imports:**
- `lucide-react` — Trophy, Star, Flame, Zap, Award, Target, Gift, Crown, Medal, Swords, Timer, Gem, etc.
- `@/lib/utils` — `cn`

**State:**
| Variable | Type | Purpose |
|---|---|---|
| `tab` | `'overview' \| 'quests' \| 'achievements' \| 'rewards'` | Active tab |

**Mock data shapes:**
```ts
// playerStats (static object)
{ level: 42; xp: 84200; nextLevelXp: 90000; tier: 'Diamond';
  streak: 47; totalSessions: 284; seasonRank: 3; globalRank: 47;
  seasonXp: 12400; seasonTarget: 20000; coinsBalance: 3240 }

interface Quest {
  id: string; title: string; description: string; xp: number;
  progress: number; total: number; category: string;
  difficulty: 'easy'|'medium'|'hard'|'legendary'; timeLeft?: string;
  icon: React.ElementType; completed: boolean;
}

interface Achievement {
  id: string; name: string; description: string; icon: string;
  xp: number; rarity: 'common'|'rare'|'epic'|'legendary';
  unlocked: boolean; unlockedDate?: string; progress?: number; total?: number;
}
```

**UI patterns:**
- Tier progression uses a `flex` row of 6 segments, each filling with a colored gradient
- `levelProgress` computed as `(xp - currentTierMinXp) / (nextTierMinXp - currentTierMinXp) * 100`
- Difficulty colors: easy=green, medium=atlas, hard=amber, legendary=purple
- Rarity border/bg: common=slate, rare=blue, epic=purple, legendary=amber
- Completed quests show `line-through` title and green `CheckCircle` icon
- `animate-fade-in` applied to each tab's container div on mount
