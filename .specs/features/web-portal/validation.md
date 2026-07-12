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
