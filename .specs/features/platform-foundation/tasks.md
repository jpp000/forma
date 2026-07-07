# Platform Foundation Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/platform-foundation/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: none — strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Service (business logic) | integration (via e2e) | All branches; 1:1 to spec ACs; all listed edge cases | `apps/api/test/*.e2e-spec.ts` | `pnpm --filter @forma/api test:e2e` |
| Controller / Route | e2e | All routes: happy + edge + error paths per AC | `apps/api/test/*.e2e-spec.ts` | `pnpm --filter @forma/api test:e2e` |
| DTO / Validation | e2e | Invalid input returns 400 with validation messages | `apps/api/test/*.e2e-spec.ts` | `pnpm --filter @forma/api test:e2e` |
| Prisma schema / migration | none | — (build gate only) | — | `pnpm db:generate` |
| Config / tooling | none | — (lint gate only) | — | `pnpm lint` |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After schema-only or config-only tasks | `pnpm lint && pnpm --filter @forma/api check-types` |
| Full | After tasks with e2e tests | `pnpm --filter @forma/api test:e2e` |
| Build | After phase completion | `pnpm build && pnpm lint && pnpm --filter @forma/api test:e2e` |

---

## Execution Plan

Phases run sequentially. Tasks within a phase execute in order.

### Phase 0: Foundation

```
T01 → T02 → T03 → T04 → T05 → T06
```

### Phase 1: Identity & Student

```
T07 → T08 → T09 → T10 → T11 → T12 → T13
```

### Phase 2: Training

```
T14 → T15 → T16
```

### Phase 3: Nutrition

```
T17 → T18 → T19 → T20
```

### Phase 4: Progress & Guidance

```
T21 → T22 → T23 → T24 → T25
```

### Phase 5: Coaching

```
T26 → T27 → T28
```

### Phase 6: Billing

```
T29 → T30 → T31 → T32
```

---

## Task Breakdown

### T01: Create shared packages (types + config)

**What**: Scaffold `packages/types` (shared enums/interfaces) and `packages/config` (base tsconfig)
**Where**: `packages/types/`, `packages/config/`
**Depends on**: None
**Reuses**: `pnpm-workspace.yaml` workspace pattern
**Requirement**: FOUND-01
**Complexity**: S

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `packages/types` exports `Role`, `HealthGoal`, `MealType` enums
- [ ] `packages/config` provides `tsconfig.base.json` extended by apps
- [ ] `pnpm build` succeeds with new packages
- [ ] Gate: `pnpm lint && pnpm --filter @forma/api check-types`

**Tests**: none
**Gate**: quick
**Commit**: `feat(monorepo): add shared types and config packages`

---

### T02: Add Biome lint and format tooling

**What**: Configure Biome for lint + format across monorepo
**Where**: `biome.json`, root `package.json` scripts
**Depends on**: T01
**Reuses**: Existing turbo pipeline
**Requirement**: FOUND-02
**Complexity**: S

**Done when**:
- [ ] `pnpm lint` runs Biome across workspace
- [ ] `pnpm format` formats all TS files
- [ ] No lint errors on existing API code
- [ ] Gate: `pnpm lint`

**Tests**: none
**Gate**: quick
**Commit**: `chore: add biome lint and format`

---

### T03: Setup Jest + Supertest e2e test harness

**What**: Configure Jest for API integration tests with test database support
**Where**: `apps/api/jest.config.ts`, `apps/api/test/setup.ts`, `apps/api/test/health.e2e-spec.ts`
**Depends on**: T02
**Reuses**: Existing health endpoints
**Requirement**: FOUND-03
**Complexity**: M

