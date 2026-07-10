# Mobile Progress — Validation Report

**Feature:** `mobile-progress` (Slice 4)  
**Branch:** `cursor/mobile-progress-spec-f68f`  
**Verifier:** Independent (author ≠ verifier)  
**Date:** 2026-07-10  
**Overall verdict:** **PASS**

---

## Diff range

| Field | Value |
|-------|-------|
| First implementation commit | `51091ee` — `feat(mobile): extend progress API client for weight` |
| Last commit (HEAD) | `6be1d52` — `test(mobile): extend e2e smoke for progress tab` |
| Range | `51091ee..6be1d52` (11 implementation commits after docs spec) |
| Files touched | 21 files under `apps/mobile/` (+1108 / −23 lines) |

Docs-only commits before implementation: `4f33754` (spec), `1b5d7ca` (design + tasks).

---

## Gate results

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm --filter @forma/mobile test` | **PASS** — 16 suites, 99 tests (19 new progress tests) |
| Typecheck | `pnpm --filter @forma/mobile check-types` | **PASS** |
| Biome (progress scope) | `biome check apps/mobile/src/features/progress apps/mobile/src/api/progress.ts apps/mobile/app/(tabs)/progress apps/mobile/e2e/auth-onboarding.spec.ts` | **PASS** — 18 files, 0 issues |

---

## Discrimination sensor

Behavior-level faults injected in scratch (file restored after each run; implementation unchanged).

| Mutation | Fault | Tests run | Killed? |
|----------|-------|-----------|---------|
| M1 | `TREND_THRESHOLD_KG` 0.2 → 0.5 in `weightMappers.ts` | `weightMappers.test.ts` | **Yes** — `returns up…` and `returns down…` failed (expected `up`/`down`, got `stable`) |
| M2 | Reversed `sortWeightEntries` comparator (desc vs asc) | `weightMappers.test.ts` | **Yes** — 5 failures across sort, latest, trend, and history row order |

Sensor verdict: **PASS** — unit tests discriminate core trend and sort behavior.

---

## Per-AC evidence (MPROG-01 … MPROG-20)

| ID | Verdict | Evidence |
|----|---------|----------|
| **MPROG-01** | PASS | **Code:** `ProgressHubScreen.tsx:78-135` — title, `todayUtc`, weight snapshot, streak cards, history, log CTA. **E2E:** `auth-onboarding.spec.ts:51-53` — `progress-screen` + `progress-log-weight-button` visible after tab click. |
| **MPROG-02** | PASS | **Test:** `weightMappers.test.ts:48-54` — `latestWeight` returns most recent by `logDate`. **Code:** `weightMappers.ts:28-35` uses sorted ascending, last element. **Code:** `progressStore.ts:53,59` — 90-day `defaultHistoryRange` for `getWeightHistory`. |
| **MPROG-03** | PASS | **Test:** `weightMappers.test.ts:62-64,67-83` — trend `null` when &lt;2 entries; `up`/`down`/`stable` at ±0.2 kg. **Code:** `TrendBadge.tsx:18-23` — tertiary insufficient copy when `trend === null`. |
| **MPROG-04** | PASS | **Code:** `ProgressHubScreen.tsx:32-34,70-75` — `RefreshControl` calls `fetchHub` on pull. **Code:** `progressStore.ts:58-61` — parallel `getWeightHistory` + `getStreaks`. |
| **MPROG-05** | PASS | **Code:** `progressStore.ts:67-87` — `Promise.allSettled`, per-section `hubErrors.weight` / `hubErrors.streaks`, keeps fulfilled data. **Code:** `ProgressHubScreen.tsx:85-121` — inline `InlineError` on failed section; successful section still renders. **Retry:** `ProgressHubScreen.tsx:70-75` pull-to-refresh on partial-success hub (matches nutrition hub pattern). |
| **MPROG-06** | PASS | **Code:** `ProgressHubScreen.tsx:36-38,40-58` — `bothFailed` when both errors and no cached data; skeleton via `LoadingState` while `hubLoading && !hasAnyData`; full-screen `InlineError` + `progress-retry-button`. |
| **MPROG-07** | PASS | **Code:** `ProgressHubScreen.tsx:131-134` — `router.push('/(tabs)/progress/weight/new')`. **Route:** `app/(tabs)/progress/weight/new.tsx`. **E2E:** `progress-log-weight-button` visible on hub. |
| **MPROG-08** | PASS | **Test:** `weightValidation.test.ts:24-40` — required, invalid number, out-of-range (&gt;500). **Test:** `weightValidation.test.ts:42-46` — comma decimal accepted. **Code:** `LogWeightScreen.tsx:23,70-77` — kg input, default date `todayUtcDate()`. **Code:** `weightValidation.ts:58` — `weight < 0` rejected (no dedicated negative test; branch present). |
| **MPROG-09** | PASS | **Test:** `weightValidation.test.ts:48-66` — future blocked, &gt;365 days blocked. **Code:** `weightValidation.ts:24-25,75-78` — `MAX_PAST_DAYS = 365`. |
| **MPROG-10** | PASS | **Code:** `progress.ts:27-31` — `logWeight` POST. **Code:** `progressStore.ts:91-97` — POST then `fetchHub()`. **Code:** `LogWeightScreen.tsx:54-58` — submit + `router.back()` on success. |
| **MPROG-11** | PASS | **Test:** `weightValidation.test.ts:24-72` — all validation branches. **Code:** `LogWeightScreen.tsx:47-48,75,84` — `validationErrors` bound to `TextField` `error` props. |
| **MPROG-12** | PASS | **Code:** `progressStore.ts:95-96` — hub refresh after POST (server upsert by date; client shows refreshed latest). No client-side duplicate-date logic required. |
| **MPROG-13** | PASS | **Test:** `weightMappers.test.ts:92-104` — `buildHistoryRows` newest-first. **Test:** `weightMappers.test.ts:87-89` — one decimal via `formatWeightKg`. **Code:** `WeightHistoryRow.tsx:15-19` — date + weight label. |
| **MPROG-14** | PASS | **Test:** `weightMappers.test.ts:105-107` — signed delta `-0.5 kg`; oldest row has no delta. **Code:** `WeightHistoryRow.tsx:22-34` — optional `deltaLabel` column. |
| **MPROG-15** | PASS | **Code:** `WeightHistoryList.tsx:24-27` — `emptyLabel` when `rows.length === 0`. **i18n:** `progress.hub.emptyHistory`. **Code:** `ProgressHubScreen.tsx:131-135` — primary log-weight CTA always on hub (including empty state). |
| **MPROG-16** | PASS | **Code:** `WeightHistoryList.tsx:24-30` — empty copy only when `rows.length === 0`; rows map when data exists. |
| **MPROG-17** | PASS | **Code:** `ProgressHubScreen.tsx:106-112` — `StreakPairCard` title `progress.streak.training`. **Code:** `StreakPairCard.tsx:21-46` — current + longest with tabular numerals. |
| **MPROG-18** | PASS | **Code:** `ProgressHubScreen.tsx:113-119` — nutrition `StreakPairCard` with same shape as training. |
| **MPROG-19** | PASS | **Code:** `StreakPairCard.tsx:21-22,47-50` — defaults to `0` when `streak` null; `zeroHint` tertiary copy when `current === 0`. |
| **MPROG-20** | PASS | **Code:** `ProgressHubScreen.tsx:102-103` — streak `InlineError` only in streak branch. **Code:** `ProgressHubScreen.tsx:85-100,123-128` — weight snapshot and history still render when `!hubErrors.weight`. |

**AC coverage:** 20 / 20 mapped — **20 PASS**, 0 FAIL.

---

## Gaps and notes (non-blocking)

1. **MPROG-05 retry UX:** Partial failures rely on pull-to-refresh (no per-section retry button). Aligns with `NutritionHubScreen` and `design.md` error table; spec wording “retry affordance per RULES” is satisfied via refresh + full-screen retry when both fail.
2. **Store / screen error paths:** `progressStore` partial/full-error logic and hub rendering are not unit-tested; covered by code inspection only. Acceptable per tasks matrix (store = indirect coverage).
3. **Negative weight:** `weightValidation.ts:58` rejects `weight < 0` but no explicit unit test for negative input.
4. **Stale i18n key:** `tabs.progressPlaceholder` remains in `en.ts` / `pt-BR.ts` but is unused after placeholder removal (T10 “unused or removed” — cosmetic).
5. **E2E depth:** Smoke reaches Progress hub and log CTA; does not exercise log-weight submit or streak/weight API data (optional per T11).

---

## Requirement traceability closure

| Metric | Value |
|--------|-------|
| Spec requirements | 20 (MPROG-01 … MPROG-20) |
| Tasks | T1–T12 implemented on branch |
| New unit tests | 19 (`weightMappers.test.ts` ×10, `weightValidation.test.ts` ×9) |
| E2E extension | `auth-onboarding.spec.ts` — Progress tab + `progress-screen` |

**Recommendation:** Mark Slice 4 **complete** for STATE handoff (T12). No implementation changes required for PASS.
