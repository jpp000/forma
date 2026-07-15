# Web Portal W1 Validation

**Date**: 2026-07-12
**Spec**: `.specs/features/web-portal/spec.md`
**Diff range**: `7f9df09cb0c3b8d7eeaba8bb3c25fa97892f1bc2..21c6c777246ff048a5b8bac7ace40db7b6cba874` (`feature/web-portal-w1` HEAD)
**Verifier**: independent sub-agent (author ≠ verifier) — **re-verify after fix iteration 2**
**Scope**: W1 only — WPORT-01..07, WPORT-17, WPORT-18, WPORT-19; stories W1-01..W1-04. W2–W4 not evaluated.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1–T14 | ✅ Done | All marked done in `tasks.md`; iter 2 exports `handleUnauthorized` + e2e 401→login |

---

## Spec-Anchored Acceptance Criteria (W1)

### P1 / W1-01: Portal scaffold & auth (WPORT-01, WPORT-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN operator deploys portal THEN Vite+React SPA on Render | Static `forma-web-portal` + SPA rewrite | `render.yaml` — `runtime: static`, publish `apps/web-portal/dist`, rewrite `/*`→`/index.html`; `apps/web-portal/package.json` — `"dev": "vite"` | ✅ PASS (structural) |
| WHEN User completes OTP/OAuth THEN store Bearer + call `GET /api/identity/me` | Token persisted; session uses `/me` | `e2e/w1-smoke.spec.ts:35-38` — `expect(token).toBeTruthy()` after mock login; API `identity.e2e-spec.ts` web OAuth `accessToken` | ✅ PASS |
| WHEN User has no trainer/nutritionist role THEN guide to paid onboarding | Land on onboarding | `e2e/w1-smoke.spec.ts:50-53` — `onboarding-checkout` + `onboarding-profile-form`; `errors.test.ts` — `isProfessionalRole(['student'])` false | ✅ PASS |
| WHEN API returns 401 THEN clear session and return to auth | `clearSession` + login | `session-401.test.ts:4,22-25` — imports `handleUnauthorized` from `wire.ts`; `token`/`user` `toBeNull()`; `session-401.test.ts:38-51` — client 401 with production handler clears session; `e2e/w1-smoke.spec.ts:257-277` — 401 `/me` → `auth-screen` + `localStorage` token `null` | ✅ PASS (prior ⚠️ closed) |

### P1 / W1-02: Paid professional signup & profile (WPORT-03, WPORT-04)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN User starts professional signup THEN checkout for **professional** plan | `POST …/checkout` with `planSlug: 'professional'` | `client.test.ts:64-68` — `expect(JSON.parse(…)).toEqual({ planSlug: 'professional' })` | ✅ PASS |
| WHEN lacks entitlement + create-profile THEN 402 + portal paywall CTA | API 402; checkout CTA shown | `billing.e2e-spec.ts` — status 402; `e2e/w1-smoke.spec.ts:175` — `onboarding-checkout` after 402 | ✅ PASS |
| WHEN entitled User submits trainer/nutritionist profile THEN profile created + roles on `/identity/me` | 201 + role on me | `coaching.e2e-spec.ts` — `expect(response.status).toBe(201)`; roles contain `trainer` | ✅ PASS (API/system) |
| WHEN profile created THEN collect type + credentials (min) | type + credentials fields | `e2e/w1-smoke.spec.ts:53` — `onboarding-profile-form`; `:173` fills credentials | ✅ PASS |

### P1 / W1-03: Client dashboard (WPORT-05, WPORT-06)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Professional opens dashboard THEN render linked students from `GET /api/coaching/dashboard` | Student rows from API | `e2e/w1-smoke.spec.ts:215` — `expect(page.getByText('aluno@example.com')).toBeVisible()` with mocked non-empty `students` | ✅ PASS |
| WHEN student has lastWorkout/lastMeal/weightTrend THEN display those fields | Columns show summary fields | `e2e/w1-smoke.spec.ts:216-218` — `getByText('2026-07-10'|'2026-07-11'|'down')` | ✅ PASS |
| WHEN zero links THEN empty state + CTA to invite | Empty UI + link `/invites` | `e2e/w1-smoke.spec.ts:108-111` — `dashboard-empty`; link `href` `/invites` | ✅ PASS |
| WHEN dashboard fails THEN recoverable error + retry | Error + retry control | `e2e/w1-smoke.spec.ts:145` — `dashboard-retry` visible | ✅ PASS |

### P1 / W1-04: Email invites (WPORT-07)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Professional submits student email THEN invite + success with 7-day expiry hint | Success UI mentions 7 days | `e2e/w1-smoke.spec.ts:117` — `invite-success` `/7 days/i`; `invite-copy.test.ts` | ✅ PASS |
| WHEN invite API returns validation/rate errors THEN localized message | Visible localized error | `e2e/w1-smoke.spec.ts:252-254` — `getByRole('alert')` matches `/valid email|e-mail válido|Must be a valid/i` on POST 400 | ✅ PASS |
| WHEN Student accepts via accept API THEN appears on dashboard after refresh | Linked student on dashboard | `coaching.e2e-spec.ts:225-227` — API dashboard lists student after accept; portal refresh/UI path untested | ⚠️ Spec-precision gap |

