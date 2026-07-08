# Mobile Foundation Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/mobile-foundation/design.md`  
**Status**: Draft — awaiting approval  
**Spec**: `.specs/features/mobile-foundation/spec.md`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: `biome.json`, `apps/api/jest.config.ts` + `test:e2e` (API only), design.md Slice-0 test strategy (tsc + biome + unit for pure utils; no Detox ceremony). No mobile tests exist yet — strong defaults applied for client logic layers; screen UI = build/smoke gate per approved design.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Pure client logic (session storage helpers, API header/401 handling, locale → Accept-Language, form field validators) | unit | Branches + edge cases from spec (invalid email, 401 clears session, locale header) | `apps/mobile/src/**/__tests__/*.test.ts` | `pnpm --filter @forma/mobile test` |
| Expo routes / RN screens | none | Visual/manual smoke — loading/empty/error present per RULES; Verifier checklist | — | Manual + typecheck |
| Theme / i18n catalogs / app.json | none | Build gate only | — | `check-types` + lint |
| Optional API OAuth mobile redirect | e2e (API) | Happy path returns redirect with token when `platform=mobile` | `apps/api/test/identity.e2e-spec.ts` | `pnpm --filter @forma/api test:e2e` |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `pnpm --filter @forma/mobile test` |
| Full | After tasks that also touch API e2e | `pnpm --filter @forma/mobile test && pnpm --filter @forma/api test:e2e` |
| Build | After scaffold/config/UI-only or phase end | `pnpm --filter @forma/mobile check-types && pnpm lint` (or biome on mobile paths) |

---

## Execution Plan

Phases run sequentially. Tasks within a phase run in order.

### Phase 1: Scaffold + design system

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Session + API client

```
T6 → T7 → T8
```

### Phase 3: Providers + navigation skeleton

```
T9 → T10
```

### Phase 4: Auth

```
T11 → T12 → T13 → T14
```

### Phase 5: Onboarding + shell

```
T15 → T16 → T17 → T18
```

### Phase 6: OAuth handoff + wrap-up

```
T19 → T20 → T21
```

**Batch packing (Execute):** ~21 tasks → 3 batches  
1. Phases 1–2 (T1–T8)  
2. Phases 3–4 (T9–T14)  
3. Phases 5–6 (T15–T21)

---

## Task Breakdown

### T1: Create Expo `apps/mobile` package

**What**: Scaffold Expo SDK 53+ app with expo-router, TypeScript, workspace name `@forma/mobile`  
**Where**: `apps/mobile/package.json`, `app.json`, `tsconfig.json`, `app/_layout.tsx` (minimal boot)  
**Depends on**: None  
**Reuses**: `pnpm-workspace.yaml` `apps/*`, turbo pipeline  
**Requirement**: `MFOUND-01`, `MFOUND-02`

**Tools**: Skill `tlc-spec-driven` / coding-guidelines; Shell for `create-expo-app` if needed

**Done when**:

- [x] `apps/mobile` exists and is listed in the workspace
- [x] `pnpm install` succeeds including mobile
- [x] Expo entry boots a blank screen without fatal config error
- [x] Gate: Build (`check-types` for package once script exists, or tsc config present)

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): scaffold Expo app package`

---

### T2: Wire monorepo scripts + lint scope

**What**: Add turbo-friendly `check-types`/`test` scripts; ensure Biome covers `apps/mobile`  
**Where**: `apps/mobile/package.json`, root/`biome.json` as needed, `turbo.json` if required  
**Depends on**: T1  
**Reuses**: Existing biome + turbo patterns  
**Requirement**: `MFOUND-02`

**Done when**:

- [x] `pnpm --filter @forma/mobile check-types` runs
- [x] `pnpm lint` includes mobile sources without prototype dead paths
- [x] Gate: Build passes for mobile package types

**Tests**: none  
**Gate**: build  
**Commit**: `chore(mobile): wire check-types and lint`

---

### T3: Theme tokens + ThemeProvider (light/dark)

**What**: Implement dark/light palettes and `useFormaTheme` per design table; brand green invariant  
**Where**: `apps/mobile/src/theme/colors.ts`, `typography.ts`, `ThemeProvider.tsx`  
**Depends on**: T1  
**Reuses**: `DESIGN.md`, design.md light table  
**Requirement**: `MFOUND-03`, `MFOUND-04`

**Done when**:

- [x] Dark canvas `#000000`; light canvas `#F2F2F7` (or design-locked values)
- [x] Primary CTA token `#30D158` / pressed `#248A3D` in both schemes
- [x] Provider follows system appearance and re-renders on change
- [x] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add light/dark design tokens`

---

### T4: i18n pt-BR + en catalogs

**What**: Locale module with `t()`, default `pt-BR`, Switcher-ready API  
**Where**: `apps/mobile/src/i18n/{pt-BR,en,index}.ts`  
**Depends on**: T1  
**Reuses**: AD-018 language pair  
**Requirement**: `MFOUND-05`

**Done when**:

- [ ] Catalogs cover foundation placeholder keys used by later auth/onboarding (can expand in those tasks)
- [ ] Default locale `pt-BR`; `en` loads
- [ ] No user-facing hard-coded strings introduced in this module
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add pt-BR and en i18n catalogs`

