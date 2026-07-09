# Mobile Nutrition Specification

**Status**: Approved

## Problem Statement

After Slices 0–2, the Nutrition tab is still a placeholder. Home Summary already reads `GET /api/nutrition/daily` for rings and tiles, and guidance CTAs route students to Nutrition — but they cannot log meals or see consumed-vs-target macros on a dedicated surface. Without Slice 3, the daily nutrition loop is incomplete.

## Goals

- [ ] Replace the Nutrition placeholder with a **Daily Nutrition** hub showing today’s macro summary (consumed vs prescribed target)
- [ ] Let students **log meals** with manual macro values via `POST /api/nutrition/meals`
- [ ] Show **nutrition streak** from `GET /api/progress/streaks`
- [ ] Match `DESIGN.md` + `.specs/ui/RULES.md` (light + dark; Move pink for nutrition energy accents)
- [ ] Use Zustand `nutritionStore` per AD-030

## Out of Scope

| Feature | Reason |
|---------|--------|
| Curated food database / search | P2 (AD-020) |
| AI food photo analysis | P2 Pro-gated |
| Meal history list / edit / delete API | No list endpoint today; hub shows daily totals only |
| Billing / paywall UI | AD-026 — show localized 402 message only |
| Nutrition plan prescription UI | Professional web; targets appear via daily summary when prescribed |
| Progress weight / streak detail | Slice 4 — `mobile-progress` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Actor | **Student only** | AD-024 | y |
| Depends on | Slice 0 (auth, API client, tabs) + Slice 1 (Home already consumes daily summary) | Sequential slices | y |
| Date for “today” | **UTC date** (`YYYY-MM-DD`, same as training/home) | AD-028 | y |
| Hub data | Parallel fetch: `nutrition/daily` + `progress/streaks` | Mirrors training hub | y |
| Meal log | One screen: pick meal type + ≥1 item with name + 4 macros | Matches API `LogMealDto` | y |
| Same meal type same day | API **appends** items; client refreshes daily summary after POST | platform-foundation e2e | y |
| No target | Show consumed only + tertiary “no target” copy (same as Home) | No student goal endpoint | y |
| Macro display | Calories + protein + carbs + fat with progress bar when target exists | Core nutrition loop | y |
| 402 meal limit | Map to localized upgrade hint; no checkout UI | AD-026 | y |
| Client state | Zustand `nutritionStore`; wire API via `getWiredNutritionApi` | AD-030 | y |
| Tests | Unit tests for macro progress + meal validation pure functions | Slice 0–2 pattern | y |

**Open questions:** none.

---

## Design constraints (must cite)

- Root [`DESIGN.md`](../../../DESIGN.md) — Move pink `#FA114F` for nutrition/energy accents; green `#30D158` for primary CTAs
- [`.specs/ui/RULES.md`](../../ui/RULES.md) — loading / empty / error; tabular numerals; 44pt targets
- Slice 0/1/2 handoff — extend `apps/mobile/src/features/nutrition/`; replace `(tabs)/nutrition.tsx` placeholder
- **AD-030:** `nutritionStore` — not React Context

---

## User Stories

### P1-01: Nutrition hub — daily macro summary ⭐ MVP

**User Story**: As a **student**, I want to open Nutrition and see today’s macro totals vs my plan so that I know how much I’ve eaten.

**Acceptance Criteria**:

1. WHEN the student opens the Nutrition tab THEN the screen SHALL show title, today’s UTC date, nutrition streak, and macro summary (calories, protein, carbs, fat)
2. WHEN `GET /api/nutrition/daily?date=<today>` returns `target` THEN each macro row SHALL show consumed / target with a progress bar capped at 100%
3. WHEN `target` is null THEN rows SHALL show consumed only with localized “no target” tertiary copy
4. WHEN the student pulls to refresh THEN the hub SHALL re-fetch daily summary and streaks
5. WHEN fetches fail THEN the screen SHALL show loading skeleton first, then inline or full error with retry per RULES

**Requirements**: `MNUTR-01`–`MNUTR-05`

---

### P1-02: Log meal with manual macros ⭐ MVP

**User Story**: As a **student**, I want to log a meal with food name and macro values so that my daily totals update.

**Acceptance Criteria**:

1. WHEN the student taps “Log meal” THEN the app SHALL navigate to a meal log form
2. WHEN the form renders THEN the student SHALL select meal type (breakfast, lunch, dinner, snack) and add ≥1 item with name, calories, protein, carbs, fat (all ≥ 0)
3. WHEN the student submits valid data THEN the app SHALL `POST /api/nutrition/meals` for today’s UTC date and return to the hub with refreshed summary
4. WHEN validation fails THEN inline field errors SHALL appear (required name, non-negative numbers, at least one item)
5. WHEN API returns `402` THEN a localized upgrade hint SHALL display (no billing UI)

**Requirements**: `MNUTR-06`–`MNUTR-10`

---

### P1-03: Empty day state ⭐ MVP

**User Story**: As a **student** with no meals logged today, I want clear empty-state copy so that I know to log my first meal.

**Acceptance Criteria**:

1. WHEN daily summary shows all consumed macros at zero THEN the hub SHALL show localized empty encouragement below the macro card
2. WHEN the student logs the first meal THEN empty copy SHALL disappear on refresh

**Requirements**: `MNUTR-11`, `MNUTR-12`

---

## API integration

| Endpoint | Use |
|----------|-----|
| `GET /api/nutrition/daily?date=<today>` | Hub macro summary |
| `POST /api/nutrition/meals` | Log meal |
| `GET /api/progress/streaks` | Nutrition streak on hub |

No new API endpoints in this slice.

---

## Success Criteria

- [x] Student opens Nutrition → sees today’s macros and streak; pull-to-refresh works
- [x] Student logs a meal → hub totals update
- [x] Loading, empty, and error states per RULES
- [x] Unit tests for macro progress + validation; typecheck + test gates pass

---

## Requirement Traceability

| Requirement ID | Story | Status |
|----------------|-------|--------|
| MNUTR-01 | P1-01: Hub title, date, streak, macro summary | Verified |
| MNUTR-02 | P1-01: Consumed / target progress bars | Verified |
| MNUTR-03 | P1-01: No-target consumed-only display | Verified |
| MNUTR-04 | P1-01: Pull-to-refresh | Verified |
| MNUTR-05 | P1-01: Loading / error / retry | Verified |
| MNUTR-06 | P1-02: Log meal navigation | Verified |
| MNUTR-07 | P1-02: Meal type + item form | Verified |
| MNUTR-08 | P1-02: POST meal + hub refresh | Verified |
| MNUTR-09 | P1-02: Inline validation errors | Verified |
| MNUTR-10 | P1-02: 402 upgrade hint | Verified |
| MNUTR-11 | P1-03: Empty day encouragement | Verified |
| MNUTR-12 | P1-03: Empty clears after first log | Verified |

---

## Multi-agent handoff

- **Blocked by:** Slices 0–2 on `main`
- **Entry:** replace `apps/mobile/app/(tabs)/nutrition.tsx` with `nutrition/` stack
- **Next slice after PASS:** `mobile-progress` (Slice 4)