**Done when**:
- [ ] `pnpm --filter @forma/api test:e2e` runs and passes health e2e test
- [ ] Test setup connects to test DB (or uses same DB with cleanup)
- [ ] Health e2e asserts `GET /api/health` returns 200 and `GET /api/ready` returns 200
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(api): add jest supertest e2e harness`

---

### T04: Restructure API module skeleton

**What**: Create `modules/` folder structure, `common/` infra, move health/prisma
**Where**: `apps/api/src/modules/`, `apps/api/src/common/`, update `app.module.ts`
**Depends on**: T03
**Reuses**: Existing `health/`, `prisma/` modules
**Requirement**: FOUND-04
**Complexity**: S

**Done when**:
- [ ] `apps/api/src/modules/` directory exists (empty module placeholders OK)
- [ ] `apps/api/src/common/` directory exists
- [ ] Health and Prisma modules still work
- [ ] Gate: `pnpm --filter @forma/api test:e2e` (health tests still pass)

**Tests**: e2e (existing health tests)
**Gate**: full
**Commit**: `refactor(api): add modules skeleton and common infra`

---

### T05: Add validation pipe, exception filter, Swagger

**What**: Global ValidationPipe, HttpExceptionFilter, Swagger at `/api/docs`
**Where**: `apps/api/src/main.ts`, `apps/api/src/common/http-exception.filter.ts`
**Depends on**: T04
**Reuses**: NestJS Swagger, class-validator deps
**Requirement**: FOUND-04
**Complexity**: M

**Done when**:
- [ ] `GET /api/docs` serves Swagger UI
- [ ] Invalid request body returns 400 with validation messages
- [ ] Unhandled errors return consistent `{ statusCode, message, error }` shape
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(api): add validation pipe, exception filter, swagger`

---

### T06: i18n setup (pt-BR + en)

**What**: JSON locale files, `I18nService`, `Accept-Language` resolution, localized exception filter
**Where**: `apps/api/src/i18n/`, update `apps/api/src/common/http-exception.filter.ts`
**Depends on**: T05
**Reuses**: Existing exception filter from T05
**Requirement**: I18N-01
**Complexity**: M

**Done when**:
- [ ] `pt-BR.json` and `en.json` locale files exist with error/validation keys
- [ ] `Accept-Language: en` returns English error messages; default is pt-BR
- [ ] Validation errors return localized messages
- [ ] E2E test covers locale switching on a 400/401 response
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(api): add i18n with pt-BR and en locales`

---

### T07: Identity Prisma schema + migration

**What**: Add `IdentityUser`, `IdentityOtpToken`, `IdentitySession`, `IdentityOAuthAccount` models with migration
**Where**: `prisma/schema.prisma`, `prisma/migrations/`
**Depends on**: T06
**Reuses**: Existing Prisma setup
**Requirement**: AUTH-01
**Complexity**: M

**Done when**:
- [ ] Migration applies cleanly (`pnpm db:migrate`)
- [ ] Prisma client generates types for identity models
- [ ] Gate: `pnpm db:generate && pnpm lint`

**Tests**: none
**Gate**: quick
**Commit**: `feat(identity): add user otp and oauth prisma schema`

---

### T08: Email OTP request + verify endpoints (Resend)

**What**: `POST /api/identity/otp/request` and `POST /api/identity/otp/verify` with OTP generation, Resend email (mock in dev), rate limiting
**Where**: `apps/api/src/modules/identity/`, `apps/api/src/modules/identity/email/`
**Depends on**: T07
**Reuses**: T05 validation pipe, T06 i18n for error messages
**Requirement**: AUTH-01, AUTH-03, AUTH-05
**Complexity**: L

**Done when**:
- [ ] Request OTP with valid email returns 202
- [ ] Resend provider used when `EMAIL_PROVIDER=resend`; mock logs OTP in dev
- [ ] Verify correct OTP returns JWT + creates User
- [ ] Wrong/expired OTP returns 401 with localized message
- [ ] Rate limit (>3 in 15min) returns 429
- [ ] E2E tests cover all ACs above
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(identity): add email otp auth with resend`

---

### T09: JWT auth guard + GET /identity/me

**What**: JWT generation on verify, AuthGuard, `GET /api/identity/me` returning user + computed roles
**Where**: `apps/api/src/modules/identity/`, `apps/api/src/common/auth.guard.ts`
**Depends on**: T08
**Reuses**: JWT from T08
**Requirement**: AUTH-04
**Complexity**: M

