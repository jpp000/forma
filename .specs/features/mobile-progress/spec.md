# Mobile Progress Specification

**Status**: Draft — awaiting confirmation

## Problem Statement

After Slices 0–3, the Progress tab is still a placeholder. Home Summary already surfaces training and nutrition streaks in metric tiles, and guidance CTAs route students to Progress — but they cannot log weight, review weight history, or see a dedicated streak breakdown. Without Slice 4, the progress-tracking loop is incomplete and guidance suggestions about weight trend have no surface to act on.

## Goals

- [ ] Replace the Progress placeholder with a **Progress hub** showing latest weight, trend cue, and training + nutrition streaks (current and longest)
- [ ] Let students **log weight** in kg via `POST /api/progress/weight` (upsert by UTC date)
- [ ] Show **weight history** for a configurable default range via `GET /api/progress/weight`
- [ ] Match `DESIGN.md` + `.specs/ui/RULES.md` (light + dark; Stand cyan `#1EE4E1` for progress accents)
- [ ] Use Zustand `progressStore` per AD-030

## Out of Scope

| Feature | Reason |
|---------|--------|
| Weight chart / graph visualization | MVP list is sufficient; no chart dependency in mobile yet |
| Edit or delete past weight entries | API has upsert-only for same date; no DELETE endpoint |
| Rest-day mark UI | Slice 2 — `mobile-training` owns `POST /api/progress/training-rest-days` |
| Training grace-period explainer UI | AD-027 logic is server-side; hub shows streak counts only |
| Imperial units (lb) | API stores kg only; conversion P2 |
| Professional dashboard / coaching views | Web portal P2 |
| Billing / paywall UI | AD-026 |
| Home Summary ring changes | Stand ring stays meal-logged proxy until a separate Home polish slice |
| New API endpoints | Client consumes existing Progress module |
| Offline persistence / sync queue | MVP in-memory session only |
| Push notifications for streak milestones | P2 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Actor | **Student only** | AD-024 | n |
| Depends on | Slice 0 (auth, API client, tabs) + Slice 1 (Home routes guidance CTAs here) | Sequential slices | n |
| Date for “today” | **UTC date** (`YYYY-MM-DD`, same as training/nutrition/home) | AD-028 / platform-foundation | n |
| Hub data | Parallel fetch: `GET /api/progress/weight` (default range) + `GET /api/progress/streaks` | Mirrors training/nutrition hub pattern | n |
| Default history range | **Last 90 days** (`from = today − 89d`, `to = today`) | Enough for trend without huge lists | n |
| History display | **Chronological list, newest first** — date + weight (1 decimal kg) + optional delta vs previous entry | No chart library; scannable MVP | n |
| Latest weight on hub | Most recent entry in fetched history (or `—` when empty) | Avoid extra API call; history fetch covers hub | n |
| Trend cue | Client computes `up` / `down` / `stable` from two most recent entries using API thresholds (> 0.2 kg up, < −0.2 kg down) | Matches `ProgressService.getWeightTrend` without new endpoint | n |
| Log weight date | Defaults to **today UTC**; student may pick a **past** date within the last **365 days**; future dates blocked | API accepts any valid date; backfill forgotten logs; no future logging | n |
| Weight input | Decimal kg, ≥ 0, max **500** client-side; 1 decimal place display | API `@Min(0)` only; sanity cap on client | n |
| Same-day re-log | API **upserts**; hub refreshes after POST | `progress.e2e-spec.ts` upsert behavior | n |
| Streak display | Two cards/rows: **Training** and **Nutrition**, each showing current + longest (tabular numerals) | `GET /api/progress/streaks` shape | n |
| Streak zero state | Show `0` with localized encouragement copy (not hidden) | Clear empty streak UX | n |
| Client state | Zustand `progressStore`; extend `createProgressApi` with `logWeight` + `getWeightHistory` | AD-030; `progress.ts` today lacks weight methods | n |
| Tests | Unit tests for trend + delta + date validation pure functions; `testID` on hub + log form for Playwright | Slice 0–3 pattern (AD-031) | n |
| Pull-to-refresh | Hub re-fetches weight history + streaks | Consistent with nutrition/training hubs | n |

**Open questions:** none — defaults above are agent-chosen pending your confirmation.

**Implicit-requirement dimensions (Large scope):**

