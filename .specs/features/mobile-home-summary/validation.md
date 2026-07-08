# Mobile Home Summary — Validation Report

**Status:** PASS  
**Date:** 2026-07-08  
**Diff range:** `2f5d6d3..f61d5f7` (`feature/home-summary`)  
**Verifier:** Independent post-Execute pass (author ≠ verifier)

---

## Gate Results

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm --filter @forma/mobile test` | **PASS** — 51 tests, 0 failed |
| Types | `pnpm --filter @forma/mobile check-types` | **PASS** |
| Lint | `pnpm lint` | **PASS** (after pre-existing API format auto-fix in worktree, unstaged) |

---

## Discrimination Sensor

| Target | Mutation | Tests | Result |
|--------|----------|-------|--------|
| `computeMoveProgress` | Cap changed `1` → `0.5` | `summaryMappers.test.ts` | **KILLED** (1 failed: caps at 1) |
| `resolveCtaFromGuidance` | Empty fallback route `training` → `progress` | `ctaRouting.test.ts` | **KILLED** (2 failed: training + empty fallback) |

No surviving mutants.

---

## Spec-Anchored AC Evidence (key P1 ACs)

### P1-01 Summary anatomy (MHOME-01–05)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| Summary anatomy order | header → hero → tiles → guidance → CTA | `SummaryScreen.tsx` composes `SummaryHeader`, `RingHeroCard`, `MetricTileGrid`, `GuidanceList`, `PrimaryButton` | ✅ Manual/typecheck |
| Pull-to-refresh | Re-fetch on pull | `SummaryScreen.tsx` — `RefreshControl` + `refresh()` | ✅ |
| Tabular numerals | `fontVariant: tabular-nums` | `MetricTile.tsx:49` — `typography.tabular`; `RingHeroCard.tsx:68` | ✅ |

### P1-02 Activity rings (MHOME-06–10)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| Move progress capped | `min(consumed/target, 1)` | `summaryMappers.test.ts:38` — `expect(computeMoveProgress(2500, 2000)).toBe(1)` | ✅ |
| Target null → 0 | progress `0` | `summaryMappers.test.ts:46` — `expect(computeMoveProgress(1200, null)).toBe(0)` | ✅ |
| Target 0 → 0 | progress `0` | `summaryMappers.test.ts:50` — `expect(computeMoveProgress(1200, 0)).toBe(0)` | ✅ |
| Exercise today → 1 | progress `1` | `summaryMappers.test.ts:62` — `expect(computeExerciseProgress(sessions, today)).toBe(1)` | ✅ |
| No session today → 0 | progress `0` | `summaryMappers.test.ts:66-72` | ✅ |
| Stand any macro > 0 → 1 | progress `1` | `summaryMappers.test.ts:78-83` | ✅ |
| Reduced motion | skip sweep | `ActivityRings.tsx:39-42` — immediate value when `reducedMotion` | ✅ |

### P1-03 Metric tiles (MHOME-11–14)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| Tile order | training streak, calories, protein, nutrition streak | `summaryMappers.test.ts:119-127` — `tiles.map(tile => tile.id)` | ✅ |
| Calories with target | `consumed/target` | `summaryMappers.test.ts:128` — `expect(tiles[1].value).toBe('1800/2200')` | ✅ |
| Target null | consumed only | `summaryMappers.test.ts:134-137` | ✅ |
| Partial tile errors | per-source `error` flag | `summaryMappers.test.ts:141-149` | ✅ |

### P1-04 Guidance (MHOME-15–18)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| Max 3 rows | slice(0,3) | `GuidanceList.tsx:34` — `suggestions.slice(0, 3)` | ✅ |
| Empty state | localized key | `GuidanceList.tsx:57` — `t('home.guidance.empty')` | ✅ |
| Error + retry | InlineError + button | `GuidanceList.tsx:42-47` | ✅ |

### P1-05 CTA routing (MHOME-19–22)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| training → log workout / training tab | label + route | `ctaRouting.test.ts:14-17` | ✅ |
| nutrition → log meal / nutrition tab | label + route | `ctaRouting.test.ts:20-23` | ✅ |
| progress/general → view progress / progress tab | label + route | `ctaRouting.test.ts:26-35` | ✅ |
| Empty → start day / training tab | fallback | `ctaRouting.test.ts:38-41` | ✅ |
| Unknown type → progress | fallback | `ctaRouting.test.ts:44-47` | ✅ |
| CTA green button | `#30D158` / on-primary black | `PrimaryButton.tsx` — `colors.primary` / `colors.onPrimary` (theme tokens) | ✅ |

### P1-06 Loading & errors (MHOME-23–26)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| Loading skeleton | not blank | `SummaryScreen.tsx:37-42` — `SummarySkeleton` | ✅ |
| All fail → full error | fatalError + retry | `homeStore.ts:110-124`, `SummaryScreen.tsx:45-55` | ✅ |
| 401 → signOut | existing client handler | `useApiClient.ts:14-16` — `onUnauthorized: signOut` | ✅ |
| Partial errors | per-section flags | `homeStore.ts:136-160`, `Promise.allSettled` | ✅ |

### P2 Tab bar (MHOME-27–29)

| Criterion | Spec outcome | Evidence | Result |
|-----------|--------------|----------|--------|
| Active tint green | `#30D158` | `_layout.tsx:22` — `tabBarActiveTintColor: colors.primary` | ✅ |
| Localized labels | pt-BR + en | `_layout.tsx` — `t('tabs.*')`; i18n catalogs | ✅ |
| ≥44pt targets | `tabBarItemStyle.minHeight: 44` | `_layout.tsx:31-33` | ✅ |

---

## Spec-Precision Gaps

| Area | Note |
|------|------|
| UI visual polish (light/dark canvas) | Manual smoke — typecheck + component tokens only |
| Ring sweep animation timing | ⚠️ Not unit-tested; covered by `ActivityRings` implementation + reduced-motion branch |
| End-to-end API integration | Manual smoke with local API |

---

## Deviations

| Item | Detail |
|------|--------|
| Commit `185fda7` | Pre-existing partial API commit (training+progress combined); superseded by atomic T4/T5 commits `710090a`, `a0c380a` |
| `training.ts` scope | Includes Slice 2 methods (exercises/plans) from branch base — `listSessions` used by Home |
| API lint format | Pre-existing `progress.*` formatting fixed locally (unstaged) for `pnpm lint` gate |

---

## Verdict

**PASS** — All mapped P1 acceptance criteria have implementation evidence; unit tests assert spec-defined outcomes for pure logic; discrimination sensor killed all injected faults; full gate green.

**Next slice:** `mobile-training` per `.specs/STATE.md` Handoff.