**Done when**:
- [ ] Protected endpoint rejects missing/invalid JWT with 401
- [ ] `GET /api/identity/me` returns user id, email, roles array
- [ ] Expired JWT returns 401
- [ ] E2E tests cover auth guard and me endpoint
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(identity): add jwt guard and me endpoint`

---

### T10: OAuth providers (Google, Apple, Facebook)

**What**: Passport OAuth strategies, redirect + callback endpoints returning JWT
**Where**: `apps/api/src/modules/identity/oauth/`
**Depends on**: T09
**Reuses**: JWT/session from T09, `IdentityOAuthAccount` from T07
**Requirement**: AUTH-02
**Complexity**: L

**Done when**:
- [ ] `GET /api/identity/oauth/:provider` redirects to provider (google, apple, facebook)
- [ ] Callback creates/links User and returns JWT
- [ ] Invalid provider token returns 401 with localized error
- [ ] E2E tests cover OAuth callback flow (mocked provider)
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(identity): add oauth google apple facebook`

---

### T11: Student Prisma schema + create profile endpoint

**What**: `StudentProfile` model + `POST /api/student/profile` with onboarding fields
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/student/`
**Depends on**: T10
**Reuses**: AuthGuard from T09
**Requirement**: STUD-01
**Complexity**: M

**Done when**:
- [ ] Migration applies for student_profiles table
- [ ] Authenticated user can create StudentProfile (age, sex, height, activityLevel)
- [ ] `GET /api/identity/me` now includes `student` role
- [ ] Unauthenticated request returns 401
- [ ] E2E tests cover create profile flow
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(student): add profile schema and create endpoint`

---

### T12: Health goal model + set goal endpoint

**What**: `StudentHealthGoal` model + `PUT /api/student/goal` with goal type and targets
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/student/`
**Depends on**: T11
**Reuses**: StudentModule from T11
**Requirement**: STUD-02
**Complexity**: S

**Done when**:
- [ ] Student can set goal (lose_weight, gain_muscle, maintain, improve_health)
- [ ] Goal persists with target metrics
- [ ] User without StudentProfile gets 403
- [ ] E2E tests cover set goal + 403 case
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(student): add health goal endpoint`

---

### T13: Roles decorator + role-based access

**What**: `@Roles('student')` decorator + RolesGuard for endpoint protection
**Where**: `apps/api/src/common/roles.decorator.ts`, `apps/api/src/common/roles.guard.ts`
**Depends on**: T12
**Reuses**: AuthGuard from T09
**Requirement**: AUTH-04
**Complexity**: S

**Done when**:
- [ ] Endpoints decorated with `@Roles('student')` reject users without role (403)
- [ ] Users with correct role pass through
- [ ] E2E test demonstrates role guard on a student endpoint
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(api): add roles decorator and guard`

---

### T14: Custom exercise CRUD (manual)

**What**: `TrainingExercise` model (user-owned), `POST/GET /api/training/exercises` — no seed library
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/training/`
**Depends on**: T13
**Reuses**: RolesGuard, AuthGuard
**Requirement**: TRAIN-01
**Complexity**: M

**Done when**:
- [ ] Student can create custom exercise (name, muscle group, equipment)
- [ ] `GET /api/training/exercises` returns user's exercises (paginated)
- [ ] Exercises scoped to creating user
- [ ] E2E tests cover create + list
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(training): add manual custom exercise crud`

---

### T15: Workout plan schema + CRUD endpoints

**What**: `TrainingWorkoutPlan` + items, `POST/GET /api/training/plans`
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/training/`
**Depends on**: T14
**Reuses**: TrainingModule, exercise references
**Requirement**: TRAIN-02
**Complexity**: M

**Done when**:
- [ ] Student can create workout plan with exercises, sets, reps, rest
- [ ] Student can list their plans
- [ ] Plan references valid exercise IDs
- [ ] E2E tests cover create + list
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(training): add workout plan endpoints`

---

### T16: Workout session logging + history

**What**: `TrainingWorkoutSession` model, `POST /api/training/sessions`, `GET /api/training/sessions`
**Where**: `apps/api/src/modules/training/`
**Depends on**: T15
**Reuses**: TrainingModule
**Requirement**: TRAIN-03, TRAIN-04
**Complexity**: M

**Done when**:
- [ ] Student can log session with exercises, actual sets/reps/weight
- [ ] Session history returns entries ordered by date desc
- [ ] Emits `training.session.completed` event
- [ ] E2E tests cover log + history
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(training): add session logging and history`

---

### T17: Meal log schema (manual macros)