| Dimension | Resolution |
|-----------|------------|
| Input validation & bounds | weightKg ≥ 0, ≤ 500 client; ISO date; no future dates; past ≤ 365 days |
| Failure / partial-failure | Per-section inline errors when one fetch fails; full-screen error + retry when both fail on first load |
| Idempotency / dedup | POST weight upserts by `userId + logDate` (server) |
| Auth boundaries | Student JWT via existing session; 401 → auth gate |
| Concurrency / ordering | Last POST wins for same date; refresh after submit |
| Data lifecycle / expiry | History window 90 days on hub; full range query if extended later |
| Observability | N/A on mobile client |
| External-dependency failure | Localized API error messages; retry on hub |
| State-transition integrity | N/A — no workflow states beyond loading/submitting |

---

## Design constraints (must cite)

- Root [`DESIGN.md`](../../../DESIGN.md) — Stand cyan `#1EE4E1` for progress accents; green `#30D158` for primary CTAs
- [`.specs/ui/RULES.md`](../../ui/RULES.md) — loading / empty / error; tabular numerals; 44pt targets
- Slice 0–3 handoff — extend `apps/mobile/src/features/progress/`; replace `(tabs)/progress.tsx` placeholder
- **AD-030:** `progressStore` — not React Context

---

## User Stories

### P1-01: Progress hub — weight snapshot + streaks ⭐ MVP

**User Story**: As a **student**, I want to open Progress and see my latest weight, trend, and activity streaks so that I understand how I am doing over time.

**Why P1**: Core Progress surface; closes the loop started on Home Summary tiles.

**Acceptance Criteria**:

1. WHEN the student opens the Progress tab THEN the screen SHALL show title, today’s UTC date, latest weight (or empty placeholder), trend cue (`up` / `down` / `stable` / hidden when < 2 entries), training streak (current + longest), and nutrition streak (current + longest)
2. WHEN `GET /api/progress/weight` returns entries THEN latest weight SHALL be the most recent entry by `logDate` within the default 90-day range
3. WHEN fewer than two weight entries exist THEN trend cue SHALL be hidden and tertiary copy SHALL explain insufficient data
4. WHEN the student pulls to refresh THEN the hub SHALL re-fetch weight history and streaks
5. WHEN one fetch fails and the other succeeds THEN the hub SHALL show partial data with an inline error on the failed section and a retry affordance per RULES
6. WHEN both fetches fail on initial load THEN the screen SHALL show loading skeleton first, then full error with retry

**Requirements**: `MPROG-01`–`MPROG-06`

**Independent Test**: Seed two weight entries via API → open Progress → see latest weight, trend arrow/label, and streak counts.

---

### P1-02: Log weight ⭐ MVP

**User Story**: As a **student**, I want to log my body weight in kg so that my progress history stays up to date.

**Acceptance Criteria**:

1. WHEN the student taps “Log weight” THEN the app SHALL navigate to a weight log form
2. WHEN the form renders THEN the student SHALL enter weight in kg (required, ≥ 0) with date defaulting to today UTC
3. WHEN the student selects a date THEN it SHALL be allowed only for past or today within the last 365 days (future blocked)
4. WHEN the student submits valid data THEN the app SHALL `POST /api/progress/weight` and return to the hub with refreshed history and latest weight
5. WHEN validation fails THEN inline field errors SHALL appear (required weight, invalid number, out-of-range, invalid date)
6. WHEN the student logs again for the same UTC date THEN the hub SHALL show the updated value (upsert)

**Requirements**: `MPROG-07`–`MPROG-12`

**Independent Test**: Log 72.5 kg → hub shows 72.5 → log 73.0 same day → hub shows 73.0 (single entry).

---

### P1-03: Weight history list ⭐ MVP

**User Story**: As a **student**, I want to see my recent weight entries in a list so that I can review changes over time.

**Acceptance Criteria**:

1. WHEN the hub has weight entries in the default range THEN a **Recent weight** section SHALL list entries newest-first with date and weight (kg, one decimal)
2. WHEN an entry has a previous entry (chronologically) THEN the row MAY show signed delta in kg vs that previous entry (e.g. `−0.5 kg`)
3. WHEN no entries exist in range THEN the section SHALL show localized empty encouragement and the primary CTA to log first weight
4. WHEN entries exist THEN empty encouragement SHALL not appear

**Requirements**: `MPROG-13`–`MPROG-16`