### Cross-cutting (WPORT-17–19)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WPORT-17 Design: pro dashboard × Forma brand | Primary `#30D158`, light surfaces | `tokens.css:2` — `--color-primary: #30d158` | ✅ PASS (structural) |
| WPORT-18 i18n pt-BR + en | Locale switch updates UI; `Accept-Language` sent | `e2e/w1-smoke.spec.ts:16-19` — EN Continue; `client.test.ts` — `Accept-Language` `en` | ✅ PASS |
| WPORT-19 CORS + Render | Prod CORS from `CORS_ORIGIN`; portal on Render | `cors.e2e-spec.ts`; `render.yaml` static service | ✅ PASS |

**Status**: ✅ WPORT-02 closed; **1** remaining ⚠️ precision (W1-04.3 accept→portal dashboard). Discrimination sensor PASS (mutant 8 killed).

**Story AC score**: **14/15** ✅ matched; **1** ⚠️ precision (accept→portal dashboard); **0** ❌ AC gaps

---

## Discrimination Sensor

Scratch copy under `/tmp` (product tree not mutated). Focus: prior survivor mutant 8.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `errors.ts` 401 branch | `401` → non-matching status | ✅ Killed (`errors.test`) — prior |
| 2 | `errors.ts` `isProfessionalRole` | always `false` | ✅ Killed — prior |
| 3 | `client.ts` skip `onUnauthorized` | omit callback on 401 | ✅ Killed (`client.test.ts:25`) — prior |
| 4 | `billing.ts` `planSlug` | `'professional'` → `'free'` | ✅ Killed — prior |
| 5 | invite success copy | drop “7 days” | ✅ Killed (`invite-copy.test`) — prior |
| 6 | `DashboardPage.tsx` columns | remove `lastWorkout`/`lastMeal`/`weightTrend` | ✅ Killed — e2e roster — prior |
| 7 | `InvitesPage.tsx` catch | swallow API error (no `setFormError`) | ✅ Killed — e2e alert — prior |
| 8 | `wire.ts:9-11` | `handleUnauthorized` no-op (no `clearSession`) | ✅ Killed — scratch vitest: both `session-401` tests fail (`expected 'stale-token' to be null`) |

**Residual note (not a FAIL)**: replacing `onUnauthorized: handleUnauthorized` with `() => {}` in `createWiredClient` still leaves unit green (tests call exported `handleUnauthorized` directly) and e2e green (`sessionStore.bootstrap`/`refreshMe` `catch` also calls `clearSession`). Spec AC + mutant-8-as-handler-body are covered; wiring-line coupling remains thin.

**Sensor depth**: lightweight (behavior-level; mutant 8 re-injected empirically)
**Result**: 8/8 killed for stated mutant set — PASS ✅

---

## Interactive UAT Results

Not performed (automated Verifier pass only).

---

## Code Quality

| Principle | Status |
| ---------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep (W1 surface) | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ⚠️ 1 precision gap remains (W1-04.3) |
| Per-layer Coverage Expectation | ✅ 401 production handler + return-to-auth e2e now present |
| Every test maps to a spec AC | ✅ |
| Documented guidelines | ✅ `AGENTS.md`, tasks matrix, AD-013/AD-031 spirit |

---

## Edge Cases (W1-relevant)

- [x] CORS misconfig → network mapping: `errors.test` TypeError→`network`
- [x] Subscription 402 + paywall CTA: portal e2e
- [ ] Invite expired 410; portal resend UX: API 410 covered; portal resend not in W1 UI
- [x] student+professional → pro role: `errors.test`
- [x] Mid-bootstrap 401 → clear session + auth screen: `e2e/w1-smoke.spec.ts:257-277`
- [ ] W2-only edges — out of W1 scope

---

## Gate Check

- **Gate command**: Full W1 — API e2e (cors/identity web) + `pnpm --filter @forma/web-portal test` + `check-types` + portal e2e
- **Result (this session)**:
  - Portal unit (scratch pristine copy): **15 passed**, 0 failed (`errors` 8 + `client` 4 + `invite-copy` 1 + `session-401` 2)
  - Portal check-types: **pass** (real tree)
  - Portal e2e: **not re-run here** (API/Vite not started this session). Suite has **10** Playwright tests; orchestrator note: **10 passed**
- **Test count before feature**: 0 portal tests (app absent at merge-base)
- **Test count after feature**: 15 unit + 10 e2e (+ API cors/oauth/coaching coverage)
- **Delta**: +25 focused portal tests vs merge-base
- **Skipped**: full API e2e + portal e2e not re-executed this pass (orchestrator-confirmed green)
- **Failures**: none on gates that ran

---

## Fix Plans

None blocking. Optional polish only:

### Optional: W1-04.3 portal accept→dashboard (Minor / ⚠️ precision)

