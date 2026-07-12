# Web Portal W1 Validation

**Date**: 2026-07-12
**Spec**: `.specs/features/web-portal/spec.md`
**Diff range**: `7f9df09c..6933707` (`origin/dev` merge-base..`feature/web-portal-w1` HEAD)
**Verifier**: independent sub-agent (author ≠ verifier)
**Scope**: W1 only (WPORT-01–07, WPORT-17–19)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1–T14 | ✅ Marked done in tasks.md | Implementation present on branch |

---

## Spec-Anchored Acceptance Criteria (W1)

### P1 / W1-01: Portal scaffold & auth (WPORT-01, WPORT-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN operator deploys portal THEN Vite+React SPA on Render | Static site `forma-web-portal` with SPA rewrite | `render.yaml:26-36` — `runtime: static`, `staticPublishPath: apps/web-portal/dist`, rewrite `/*`→`/index.html`; `apps/web-portal/package.json:7-8` — `"dev": "vite"` | ✅ PASS (structural) |
| WHEN User completes OTP/OAuth THEN store Bearer + call `GET /api/identity/me` | Token persisted; `getMe` invoked | `apps/api/test/identity.e2e-spec.ts:317-322` — OAuth web redirect `accessToken` present; portal smoke `e2e/w1-smoke.spec.ts:26-31` only asserts post-login shell (no `localStorage` / `getMe` assertion) | ❌ GAP |
| WHEN User has no trainer/nutritionist role THEN guide to paid onboarding | Navigate to onboarding | `errors.test.ts:40-43` — `isProfessionalRole(['student'])` false; smoke `w1-smoke.spec.ts:26-31` allows onboarding **OR** dashboard | ❌ GAP |
| WHEN API returns 401 THEN clear session and return to auth | `clearSession` + login | `errors.test.ts:6-9` — maps 401→`unauthorized` only; **no** assertion that `onUnauthorized`/`clearSession` runs (`wire.ts:12-14` untested) | ❌ GAP |

### P1 / W1-02: Paid professional signup & profile (WPORT-03, WPORT-04)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN User starts professional signup THEN checkout for **professional** plan | `POST /api/billing/checkout` with professional plan | Implementation `billing.ts:7-11` sends `planSlug: 'professional'`; billing e2e `billing.e2e-spec.ts:76-85` uses `student_pro` — **no** assertion of portal professional checkout | ❌ GAP |
| WHEN lacks entitlement + create-profile THEN 402 + portal paywall CTA | API 402; portal shows checkout CTA | `billing.e2e-spec.ts:159-168` — `expect(response.status).toBe(402)`; `errors.test.ts:12-15` — `payment_required`; **no** UI assertion CheckoutPanel on 402 | ❌ GAP (portal CTA) |
| WHEN entitled User submits trainer/nutritionist profile THEN profile created + roles on `/identity/me` | 201 + role on me | `coaching.e2e-spec.ts:103-110` — `expect(response.status).toBe(201)`; `expect(me.body.roles).toContain('trainer')` | ✅ PASS (API/system) |
| WHEN profile created THEN collect type + credentials (min) | type + credentials text | Form in `ProfileForm.tsx` — **no** test asserts required credentials / type radios | ❌ GAP |

### P1 / W1-03: Client dashboard (WPORT-05, WPORT-06)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Professional opens dashboard THEN render linked students from `GET /api/coaching/dashboard` | Students listed from API | `coaching.e2e-spec.ts:225-227` — students length/email; portal does not assert roster render | ❌ GAP (portal) |
| WHEN student has lastWorkout/lastMeal/weightTrend THEN display those fields | Columns show summary fields | Columns in `DashboardPage.tsx:28-42`; **no** test asserts field display (API e2e also omits) | ❌ GAP |
| WHEN zero links THEN empty state + CTA to invite | Empty UI + link `/invites` | Smoke may hit `dashboard-empty` optionally (`w1-smoke.spec.ts:28-30`) but OR-chain does not require empty CTA | ❌ GAP |
| WHEN dashboard fails THEN recoverable error + retry | Error + retry action | `dashboard-retry` in `DashboardPage.tsx:71` — **no** test | ❌ GAP |

