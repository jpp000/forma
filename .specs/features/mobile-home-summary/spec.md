# Mobile Home Summary Specification

**Status**: Approved

## Problem Statement

After Slice 0 (`mobile-foundation`), the authenticated student lands on a placeholder Home tab. The product’s daily value lives on the **Summary** screen — Apple Fitness anatomy with Forma domain mapping — but that surface does not exist yet. Without Home Summary (rings, metric tiles, guidance, primary CTA), the app has no credible “open and see my day” loop and later slices (Training, Nutrition, Progress) lack a hub to return to.

## Goals

- [ ] Replace the Home placeholder with a shippable **Summary** screen matching `DESIGN.md` + `.specs/ui/RULES.md` (light + dark)
- [ ] Surface today’s training, nutrition, and progress signals via existing REST endpoints (no new API required for this slice)
- [ ] Show rule-based **guidance** from `GET /api/guidance/daily` with localized copy
- [ ] Provide contextual **primary CTA** that routes the student to the correct tab (Training / Nutrition / Progress stubs until Slices 2–4)
- [ ] Polish the tab bar chrome (icons, labels, active tint) while keeping the four-tab structure from Slice 0

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full Training screens (exercises, plans, session log, rest day) | Slice 2 — `mobile-training` |
| Full Nutrition screens (meal log form, history) | Slice 3 — `mobile-nutrition` |
| Full Progress screens (weight log, streak detail, history) | Slice 4 — `mobile-progress` |
| Fitness+ artwork shelf / horizontal catalog | Apple Fitness pattern optional; not needed for Forma MVP loop |
| New aggregated `GET /home/summary` API | Client composes existing endpoints; defer BFF until pain is proven |
| `GET /student/goal` or profile read endpoints | Not exposed today; nutrition `target` + guidance suffice for Home |
| Rest-day mark UI / streak grace logic | AD-027 — Slice 2 + API gap; Home may show training streak as-is until then |
| Billing / paywall / coaching chat / multi-profile | AD-026 |
| Pull-to-refresh animation polish beyond standard RN refresh | Nice-to-have; basic refresh required |
| Widgets / notifications / deep links | P2 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Actor | **Student only** | AD-024 | y |
| Depends on Slice 0 | `(tabs)/index.tsx` placeholder replaced; session, theme, i18n, API client exist | Sequential mobile slices | y |
| Date for “today” | **Server UTC date** (`YYYY-MM-DD` from device ISO slice, same as API) | AD-028 streak timezone; matches API tests | y |
| Ring — **Move** (pink) | Nutrition energy: `consumed.calories / target.calories`, capped at 100% | `DESIGN.md` domain mapping | y |
| Ring — **Exercise** (green) | Training: **100%** if any workout session on today’s UTC date, else **0%** | Binary daily training signal until plan-aware scheduling exists | y |
| Ring — **Stand** (cyan) | Progress habit: **100%** if any meal logged today, else **0%** | Progress domain cue; pairs with nutrition daily loop; weight detail in Slice 4 | y |
| Ring targets when `nutrition/daily.target` is null | Rings show **0% fill**; legend shows consumed values + tertiary “no target” copy | No `GET /student/goal`; avoid inventing targets client-side | y |
| Metric tiles (2×2) | **Training streak**, **Calories** (consumed[/target]), **Protein** (consumed[/target]), **Nutrition streak** | Tabular numerals; icons tinted per domain colors | y |
| Guidance section | Top **3** suggestions by API `priority` ascending (already sorted server-side) | Keep Summary scannable | y |
| Primary CTA | Maps to top guidance `type`: `training` → Training tab, `nutrition` → Nutrition tab, `progress`/`general` → Progress tab; fallback **“Explore”** → Training tab | Drives daily loop without building log UIs here | y |
| Tab bar | Four tabs unchanged; Home tab gets Summary UI; active tint `#30D158` | Slice 0 shell; this slice upgrades Home + tab chrome | y |
| Data loading | Parallel fetch on mount + pull-to-refresh; per-section error if one call fails | Partial failure UX | y |
| Caching | In-memory only for session; no offline persistence | MVP simplicity | y |
| **Client state** | **Zustand store** per feature (`homeStore`); no new React Context (AD-030) | Simple state; Slice 0 session/theme/i18n Context unchanged | y |
| Animations | Ring sweep on mount/update; respect `prefers-reduced-motion` (crossfade/static) | `.specs/ui/RULES.md` | y |
| Tests | Unit tests for ring progress + CTA routing pure functions; screen = typecheck + lint + manual smoke | Matches Slice 0 test strategy | y |