**What**: `NutritionMealLog` + `NutritionMealItem` models with inline macro fields (no food database)
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/nutrition/`
**Depends on**: T16
**Reuses**: AuthGuard, RolesGuard
**Requirement**: NUTR-01
**Complexity**: M

**Done when**:
- [ ] Migration applies for meal log tables with manual macro columns
- [ ] Schema supports calories, protein, carbs, fat per item (user-entered)
- [ ] Gate: `pnpm db:generate && pnpm lint`

**Tests**: none
**Gate**: quick
**Commit**: `feat(nutrition): add manual meal log schema`

---

### T18: Meal logging endpoints

**What**: `POST /api/nutrition/meals` with meal type + manual macro items
**Where**: `apps/api/src/modules/nutrition/`
**Depends on**: T17
**Reuses**: NutritionModule
**Requirement**: NUTR-02
**Complexity**: M

**Done when**:
- [ ] Student can log meal (breakfast/lunch/dinner/snack) with manual macro values
- [ ] Duplicate meal type same day appends items (not replace)
- [ ] Emits `nutrition.meal.logged` event
- [ ] E2E tests cover log + append behavior
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(nutrition): add manual meal logging endpoints`

---

### T19: Daily macro summary endpoint

**What**: `GET /api/nutrition/daily?date=` returning consumed macros for the day
**Where**: `apps/api/src/modules/nutrition/`
**Depends on**: T18
**Reuses**: NutritionModule
**Requirement**: NUTR-04
**Complexity**: S

**Done when**:
- [ ] Returns total calories, protein, carbs, fat for given date
- [ ] Empty day returns zeros
- [ ] E2E test covers summary with logged meals
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(nutrition): add daily macro summary`

---

### T20: Nutrition plan prescription endpoints

**What**: `NutritionPlan` model, `POST /api/nutrition/plans` (professional prescribes for linked student)
**Where**: `apps/api/src/modules/nutrition/`
**Depends on**: T19
**Reuses**: NutritionModule (CoachingService stub until T28)
**Requirement**: NUTR-03
**Complexity**: M

**Done when**:
- [ ] Plan stores daily macro targets for a student
- [ ] Daily summary shows consumed vs target (when plan exists)
- [ ] E2E test covers prescribe + summary with targets
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(nutrition): add nutrition plan prescription`

---

### T21: Weight entry schema + log/list endpoints

**What**: `ProgressWeightEntry` model, `POST /api/progress/weight`, `GET /api/progress/weight`
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/progress/`
**Depends on**: T20
**Reuses**: AuthGuard, RolesGuard
**Requirement**: PROG-01, PROG-02
**Complexity**: M

**Done when**:
- [ ] Student can log weight in kg with date
- [ ] Duplicate date upserts (keeps latest)
- [ ] History returns entries for date range
- [ ] E2E tests cover log, upsert, history
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(progress): add weight tracking endpoints`

---

### T22: Streak tracking via event listeners

**What**: `ProgressStreak` model, listeners for `training.session.completed` and `nutrition.meal.logged`
**Where**: `apps/api/src/modules/progress/`
**Depends on**: T21
**Reuses**: Events from T16, T18
**Requirement**: PROG-03
**Complexity**: M

**Done when**:
- [ ] Completing training session increments training streak
- [ ] Logging meal increments nutrition streak
- [ ] Streak resets when day is skipped
- [ ] E2E tests cover streak increment and reset
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(progress): add streak tracking with event listeners`

---

### T23: Streak query endpoint

**What**: `GET /api/progress/streaks` returning current and longest streaks
**Where**: `apps/api/src/modules/progress/`
**Depends on**: T22
**Reuses**: ProgressModule
**Requirement**: PROG-04
**Complexity**: S

**Done when**:
- [ ] Returns `{ training: { current, longest }, nutrition: { current, longest } }`
- [ ] E2E test covers query after activity
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(progress): add streak query endpoint`

---

### T24: Rule-based guidance engine

**What**: `GuidanceService` with rules mapping health goal + recent activity → localized suggestions
**Where**: `apps/api/src/modules/guidance/`
**Depends on**: T23
**Reuses**: StudentService, TrainingService, NutritionService, ProgressService, I18nService
**Requirement**: GUID-01
**Complexity**: M