### P1 / W1-04: Email invites (WPORT-07)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Professional submits student email THEN `POST /api/coaching/invites` + success with 7-day expiry hint | Success UI mentions 7 days | API invite in `coaching.e2e-spec.ts:124-135`; i18n `en.ts:67` / `pt-BR.ts:65` have 7-day copy; **no** test asserts success string / invite UI | ❌ GAP |
| WHEN invite API returns validation/rate errors THEN localized message | Visible localized error | `mapApiError` validation branch untested for invites; no invite-error e2e | ❌ GAP |
| WHEN Student accepts via accept API THEN appears on dashboard after refresh | Linked student on dashboard | `coaching.e2e-spec.ts:221-227` — dashboard lists student after accept; portal refresh path untested | ⚠️ Spec-precision gap (API yes / portal refresh no) |

### Cross-cutting (WPORT-17–19)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WPORT-17 Design: pro dashboard × Forma brand | Primary `#30D158`, light surfaces | `tokens.css:2-11` — `--color-primary: #30d158` etc. | ✅ PASS (structural) / ⚠️ no visual gate |
| WPORT-18 i18n pt-BR + en | Switching locale updates UI; Accept-Language sent | `w1-smoke.spec.ts:16-19` — EN button text `/Continue with email/i`; Accept-Language `client.ts:45-46` **untested** | ⚠️ Spec-precision gap |
| WPORT-19 CORS + Render | Prod CORS from `CORS_ORIGIN`; portal on Render | `cors.e2e-spec.ts:47-50` — Allow-Origin `http://localhost:5173`; `cors.e2e-spec.ts:66-67` — undefined when unset; `render.yaml:26-36` | ✅ PASS |

**Status**: ❌ Gaps present (majority of portal ACs lack evidence-or-zero citations)

---

## Discrimination Sensor

Scratch-only (temp Node mirrors of `errors.test.ts` assertions + CORS e2e logic). Real tree not mutated. Vitest-in-worktree blocked by readonly sandbox; equivalent assertions executed.

| Mutation | File:line (intended) | Description | Killed? |
| -------- | -------------------- | ----------- | ------- |
| 1 | `errors.ts:21-27` | 401 mapped as `payment_required` | ✅ Killed (`errors.test.ts` 401→unauthorized) |
| 2 | `errors.ts:62-68` | `isProfessionalRole` always false | ✅ Killed (trainer/nutritionist true cases) |
| 3 | `errors.ts:28-33` | 402 mapped as `unauthorized` | ✅ Killed (402→payment_required) |
| 4 | `app.configure.ts:6-17` | Ignore `CORS_ORIGIN` in production | ✅ Killed (cors e2e Allow-Origin expectation) |
| 5 | `i18n/en.ts:67` | Drop “7 days” from invite success | ❌ Survived — no test asserts expiry hint |
| 6 | `DashboardPage.tsx:64-78` | Remove retry action | ❌ Survived — no test hits `dashboard-retry` |
| 7 | `billing.ts:10` | `planSlug: 'student_pro'` instead of `professional` | ❌ Survived — no portal/API assertion for portal checkout body |

**Sensor depth**: lightweight (+ surviving-mutant probe on untested UI)
**Result**: 4/7 killed, 3 survived — FAIL ❌

---

## Interactive UAT Results

Not performed (Verifier automated pass only).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep (W1 surface) | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ❌ many ACs lack matching assertions |
| Per-layer Coverage Expectation | ❌ portal screens/routes lack happy+edge+error beyond thin smoke |
| Every test maps to a spec AC | ✅ smoke/unit/API map to W1; depth insufficient |
| Documented guidelines | ✅ `AGENTS.md`, tasks matrix, AD-013/AD-031 spirit |

---

## Edge Cases (W1-relevant)

