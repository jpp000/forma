# Mobile Home Summary Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/mobile-home-summary/design.md`  
**Spec**: `.specs/features/mobile-home-summary/spec.md`  
**Status**: Approved

**Prerequisite:** `mobile-foundation` Verifier PASS (Slice 0 complete). **AD-030:** feature state = Zustand; no new React Context.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: `biome.json`, `apps/mobile/jest.config.js`, Slice 0 pattern (unit tests for pure client logic; screens = typecheck + manual smoke). Strong defaults applied for new mapper/hook layers.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Pure summary mappers (`summaryMappers.ts`, `ctaRouting.ts`) | unit | All branches 1:1 to spec ACs MHOME-06–10, MHOME-19–21; edge cases: `target=0`, `target=null`, no session today, empty guidance, unknown guidance type | `apps/mobile/src/features/home/__tests__/*.test.ts` | `pnpm --filter @forma/mobile test` |
| Domain API wrappers (`nutrition.ts`, etc.) | none | Thin `api.request` passthrough — covered by hook smoke + manual | — | build gate |
| `homeStore` (Zustand) | unit (optional) | `fetchSummary` mapping + error branches; prefer testing mappers/ctaRouting; store smoke via manual | `apps/mobile/src/features/home/__tests__/homeStore.test.ts` (optional) | `pnpm --filter @forma/mobile test` |
| `useHomeSummary` selector hook | none | Wires API deps → store; no local `useState` | — | manual |
| Summary RN components / screen | none | Manual smoke: loading, empty guidance, partial error, pull-to-refresh; Verifier checklist | — | `check-types` + lint |
| Theme `ringConfig` / i18n catalogs | none | Build gate only | — | build gate |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests (T6, T7) | `pnpm --filter @forma/mobile test` |
| Build | After UI/config/i18n-only tasks | `pnpm --filter @forma/mobile check-types && pnpm lint` |
| Full | End of slice / before Verifier | `pnpm --filter @forma/mobile test && pnpm --filter @forma/mobile check-types && pnpm lint` |

---

## Execution Plan

Phases run sequentially. Tasks within a phase run in order.

### Phase 1: Dependencies + types

```
T1 → T2
```

### Phase 2: API client + domain modules + pure logic

```
T3 → T4 → T5 → T6 → T7
```

### Phase 3: Summary UI components

```
T8 → T9 → T10 → T11 → T12
```

### Phase 4: Integration + polish

```
T13 → T14 → T15 → T16
```

**Batch packing (Execute):** 16 tasks → 2 batches  
1. **Batch 1:** Phases 1–2 (T1–T7)  
2. **Batch 2:** Phases 3–4 (T8–T16)

---

## Task Breakdown

### T1: Install Zustand + ring animation dependencies

**What**: Add `zustand`, `react-native-svg`, `react-native-reanimated`, `@expo/vector-icons`; configure Reanimated Babel plugin  
**Where**: `apps/mobile/package.json`, `apps/mobile/babel.config.js`  
**Depends on**: Slice 0 complete  
**Reuses**: Expo SDK 53 install pattern; **AD-030**  
**Requirement**: `MHOME-10`, AD-030

**Tools**: Shell (`pnpm add zustand`, `npx expo install …`); Skill `tlc-spec-driven`

**Done when**:

- [ ] `zustand` added to mobile dependencies
- [ ] SVG, Reanimated, vector-icons install without peer conflicts
- [ ] `babel.config.js` includes `react-native-reanimated/plugin` (last plugin)
- [ ] Gate: Build (`pnpm --filter @forma/mobile check-types`)

**Tests**: none  
**Gate**: build  
**Commit**: `chore(mobile): add zustand and ring animation deps`

---

### T2: Home types + ringConfig theme export

**What**: Add `features/home/types.ts` and `ringConfig` track colors in theme  
**Where**: `apps/mobile/src/features/home/types.ts`, `apps/mobile/src/theme/colors.ts`  
**Depends on**: T1  
**Reuses**: `brand` move/exercise/stand from Slice 0  
**Requirement**: `MHOME-06`, `MHOME-02`, `MHOME-03`

**Done when**:

- [ ] Client types mirror API responses used on Home (DailySummary, StreaksResponse, etc.)
- [ ] `ringConfig` exports move/exercise/stand color + 22% track rgba per DESIGN.md
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add home summary types and ring config`

---

### T3: Shared `useApiClient` hook

**What**: Hook wrapping `createApiClient` with session token, locale, 401 → signOut  
**Where**: `apps/mobile/src/api/useApiClient.ts`  
**Depends on**: T2  
**Reuses**: `createApiClient`, `useSession`, `getActiveLocale`  
**Requirement**: `MHOME-25`

**Done when**:

- [ ] Hook returns stable `ApiClient` using current `session.token` (no stale-token fetches after sign-in)
- [ ] `onUnauthorized` calls `signOut` from `useSession`
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add useApiClient hook`

---

### T4: Nutrition + progress domain APIs

**What**: Typed `createNutritionApi` and `createProgressApi`  
**Where**: `apps/mobile/src/api/nutrition.ts`, `apps/mobile/src/api/progress.ts`, export from `api/index.ts`  
**Depends on**: T3  
**Reuses**: `identity.ts` factory pattern  
**Requirement**: `MHOME-06`, `MHOME-11`

**Done when**:

- [ ] `getDailySummary(date)` → `GET /api/nutrition/daily?date=`
- [ ] `getStreaks()` → `GET /api/progress/streaks`
- [ ] Types exported for Home feature
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add nutrition and progress API clients`

---

### T5: Training + guidance domain APIs

**What**: Typed `createTrainingApi` and `createGuidanceApi`  
**Where**: `apps/mobile/src/api/training.ts`, `apps/mobile/src/api/guidance.ts`, `api/index.ts`  
**Depends on**: T4  
**Reuses**: Same factory pattern  
**Requirement**: `MHOME-08`, `MHOME-15`

**Done when**:

- [ ] `listSessions(page, limit)` → `GET /api/training/sessions`
- [ ] `getDaily()` → `GET /api/guidance/daily`
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add training and guidance API clients`

---

### T6: `summaryMappers` pure functions + unit tests

**What**: Ring progress, legend, tile builders, `todayUtcDate`  
**Where**: `apps/mobile/src/features/home/summaryMappers.ts`, `__tests__/summaryMappers.test.ts`  
**Depends on**: T2  
**Reuses**: `types.ts`  
**Requirement**: `MHOME-06`–`MHOME-13`, edge cases in spec

**Done when**:

- [ ] `computeMoveProgress`: cap at 1, `target null` → 0, `target 0` → 0
- [ ] `computeExerciseProgress`: session today → 1, else 0
- [ ] `computeStandProgress`: any macro > 0 → 1, else 0
- [ ] `buildMetricTiles` order: training streak, calories, protein, nutrition streak
- [ ] Gate: Quick — all new tests pass (≥12 cases covering ACs + edge cases)
- [ ] Test count: baseline + new tests, no deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(mobile): add home summary mappers with tests`

---

### T7: `ctaRouting` + unit tests

**What**: Map guidance top suggestion → CTA label key + tab route  
**Where**: `apps/mobile/src/features/home/ctaRouting.ts`, `__tests__/ctaRouting.test.ts`  
**Depends on**: T2  
**Reuses**: `types.ts`  
**Requirement**: `MHOME-19`–`MHOME-21`

**Done when**:

- [ ] Maps `training`/`nutrition`/`progress`/`general`/empty per design table
- [ ] Unknown `type` falls back to progress route
- [ ] Gate: Quick — all tests pass (≥6 cases)
- [ ] Test count: no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(mobile): add home CTA routing with tests`

---

### T8: Extend `Screen` with pull-to-refresh

**What**: Optional `refreshControl` prop when `scroll={true}`  
**Where**: `apps/mobile/src/ui/Screen.tsx`  
**Depends on**: T7  
**Reuses**: Existing `Screen` scroll variant  
**Requirement**: `MHOME-05`

**Done when**:

- [ ] `refreshControl` forwarded to `ScrollView`
- [ ] Non-scroll mode unchanged
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): support RefreshControl on Screen`

---

### T9: `ActivityRings` SVG component

**What**: Three concentric animated rings per apple-fitness-expo reference  
**Where**: `apps/mobile/src/features/home/components/ActivityRings.tsx`  
**Depends on**: T1, T2  
**Reuses**: `ringConfig`, Reanimated + SVG pattern from design doc  
**Requirement**: `MHOME-10`

**Done when**:

- [ ] Renders move/exercise/stand with round caps, 12 o'clock start
- [ ] `reducedMotion` skips sweep animation
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add ActivityRings component`

---

### T10: `RingHeroCard` + `SummaryHeader`

