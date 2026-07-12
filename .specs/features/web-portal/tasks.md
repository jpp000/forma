# Web Portal (Professionals) Tasks

## Execution Protocol (MANDATORY)

Implement with the **`tlc-spec-driven`** skill: follow Execute flow (per-task cycle, batch workers, Verifier). One atomic commit per task. Do not batch commits.

**Design**: `.specs/features/web-portal/design.md`  
**Spec**: `.specs/features/web-portal/spec.md`  
**Context**: `.specs/features/web-portal/context.md`  
**Status**: Approved — ready for Execute (start **W1**)

**Branch**: create from `dev` → `feature/web-portal-w1` (or continue `feature/web-portal-spec` then rename). Prefer `./scripts/git/new-feature-branch.sh feature/web-portal-w1` after merging spec docs to `dev`.

---

## Test Coverage Matrix

> Guidelines found: `AGENTS.md`, `AD-013` (API integration/e2e primary), mobile Playwright pattern (`AD-031`), Biome lint.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| API CORS / OAuth web redirect | e2e (or extend existing identity/platform e2e) | Happy path + misconfig documented; web redirect returns portal URL with token | `apps/api/test/*.e2e-spec.ts` | `cd apps/api && DATABASE_URL=… pnpm test:e2e` |
| Coaching W1 (existing dashboard/invite) | e2e (already exist) | No regression on invite/dashboard/profile 402 | `apps/api/test/coaching.e2e-spec.ts`, `billing.e2e-spec.ts` | same |
| Portal pure helpers (error map, role gates) | unit (Vitest) | All branches for 401/402/403 mapping + `isProfessionalRole` | `apps/web-portal/src/**/__tests__/*.test.ts` | `pnpm --filter @forma/web-portal test` |
| Portal screens / router | none (smoke) | Playwright: login → onboarding or dashboard | `apps/web-portal/e2e/*.spec.ts` | `pnpm --filter @forma/web-portal test:e2e` (add in T14) |
| Zustand stores | none | Covered by smoke + typecheck | — | build gate |
| Render/config | none | build gate | `render.yaml` | build gate |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-test tasks | `pnpm --filter @forma/web-portal test` |
| API | After API tasks | `cd apps/api && DATABASE_URL=postgresql://forma:forma@localhost:5432/forma pnpm test:e2e` |
| Build | After UI/scaffold tasks | `pnpm --filter @forma/web-portal check-types` + biome on touched paths |
| Full W1 | End of W1 | API e2e + portal test + check-types + portal e2e smoke |

---

## Execution Plan

### W1 (execute now) — batches ~7 tasks

```
Batch 1 — Platform:     T1 → T2 → T3 → T4
Batch 2 — Auth shell:   T5 → T6 → T7
Batch 3 — Pro workplace: T8 → T9 → T10 → T11
Batch 4 — Ship W1:      T12 → T13 → T14
```

```
T1 ──→ T4
T2 ──→ T5 (CORS needed for browser)
T3 ──→ T6 (OAuth web)
T5 ──→ T6 ──→ T7 ──→ T8 ──→ T9 ──→ T10 ──→ T11
T4 ──→ T6, T9, T10, T11
T12 parallel-ok after T7 (i18n wiring) but commit after screens exist
T13 after T1
T14 after T11 + T12
```

### W2–W4 (do not start until W1 Verifier PASS)