**Done when**:
- [ ] Rules exist for each HealthGoal type
- [ ] Suggestions reference actual student data (last workout, macro gap, weight trend)
- [ ] Suggestion messages localized via i18n
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(guidance): add rule-based suggestion engine`

---

### T25: Daily guidance endpoint

**What**: `GET /api/guidance/daily` returning today's suggestions for authenticated student
**Where**: `apps/api/src/modules/guidance/`
**Depends on**: T24
**Reuses**: GuidanceService
**Requirement**: GUID-02
**Complexity**: S

**Done when**:
- [ ] Returns array of suggestions with type, message, priority
- [ ] User without StudentProfile gets 403
- [ ] E2E tests cover happy path + 403
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(guidance): add daily guidance endpoint`

---

### T26: Professional profile schema + create endpoint

**What**: `CoachingProfessionalProfile` model, `POST /api/coaching/profile` (trainer or nutritionist); subscription check wired in T32
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/coaching/`
**Depends on**: T25
**Reuses**: AuthGuard
**Requirement**: COACH-01
**Complexity**: M

**Done when**:
- [ ] Professional can create profile with type (trainer/nutritionist) and credentials
- [ ] `GET /api/identity/me` includes `trainer` or `nutritionist` role
- [ ] E2E tests cover create profile + role assignment (subscription gate added in T32)
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(coaching): add professional profile endpoint`

---

### T27: Invite create + accept flow

**What**: `CoachingInvite` + `CoachingLink` models, invite/accept endpoints
**Where**: `apps/api/src/modules/coaching/`
**Depends on**: T26
**Reuses**: CoachingModule
**Requirement**: COACH-02, COACH-03
**Complexity**: M

**Done when**:
- [ ] Professional can send invite to student email (token, 7-day expiry)
- [ ] Student can accept invite via `POST /api/coaching/invites/:token/accept`
- [ ] Expired token returns 410
- [ ] Duplicate link returns 409
- [ ] E2E tests cover invite → accept + error cases
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(coaching): add invite and accept flow`

---

### T28: Coaching link validation + dashboard

**What**: `CoachingService.assertLinked()`, wire into Training/Nutrition prescribe, `GET /api/coaching/dashboard`
**Where**: `apps/api/src/modules/coaching/`, update training/nutrition prescribe guards
**Depends on**: T27
**Reuses**: CoachingModule exports
**Requirement**: COACH-04, COACH-05
**Complexity**: M

**Done when**:
- [ ] Unlinked professional cannot prescribe plans (403)
- [ ] Dashboard returns linked students with summary stats
- [ ] E2E tests cover authorization + dashboard
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(coaching): add link validation and dashboard`

---

### T29: Billing plans schema + seed + list endpoint

**What**: `BillingPlan` + `BillingSubscription` models, seed student (free/pro) + professional tiers, `GET /api/billing/plans`
**Where**: `prisma/schema.prisma`, `apps/api/src/modules/billing/`
**Depends on**: T28
**Reuses**: AuthGuard
**Requirement**: BILL-01
**Complexity**: S

**Done when**:
- [ ] Student free/pro and professional paid plans seeded with feature entitlements
- [ ] `GET /api/billing/plans` returns all tiers with limits
- [ ] E2E test covers list plans
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(billing): add plans schema and list endpoint`

---

### T30: Stripe checkout session endpoint

**What**: `POST /api/billing/checkout` creating Stripe Checkout session for student pro or professional plan
**Where**: `apps/api/src/modules/billing/`
**Depends on**: T29
**Reuses**: Stripe SDK
**Requirement**: BILL-04
**Complexity**: M

**Done when**:
- [ ] Authenticated user can start checkout for pro or professional plan
- [ ] Returns `{ url }` for Stripe Checkout
- [ ] E2E test with Stripe test mode (or mock)
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(billing): add stripe checkout endpoint`

---

### T31: Stripe webhook + subscription lifecycle

**What**: `POST /api/billing/webhook` handling checkout.session.completed, subscription updated/deleted
**Where**: `apps/api/src/modules/billing/`
**Depends on**: T30
**Reuses**: Stripe webhook signature verification
**Requirement**: BILL-05
**Complexity**: M

**Done when**:
- [ ] Valid webhook activates subscription (student pro or professional)
- [ ] Cancellation/downgrade sets tier appropriately
- [ ] Invalid signature returns 400
- [ ] E2E tests cover webhook flows (mock Stripe events)
- [ ] Gate: `pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(billing): add stripe webhook handler`