**What**: Hero card (rings + legend) and date header (eyebrow, date, title)  
**Where**: `apps/mobile/src/features/home/components/RingHeroCard.tsx`, `SummaryHeader.tsx`  
**Depends on**: T9  
**Reuses**: `useFormaTheme`, `useT`, tabular typography  
**Requirement**: `MHOME-01`, `MHOME-06`–`MHOME-07`

**Done when**:

- [ ] Header uses `Intl.DateTimeFormat` with active locale
- [ ] Eyebrow uppercase in `colors.primary`
- [ ] Legend shows move/exercise/stand values; `noTarget` copy when target null
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add summary header and ring hero card`

---

### T11: `MetricTile` + `MetricTileGrid`

**What**: 2×2 grouped metric tiles  
**Where**: `apps/mobile/src/features/home/components/MetricTile.tsx`, `MetricTileGrid.tsx`  
**Depends on**: T10  
**Reuses**: Theme grouped surfaces  
**Requirement**: `MHOME-11`–`MHOME-14`

**Done when**:

- [ ] Grid layout 2×2 with 16pt insets
- [ ] Per-tile optional error state (compact `InlineError`)
- [ ] Award accent on streak tiles
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add home metric tiles`

---

### T12: `GuidanceList` + `SummarySkeleton`

**What**: Guidance section (max 3 rows, empty/error) + loading skeleton  
**Where**: `apps/mobile/src/features/home/components/GuidanceList.tsx`, `SummarySkeleton.tsx`  
**Depends on**: T11  
**Reuses**: `InlineError`, theme  
**Requirement**: `MHOME-15`–`MHOME-18`, `MHOME-23`

**Done when**:

- [ ] Empty state uses `home.guidance.empty` key (placeholder ok until T13)
- [ ] Error row with retry callback prop
- [ ] Skeleton covers rings + tiles + guidance blocks
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add guidance list and summary skeleton`

---

### T13: i18n `home.*` keys (pt-BR + en)

**What**: All Home copy keys from design.md  
**Where**: `apps/mobile/src/i18n/pt-BR.ts`, `en.ts`  
**Depends on**: T12  
**Reuses**: Existing i18n module  
**Requirement**: `MHOME-01`, `MHOME-16`, `MHOME-19`–`MHOME-21`, `MHOME-28`

**Done when**:

- [ ] All keys in design i18n table present in both locales
- [ ] No raw keys visible on Home after T15
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add home summary i18n strings`

---

### T14: `homeStore` (Zustand) + `useHomeSummary` selectors

**What**: Zustand store for fetch/status/models/actions; thin hook wires `useApiClient` on mount — **no React Context, no duplicate `useState`** (AD-030)  
**Where**: `apps/mobile/src/features/home/homeStore.ts`, `useHomeSummary.ts`  
**Depends on**: T5, T6, T7  
**Reuses**: Domain APIs, mappers, `ctaRouting`, `mapApiError`  
**Requirement**: `MHOME-05`, `MHOME-14`, `MHOME-17`, `MHOME-23`–`MHOME-26`, AD-030

**Done when**:

- [ ] `homeStore` uses `create()` from `zustand`; exports `useHomeStore`
- [ ] `fetchSummary` / `refresh` run parallel `allSettled` fetch + map results into store
- [ ] `reset()` clears store on sign-out (call from hook cleanup or session listener if needed)
- [ ] `useHomeSummary` only selects from store + triggers fetch with injected API deps
- [ ] Gate: Build

**Tests**: none (mappers tested in T6–T7; optional store unit test allowed)  
**Gate**: build  
**Commit**: `feat(mobile): add home summary zustand store`

---

### T15: `SummaryScreen` + wire Home tab route

**What**: Compose Summary UI; replace `(tabs)/index.tsx` placeholder  
**Where**: `apps/mobile/src/features/home/SummaryScreen.tsx`, `apps/mobile/app/(tabs)/index.tsx`  
**Depends on**: T8, T12, T13, T14  
**Reuses**: `Screen`, `PrimaryButton`, `useRouter`  
**Requirement**: `MHOME-01`–`MHOME-26`, `MHOME-22`

**Done when**:

- [ ] Full anatomy: header → hero → tiles → guidance → CTA
- [ ] Pull-to-refresh wired
- [ ] CTA navigates to correct tab via `router.push`
- [ ] Primary button green `#30D158` / on-primary black
- [ ] Manual smoke: authenticated student sees Summary (document in commit or handoff)
- [ ] Gate: Full

**Tests**: none  
**Gate**: full  
**Commit**: `feat(mobile): ship home summary screen`

---

### T16: Tab bar icons + slice handoff

