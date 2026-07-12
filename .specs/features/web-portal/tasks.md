# Web Portal (Professionals) Tasks

## Execution Protocol (MANDATORY)

Implement with the **`tlc-spec-driven`** skill: follow Execute flow (per-task cycle, batch workers, Verifier). One atomic commit per task. Do not batch commits.

**Design**: `.specs/features/web-portal/design.md`  
**Spec**: `.specs/features/web-portal/spec.md`  
**Context**: `.specs/features/web-portal/context.md`  
**Status**: W1 Verifier PASS — W2 Execute in progress (T15+)

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
- [x] `GET .../oauth/:provider?platform=web` callback redirects to configured web success URL + token query
- [x] Mobile `platform=mobile` unchanged
- [x] E2E or oauth test covers web branch

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
- [x] CSS variables for primary `#30D158`, surfaces, labels
- [x] Primitives export from `src/ui`
- [x] Light dashboard default

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
- [x] 401 clears session
- [x] Typed helpers for 402/403/410
- [x] Unit tests for helpers pass (quick gate)
- [x] `identity.getMe`, wire pattern ready

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
- [x] OTP request + verify stores token via sessionStore
- [x] OAuth links hit API with `platform=web`
- [x] Success navigates to gate (T7)

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
- [x] Unauthenticated users cannot open dashboard
- [x] Professional role lands on dashboard
- [x] Non-pro authed lands on onboarding

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
- [x] Checkout button works against mock/real URL
- [x] Failure shows InlineError

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
- [x] Success refreshes `me` and routes to dashboard
- [x] 402 shows paywall (WPORT-04)
- [x] Validation prevents empty credentials

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
- [x] Renders linked students
- [x] Empty state CTA links to `/invites`
- [x] Error + Retry works

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
- [x] Successful invite shows confirmation
- [x] Invalid email / API errors visible

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
- [x] Switching locale updates UI strings
- [x] API client sends `Accept-Language`

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
- [x] SPA rewrite to `index.html` documented/configured
- [x] README lists local + Render env vars

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
- [x] `pnpm --filter @forma/web-portal test:e2e` (or documented smoke) passes against local API
- [x] Full W1 gate green
- [x] Update `.specs/STATE.md` Handoff: W1 Execute complete pending Verifier

**Tests**: e2e  
**Gate**: full W1  
**Commit**: `test(web-portal): add W1 auth dashboard smoke`

---

## Later phases (W2–W4)

### W2 — Discovery & requests (Execute now — W1 Verifier PASS)

```
Batch W2-A — API data:     T15 → T16 → T17 → T18
Batch W2-B — Portal:       T19 → T20
Batch W2-C — Mobile:       T21 → T22
Batch W2-D — Ship:         T23
```

#### T15: Profile public fields + link-request migration

**What**: Extend `CoachingProfessionalProfile` with `displayName`, `bio`, `slug`, `isPublished`; add `CoachingLinkRequest`  
**Where**: `prisma/schema.prisma`, new migration  
**Depends on**: W1 done  
**Requirement**: WPORT-08, WPORT-10  

**Done when**:
- [x] Migration applies cleanly
- [x] Prisma client generates new models/fields

**Tests**: none (schema)  
**Gate**: build (`pnpm db:generate`)  
**Commit**: `feat(api): add public profile fields and link requests`

---

#### T16: PATCH professional profile (publish fields)

**What**: `PATCH /api/coaching/profile` for displayName/bio/slug/isPublished; validate slug uniqueness  
**Where**: coaching controller/service/DTO  
**Depends on**: T15  
**Requirement**: WPORT-08  

**Done when**:
- [ ] Pro can update publish fields
- [ ] Unpublished/incomplete stays non-public
- [ ] E2E covers happy path + slug conflict

**Tests**: e2e  
**Gate**: API  
**Commit**: `feat(api): allow professionals to update public profile`

---

#### T17: Public professionals list + get

**What**: `GET /api/coaching/professionals` (browse/search published); `GET /api/coaching/professionals/:idOrSlug` public DTO (no private data)  
**Where**: coaching module  
**Depends on**: T15, T16  
**Requirement**: WPORT-08, WPORT-09  