---

### T5: UI primitives (Screen, PrimaryButton, TextField, InlineError, LoadingState)

**What**: Minimal themed primitives for Auth/Onboarding  
**Where**: `apps/mobile/src/ui/*.tsx`  
**Depends on**: T3, T4  
**Reuses**: Theme + i18n  
**Requirement**: `MFOUND-03`, `MFOUND-04`

**Done when**:

- [ ] `PrimaryButton` uses green fill + black label
- [ ] Components use theme labels (no gray hex for secondary text)
- [ ] Touch targets ≥44pt where interactive
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add foundation UI primitives`

---

### T6: Secure session storage helpers + unit tests

**What**: Read/write/clear JWT via SecureStore wrapper  
**Where**: `apps/mobile/src/session/tokenStorage.ts`, `apps/mobile/src/session/__tests__/tokenStorage.test.ts`  
**Depends on**: T1, T2  
**Reuses**: Design session decision  
**Requirement**: `MFOUND-06`

**Done when**:

- [ ] Native path uses `expo-secure-store`
- [ ] Clear removes token
- [ ] Unit tests cover set/get/clear (+ failure treated as null)
- [ ] Gate: Quick — tests pass

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(mobile): add SecureStore token helpers`

---

### T7: Fetch API client + unit tests

**What**: Thin `api.request` with base URL, Bearer, Accept-Language, 401 callback  
**Where**: `apps/mobile/src/api/client.ts`, `apps/mobile/src/api/__tests__/client.test.ts`  
**Depends on**: T6  
**Reuses**: CONTEXT API conventions `/api`  
**Requirement**: `MFOUND-06`, `MFOUND-07`, `MFOUND-05`

**Done when**:

- [ ] `EXPO_PUBLIC_API_URL` used as base
- [ ] Attaches `Authorization` when token present
- [ ] Attaches `Accept-Language` from locale getter
- [ ] On HTTP 401 invokes `onUnauthorized` (clears session at provider layer)
- [ ] Unit tests mock fetch for happy + 401 + header assertions
- [ ] Gate: Quick

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(mobile): add authenticated fetch client`

---

### T8: Identity + student API helpers

**What**: Typed helpers for OTP, me, profile, goal (and OAuth URL builder)  
**Where**: `apps/mobile/src/api/identity.ts`, `apps/mobile/src/api/student.ts`  
**Depends on**: T7  
**Reuses**: `@forma/types` HealthGoal; Nest DTO field names  
**Requirement**: `MAUTH-03`, `MONB-02`, `MONB-03`

**Done when**:

- [ ] Helpers call correct paths under `/api/identity/*` and `/api/student/*`
- [ ] Types align with API bodies
- [ ] Gate: Build (+ any thin unit if helper pure; else covered via client tests)

**Tests**: none (thin wrappers; client unit in T7)  
**Gate**: build  
**Commit**: `feat(mobile): add identity and student API helpers`

---

### T9: SessionProvider + useSession

**What**: Context loading token, `signIn`/`signOut`/`refreshMe`, exposes `user` + `isLoading`  
**Where**: `apps/mobile/src/session/SessionProvider.tsx`  
**Depends on**: T6, T7, T8  
**Reuses**: Token storage + identity.me  
**Requirement**: `MFOUND-06`, `MFOUND-07`, `MONB-01`

**Done when**:

- [ ] Cold start restores token and refreshes `/me` when present
- [ ] `signOut` clears storage
- [ ] `401` path clears session
- [ ] `roles` available for student gate
- [ ] Gate: Build

**Tests**: none (provider wiring; storage/client unit already exist)  
**Gate**: build  
**Commit**: `feat(mobile): add SessionProvider`

---

### T10: Root layout providers + Protected route groups

**What**: Mount Theme, I18n, Session; declare `(auth)` / `(onboarding)` / `(tabs)` with Protected guards  
**Where**: `apps/mobile/app/_layout.tsx`, group `_layout.tsx` stubs  
**Depends on**: T3, T4, T5, T9  
**Reuses**: Expo Router Protected routes (AD-028)  
**Requirement**: `MSHELL-01`, `MONB-01`, `MAUTH-01`

**Done when**:

- [ ] `!token` → auth routes only
- [ ] `token && !student` → onboarding
- [ ] `token && student` → tabs
- [ ] Loading session shows loading UI (not blank crash)
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): wire Protected auth navigation shell`

---

### T11: Auth sign-in screen (email + OAuth buttons)

**What**: Welcome/sign-in UI with email field and provider buttons; design-compliant  
**Where**: `apps/mobile/app/(auth)/index.tsx`  
**Depends on**: T10, T5, T8  
**Reuses**: UI primitives, i18n  
**Requirement**: `MAUTH-01`

**Done when**:

- [ ] Screen shows OAuth (Google/Apple/Facebook) + email entry
- [ ] Invalid email blocks OTP request
- [ ] Loading/error/empty states present
- [ ] Light/dark + green CTAs
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add auth sign-in screen`

---

### T12: OTP request + verify flow

**What**: Request OTP then code entry; persist JWT on success  
**Where**: `apps/mobile/app/(auth)/otp.tsx` (+ navigation from T11)  
**Depends on**: T11  
**Reuses**: identity helpers, SessionProvider.signIn  
**Requirement**: `MAUTH-03`, `MAUTH-04`

**Done when**:

- [ ] Success → `signIn` + proceed to gate (onboarding/tabs)
- [ ] Wrong OTP / 401 shows localized error
- [ ] 429 shows rate-limit copy
- [ ] Network error + retry path
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add email OTP auth flow`

---

### T13: OAuth AuthSession start (mock/dev path)

**What**: Open provider start URL via AuthSession/WebBrowser; obtain token in mock/dev  
**Where**: `apps/mobile/src/session/oauth.ts`, wired from sign-in  
**Depends on**: T11, T8  
**Reuses**: API OAuth mock mode  
**Requirement**: `MAUTH-02`, `MAUTH-04`

**Done when**:

- [ ] Mock/dev path can complete to JWT (documented)
- [ ] Cancel/failure shows localized error
- [ ] Does not crash Expo Go on cancel
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add OAuth AuthSession entry`

---

### T14: Auth i18n keys + error mapping polish

**What**: Complete auth/onboarding string keys pt-BR/en; map API error codes to `t()`  
**Where**: `apps/mobile/src/i18n/*.ts`, small `mapApiError` helper if needed  
**Depends on**: T12, T13  
**Reuses**: T4 catalogs  
**Requirement**: `MFOUND-05`, `MAUTH-04`

**Done when**:

- [ ] No raw i18n keys visible on auth screens
- [ ] Both locales include auth strings
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): complete auth i18n and error mapping`

---

### T15: Onboarding profile screen

**What**: Form for age, sex, heightCm, activityLevel → `POST /student/profile`  
**Where**: `apps/mobile/app/(onboarding)/profile.tsx`  
**Depends on**: T10, T8, T5  
**Reuses**: CreateStudentProfileDto bounds  
**Requirement**: `MONB-01`, `MONB-02`

**Done when**:

- [ ] Validation respects API bounds
- [ ] Success navigates to goal step
- [ ] API failure shows localized error + retry
- [ ] Loading state on submit
- [ ] Gate: Build

**Tests**: unit for validators if extracted to pure fn — preferred in `src/onboarding/validators.ts` + `__tests__`  
**Gate**: quick if validators added; else build  
**Commit**: `feat(mobile): add student profile onboarding`

---

### T16: Onboarding health goal screen

**What**: Select HealthGoal → `PUT /student/goal` → `refreshMe` → tabs  
**Where**: `apps/mobile/app/(onboarding)/goal.tsx`  
**Depends on**: T15  
**Reuses**: `@forma/types` HealthGoal  
**Requirement**: `MONB-03`

**Done when**:

- [ ] All four goals selectable
- [ ] Success refreshes me and lands in tabs
- [ ] Goal failure after profile success stays on goal with retry
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add health goal onboarding`

---

### T17: Tabs shell placeholders + logout

**What**: Four tabs (Home/Training/Nutrition/Progress) placeholders; active tint green; logout clears session  
**Where**: `apps/mobile/app/(tabs)/_layout.tsx`, tab screens, account/logout affordance  
**Depends on**: T10, T9  
**Reuses**: Design tab rules  
**Requirement**: `MSHELL-01`, `MSHELL-02`

**Done when**:

- [ ] Tabs render with i18n labels
- [ ] Active tint `#30D158`
- [ ] Logout → Auth
- [ ] Unauthenticated cannot open tabs (Protected)
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `feat(mobile): add student tab shell and logout`

---

### T18: End-to-end gate wiring verification (smoke checklist script or doc)

**What**: Ensure cold-start / skip-onboarding paths work; fix guard gaps found  
**Where**: `app/` layouts + short `apps/mobile/SMOKE.md` checklist for Verifier  
**Depends on**: T12, T16, T17  
**Reuses**: Spec success criteria  
**Requirement**: `MONB-01`, `MSHELL-01`, `MFOUND-06`

**Done when**:

- [ ] Documented smoke steps: OTP → onboarding → tabs; returning student skips onboarding; logout; 401 note
- [ ] Any guard bugs found are fixed in this task
- [ ] Gate: Build

**Tests**: none  
**Gate**: build  
**Commit**: `docs(mobile): add foundation smoke checklist`

---

### T19: API OAuth mobile success redirect

**What**: When client requests mobile handoff (`platform=mobile` or agreed query), callback redirects to app URL with `accessToken` instead of bare JSON  
**Where**: `apps/api/src/modules/identity/oauth/oauth.controller.ts` (+ e2e)  
**Depends on**: T13  
**Reuses**: Existing mock OAuth  
**Requirement**: `MAUTH-02`

**Done when**:

- [ ] Default/web behavior unchanged (JSON) unless mobile flag set
- [ ] Mobile flag → redirect to configured success URL including token
- [ ] E2E covers mock mobile redirect
- [ ] Mobile OAuth helper reads token from redirect
- [ ] Gate: Full

**Tests**: e2e (API)  
**Gate**: full  
**Commit**: `feat(identity): redirect OAuth callback for mobile clients`

---

### T20: Env example + README run notes

**What**: Document `EXPO_PUBLIC_API_URL`, OAuth mobile success URL, how to run API+mobile  
**Where**: `apps/mobile/.env.example`, `apps/mobile/README.md` (short), root README pointer optional  
**Depends on**: T7, T19  
**Reuses**: Design env assumption  
**Requirement**: `MFOUND-01`

**Done when**:

- [ ] Env vars documented
- [ ] Dev run steps clear for next agent
- [ ] Gate: Build (docs only ok)

**Tests**: none  
**Gate**: build  
**Commit**: `docs(mobile): document API URL and run steps`

---

### T21: Update STATE handoff for Slice 1

**What**: Mark mobile-foundation Execute complete readiness; point next chat to `mobile-home-summary`  
**Where**: `.specs/STATE.md` Handoff (+ requirement status notes in spec if desired)  
**Depends on**: T18, T20  
**Reuses**: Multi-agent playbook  
**Requirement**: Success criteria handoff

**Done when**:

- [ ] Handoff lists branch, how to run, env, auth entry, “Slice 1 = Home Summary in `(tabs)/index`”
- [ ] No blocker left for starting Specify on Slice 1
- [ ] Gate: n/a docs

**Tests**: none  
**Gate**: build  
**Commit**: `docs(specs): handoff mobile-foundation to home-summary`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

Phase 1:  T1 → T2 → T3 → T4 → T5
Phase 2:  T6 → T7 → T8
Phase 3:  T9 → T10
Phase 4:  T11 → T12 → T13 → T14
Phase 5:  T15 → T16 → T17 → T18
Phase 6:  T19 → T20 → T21
```

Batches at Execute: **(T1–T8) → (T9–T14) → (T15–T21)** — offer sub-agents (user must confirm).

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1 Scaffold package | 1 package bootstrap | ✅ |
| T2 Scripts/lint | 1 wiring change | ✅ |
| T3 Theme | 1 theme module | ✅ |
| T4 i18n | 1 i18n module | ✅ |
| T5 UI primitives | cohesive primitive set same folder | ✅ (borderline OK) |
| T6 Token storage + tests | 1 helper + tests | ✅ |
| T7 API client + tests | 1 client + tests | ✅ |
| T8 API helpers | 2 related files same concern | ✅ |
| T9 SessionProvider | 1 provider | ✅ |
| T10 Protected layouts | 1 nav wiring | ✅ |
| T11 Sign-in screen | 1 screen | ✅ |
| T12 OTP flow | 1 flow/screen | ✅ |
| T13 OAuth session helper | 1 module | ✅ |
| T14 i18n polish | 1 catalog pass | ✅ |
| T15 Profile screen | 1 screen (+ optional validators) | ✅ |
| T16 Goal screen | 1 screen | ✅ |
| T17 Tabs + logout | 1 shell | ✅ |
| T18 Smoke checklist | 1 doc + guard fixes | ✅ |
| T19 OAuth API redirect | 1 endpoint behavior + e2e | ✅ |
| T20 Env/docs | docs | ✅ |
| T21 STATE handoff | docs | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T1 | None | start | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T1 | T1→T3 | ✅ |
| T4 | T1 | T1→T4 | ✅ |
| T5 | T3, T4 | after T3/T4 | ✅ |
| T6 | T1, T2 | after Phase1 | ✅ |
| T7 | T6 | T6→T7 | ✅ |
| T8 | T7 | T7→T8 | ✅ |
| T9 | T6, T7, T8 | Phase3 after T8 | ✅ |
| T10 | T3, T4, T5, T9 | after providers | ✅ |
| T11 | T10, T5, T8 | Phase4 | ✅ |
| T12 | T11 | T11→T12 | ✅ |
| T13 | T11, T8 | from T11 | ✅ |
| T14 | T12, T13 | after auth flows | ✅ |
| T15 | T10, T8, T5 | Phase5 | ✅ |
| T16 | T15 | T15→T16 | ✅ |
| T17 | T10, T9 | Phase5 | ✅ |
| T18 | T12, T16, T17 | after shell+auth+onb | ✅ |
| T19 | T13 | Phase6 | ✅ |
| T20 | T7, T19 | after client+oauth API | ✅ |
| T21 | T18, T20 | end | ✅ |

Note: Phase 1 diagram is linear `T1→T2→T3→T4→T5` for worker simplicity; T3/T4 only need T1 (T2 can proceed in parallel logically but Execute stays sequential). Bodies allow T3/T4 ‖ T2 after T1 — **Execute order follows diagram (strict sequential)** to avoid merge conflicts.

**Execute order override:** Follow Phase map strictly: T1, T2, T3, T4, T5 even though T3 could start after T1 alone.

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|------------|-----------------|-----------|--------|
| T1 | config | none | none | ✅ |
| T2 | config | none | none | ✅ |
| T3 | theme | none | none | ✅ |
| T4 | i18n catalogs | none | none | ✅ |
| T5 | screens/ui | none | none | ✅ |
| T6 | session helpers | unit | unit | ✅ |
| T7 | API client | unit | unit | ✅ |
| T8 | thin API wrappers | none | none | ✅ |
| T9 | provider | none | none | ✅ |
| T10 | routes | none | none | ✅ |
| T11–T14 | screens | none | none | ✅ |
| T15 | screen + optional validators | unit if validators | unit if extracted | ✅ |
| T16–T18 | screens/docs | none | none | ✅ |
| T19 | API oauth | e2e | e2e | ✅ |
| T20–T21 | docs | none | none | ✅ |

---

## Requirement Traceability (tasks)

| Req ID | Tasks |
|--------|-------|
| MFOUND-01 | T1, T20 |
| MFOUND-02 | T1, T2 |
| MFOUND-03 | T3, T5 |
| MFOUND-04 | T3, T5 |
| MFOUND-05 | T4, T7, T14 |
| MFOUND-06 | T6, T7, T9, T18 |
| MFOUND-07 | T7, T9 |
| MAUTH-01 | T10, T11 |
| MAUTH-02 | T13, T19 |
| MAUTH-03 | T8, T12 |
| MAUTH-04 | T12, T13, T14 |
| MONB-01 | T9, T10, T15, T18 |
| MONB-02 | T8, T15 |
| MONB-03 | T8, T16 |
| MSHELL-01 | T10, T17, T18 |
| MSHELL-02 | T17 |

**Coverage:** 16 requirements mapped, 0 unmapped ✅