**Independent Test**: Log weights on three different days → list shows three rows newest-first with deltas.

---

### P1-04: Streak detail cards ⭐ MVP

**User Story**: As a **student**, I want to see both training and nutrition streaks with current and personal-best counts so that I stay motivated across habits.

**Acceptance Criteria**:

1. WHEN streaks load successfully THEN the hub SHALL show separate **Training** and **Nutrition** streak blocks
2. WHEN each block renders THEN it SHALL display current streak and longest streak with tabular numerals and localized labels
3. WHEN streak values are zero THEN blocks SHALL still render with `0` and supportive tertiary copy
4. WHEN `GET /api/progress/streaks` fails THEN an inline error SHALL appear in the streak section without hiding weight data

**Requirements**: `MPROG-17`–`MPROG-20`

**Independent Test**: Student with known streaks from API → Progress shows matching current/longest for both types.

---

## API integration

| Endpoint | Use |
|----------|-----|
| `GET /api/progress/weight?from=<today-89d>&to=<today>` | Hub latest weight + history list |
| `POST /api/progress/weight` | Log / upsert weight `{ weightKg, date }` |
| `GET /api/progress/streaks` | Training + nutrition current/longest |

**Client gaps to close in Execute:** `apps/mobile/src/api/progress.ts` needs `logWeight` and `getWeightHistory` (types for weight entries).

No new API endpoints in this slice.

---

## Edge Cases

- WHEN student logs weight twice same UTC date THEN system SHALL keep latest value (API upsert)
- WHEN weight history returns unsorted data THEN client SHALL sort by `logDate` ascending before computing latest, trend, and deltas
- WHEN student submits weight with comma decimal separator THEN client SHALL normalize or reject with validation error
- WHEN API returns 401 THEN app SHALL route to auth (existing session gate)
- WHEN history range returns empty array THEN latest weight shows `—` and trend is hidden

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| MPROG-01 | P1-01: Hub anatomy | Design | Pending |
| MPROG-02 | P1-01: Latest weight | Design | Pending |
| MPROG-03 | P1-01: Trend cue rules | Design | Pending |
| MPROG-04 | P1-01: Pull-to-refresh | Design | Pending |
| MPROG-05 | P1-01: Partial error UX | Design | Pending |
| MPROG-06 | P1-01: Full error UX | Design | Pending |
| MPROG-07 | P1-02: Navigate to form | Design | Pending |
| MPROG-08 | P1-02: Weight input validation | Design | Pending |
| MPROG-09 | P1-02: Date bounds | Design | Pending |
| MPROG-10 | P1-02: POST + refresh | Design | Pending |
| MPROG-11 | P1-02: Inline validation errors | Design | Pending |
| MPROG-12 | P1-02: Same-day upsert display | Design | Pending |
| MPROG-13 | P1-03: History list order | Design | Pending |
| MPROG-14 | P1-03: Delta display | Design | Pending |
| MPROG-15 | P1-03: Empty history copy | Design | Pending |
| MPROG-16 | P1-03: Hide empty when data exists | Design | Pending |
| MPROG-17 | P1-04: Training streak block | Design | Pending |
| MPROG-18 | P1-04: Nutrition streak block | Design | Pending |
| MPROG-19 | P1-04: Zero streak copy | Design | Pending |
| MPROG-20 | P1-04: Streak fetch error | Design | Pending |

**Coverage:** 20 total, 0 mapped to tasks, 20 unmapped (expected pre-Design)

---

## Success Criteria

- [ ] Student opens Progress → sees latest weight, streaks, and recent history; pull-to-refresh works
- [ ] Student logs weight → hub updates; same-day re-log replaces value
- [ ] `pnpm --filter @forma/mobile test` — new unit tests pass
- [ ] `pnpm --filter @forma/mobile check-types` + `pnpm lint` pass
- [ ] Playwright smoke can reach Progress tab after auth (extend E2E when hub `testID`s land)

---

## Next phases (after confirmation)

| Phase | Artifact | Notes |
|-------|----------|-------|
| Design | `.specs/features/mobile-progress/design.md` | Hub layout, `progressStore` shape, API client types, i18n keys |
| Tasks | `.specs/features/mobile-progress/tasks.md` | Atomic tasks + verification (~12–16 tasks estimated) |
| Execute | Implementation on `cursor/mobile-progress-f68f` | One commit per task; Verifier auto-runs at end |