- [x] CORS misconfig → network mapping: `errors.test.ts:26-28` TypeError→`network`
- [~] Subscription lapse 402 + renew CTA: API 402 on profile; portal paywall path untested
- [ ] Invite expired 410; portal invite UI allow resend: API `coaching.e2e-spec.ts:167` 410; portal has no resend UX
- [x] student+professional → pro role true: `errors.test.ts:36-37`
- [ ] W2-only edges (duplicate request, public 404) — out of W1 scope

---

## Gate Check

- **Gate command**: Full W1 — API e2e (cors/identity/coaching/billing) + `pnpm --filter @forma/web-portal test` + `check-types` + portal e2e smoke
- **Result**:
  - Portal unit: **8 passed**, 0 failed
  - Portal check-types: **pass**
  - API e2e (cors + identity + coaching + billing): **30 passed** (2 + 28), 0 failed
  - Portal e2e (prior CI run on branch): **2 passed, 1 flaky** (mock-login timeout then retry pass); overall exit 0
- **Test count before feature**: 0 portal tests (`apps/web-portal` absent at merge-base)
- **Test count after feature**: 8 unit + 3 e2e + 2 new cors e2e (+ oauth web case in identity)
- **Delta**: +13 portal/cors-focused new tests (approx.)
- **Skipped**: none
- **Failures**: none on final exit; **flaky** mock-login smoke is a reliability defect

---

## Fix Plans

### Fix 1: Close portal AC evidence gaps (Blocker)

- **Root cause**: Tasks T6–T11 deferred UI tests to T14 smoke; smoke only covers login shell + locale + OTP navigation — not W1-02/03/04 outcomes.
- **Fix task**: Extend Playwright (or Vitest+msw) to assert: Bearer in storage after login; non-pro → `onboarding-checkout`; checkout POST body `planSlug: 'professional'`; 402 → paywall visible; invite success contains 7-day hint; dashboard empty CTA → `/invites`; dashboard error+retry; optional roster field columns with mocked API.
- **Verify**: Each W1 AC has `file:line` assertion matching spec outcome; re-run Full W1 gate; re-run discrimination sensor (mutants 5–7 must die).
- **Priority**: Blocker

### Fix 2: Assert 401 clears session (Blocker)

- **Root cause**: Unit tests cover `mapApiError` kinds only, not `createApiClient` `onUnauthorized` → `clearSession`.
- **Fix task**: Unit-test client 401 invokes `onUnauthorized`; optionally e2e expired token → `/login`.
- **Priority**: Blocker

### Fix 3: Stabilize mock-login smoke (Major)

- **Root cause**: Flaky timeout waiting for onboarding/dashboard (observed 120s timeout then retry pass).
- **Fix task**: Harden e2e stack readiness / mock OTP path; fail fast with diagnostics; avoid relying on CI retry alone.
- **Priority**: Major

---

## Requirement Traceability Update (recommended; not applied — read-only)

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| WPORT-01 | In progress | ❌ Needs Fix |
| WPORT-02 | Pending | ❌ Needs Fix |
| WPORT-03 | Pending | ❌ Needs Fix |
| WPORT-04 | Pending | ❌ Needs Fix |
| WPORT-05 | Pending | ❌ Needs Fix |
| WPORT-06 | Pending | ❌ Needs Fix |
| WPORT-07 | Pending | ❌ Needs Fix |
| WPORT-17 | Pending | ⚠️ Structural only |
| WPORT-18 | Pending | ⚠️ Partial (locale smoke) |
| WPORT-19 | Pending | ✅ Verified (CORS + Render config) |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: ~6/15+ W1 ACs with solid evidence; majority GAP / precision gaps
**Sensor**: 4 killed, 3 survived
**Gate**: commands green with flaky portal smoke

**What works**: Vite portal scaffold, Render static+rewrite, production CORS via `CORS_ORIGIN`, OAuth `platform=web` redirect, error/role helpers unit-tested, API coaching profile/invite/dashboard + profile 402, locale switcher smoke.

**Issues found**: Portal workplace ACs largely unproven by tests; session 401 clear untested; invite 7-day hint / checkout planSlug / dashboard retry would survive mutation; mock-login flaky.

**Next steps**: Implement Fix 1–3; re-verify (max 3 iterations). Do not start W2 until Verifier PASS.