**Open questions:** none — all resolved or logged above (confirm with user before Design phase).

**Remaining implicit dimensions N/A for this scope:** idempotency (read-only aggregate), data expiry (ephemeral view state), rate limits (inherits API), auth boundaries (student JWT via Slice 0 session).

---

## Design constraints (must cite)

Every screen/component in this feature SHALL follow:

- Root [`DESIGN.md`](../../../DESIGN.md) — Summary anatomy; Forma green `#30D158` for CTAs/chrome; Move pink only on outer ring
- [`.specs/ui/RULES.md`](../../ui/RULES.md) — loading / empty / error on Home; tabular numerals; 44pt targets
- [`.specs/ui/references/apple-fitness-DESIGN.md`](../../ui/references/apple-fitness-DESIGN.md) — layout order: eyebrow → date → title → ring hero → tiles → guidance → CTA
- [`.specs/ui/references/apple-fitness-DESIGN-expo.md`](../../ui/references/apple-fitness-DESIGN-expo.md) — ActivityRings / RingHeroCard implementation hints
- Slice 0 handoff: extend `apps/mobile/src/ui/` and `(tabs)/` — do not rebuild auth/onboarding
- **AD-030:** Home fetch/cache/UI state lives in a Zustand `homeStore` — not React Context

---

## User Stories

### P1-01: Summary screen anatomy ⭐ MVP

**User Story**: As a **student**, I want to open Home and see today’s Summary (date header, activity rings, metric tiles) so that I immediately understand how my day is going.

**Why P1**: Core product surface; unlocks the daily loop.

**Acceptance Criteria**:

1. WHEN the student opens the Home tab THEN the screen SHALL render Summary anatomy in order: day eyebrow → large date → “Summary” large title → ring hero card → 2×2 metric tile grid
2. WHEN the app is in dark mode THEN the Home canvas SHALL use true black `#000000` and grouped cards `#1C1C1E` per `DESIGN.md`
3. WHEN the app is in light mode THEN surfaces SHALL use Slice 0 light tokens (canvas `#F2F2F7`, grouped `#FFFFFF`) with unchanged brand/ring colors
4. WHEN metric values render THEN numerals SHALL use tabular figures
5. WHEN the student pulls to refresh THEN Home SHALL re-fetch all summary data and update rings/tiles/guidance

**Independent Test**: Authenticated student opens Home → sees rings + four tiles with today’s date header in light and dark.

**Requirements**: `MHOME-01`, `MHOME-02`, `MHOME-03`, `MHOME-04`, `MHOME-05`

---

### P1-02: Activity rings from API data ⭐ MVP

**User Story**: As a **student**, I want the three rings to reflect my nutrition, training, and daily progress habits so that the hero card matches Forma’s domain colors.

**Why P1**: Rings are the signature visual; must map to real data.

**Acceptance Criteria**:

1. WHEN `GET /api/nutrition/daily?date=<today>` returns `consumed` and `target.calories` THEN the **Move** ring progress SHALL be `min(consumed.calories / target.calories, 1)` and the legend SHALL show consumed and target calories with Move colors
2. WHEN `target` is null THEN the Move ring progress SHALL be `0` and the legend SHALL show consumed calories with tertiary copy indicating no target (localized key, not hard-coded)
3. WHEN `GET /api/training/sessions` includes a session whose completed date equals today (UTC) THEN the **Exercise** ring progress SHALL be `1`
4. WHEN no session exists for today THEN the Exercise ring progress SHALL be `0`
5. WHEN `GET /api/nutrition/daily?date=<today>` returns `consumed` with any of `calories`, `protein`, `carbs`, or `fat` greater than zero THEN the **Stand** ring progress SHALL be `1`; otherwise Stand progress SHALL be `0`
6. WHEN ring progress values change after refresh THEN rings SHALL animate sweep (or crossfade when reduced motion is enabled)

**Independent Test**: Seed API with meal + workout for today → rings show non-zero Move/Exercise/Stand; empty day → Exercise and Stand at 0.

**Requirements**: `MHOME-06`, `MHOME-07`, `MHOME-08`, `MHOME-09`, `MHOME-10`

---

### P1-03: Metric tiles ⭐ MVP

**User Story**: As a **student**, I want four quick metrics below the rings so that I can scan streaks and macros without leaving Home.

**Why P1**: Completes Summary grid per design references.

**Acceptance Criteria**:

