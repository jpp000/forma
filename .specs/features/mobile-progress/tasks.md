# Mobile Progress Tasks

## Execution Protocol (MANDATORY)

Implement with the **`tlc-spec-driven`** skill: follow Execute flow (per-task cycle, batch workers, Verifier).

**Design**: `.specs/features/mobile-progress/design.md`  
**Spec**: `.specs/features/mobile-progress/spec.md`  
**Prerequisite:** Slices 0–3 on `dev`. **AD-030:** Zustand store. **AD-031:** `testID` on P0 flows.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: `AGENTS.md`, `.specs/ui/RULES.md`, nutrition/training slice patterns.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Pure mappers (`weightMappers.ts`) | unit | All branches; 1:1 to MPROG-02/03/13/14; all listed edge cases (unsorted input, <2 entries, delta sign) | `apps/mobile/src/features/progress/__tests__/*.test.ts` | `pnpm --filter @forma/mobile test` |
| Pure validation (`weightValidation.ts`) | unit | All validation branches; date bounds; comma decimal | `apps/mobile/src/features/progress/__tests__/*.test.ts` | `pnpm --filter @forma/mobile test` |
| Zustand store | none | Covered indirectly via screen smoke + mapper unit tests | — | build gate |
| Screens / components | none | Manual smoke + optional E2E extension in T11 | — | `pnpm --filter @forma/mobile test:e2e` |
| API client types | none | Typecheck gate | `apps/mobile/src/api/progress.ts` | `pnpm --filter @forma/mobile check-types` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After T2 (mappers + validation tests) | `pnpm --filter @forma/mobile test` |
| Build | After UI tasks | `pnpm --filter @forma/mobile check-types && pnpm lint` |
| Full | After T11 (integration) | `pnpm --filter @forma/mobile test && pnpm --filter @forma/mobile check-types && pnpm lint` |

---

## Execution Plan

**Batch 1 (Foundation):** T1 → T2 → T3  
**Batch 2 (UI):** T4 → T5 → T6 → T7  
**Batch 3 (Integration):** T8 → T9 → T10 → T11 → T12

```
Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6 ──→ T7
Phase 3:  T8 ──→ T9 ──→ T10 ──→ T11 ──→ T12
```

---

## Task Breakdown

### T1: Progress types + extend API client

**What**: Add `WeightEntry`, `LogWeightInput` types; `logWeight`, `getWeightHistory` on `createProgressApi`  
**Where**: `src/features/progress/types.ts`, `src/api/progress.ts`  
**Depends on**: None  
**Reuses**: `createProgressApi` pattern from `getStreaks`  
**Requirement**: MPROG-07, MPROG-10

**Done when**:
- [ ] `getWeightHistory(from?, to?)` typed GET with query params
- [ ] `logWeight({ weightKg, date })` typed POST
- [ ] `check-types` passes for API module

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): extend progress API client for weight`

---

### T2: Pure weight mappers + validation + unit tests

**What**: `weightMappers.ts`, `weightValidation.ts`, `__tests__/` covering trend, sort, delta, date/weight validation  
**Where**: `src/features/progress/`  
**Depends on**: T1  
**Reuses**: `todayUtcDate` from home mappers  
**Requirement**: MPROG-02, MPROG-03, MPROG-08, MPROG-09, MPROG-13, MPROG-14 + edge cases

**Done when**:
- [ ] Trend hidden when < 2 entries; thresholds ±0.2 kg
- [ ] Unsorted entries sorted before latest/trend/delta
- [ ] Validation: future blocked, >365 days blocked, comma decimal, 0–500 range
- [ ] Quick gate passes; test count ≥ 12 new tests

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(mobile): add progress weight mappers and validation`

---

### T3: progressStore (Zustand)

**What**: `progressStore.ts` with `fetchHub`, `logWeight`, loading/error/submit states  
**Where**: `src/features/progress/progressStore.ts`  
**Depends on**: T1, T2  
**Reuses**: `nutritionStore` parallel fetch + generation guard  
**Requirement**: MPROG-04, MPROG-05, MPROG-06, MPROG-10, MPROG-12, MPROG-20

**Done when**:
- [ ] `fetchHub` uses 90-day range + streaks in parallel (`allSettled`)
- [ ] Partial errors per section; full error when both fail and no cached data
- [ ] `logWeight` POST + refresh hub

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add progress Zustand store`

---

### T4: Weight snapshot + trend components

**What**: `WeightSnapshotCard.tsx`, `TrendBadge.tsx`  
**Where**: `src/features/progress/components/`  
**Depends on**: T2  
**Reuses**: `useFormaTheme`, Stand cyan accent  
**Requirement**: MPROG-01, MPROG-02, MPROG-03

**Done when**:
- [ ] Shows latest weight or empty state
- [ ] Trend badge for up/down/stable; hidden + tertiary when insufficient data

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add weight snapshot components`

---

### T5: Streak pair card component

**What**: `StreakPairCard.tsx` — training + nutrition blocks with current/longest  
**Where**: `src/features/progress/components/`  
**Depends on**: T2  
**Requirement**: MPROG-17, MPROG-18, MPROG-19

**Done when**:
- [ ] Tabular numerals; zero state with tertiary hint
- [ ] Accepts `StreakPair` + label keys

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add progress streak cards`

---

### T6: Weight history list components

**What**: `WeightHistoryRow.tsx`, `WeightHistoryList.tsx`  
**Where**: `src/features/progress/components/`  
**Depends on**: T2  
**Requirement**: MPROG-13, MPROG-14, MPROG-15, MPROG-16

**Done when**:
- [ ] Newest-first list with optional delta column
- [ ] Empty encouragement when no rows

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add weight history list`