- **Root cause**: AC proven at API layer only; portal refresh path untested.
- **Fix task**: Mocked e2e after accept shows student on dashboard, **or** document AC as system-level API proof.
- **Priority**: Minor — does **not** block Verifier PASS per W1 re-verify charter

### Optional residual: assert `createWiredClient` wiring (Cosmetic)

- **Root cause**: unit imports `handleUnauthorized` but does not exercise `getIdentityApi`/`createWiredClient` binding; bootstrap `catch` masks e2e for wire no-op.
- **Fix task**: unit with `fetchImpl` injected into wired client, or mid-session 401 on a path that does not also `clearSession` in `catch`.
- **Priority**: Cosmetic — mutant 8 (handler body) already killed

---

## Requirement Traceability Update (recommended; not applied — Verifier writes report only)

| Requirement | Previous Status (iter 1) | New Status |
| ----------- | ------------------------ | ---------- |
| WPORT-01 | ✅ Verified | ✅ Verified |
| WPORT-02 | ⚠️ Needs Fix | ✅ Verified (handler + e2e return-to-auth) |
| WPORT-03 | ✅ Verified | ✅ Verified |
| WPORT-04 | ✅ Verified | ✅ Verified |
| WPORT-05 | ✅ Verified | ✅ Verified |
| WPORT-06 | ✅ Verified | ✅ Verified |
| WPORT-07 | ✅ Verified (success + validation); accept→UI ⚠️ | ✅ Verified success + validation; accept→UI still ⚠️ precision |
| WPORT-17 | ✅ Verified | ✅ Verified |
| WPORT-18 | ✅ Verified | ✅ Verified |
| WPORT-19 | ✅ Verified | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (PASS) — remaining W1-04.3 ⚠️ precision only; not blocking

**Spec-anchored check**: 14/15 story ACs ✅; 1 ⚠️; 0 ❌ (WPORT-17–19 ✅)
**Sensor**: 8/8 killed (mutant 8 `handleUnauthorized` no-op killed by `session-401`)
**Gate**: portal unit 15 + check-types pass; e2e 10 known-green (orchestrator)

**What works**: WPORT-02 closed — production `handleUnauthorized` imported by unit; client 401 clears session; e2e 401 `/me` → login + cleared token. Prior roster/invite/sensor gaps remain closed.

**Issues found**: W1-04.3 accept→portal dashboard still API-only (⚠️). Residual thin coupling on `createWiredClient` wiring line (optional).

**Next steps**: W1 Verifier PASS — may proceed to W2. Optional polish for W1-04.3 / wiring if desired.

# Web Portal W2 Validation

**Date**: 2026-07-12
**Spec**: `.specs/features/web-portal/spec.md`
**Diff range**: `d68f42e432956957f9faaef9156fa5d748c34341..f9e93997ccff8eeb6231781a7d6cf3b410d1fc0c` (after W1 Verifier PASS → HEAD)
**Commits**: `7f49494` … `f9e9399` (7 commits; first W2 docs + API/portal/mobile)
**Verifier**: independent sub-agent (author ≠ verifier)
**Scope**: W2 only — WPORT-08..11; stories W2-01..W2-03. W1 not re-scored.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T15 | ✅ Done | Migration `20260712180000_add_public_profile_and_link_requests`; schema `displayName`/`bio`/`slug`/`isPublished` + `CoachingLinkRequest` |
| T16 | ✅ Done | `PATCH /api/coaching/profile`; e2e publish + slug 409 |
| T17 | ✅ Done | Public `GET /professionals` + `:idOrSlug`; e2e safe fields / unpublished 404 |
| T18 | ✅ Done | Request create/list/accept/decline; e2e accept+decline; invite tests retained |
| T19 | ✅ Done | Portal `ProfileEditorPage` — **no portal unit/e2e** |
| T20 | ✅ Done | Portal `RequestsInboxPage` — **no portal unit/e2e** |
| T21 | ✅ Done | Mobile Professionals tab + store; smoke opens tab |
| T22 | ✅ Done | Detail + request CTA; client unit only |
| T23 | ✅ Done | Gates green; Verifier **PASS** after W2-03.4 fix (5 ⚠️ non-blocking) |

---

## Spec-Anchored Acceptance Criteria (W2)

### P1 / W2-01: Public professional profile (WPORT-08)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Pro completes publish fields THEN API exposes **public** profile (safe fields only) | Public DTO: name/credentials/bio/type; no private student/email | `coaching.e2e-spec.ts:342-350` — `toMatchObject({ displayName, slug, type, credentials, bio })`; `email` `toBeUndefined()`; `toPublicProfessional` omits private fields (`coaching.service.ts:128-136`) | ✅ PASS |
| WHEN unauthenticated/student requests public by id/slug THEN 200 public payload | No auth required; 200 | `coaching.e2e-spec.ts:338-363` — unauthenticated `GET /professionals`, by slug, by id all `200`; unpublished `404` at `:323-326` | ✅ PASS |
| WHEN Pro updates bio/credentials **in portal** THEN public reflects after save | Portal save → public read shows new values | API path: PATCH then public GET in same suite (`:249-265` + `:338-356`). Portal editor calls `updateProfile` (`ProfileEditorPage.tsx:62-68`) — **no portal e2e/unit asserting save→public** | ⚠️ Spec-precision gap |