1. WHEN `GET /api/progress/streaks` succeeds THEN tile 1 SHALL show training `current` streak and tile 4 SHALL show nutrition `current` streak with award/gold accent where design specifies streak emphasis
2. WHEN nutrition daily returns consumed/target THEN tile 2 SHALL show calories consumed and target (or consumed only if target null)
3. WHEN nutrition daily returns consumed/target THEN tile 3 SHALL show protein consumed and target (or consumed only if target null)
4. WHEN a tile’s data source fails THEN that tile SHALL show a localized error state without blocking other tiles

**Independent Test**: API returns streaks + daily summary → four tiles populated; kill streaks endpoint → three tiles still render, one shows error.

**Requirements**: `MHOME-11`, `MHOME-12`, `MHOME-13`, `MHOME-14`

---

### P1-04: Guidance section ⭐ MVP

**User Story**: As a **student**, I want to see today’s guidance suggestions on Home so that I know what to do next.

**Why P1**: Rule-based coaching is an MVP differentiator (AD-012).

**Acceptance Criteria**:

1. WHEN `GET /api/guidance/daily` returns suggestions THEN Home SHALL list up to the first **3** items with localized `message` text (API already localized via `Accept-Language`)
2. WHEN guidance returns an empty array THEN Home SHALL show a localized empty state (e.g. “You’re on track today”)
3. WHEN guidance fetch fails THEN Home SHALL show a localized error block with retry affordance
4. WHEN a suggestion `type` is known (`training`, `nutrition`, `progress`, `general`) THEN an optional tint/icon MAY reflect domain color (green/pink/cyan) without breaking readability

**Independent Test**: Student with goal but no workouts → guidance includes training message; `Accept-Language: en` → English strings.

**Requirements**: `MHOME-15`, `MHOME-16`, `MHOME-17`, `MHOME-18`

---

### P1-05: Primary CTA + tab routing ⭐ MVP

**User Story**: As a **student**, I want one prominent action on Home that takes me to the right place so that I can act on guidance quickly.

**Why P1**: Closes the loop until dedicated log screens ship.

**Acceptance Criteria**:

1. WHEN guidance has at least one suggestion THEN the primary CTA label SHALL be derived from the highest-priority suggestion’s `type` (localized): training → log/start workout copy, nutrition → log meal copy, progress/general → view progress copy
2. WHEN the student taps the primary CTA THEN the app SHALL navigate to the corresponding tab: Training, Nutrition, or Progress (Expo Router tab switch)
3. WHEN guidance is empty THEN the CTA SHALL use a neutral localized label (e.g. “Start your day”) and navigate to the Training tab
4. WHEN the CTA renders THEN it SHALL use primary green fill `#30D158` with on-primary text `#000000` per `DESIGN.md`

**Independent Test**: Mock guidance with `type: 'nutrition'` → CTA says meal copy → tap lands on Nutrition tab stub.

**Requirements**: `MHOME-19`, `MHOME-20`, `MHOME-21`, `MHOME-22`

---

### P1-06: Home loading & error states ⭐ MVP

**User Story**: As a **student**, I want Home to handle slow network and failures gracefully so that the app still feels premium.

**Why P1**: `.specs/ui/RULES.md` mandates loading/empty/error on every shippable screen.

**Acceptance Criteria**:

1. WHEN summary data is loading on first paint THEN Home SHALL show a skeleton or loading state for rings/tiles/guidance (not a blank screen)
2. WHEN all parallel fetches fail THEN Home SHALL show a full-screen error with retry
3. WHEN the session token is invalid (`401` on any fetch) THEN the existing Slice 0 session handler SHALL sign out and return to Auth (no duplicate logic)
4. WHEN partial fetches succeed THEN successful sections SHALL render while failed sections show inline errors

**Independent Test**: Airplane mode → error + retry; restore network → content loads.

**Requirements**: `MHOME-23`, `MHOME-24`, `MHOME-25`, `MHOME-26`

---

### P2-01: Tab bar polish

**User Story**: As a **student**, I want tab icons and labels that match the Forma visual system so that navigation feels finished.

**Why P2**: Important polish but not blocking Summary content.

**Acceptance Criteria**:

1. WHEN any tab is active THEN the tab icon and label tint SHALL be `#30D158`
2. WHEN tabs render THEN each tab SHALL have a localized label (Home/Summary, Training, Nutrition, Progress) in pt-BR and en
3. WHEN tabs render on iOS/Android THEN touch targets SHALL meet ≥44pt guidance

**Independent Test**: Switch tabs → active tint green; locale toggle updates labels.

**Requirements**: `MHOME-27`, `MHOME-28`, `MHOME-29`

---

## Edge Cases