---

### T7: ProgressHubScreen + tab stack routes

**What**: `ProgressHubScreen.tsx`, `app/(tabs)/progress/index.tsx`, `_layout.tsx`  
**Where**: features + app routes  
**Depends on**: T3, T4, T5, T6  
**Reuses**: `NutritionHubScreen` pull-to-refresh + focus pattern  
**Requirement**: MPROG-01–MPROG-06, MPROG-13–MPROG-20

**Done when**:
- [ ] Hub renders all sections; pull-to-refresh; `testID="progress-screen"`
- [ ] CTA navigates to weight log route
- [ ] `useFocusEffect` refresh

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add progress hub screen`

---

### T8: Log weight screen + route

**What**: `LogWeightScreen.tsx`, `app/(tabs)/progress/weight/new.tsx`  
**Where**: features + app routes  
**Depends on**: T3, T2  
**Requirement**: MPROG-07–MPROG-12

**Done when**:
- [ ] Form validates and submits; `router.back()` on success
- [ ] `testID`s on screen, inputs, submit
- [ ] Inline validation errors

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add log weight flow`

---

### T9: i18n progress.* keys

**What**: Add all `progress.*` keys to `en.ts` and `pt-BR.ts`  
**Where**: `src/i18n/`  
**Depends on**: T7, T8  
**Requirement**: all UI copy ACs

**Done when**:
- [ ] Keys from design.md present in both locales
- [ ] No hard-coded Progress copy in screens

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add progress i18n keys`

---

### T10: Remove placeholder + wire tab

**What**: Delete `app/(tabs)/progress.tsx`; ensure tab layout points to folder  
**Where**: `app/(tabs)/`  
**Depends on**: T7  
**Requirement**: MPROG-01

**Done when**:
- [ ] Old placeholder removed; Progress tab opens hub stack
- [ ] `tabs.progressPlaceholder` unused or removed

**Tests**: none  
**Gate**: build  
**Commit**: `chore(mobile): replace progress placeholder with stack`

---

### T11: Full gate + E2E smoke extension

**What**: Extend Playwright smoke to open Progress tab post-auth; run full gate  
**Where**: `apps/mobile/e2e/` (optional minimal assertion)  
**Depends on**: T9, T10  
**Requirement**: Success criteria in spec

**Done when**:
- [ ] Full gate passes (test + check-types + lint)
- [ ] E2E reaches `progress-screen` after onboarding (or document skip if flaky)

**Tests**: e2e (optional minimal)  
**Gate**: full  
**Commit**: `test(mobile): extend e2e smoke for progress tab`

---

### T12: STATE handoff + validation report

**What**: Update `.specs/STATE.md` handoff; write `validation.md` after Verifier  
**Where**: `.specs/`  
**Depends on**: T11 + Verifier PASS  
**Requirement**: traceability closure

**Done when**:
- [ ] STATE Handoff lists Slice 4 complete
- [ ] `validation.md` with PASS/FAIL per AC

**Tests**: none  
**Gate**: n/a  
**Commit**: `docs(specs): update STATE for mobile-progress`

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: API client extension | 2 files | ✅ Granular |
| T2: Mappers + validation + tests | 1 domain layer | ✅ Granular |
| T3: progressStore | 1 store file | ✅ Granular |
| T4: Snapshot components | 2 components | ✅ Granular |
| T5: Streak card | 1 component | ✅ Granular |
| T6: History list | 2 components | ✅ Granular |
| T7: Hub screen + routes | 1 screen + routes | ✅ Granular |
| T8: Log screen + route | 1 screen + route | ✅ Granular |
| T9: i18n | 2 locale files | ✅ Granular |
| T10: Remove placeholder | 1 delete | ✅ Granular |
| T11: Gates + E2E | test update | ✅ Granular |
| T12: Docs | STATE + validation | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T1 | None | Phase 1 start | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1, T2 | T2 → T3 | ✅ |
| T4 | T2 | T2 → T4 | ✅ |
| T5 | T2 | T2 → T5 | ✅ |
| T6 | T2 | T2 → T6 | ✅ |
| T7 | T3,T4,T5,T6 | T3–T6 → T7 | ✅ |
| T8 | T3, T2 | T3 → T8 | ✅ |
| T9 | T7, T8 | T7,T8 → T9 | ✅ |
| T10 | T7 | T7 → T10 | ✅ |
| T11 | T9, T10 | T9,T10 → T11 | ✅ |
| T12 | T11 | T11 → T12 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|------------|-----------------|-----------|--------|
| T1 | API client | none | none | ✅ |
| T2 | Mappers + validation | unit | unit | ✅ |
| T3 | Store | none | none | ✅ |
| T4–T10 | UI | none | none | ✅ |
| T11 | E2E | e2e optional | e2e | ✅ |
| T12 | Docs | none | none | ✅ |

---

## Requirement Traceability (Tasks)

| Requirement | Task(s) |
|-------------|---------|
| MPROG-01–06 | T3, T4, T7 |
| MPROG-07–12 | T1, T2, T3, T8 |
| MPROG-13–16 | T2, T6, T7 |
| MPROG-17–20 | T3, T5, T7 |