### P1 / W2-02: Mobile professionals tab & discovery (WPORT-09)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Student opens Professionals tab THEN list discoverable pros | Tab + list/search | `auth-onboarding.spec.ts:50,56-57` — `tab-professionals` → `professionals-screen`; API list `coaching.e2e-spec.ts:338-369`; client `coaching.test.ts:4-14` | ✅ PASS |
| WHEN Student opens a professional THEN show public profile | Detail shows public fields | Screen `ProfessionalDetailScreen.tsx:62-74`; client `coaching.test.ts:21-24`. **No e2e** navigates to detail / asserts fields | ⚠️ Spec-precision gap |
| WHEN list/profile fails THEN recoverable error | Error + retry | UI: `ProfessionalsListScreen.tsx:60-67` (`professionals-retry`); detail retry `:47-50`. **No test assertion** | ⚠️ Spec-precision gap |
| WHEN design tokens apply THEN follow DESIGN.md | Shared Forma theme | `useFormaTheme` + `colors.primary` / typography on list+detail; tab tint `_layout.tsx:23,72-75` | ✅ PASS (structural) |

### P1 / W2-03: Request link & pro accept/decline (WPORT-10, WPORT-11)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Student requests coaching THEN pending request (idempotent while pending) | Same id on repeat POST | `coaching.e2e-spec.ts:394-406` — `status` `pending`; second POST `again.body.id` equals first | ✅ PASS |
| WHEN Pro views pending in portal THEN list requester identity | Email/name as available | API: `coaching.e2e-spec.ts:408-413` — `studentEmail` equals student. Portal inbox renders `row.studentEmail` (`RequestsInboxPage.tsx:63`) — **no portal e2e** | ⚠️ Spec-precision gap |
| WHEN Pro accepts THEN coaching link + request leaves pending | Link row exists; pending list empty | `coaching.e2e-spec.ts:420-443` — accept `201`/`accepted`; `coachingLink` `not.toBeNull()`; pending length `0` | ✅ PASS |
| WHEN Pro declines THEN no link **and** Student can see declined/closed state | Decline without link; student-visible closed state | Decline+no link: `coaching.e2e-spec.ts` decline `declined` + `link` `toBeNull()`. Student visibility (**fix iter**): `GET /api/coaching/requests/mine` (`coaching.controller.ts` + e2e asserts `status: 'declined'`); mobile `myRequestStatus` + `professional-request-status` (`ProfessionalDetailScreen.tsx`, `professionalsStore.ts`) | ✅ PASS (fix iter) |
| WHEN unauthenticated or non-student requests THEN 401/403 | Reject appropriately | Controller `@UseGuards(AuthGuard)` + `@Roles(Role.Student)` on POST (`coaching.controller.ts:26,61-63`). E2e: student `GET /requests` → `403` (`:415-418`). **No e2e** for unauthenticated POST → `401` or pro POST → `403` | ⚠️ Spec-precision gap |
| WHEN email invite used THEN still works alongside requests | No invite regression | `coaching.e2e-spec.ts:114+` — invite→accept creates link (suite retained on branch) | ✅ PASS |

**Status (initial)**: ❌ **FAIL** — blocking gap W2-03.4.  
**Status (re-verify after fix)**: ✅ **PASS** with **5** non-blocking ⚠️ precision gaps (portal/mobile UI smoke incomplete; auth matrix partial).

**Story AC score (re-verify)**: **8/13** ✅ matched; **5** ⚠️ precision; **0** ❌ AC gaps

**WPORT mapping**: WPORT-08 mostly ✅ (portal publish UI ⚠️); WPORT-09 ✅/⚠️; WPORT-10 ✅; WPORT-11 API ✅, portal inbox ⚠️.

---

## Discrimination Sensor

Hypothetical mutants on W2 paths (existing tests would kill?):

| # | Mutation | File:line (approx) | Existing killer? | Killed? |
| - | -------- | ------------------ | ---------------- | ------- |
| 1 | Drop `isPublished: true` from public list filter | `coaching.service.ts:143` | Unpublished must stay hidden; list length 1 after publish (`e2e:323-342`) | ✅ Would kill |
| 2 | Include `email` on public DTO | `coaching.service.ts:128-136` | `expect(…email).toBeUndefined()` (`e2e:350,357`) | ✅ Would kill |
| 3 | Always create new pending (break idempotency) | `coaching.service.ts:209-210` | `again.body.id === create.body.id` (`e2e:405-406`) | ✅ Would kill |
| 4 | Decline also creates `CoachingLink` | `declineLinkRequest` | `expect(link).toBeNull()` (`e2e:490`) | ✅ Would kill |
| 5 | Portal inbox omit `studentEmail` column | `RequestsInboxPage.tsx:63` | **No** portal/unit/e2e asserts inbox identity | ❌ Survives |
| 6 | Mobile detail never shows `bio` | `ProfessionalDetailScreen.tsx:70-74` | **No** detail e2e/unit | ❌ Survives |
| 7 | Student declined-state never returned from `/requests/mine` | `listMyLinkRequests` / e2e mine after decline | ✅ Would kill (`status: 'declined'` on mine) |