- WHEN today has `target.calories = 0` (malformed) THEN Move ring progress SHALL be `0` (avoid division by zero)
- WHEN consumed calories exceed target THEN Move ring SHALL cap at 100% (not overflow visually)
- WHEN training sessions paginate beyond first page and today’s session is not in page 1 THEN Exercise ring MAY be wrong — **mitigation**: fetch sessions with `limit=20` and filter client-side for today; document in Design; acceptable MVP risk until dedicated “today” endpoint
- WHEN student has no meal logs ever THEN Stand ring 0% and nutrition streak tile shows `0`
- WHEN guidance and nutrition calls race on slow network THEN UI SHALL not crash; last successful refresh wins
- WHEN locale changes on Home THEN subsequent refresh SHALL send updated `Accept-Language`

---

## API integration (read-only)

| Endpoint | Use on Home |
|----------|-------------|
| `GET /api/nutrition/daily?date=<today>` | Move ring, calorie/protein tiles, Stand ring proxy |
| `GET /api/training/sessions?page=1&limit=20` | Exercise ring (filter `completedAt` date = today) |
| `GET /api/progress/streaks` | Training + nutrition streak tiles |
| `GET /api/guidance/daily` | Guidance list + CTA routing hint |

All require `Authorization: Bearer` + student role (inherited from Slice 0). No writes in this slice.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| MHOME-01 | P1-01 Summary anatomy | Tasks | Pending |
| MHOME-02 | P1-01 Dark theme | Tasks | Pending |
| MHOME-03 | P1-01 Light theme | Tasks | Pending |
| MHOME-04 | P1-01 Tabular numerals | Tasks | Pending |
| MHOME-05 | P1-01 Pull to refresh | Tasks | Pending |
| MHOME-06 | P1-02 Move ring | Tasks | Pending |
| MHOME-07 | P1-02 Move no target | Tasks | Pending |
| MHOME-08 | P1-02 Exercise ring | Tasks | Pending |
| MHOME-09 | P1-02 Stand ring | Tasks | Pending |
| MHOME-10 | P1-02 Ring animation | Tasks | Pending |
| MHOME-11 | P1-03 Streak tiles | Tasks | Pending |
| MHOME-12 | P1-03 Calorie tile | Tasks | Pending |
| MHOME-13 | P1-03 Protein tile | Tasks | Pending |
| MHOME-14 | P1-03 Partial tile errors | Tasks | Pending |
| MHOME-15 | P1-04 Guidance list | Tasks | Pending |
| MHOME-16 | P1-04 Guidance empty | Tasks | Pending |
| MHOME-17 | P1-04 Guidance error | Tasks | Pending |
| MHOME-18 | P1-04 Guidance styling | Tasks | Pending |
| MHOME-19 | P1-05 CTA label | Tasks | Pending |
| MHOME-20 | P1-05 CTA navigation | Tasks | Pending |
| MHOME-21 | P1-05 CTA fallback | Tasks | Pending |
| MHOME-22 | P1-05 CTA colors | Tasks | Pending |
| MHOME-23 | P1-06 Loading | Tasks | Pending |
| MHOME-24 | P1-06 Full error | Tasks | Pending |
| MHOME-25 | P1-06 401 handling | Tasks | Pending |
| MHOME-26 | P1-06 Partial errors | Tasks | Pending |
| MHOME-27 | P2-01 Tab tint | Tasks | Pending |
| MHOME-28 | P2-01 Tab i18n | Tasks | Pending |
| MHOME-29 | P2-01 Tab touch targets | Tasks | Pending |

**Coverage:** 29 total, 16 tasks mapped, 0 unmapped ✅ (see `tasks.md`)

---

## Success Criteria

- [ ] Student opens Home → Summary matches design anatomy in light and dark
- [ ] Rings and tiles reflect live API data for today; pull-to-refresh updates them
- [ ] Guidance shows localized suggestions; CTA routes to the correct tab stub
- [ ] Loading, empty, and error states present per RULES
- [ ] No new API endpoints; no training/nutrition/progress log UIs beyond navigation
- [ ] Execute waits until `mobile-foundation` Verifier PASS; no parallel edits to `apps/mobile` with Slice 0 agent

---

## Multi-agent handoff

- **Blocked by:** `mobile-foundation` Execute complete + Verifier PASS
- **Entry file:** `apps/mobile/app/(tabs)/index.tsx` (replace placeholder)
- **New folders (expected in Design):** `apps/mobile/src/features/home/` (`homeStore.ts`, components), `src/api/home.ts` aggregator
- **State:** Zustand `homeStore` per AD-030 — not Context
- **Next slice after PASS:** `mobile-training` (Slice 2) — CTA already points at Training tab stub