See [Later phases](#later-phases-w2w4--task-stubs) — expand to full atomic tasks at phase kickoff.

---

## Diagram ↔ Depends Cross-Check (W1)

| Task | Depends on (field) | Diagram OK |
|------|-------------------|------------|
| T1 | — | ✅ |
| T2 | — | ✅ |
| T3 | — | ✅ |
| T4 | T1 | ✅ |
| T5 | T1, T2 | ✅ |
| T6 | T3, T4, T5 | ✅ |
| T7 | T5, T6 | ✅ |
| T8 | T5, T7 | ✅ |
| T9 | T5, T7, T8 | ✅ |
| T10 | T5, T7, T4 | ✅ |
| T11 | T5, T7, T4 | ✅ |
| T12 | T6–T11 | ✅ |
| T13 | T1 | ✅ |
| T14 | T11, T12, T13 | ✅ |

---

## Test Co-location Validation (W1)

| Task | Layer | Tests field | Matrix OK |
|------|-------|-------------|-----------|
| T1 | scaffold | none / build | ✅ |
| T2 | API CORS | e2e update | ✅ |
| T3 | OAuth web | e2e update | ✅ |
| T4 | UI kit | none / build | ✅ |
| T5 | client + helpers | unit error/role helpers | ✅ |
| T6 | auth UI | none (smoke in T14) | ✅ |
| T7 | router | none | ✅ |
| T8–T11 | screens | none (smoke T14) | ✅ |
| T12 | i18n | none | ✅ |
| T13 | render | none | ✅ |
| T14 | e2e smoke | e2e | ✅ |

---

## Task Breakdown — W1

### T1: Scaffold `@forma/web-portal` Vite app

**What**: Create `apps/web-portal` with Vite + React + TS; wire `pnpm-workspace` / turbo `build` + `check-types` + `dev`  
**Where**: `apps/web-portal/**`, root turbo if needed  
**Depends on**: None  
**Reuses**: Monorepo package patterns from `@forma/mobile` / `@forma/api`  
**Requirement**: WPORT-01

**Done when**:
- [x] `pnpm --filter @forma/web-portal dev` starts Vite
- [x] `pnpm --filter @forma/web-portal check-types` passes (empty App OK)
- [x] Package name `@forma/web-portal`

**Tests**: none  
**Gate**: build  
**Commit**: `chore(web-portal): scaffold Vite React app`

---

### T2: Production CORS via `CORS_ORIGIN`

**What**: Register Fastify CORS whenever `CORS_ORIGIN` is set (including production), not only `NODE_ENV !== production`  
**Where**: `apps/api/src/app.configure.ts` (+ e2e or unit assertion if feasible)  
**Depends on**: None  
**Reuses**: Existing CORS options  
**Requirement**: WPORT-19, AD-039

**Done when**:
- [x] With `CORS_ORIGIN=http://localhost:5173` and `NODE_ENV=production`, API reflects Allow-Origin for that origin on OPTIONS/GET
- [x] Without `CORS_ORIGIN` in production, behavior remains safe (no open `origin: true`)
- [x] Existing API e2e still pass

**Tests**: e2e or focused test documenting CORS header  
**Gate**: API  
**Commit**: `fix(api): enable CORS from CORS_ORIGIN in production`

---

### T3: OAuth `platform=web` redirect

**What**: OAuth callback redirects to portal success URL with `accessToken` when `platform=web` (mirror mobile)  
**Where**: `apps/api/src/modules/identity/oauth/`  
**Depends on**: None  
**Reuses**: Mobile `OAUTH_MOBILE_SUCCESS_URL` pattern → add `OAUTH_WEB_SUCCESS_URL` or reuse generic success URL env  
**Requirement**: WPORT-01

**Done when**:
- [ ] `GET .../oauth/:provider?platform=web` callback redirects to configured web success URL + token query
- [ ] Mobile `platform=mobile` unchanged
- [ ] E2E or oauth test covers web branch

**Tests**: e2e  
**Gate**: API  
**Commit**: `feat(api): support OAuth platform=web redirect`

---

### T4: Theme tokens + UI primitives

**What**: `tokens.css` (Forma green, surfaces, type ramp) + `Button`, `TextField`, `Page`, `InlineError`, `DataTable` shell  
**Where**: `apps/web-portal/src/theme/`, `apps/web-portal/src/ui/`  
**Depends on**: T1  
**Reuses**: `DESIGN.md` hex roles; pro-dashboard density (compact padding)  
**Requirement**: WPORT-17

**Done when**:
- [ ] CSS variables for primary `#30D158`, surfaces, labels
- [ ] Primitives export from `src/ui`
- [ ] Light dashboard default

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add Forma tokens and UI primitives`

---

### T5: API client + sessionStore + error helpers

**What**: Thin `fetch` client (`VITE_API_URL`, Bearer, `Accept-Language`); `sessionStore` (localStorage); `mapApiError` / `isProfessionalRole` with unit tests  
**Where**: `apps/web-portal/src/api/`, `stores/sessionStore.ts`, `stores/localeStore.ts`  
**Depends on**: T1, T2  
**Reuses**: Mobile `client.ts` / `sessionStore` / `mapApiError`  
**Requirement**: WPORT-01, WPORT-02, WPORT-18

**Done when**:
- [ ] 401 clears session
- [ ] Typed helpers for 402/403/410
- [ ] Unit tests for helpers pass (quick gate)
- [ ] `identity.getMe`, wire pattern ready

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(web-portal): add API client and session store`

---

### T6: Auth screens (OTP + OAuth)

**What**: `/login` — email OTP request/verify; OAuth buttons with `platform=web`; `__DEV__`/mock helpers if API mock available  
**Where**: `apps/web-portal/src/features/auth/`  
**Depends on**: T3, T4, T5  
**Reuses**: Mobile auth flow copy/i18n ideas; identity OTP endpoints  
**Requirement**: WPORT-01

**Done when**:
- [ ] OTP request + verify stores token via sessionStore
- [ ] OAuth links hit API with `platform=web`
- [ ] Success navigates to gate (T7)

**Tests**: none (smoke T14)  
**Gate**: build  
**Commit**: `feat(web-portal): add OTP and OAuth login`

---

### T7: Router auth gates

**What**: React Router routes: public `/login`; authed without pro role → `/onboarding`; pro role → `/` dashboard + `/invites`; 401 → login  
**Where**: `apps/web-portal/src/app/`  
**Depends on**: T5, T6  
**Reuses**: Design route map  
**Requirement**: WPORT-01, WPORT-02

**Done when**:
- [ ] Unauthenticated users cannot open dashboard
- [ ] Professional role lands on dashboard
- [ ] Non-pro authed lands on onboarding

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add protected routes`

---

### T8: Billing checkout in onboarding

**What**: Onboarding paywall calls `POST /api/billing/checkout` with `planSlug: professional`; redirect to returned `url`; handle errors  
**Where**: `apps/web-portal/src/features/onboarding/`, `api/billing.ts`  
**Depends on**: T5, T7  
**Reuses**: Billing controller checkout  
**Requirement**: WPORT-03

**Done when**:
- [ ] Checkout button works against mock/real URL
- [ ] Failure shows InlineError

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add professional checkout CTA`

---

### T9: Create professional profile form

**What**: Form type (`trainer` \| `nutritionist`) + credentials (+ optional displayName/bio); `POST /api/coaching/profile`; map 402 → checkout CTA  
**Where**: `apps/web-portal/src/features/onboarding/`  
**Depends on**: T5, T7, T8  
**Reuses**: `CreateCoachingProfileDto`  
**Requirement**: WPORT-04

**Done when**:
- [ ] Success refreshes `me` and routes to dashboard
- [ ] 402 shows paywall (WPORT-04)
- [ ] Validation prevents empty credentials

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add professional profile onboarding`

---

### T10: Dashboard roster

**What**: `dashboardStore.fetch` → `GET /api/coaching/dashboard`; table of students + lastWorkout/lastMeal/weightTrend; empty + error + retry  
**Where**: `apps/web-portal/src/features/dashboard/`  
**Depends on**: T5, T7, T4  
**Reuses**: Coaching dashboard DTO  
**Requirement**: WPORT-05, WPORT-06

**Done when**:
- [ ] Renders linked students
- [ ] Empty state CTA links to `/invites`
- [ ] Error + Retry works

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add coaching dashboard`

---

### T11: Email invite form

**What**: `/invites` — email field → `POST /api/coaching/invites`; success + 7-day hint; localized API errors  
**Where**: `apps/web-portal/src/features/invites/`  
**Depends on**: T5, T7, T4  
**Reuses**: CreateInviteDto  
**Requirement**: WPORT-07

**Done when**:
- [ ] Successful invite shows confirmation
- [ ] Invalid email / API errors visible

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add student invite form`

---

### T12: Portal i18n pt-BR + en

**What**: `portal.*` keys for auth, onboarding, dashboard, invites, common errors; locale from `Accept-Language` / localeStore  
**Where**: `apps/web-portal/src/i18n/`  
**Depends on**: T6–T11 (wire strings)  
**Reuses**: Mobile i18n pattern; AD-018  
**Requirement**: WPORT-18

**Done when**:
- [ ] Switching locale updates UI strings
- [ ] API client sends `Accept-Language`

**Tests**: none  
**Gate**: build  
**Commit**: `feat(web-portal): add pt-BR and en i18n`

---

### T13: Render static service + docs

**What**: Add `forma-web-portal` static site to `render.yaml`; document env (`VITE_API_URL`, `OAUTH_WEB_SUCCESS_URL`, `CORS_ORIGIN`) in `AGENTS.md` or `apps/web-portal/README.md`  
**Where**: `render.yaml`, `apps/web-portal/README.md`, `AGENTS.md` (short section)  
**Depends on**: T1  
**Reuses**: Existing render API service  
**Requirement**: WPORT-19

**Done when**:
- [ ] SPA rewrite to `index.html` documented/configured
- [ ] README lists local + Render env vars

**Tests**: none  
**Gate**: build  
**Commit**: `chore(web-portal): add Render static service and README`

---

### T14: W1 smoke e2e + Verifier prep

**What**: Playwright (or Vitest+jsdom minimal) smoke: open login → (mock login if available) → reach onboarding or dashboard; `testID`/`data-testid` on key controls  
**Where**: `apps/web-portal/e2e/`  
**Depends on**: T11, T12, T13  
**Reuses**: Mobile Playwright spirit AD-031; API `OAUTH_MOCK` / OTP mock  
**Requirement**: WPORT-01–07 smoke

**Done when**:
- [ ] `pnpm --filter @forma/web-portal test:e2e` (or documented smoke) passes against local API
- [ ] Full W1 gate green
- [ ] Update `.specs/STATE.md` Handoff: W1 Execute complete pending Verifier

**Tests**: e2e  
**Gate**: full W1  
**Commit**: `test(web-portal): add W1 auth dashboard smoke`

---

## Later phases (W2–W4) — task stubs

Expand to atomic tasks at phase start (same protocol). Do **not** implement now.

### W2 stubs
- API: extend pro profile public fields + migration  
- API: list/get public professionals  
- API: link request create/list/accept/decline + e2e  
- Portal: profile publish editor + requests inbox  
- Mobile: Professionals tab + detail + request  
- E2E + Verifier W2  

### W3 stubs
- API: training templates CRUD + e2e  
- API: prescribe plan to linked student + e2e  
- Portal: template library + prescribe UI  
- Mobile: verify prescribed plan visible  
- Verifier W3  

### W4 stubs
- API: nutrition templates + prescribe-from-template  
- API: periodization + assign + lazy advance + e2e  
- Portal: nutrition templates + periodization builder  
- Mobile: active block plan  
- Verifier W4 + final feature validation.md  

---

## Requirement → Task map (W1)

| ID | Task |
|----|------|
| WPORT-01 | T1, T3, T5, T6, T7, T14 |
| WPORT-02 | T5, T7 |
| WPORT-03 | T8 |
| WPORT-04 | T9 |
| WPORT-05 | T10 |
| WPORT-06 | T10 |
| WPORT-07 | T11 |
| WPORT-17 | T4 |
| WPORT-18 | T5, T12 |
| WPORT-19 | T2, T13 |
| WPORT-08–16 | W2–W4 stubs |

---

## How to start Execute (copy-paste)

```bash
git fetch origin && git checkout dev && git pull --ff-only origin dev
# after spec branch merged to dev:
./scripts/git/new-feature-branch.sh feature/web-portal-w1

# prompt for agent / self:
# /tlc-spec-driven implement web-portal W1 starting at T1
# Follow .specs/features/web-portal/tasks.md — one commit per task
```

**Tools for Execute** (confirm if you want restrictions):
- Default: repo shell, Prisma/API e2e, Vite, Playwright, Biome
- Skills: `tlc-spec-driven`, `coding-guidelines`, `tdd` as needed
- MCP: Render (deploy later), browser for smoke

---

## Confirm

Tasks approved for W1 Execute. Say **implement W1** / **começa no T1** to start coding, or adjust tasks first.