**Sensor depth**: lightweight (behavior-level; reasoned against existing suite)
**Result (re-verify)**: 5/7 killed — API + student declined path covered; portal inbox + mobile detail bio still weakly discriminated — **PASS** for blocking ACs (⚠️ UI precision remain)

---

## Interactive UAT Results

Not performed (automated Verifier pass only).

---

## Gate Check

- **Gate command**: W2 — API coaching e2e + portal unit/check-types + mobile coaching unit/check-types (+ mobile tab smoke in e2e)
- **Result (re-verify session)**:
  - Portal unit: **15 passed**
  - Portal check-types: **PASS**
  - Mobile check-types: **PASS**
  - Mobile `coaching.test.ts`: **2 passed** (includes `listMyLinkRequests`)
  - API coaching e2e: **10 passed** (includes student `requests/mine` → `declined`)
  - Portal W2 e2e: **absent** (only `w1-smoke.spec.ts`)
- **Failures**: none on gates that ran

---

## Ranked Gaps

1. ~~❌ W2-03.4 — Student declined/closed visibility~~ → **closed** via `GET /api/coaching/requests/mine` + mobile status + e2e.

2. **⚠️ Portal W2 UI untested (T19/T20 / W2-01.3 / W2-03.2)** — add Playwright smoke: publish → public fields; inbox accept/decline removes row.

3. **⚠️ Mobile detail + error/retry (W2-02.2 / W2-02.3)** — extend e2e: open row → detail fields; mock failure → `professionals-retry`.

4. **⚠️ W2-03.5 auth matrix incomplete** — e2e: no Bearer → `401` on `POST /requests`; pro token → `403`.

---

## Summary

**Overall (re-verify)**: ✅ **PASS** — blocking W2-03.4 closed; **5** non-blocking ⚠️ remain (do not block W3)

**Spec-anchored check**: 8/13 ✅; 5 ⚠️; 0 ❌  
**Sensor**: 5/7 killed (declined path now covered)  
**Gate**: portal 15 + types PASS; mobile coaching 2 + types PASS; API coaching e2e **10** PASS

**What works**: Public publish fields, public browse/get (safe DTO), link-request idempotency, accept→link, decline→no link + student mine status, invite regression, Professionals tab smoke, portal editor/inbox shipped.

**Next steps**: Optional polish for ⚠️ portal/mobile smoke; proceed to W3 stubs when ready.

---

# Web Portal W3 Validation

**Date**: 2026-07-12
**Spec**: `.specs/features/web-portal/spec.md`
**Diff range**: `4e3b299..5c54759` (`feature/web-portal-w1` HEAD after W2 PASS)
**Verifier**: independent sub-agent (author ≠ verifier)
**Scope**: W3 only — WPORT-12..14; stories W3-01..W3-02. W1/W2 not re-scored.

**Commits in range**:
- `17b4068` feat(api): add workout templates and linked prescribe
- `5c54759` feat(web-portal): add training templates and prescribe UI

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T24 | ✅ Done | Migration `20260712190000_add_workout_templates`; `TrainingWorkoutTemplate` + `prescribedByUserId` |
| T25 | ✅ Done | Trainer CRUD `/api/training/templates`; nutritionist POST → 403 e2e |
| T26 | ✅ Done | `POST /plans/prescribe` + `assertLinked`; student `GET /plans` includes plan; unlinked 403 |
| T27 | ✅ Done | Portal `TemplatesPage` create/list — **no portal e2e** |
| T28 | ✅ Done | Portal prescribe form (template + linked student) — **no portal e2e** |
| T29 | ✅ Done | Gates green; Verifier **PASS** (2 ⚠️ non-blocking) |

---

## Spec-Anchored Acceptance Criteria (W3)

### P1 / W3-01: Training templates (WPORT-12)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Trainer creates template THEN store name + exercise structure owned by pro | 201; name + items; owned | `training.e2e-spec.ts:349-354` — `status` `201`, `body.name` `'Push A'`; schema `TrainingWorkoutTemplate.professionalUserId` (`schema.prisma:148-152`); create stores `items` (`training.service.ts:216-221`) | ✅ PASS |
| WHEN Trainer lists templates THEN only their templates | Owner-scoped list | List filter `professionalUserId` + `archivedAt: null` (`training.service.ts:226-230`); e2e own list length 1 (`:356-360`). **No cross-trainer isolation e2e** (sensor mutant 4 survived) | ⚠️ Spec-precision gap |
| WHEN Trainer updates or archives THEN subsequent list/prescribe uses new state | Update name; archive hidden from list | `training.e2e-spec.ts:362-377` — PATCH `name` `'Push A v2'`; archive then list length `0`. Service rejects archived on prescribe (`training.service.ts:276-278`) — **no e2e prescribe-after-archive** | ✅ PASS (list path e2e; archive→prescribe structural) |
| WHEN Nutritionist without trainer hits template write APIs THEN 403 | 403 | `training.e2e-spec.ts:396-400` — nutritionist `POST /templates` → `403`; controller `@Roles(Role.Trainer)` (`training.controller.ts:112-113`) | ✅ PASS |