**Done when**:
- [ ] Unauthenticated get by id/slug returns 200 public payload
- [ ] Unpublished → 404
- [ ] List returns only `isPublished=true`
- [ ] E2E covers public read + 404

**Tests**: e2e  
**Gate**: API  
**Commit**: `feat(api): expose public professional profiles`

---

#### T18: Link request create / list / accept / decline

**What**: Student `POST /requests`; pro `GET /requests`; accept→link; decline→closed; idempotent pending  
**Where**: coaching module + e2e  
**Depends on**: T15  
**Requirement**: WPORT-10, WPORT-11  

**Done when**:
- [ ] Pending unique per student↔pro (service)
- [ ] Accept creates `CoachingLink` and clears pending
- [ ] Decline closes without link
- [ ] 401/403 for wrong roles
- [ ] Invite flow still works (no regression)
- [ ] E2E covers request→accept and decline

**Tests**: e2e  
**Gate**: API  
**Commit**: `feat(api): add coaching link request flow`

---

#### T19: Portal profile publish editor

**What**: Screen to edit displayName/bio/slug/published; save via PATCH  
**Where**: `apps/web-portal/src/features/profile/`  
**Depends on**: T16  
**Requirement**: WPORT-08  

**Done when**:
- [ ] Pro can publish and see success
- [ ] Validation errors visible

**Tests**: none (smoke T23)  
**Gate**: build  
**Commit**: `feat(web-portal): add public profile editor`

---

#### T20: Portal pending requests inbox

**What**: List pending requests; accept/decline actions  
**Where**: `apps/web-portal/src/features/requests/`  
**Depends on**: T18  
**Requirement**: WPORT-11  

**Done when**:
- [ ] Shows requester identity
- [ ] Accept/decline update list

**Tests**: none (smoke T23)  
**Gate**: build  
**Commit**: `feat(web-portal): add link request inbox`

---

#### T21: Mobile Professionals tab (list)

**What**: New tab + list/search published pros; `professionalsStore`  
**Where**: `apps/mobile/app/(tabs)/professionals/`, stores, API client, i18n  
**Depends on**: T17  
**Requirement**: WPORT-09  

**Done when**:
- [ ] Authenticated student opens Professionals tab
- [ ] List loads; error+retry
- [ ] Follows DESIGN.md tokens

**Tests**: unit/store as needed; e2e smoke in T23  
**Gate**: build (`@forma/mobile` check-types + test)  
**Commit**: `feat(mobile): add Professionals discovery tab`

---

#### T22: Mobile professional detail + request CTA

**What**: Detail screen from public profile; request coaching button  
**Where**: mobile professionals feature  
**Depends on**: T18, T21  
**Requirement**: WPORT-09, WPORT-10  

**Done when**:
- [ ] Detail shows public fields
- [ ] Request creates pending (idempotent UX)
- [ ] Errors recoverable

**Tests**: none (smoke T23)  
**Gate**: build  
**Commit**: `feat(mobile): request coaching from professional profile`

---

#### T23: W2 smoke + Verifier

**What**: API e2e green for new endpoints; portal/mobile smoke; Verifier writes/extends validation  
**Depends on**: T19–T22  
**Requirement**: WPORT-08–11  

**Done when**:
- [ ] Gates green
- [ ] STATE handoff W2 complete pending/after Verifier
- [ ] Verifier PASS for W2 ACs

**Tests**: e2e  
**Gate**: full W2  
**Commit**: `test(web-portal): add W2 discovery smoke` (+ verifier docs commit)

---

### W3–W4 stubs (do not start until W2 Verifier PASS)

#### W3 stubs
- API: training templates CRUD + e2e  
- API: prescribe plan to linked student + e2e  
- Portal: template library + prescribe UI  
- Mobile: verify prescribed plan visible  
- Verifier W3  

#### W4 stubs
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
| WPORT-08 | T15–T17, T19 |
| WPORT-09 | T17, T21, T22 |
| WPORT-10 | T15, T18, T22 |
| WPORT-11 | T18, T20 |

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