---

### T32: Entitlement enforcement (Pro AI gate + professional subscription)

**What**: `BillingService.assertEntitlement()`, `@RequiresEntitlement` guard; wire professional subscription check on coaching profile; stub AI food gate for P2
**Where**: `apps/api/src/modules/billing/`, `apps/api/src/common/`, `apps/api/src/modules/coaching/`
**Depends on**: T31
**Reuses**: BillingService tier check, I18nService for localized 402 messages
**Requirement**: BILL-02, BILL-03, BILL-06
**Complexity**: M

**Done when**:
- [ ] User without professional subscription gets 402 on `POST /api/coaching/profile` (`BILL-03`)
- [ ] `assertEntitlement('ai_food_recognition')` returns 402 for free tier (`BILL-02` — ready for P2 endpoint)
- [ ] Free user exceeding plan limit gets 402 with localized `{ upgradeUrl }` (`BILL-06`)
- [ ] Pro student passes AI entitlement check
- [ ] E2E tests cover professional gate + entitlement checks
- [ ] Gate: `pnpm build && pnpm --filter @forma/api test:e2e`

**Tests**: e2e
**Gate**: build
**Commit**: `feat(billing): add entitlement enforcement`

---

## Phase Execution Map

```
Phase 0:  T01 ──→ T02 ──→ T03 ──→ T04 ──→ T05 ──→ T06
Phase 1:  T07 ──→ T08 ──→ T09 ──→ T10 ──→ T11 ──→ T12 ──→ T13
Phase 2:  T14 ──→ T15 ──→ T16
Phase 3:  T17 ──→ T18 ──→ T19 ──→ T20
Phase 4:  T21 ──→ T22 ──→ T23 ──→ T24 ──→ T25
Phase 5:  T26 ──→ T27 ──→ T28
Phase 6:  T29 ──→ T30 ──→ T31 ──→ T32
```