### P1 / W3-02: Prescribe training to linked student (WPORT-13, WPORT-14)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN linked Trainer prescribes (template or ad-hoc) THEN create/assign plan for student | 201; plan on student; `prescribedByUserId` set | `training.e2e-spec.ts:434-444` — `201`, `prescribedByUserId` truthy, `userId` = student, exercise name copied | ✅ PASS |
| WHEN unlinked Trainer tries prescribe THEN 403 | 403 | `training.e2e-spec.ts:417-424` — unlinked prescribe `403`; `assertLinked` (`training.service.ts:263-266`, `coaching.service.ts:432-444`) | ✅ PASS |
| WHEN Student opens Training THEN prescribed plan visible in existing flows | Plan in student `GET /plans`; mobile lists plans | API: `training.e2e-spec.ts:446-452` — student `GET /plans` includes prescribed id. Mobile: `listPlans` → `/api/training/plans` (`training.ts:110-111`); `fetchPlans` (`trainingStore.ts:145`) | ✅ PASS (API e2e + mobile structural; notes: WPORT-14) |
| WHEN Nutritionist-only tries training prescribe THEN 403 | 403 | Controller `@Roles(Role.Trainer)` on prescribe (`training.controller.ts:80-81`). **No dedicated nutritionist-prescribe e2e** (sensor mutant allowing `Role.Nutritionist` survived) | ⚠️ Spec-precision gap |

**Portal UI (T27/T28)**: `TemplatesPage` at `/templates` — create + prescribe forms, errors via `InlineError` (`TemplatesPage.tsx:76-134,164`). Route wired (`routes.tsx:139-143`). **No portal unit/e2e** — ⚠️ ok per W3 notes when API covered.

**Status**: ✅ **PASS** — **0** ❌ blocking AC gaps; **2** story ⚠️ + portal UI ⚠️ non-blocking.

**Story AC score**: **6/8** ✅ matched; **2** ⚠️ precision; **0** ❌ AC gaps

**WPORT mapping**: WPORT-12 ✅/⚠️ (isolation e2e weak); WPORT-13 ✅ API / ⚠️ nutri-prescribe e2e + portal UI; WPORT-14 ✅.

---

## Discrimination Sensor

Scratch mutations on live tree then restored (`git` clean). Suite: `training.e2e-spec`.

| # | Mutation | File:line (approx) | Killed? |
| - | -------- | ------------------ | ------- |
| 1 | Skip `assertLinked` in prescribe | `training.service.ts:263-266` | ✅ Killed (unlinked expect 403) — 7/1 |
| 2 | Archive sets `archivedAt: null` | `training.service.ts:255` | ✅ Killed (list after archive length 0) — 7/1 |
| 3 | `prescribedByUserId: null` | `training.service.ts:314` | ✅ Killed (`prescribedByUserId` truthy) — 7/1 |
| 4 | Drop `professionalUserId` from list filter | `training.service.ts:227-229` | ❌ Survived — 8/0 (no cross-owner e2e) |
| 5 | Allow `@Roles(Trainer, Nutritionist)` on prescribe | `training.controller.ts:81` | ❌ Survived — 8/0 (no nutri prescribe e2e) |

**Sensor depth**: lightweight (5 behavior-level mutations)
**Result**: **3/5 killed** — linked/archive/prescribedBy covered; owner-isolation list + nutritionist-prescribe weakly discriminated — **PASS** for blocking ACs (⚠️ remain)

---

## Interactive UAT Results

Not performed (automated Verifier pass only).

---

## Gate Check

- **Gate command**: W3 — API training e2e + portal unit / check-types / build
- **Result (this session)**:
  - API `training.e2e-spec`: **8 passed**, 0 failed (includes 2 W3 cases)
  - Portal unit: **15 passed**
  - Portal check-types: **PASS**
  - Portal build: **PASS** (vite dist)
  - Portal W3 e2e: **absent** (only `w1-smoke.spec.ts`)
- **Failures**: none on gates that ran

---

## Ranked Gaps

1. **⚠️ W3-01.2 owner isolation e2e** — add second trainer + assert list excludes foreign templates (kills sensor mutant 4).
2. **⚠️ W3-02.4 nutritionist prescribe e2e** — nutritionist token → `POST /plans/prescribe` expect `403` (kills mutant 5).
3. **⚠️ Portal templates/prescribe UI untested (T27/T28)** — optional Playwright: create template → prescribe linked student (non-blocking; API covered).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ (⚠️ flagged where precision thin) |
| Per-layer coverage (API happy+edge) | ✅ API; portal UI smoke thin |
| Tests map to ACs | ✅ |
| Guidelines | none — strong defaults / existing e2e patterns |

---