**What**: Ionicons on tabs; update STATE Handoff for Slice 2 entry  
**Where**: `apps/mobile/app/(tabs)/_layout.tsx`, `.specs/STATE.md` (Handoff section only)  
**Depends on**: T15  
**Reuses**: Existing tab tint `colors.primary`  
**Requirement**: `MHOME-27`–`MHOME-29`

**Done when**:

- [ ] Four tabs have icons + localized labels
- [ ] Active tint remains `#30D158`
- [ ] STATE Handoff points next agent to `mobile-training` with run/env notes
- [ ] Gate: Full

**Tests**: none  
**Gate**: full  
**Commit**: `feat(mobile): polish tab bar and handoff home summary`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4 ──→ T5 ──→ T6 ──→ T7
Phase 3:  T8 ──→ T9 ──→ T10 ──→ T11 ──→ T12
Phase 4:  T13 ──→ T14 ──→ T15 ──→ T16
```

Execution is strictly sequential within each batch.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Install deps | zustand + config | ✅ Granular |
| T2: types + ringConfig | 2 cohesive files | ✅ OK |
| T3: useApiClient | 1 hook | ✅ Granular |
| T4: nutrition + progress APIs | 2 thin API files | ✅ OK |
| T5: training + guidance APIs | 2 thin API files | ✅ OK |
| T6: summaryMappers + tests | 1 module + tests | ✅ Granular |
| T7: ctaRouting + tests | 1 module + tests | ✅ Granular |
| T8: Screen refresh | 1 component change | ✅ Granular |
| T9: ActivityRings | 1 component | ✅ Granular |
| T10: RingHeroCard + SummaryHeader | 2 related components | ✅ OK |
| T11: Metric tiles | 2 related components | ✅ OK |
| T12: Guidance + skeleton | 2 related components | ✅ OK |
| T13: i18n keys | catalog update | ✅ Granular |
| T14: homeStore + selectors | Zustand store + thin hook | ✅ Granular |
| T15: SummaryScreen + route | screen + thin route | ✅ OK |
| T16: tabs + handoff | layout + docs | ✅ OK |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | Slice 0 | (prereq) | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T2 | T2 → T6 (parallel after T5 in phase order T5 before T6) | ✅ |
| T7 | T2 | T2 → T7 | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T1, T2 | T8 → T9 (T1/T2 implicit via phase) | ✅ |
| T10 | T9 | T9 → T10 | ✅ |
| T11 | T10 | T10 → T11 | ✅ |
| T12 | T11 | T11 → T12 | ✅ |
| T13 | T12 | T12 → T13 | ✅ |
| T14 | T5, T6, T7 | T5,T6,T7 → T14 via phase 4 | ✅ |
| T15 | T8, T12, T13, T14 | sequential in phase 4 | ✅ |
| T16 | T15 | T15 → T16 | ✅ |

Note: T6/T7 depend on T2 only but execute after T5 in Phase 2 order to keep API layer complete before logic tests run against stable types.

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | config | none | none | ✅ |
| T2 | types/theme | none | none | ✅ |
| T3 | hook (api) | none | none | ✅ |
| T4–T5 | API wrappers | none | none | ✅ |
| T6 | summaryMappers | unit | unit | ✅ |
| T7 | ctaRouting | unit | unit | ✅ |
| T8–T12 | RN components | none | none | ✅ |
| T13 | i18n | none | none | ✅ |
| T14 | homeStore (Zustand) | none (optional unit) | none | ✅ |
| T15–T16 | screen/layout | none | none | ✅ |

---

## Requirement traceability (tasks)

| Requirement | Tasks |
| ----------- | ----- |
| MHOME-01–05 | T10, T15, T8 |
| MHOME-06–10 | T2, T6, T9, T10 |
| MHOME-11–14 | T6, T11, T14 |
| MHOME-15–18 | T5, T12, T14 |
| MHOME-19–22 | T7, T15 |
| MHOME-23–26 | T12, T14, T15 |
| MHOME-27–29 | T16 |

**Coverage:** 29 requirements → 16 tasks, all mapped ✅

---

## Verifier prep

After T16 commit, Verifier checks:

- [ ] Home Summary anatomy in light + dark
- [ ] Rings/tiles match API for seeded student
- [ ] Guidance + CTA routing
- [ ] Loading / empty guidance / partial error paths
- [ ] Discrimination sensor on `summaryMappers` and `ctaRouting`
- [ ] Write `.specs/features/mobile-home-summary/validation.md`

**Next slice after PASS:** `mobile-training` (Slice 2)