**Total tasks:** 32
**Estimated batches:** ~4 workers (~8 tasks each)

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T01: Shared packages | 2 packages, enums only | ✅ Granular |
| T02: Biome config | 1 config file | ✅ Granular |
| T03: Test harness | 1 test setup + 1 test file | ✅ Granular |
| T04: Module skeleton | Directory restructure | ✅ Granular |
| T05: Swagger + validation | 2-3 files | ✅ Granular |
| T06: i18n setup | locale files + service | ✅ Granular |
| T07: Identity schema | 1 migration | ✅ Granular |
| T08: OTP + Resend | 1 module, 2 endpoints | ✅ Granular |
| T09: JWT + me | Guard + 1 endpoint | ✅ Granular |
| T10: OAuth providers | 3 strategies + callbacks | ✅ Granular |
| T11: Student profile | 1 endpoint + schema | ✅ Granular |
| T12: Health goal | 1 endpoint + schema | ✅ Granular |
| T13: Roles guard | 2 decorator files | ✅ Granular |
| T14: Custom exercises | 2 endpoints, no seed | ✅ Granular |
| T15: Workout plans | 2 endpoints + schema | ✅ Granular |
| T16: Session logging | 2 endpoints + events | ✅ Granular |
| T17: Meal log schema | 1 migration | ✅ Granular |
| T18: Meal logging | 1 endpoint | ✅ Granular |
| T19: Daily summary | 1 endpoint | ✅ Granular |
| T20: Nutrition plan | 1 endpoint | ✅ Granular |
| T21: Weight tracking | 2 endpoints | ✅ Granular |
| T22: Streak listeners | Event handlers | ✅ Granular |
| T23: Streak query | 1 endpoint | ✅ Granular |
| T24: Guidance engine | 1 service | ✅ Granular |
| T25: Guidance endpoint | 1 endpoint | ✅ Granular |
| T26: Professional profile | 1 endpoint | ✅ Granular |
| T27: Invite flow | 2 endpoints | ✅ Granular |
| T28: Dashboard + auth | 1 endpoint + service | ✅ Granular |
| T29: Billing plans | 1 endpoint + seed | ✅ Granular |
| T30: Stripe checkout | 1 endpoint | ✅ Granular |
| T31: Stripe webhook | 1 endpoint | ✅ Granular |
| T32: Entitlement enforcement | Guard + service wiring | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T01 | None | T01 (start) | ✅ Match |
| T02 | T01 | T01 → T02 | ✅ Match |
| T03 | T02 | T02 → T03 | ✅ Match |
| T04 | T03 | T03 → T04 | ✅ Match |
| T05 | T04 | T04 → T05 | ✅ Match |
| T06 | T05 | T05 → T06 | ✅ Match |
| T07 | T06 | T06 → T07 | ✅ Match |
| T08 | T07 | T07 → T08 | ✅ Match |
| T09 | T08 | T08 → T09 | ✅ Match |
| T10 | T09 | T09 → T10 | ✅ Match |
| T11 | T10 | T10 → T11 | ✅ Match |
| T12 | T11 | T11 → T12 | ✅ Match |
| T13 | T12 | T12 → T13 | ✅ Match |
| T14 | T13 | T13 → T14 | ✅ Match |
| T15 | T14 | T14 → T15 | ✅ Match |
| T16 | T15 | T15 → T16 | ✅ Match |
| T17 | T16 | T16 → T17 | ✅ Match |
| T18 | T17 | T17 → T18 | ✅ Match |
| T19 | T18 | T18 → T19 | ✅ Match |
| T20 | T19 | T19 → T20 | ✅ Match |
| T21 | T20 | T20 → T21 | ✅ Match |
| T22 | T21 | T21 → T22 | ✅ Match |
| T23 | T22 | T22 → T23 | ✅ Match |
| T24 | T23 | T23 → T24 | ✅ Match |
| T25 | T24 | T24 → T25 | ✅ Match |
| T26 | T25 | T25 → T26 | ✅ Match |
| T27 | T26 | T26 → T27 | ✅ Match |
| T28 | T27 | T27 → T28 | ✅ Match |
| T29 | T28 | T28 → T29 | ✅ Match |
| T30 | T29 | T29 → T30 | ✅ Match |
| T31 | T30 | T30 → T31 | ✅ Match |
| T32 | T31 | T31 → T32 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|-----------|-----------------|-----------|--------|
| T01 | Config | none | none | ✅ OK |
| T02 | Config | none | none | ✅ OK |
| T03 | Controller | e2e | e2e | ✅ OK |
| T04 | Restructure | e2e (existing) | e2e | ✅ OK |
| T05 | Controller + filter | e2e | e2e | ✅ OK |
| T06 | i18n service | e2e | e2e | ✅ OK |
| T07 | Prisma schema | none | none | ✅ OK |
| T08 | Service + Controller | e2e | e2e | ✅ OK |
| T09 | Guard + Controller | e2e | e2e | ✅ OK |
| T10 | OAuth strategies | e2e | e2e | ✅ OK |
| T11 | Service + Controller | e2e | e2e | ✅ OK |
| T12 | Service + Controller | e2e | e2e | ✅ OK |
| T13 | Guard | e2e | e2e | ✅ OK |
| T14 | Service + Controller | e2e | e2e | ✅ OK |
| T15 | Service + Controller | e2e | e2e | ✅ OK |
| T16 | Service + Controller | e2e | e2e | ✅ OK |
| T17 | Prisma schema | none | none | ✅ OK |
| T18 | Service + Controller | e2e | e2e | ✅ OK |
| T19 | Controller | e2e | e2e | ✅ OK |
| T20 | Service + Controller | e2e | e2e | ✅ OK |
| T21 | Service + Controller | e2e | e2e | ✅ OK |
| T22 | Service (events) | e2e | e2e | ✅ OK |
| T23 | Controller | e2e | e2e | ✅ OK |
| T24 | Service | e2e | e2e | ✅ OK |
| T25 | Controller | e2e | e2e | ✅ OK |
| T26 | Service + Controller | e2e | e2e | ✅ OK |
| T27 | Service + Controller | e2e | e2e | ✅ OK |
| T28 | Service + Controller | e2e | e2e | ✅ OK |
| T29 | Service + Controller | e2e | e2e | ✅ OK |
| T30 | Service + Controller | e2e | e2e | ✅ OK |
| T31 | Service + Controller | e2e | e2e | ✅ OK |
| T32 | Guard + Service | e2e | e2e | ✅ OK |