## Summary

**Overall**: ✅ **PASS** — no ❌ blocking AC gaps; **2** story ⚠️ + portal UI ⚠️ non-blocking

**Spec-anchored check**: 6/8 ✅; 2 ⚠️; 0 ❌  
**Sensor**: 3/5 killed  
**Gate**: training e2e **8** PASS; portal unit **15** + types + build PASS

**What works**: Template CRUD + archive, nutritionist template 403, linked prescribe from template, unlinked 403, student `GET /plans` sees prescribed plan, portal `/templates` create+prescribe UI shipped, mobile reuses plan list.

**Next steps**: Optional strengthen e2e for isolation + nutri-prescribe; proceed to W4 stubs.

---

# Web Portal W4 Validation

**Date**: 2026-07-12
**Spec**: `.specs/features/web-portal/spec.md`
**Diff range**: `faf965e..c3bce23` (`feature/web-portal-w1` HEAD after W3 PASS)
**Verifier**: independent sub-agent (author ≠ verifier)
**Scope**: W4 only — WPORT-15..16; stories W4-01..W4-02. W1–W3 not re-scored (prior PASS retained).

**Commits in range**:
- `1311b48` feat(api): add nutrition templates and light periodization
- `c3bce23` feat(web-portal): add nutrition templates and periodization UI

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T30 | ✅ Done | `NutritionPlanTemplate`; `TrainingPeriodization` + Block + Assignment; migration applied |
| T31 | ⚠️ Partial | Create/list/prescribe + trainer 403 e2e; **archive e2e absent** (endpoint exists) |
| T32 | ✅ Done | 2-block create, assign, advance, unlinked 403 e2e |
| T33 | ✅ Done | Portal `/nutrition-templates` create + prescribe — **no portal e2e** |
| T34 | ✅ Done | Portal `/periodization` create/assign/advance — **no portal e2e** |
| T35 | ✅ Done | Gates green; Verifier **PASS** (2 story ⚠️ + task/portal ⚠️ non-blocking) |

---

## Spec-Anchored Acceptance Criteria (W4)

### P1 / W4-01: Nutrition templates / cardápios (WPORT-15)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Nutritionist creates nutrition template THEN store daily macros + optional menu owned by pro | 201; macros stored; optional `menuJson` | `nutrition.e2e-spec.ts:307-317` — `POST /templates` → `201`; schema `NutritionPlanTemplate` macros + `menuJson` (`schema.prisma:277-285`); create stores `menuJson` (`nutrition.service.ts:172-180`) | ✅ PASS (menu optional; e2e covers macros) |
| WHEN Nutritionist prescribes from template to linked student THEN create/update student nutrition plan | 201; student daily target from template | `nutrition.e2e-spec.ts:337-351` — prescribe `templateId` → `dailyCalories` `1800`; student `GET /daily` `target.calories` `1800` | ✅ PASS |
| WHEN unlinked Nutritionist prescribes THEN 403 | 403 | `assertLinked` (`nutrition.service.ts:120-123`). **No unlinked prescribe e2e** (sensor mutant 1 survived) | ⚠️ Spec-precision gap |
| WHEN Trainer-only writes nutrition templates THEN 403 | 403 | `nutrition.e2e-spec.ts:369-379` — trainer `POST /templates` → `403`; `@Roles(Role.Nutritionist)` (`nutrition.controller.ts:57-58`) | ✅ PASS |

### P1 / W4-02: Light periodization (WPORT-16)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Trainer creates periodization with ordered blocks THEN each block references workout plan/template | 201; ≥2 ordered blocks with `templateId` + `durationDays` | `training.e2e-spec.ts:488-499` — `blocks` length `2`; create maps `templateId`/`durationDays` (`training.service.ts:352-361`); schema `TrainingPeriodizationBlock` (`schema.prisma:175-180`) | ✅ PASS |
| WHEN Trainer assigns to linked student THEN expose active block’s plan to student | Assignment + first-block plan; student sees plans | `training.e2e-spec.ts:515-521` — `activePosition` `0`, `plan.name` `'Block 1'`; student `GET /plans` length ≥2 after advance (`:532-535`) | ✅ PASS |
| WHEN current block ends (date/duration or explicit) THEN advance to next or complete | Explicit advance + Design lazy-on-read | Explicit: `training.e2e-spec.ts:523-530` — advance → `activePosition` `1`, `plan.name` `'Block 2'`. Lazy: `getStudentActivePeriodization` elapsed≥`durationDays` (`training.service.ts:495-526`) — **no lazy/date e2e** | ✅ PASS (explicit path); ⚠️ lazy path untested |
| WHEN unlinked Trainer assigns periodization THEN 403 | 403 | `training.e2e-spec.ts:501-505` — unlinked assign `403`; `assertLinked` in assign (`training.service.ts:382-385`) + nested prescribe | ✅ PASS |

**Portal UI (T33/T34)**: `NutritionTemplatesPage` `/nutrition-templates` (`routes.tsx:151-158`); `PeriodizationPage` `/periodization` create 2 blocks + assign + advance (`PeriodizationPage.tsx:79-128`, `routes.tsx:161-168`). **No portal unit/e2e** — ⚠️ ok per W3/W4 notes when API covered.

