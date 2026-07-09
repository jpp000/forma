# Mobile Nutrition Tasks

## Execution Protocol (MANDATORY)

Implement with the **`tlc-spec-driven`** skill: follow Execute flow (per-task cycle, batch workers, Verifier).

**Design**: `.specs/features/mobile-nutrition/design.md`  
**Spec**: `.specs/features/mobile-nutrition/spec.md`  
**Prerequisite:** Slices 0–2 on `main`. **AD-030:** Zustand store.

---

## Gate Check Commands

| Gate | Command |
|------|---------|
| Quick | `pnpm --filter @forma/mobile test` |
| Build | `pnpm --filter @forma/mobile check-types && pnpm lint` |
| Full | `pnpm --filter @forma/mobile test && pnpm --filter @forma/mobile check-types && pnpm lint` |

---

## Execution Plan

**Batch 1:** T1–T5 (API, types, mappers, store, tests)  
**Batch 2:** T6–T10 (UI, routes, i18n, integration)

---

## Task Breakdown

### T1: Nutrition types + extend API client ✅

**Where**: `src/features/nutrition/types.ts`, `src/api/nutrition.ts`, `src/api/wired.ts`  
**Done when**: `logMeal` POST typed; `getWiredNutritionApi` exported  
**Commit**: `feat(mobile): extend nutrition API client`

### T2: Pure macro progress + meal validation ✅

**Where**: `macroProgress.ts`, `mealValidation.ts`, `__tests__/`  
**Done when**: Unit tests cover progress cap, target null, validation branches  
**Commit**: `feat(mobile): add nutrition mappers and validation`

### T3: nutritionStore (Zustand) ✅

**Where**: `nutritionStore.ts`  
**Done when**: `fetchHub`, `logMeal`, loading/error/submit states  
**Commit**: `feat(mobile): add nutrition Zustand store`

### T4: MacroSummaryCard + hub components ✅

**Where**: `components/MacroSummaryCard.tsx`, `MacroRow.tsx`  
**Commit**: `feat(mobile): add nutrition summary components`

### T5: NutritionHubScreen ✅

**Where**: `NutritionHubScreen.tsx`, `app/(tabs)/nutrition/index.tsx`, `_layout.tsx`  
**Commit**: `feat(mobile): add nutrition hub screen`

### T6: Log meal form + route ✅

**Where**: `LogMealScreen.tsx`, `MealTypePicker.tsx`, `MealItemForm.tsx`, `meal/new.tsx`  
**Commit**: `feat(mobile): add meal logging flow`

### T7: i18n nutrition.* keys ✅

**Where**: `src/i18n/en.ts`, `pt-BR.ts`  
**Commit**: `feat(mobile): add nutrition i18n keys`

### T8: Remove placeholder + wire focus refresh ✅

**Where**: delete `nutrition.tsx`; mapApiError 402 key optional  
**Commit**: `chore(mobile): replace nutrition placeholder with stack`

### T9: Full gate + validation.md ✅

**Commit**: `docs(mobile-nutrition): validation report`

### T10: Update STATE.md handoff ✅

**Commit**: `docs(specs): update STATE for mobile-nutrition`