**Status**: ✅ **PASS** — **0** ❌ blocking AC gaps; **2** story ⚠️ + portal/archive ⚠️ non-blocking.

**Story AC score**: **6/8** ✅ matched; **2** ⚠️ precision; **0** ❌ AC gaps

**WPORT mapping**: WPORT-15 ✅/⚠️ (unlinked prescribe e2e thin); WPORT-16 ✅/⚠️ (lazy advance e2e thin).

---

## Discrimination Sensor

Scratch mutations on live tree then restored (`cp`/`mv` backup). Suites: `nutrition.e2e-spec` / `training.e2e-spec`.

| # | Mutation | File:line (approx) | Killed? |
| - | -------- | ------------------ | ------- |
| 1 | Skip `assertLinked` in nutrition `prescribePlan` | `nutrition.service.ts:120-123` | ❌ Survived — 6/0 (no unlinked nutrition prescribe e2e) |
| 2 | Skip `assertLinked` in `assignPeriodization` | `training.service.ts:382-385` | ❌ Survived — 9/0 (nested `prescribeWorkoutPlan` still returns 403) |
| 3 | Allow `@Roles(Nutritionist, Trainer)` on template create | `nutrition.controller.ts:57-58` | ✅ Killed (trainer expect 403) — 5/1 |
| 4 | Advance `activePosition + 1` → `+ 0` | `training.service.ts:447` | ✅ Killed (expect position 1 / Block 2) — 8/1 |
| 5 | Template prescribe calories hardcode `9999` | `nutrition.service.ts:141` | ✅ Killed (expect 1800) — 5/1 |

**Sensor depth**: lightweight (5 behavior-level mutations)
**Result**: **3/5 killed** — macros/roles/advance covered; unlinked nutrition + assign-layer link check weakly discriminated — **PASS** for blocking ACs (⚠️ remain)

---

## Interactive UAT Results

Not performed (automated Verifier pass only).

---

## Gate Check

- **Gate command**: W4 — API nutrition + training e2e + portal unit / check-types / build
- **Result (this session)**:
  - API `nutrition.e2e-spec`: **6 passed**, 0 failed (includes 1 W4 case)
  - API `training.e2e-spec`: **9 passed**, 0 failed (includes 1 W4 periodization case; was 8 at W3)
  - Portal unit: **15 passed**
  - Portal check-types: **PASS**
  - Portal build: **PASS** (vite dist)
  - Portal W4 e2e: **absent**
- **Failures**: none on gates that ran

---

## Ranked Gaps

1. **⚠️ W4-01.3 unlinked nutrition prescribe e2e** — prescribe with `templateId` before link → expect `403` (kills sensor mutant 1).
2. **⚠️ W4-02.3 lazy/date advance e2e** — assignment with elapsed ≥ `durationDays` + `GET …/periodizations/active` (or student plan fetch) advances without explicit POST.
3. **⚠️ T31 archive e2e** — `POST /nutrition/templates/:id/archive` then list excludes (Done-when listed archive).
4. **⚠️ Portal nutrition/periodization UI untested (T33/T34)** — optional Playwright smoke (non-blocking; API covered).
5. **⚠️ Sensor mutant 2** — assign-layer `assertLinked` redundant with nested prescribe; optional assert on error code/body or skip nested call in a unit seam (low priority).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ (⚠️ flagged where precision thin) |
| Per-layer coverage (API happy+edge) | ✅ API happy paths; unlinked nutri + lazy thin |
| Tests map to ACs | ✅ |
| Guidelines | none — strong defaults / existing e2e patterns |

---

## Feature readiness (W1–W4 brief)

| Phase | Verdict | Residual |
| ----- | ------- | -------- |
| W1 | ✅ PASS | 1 ⚠️ accept→portal dashboard |
| W2 | ✅ PASS | several non-blocking ⚠️ |
| W3 | ✅ PASS | owner-isolation + nutri-prescribe e2e ⚠️ |
| W4 | ✅ PASS | unlinked nutri prescribe + lazy advance ⚠️ |

**Feature overall**: ✅ **Complete** pending optional ⚠️ polish — all phase Verifiers PASS; 0 ❌ AC gaps across W1–W4.

---

## Summary

**Overall**: ✅ **PASS** — no ❌ blocking AC gaps; **2** story ⚠️ + portal/archive ⚠️ non-blocking

**Spec-anchored check**: 6/8 ✅; 2 ⚠️; 0 ❌  
**Sensor**: 3/5 killed  
**Gate**: nutrition e2e **6** + training e2e **9** PASS; portal unit **15** + types + build PASS

**What works**: Nutrition template create/list/prescribe→student targets; trainer template write 403; 2-block periodization assign/advance with student plans; portal `/nutrition-templates` + `/periodization` UI shipped.

**Next steps**: Optional strengthen e2e for unlinked nutri prescribe + lazy advance + archive; feature handoff complete.
