# Forma — Project State

## Decisions Log

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| AD-001 | **Simple modular monolith** — one NestJS module per bounded context under `apps/api/src/modules/[context]/` | User explicitly rejects Clean Architecture ceremony (no domain/application/infrastructure layers, no CQRS). Services hold business logic; Prisma used directly. | 2026-07-07 |
| AD-002 | **Turborepo monorepo** with `apps/*` + `packages/*` | Already scaffolded; good fit for API + mobile + web apps sharing types. | 2026-07-07 |
| AD-003 | **REST API** with Swagger/OpenAPI | Public API for mobile and web clients; well-understood, easy to test with Supertest. | 2026-07-07 |
| AD-004 | **Render deploy: API + Postgres only** (no worker/Redis in MVP) | README and render.yaml already configured; async jobs deferred until IA/WhatsApp/notifications. | 2026-07-07 |
| AD-005 | **Worker + Redis deferred** | BullMQ worker exists locally but not deployed; no background jobs in MVP. | 2026-07-07 |
| AD-006 | **Single Prisma schema** with table prefixes per module (`identity_`, `training_`, etc.) | Pragmatic state ownership without multiple databases; prefix signals module boundary. | 2026-07-07 |
| AD-007 | **Cross-module communication: pragmatic** — exported module services for sync reads; NestJS EventEmitter for side effects | No event sourcing, no message bus. Direct service injection acceptable when coupling is low. | 2026-07-07 |
| AD-008 | **Auth: email OTP + OAuth P1** — Google, Apple, Facebook alongside email OTP | User confirmed OAuth ships in MVP Phase 1, not P2. | 2026-07-07 |
| AD-009 | **Roles derived from profiles** — not a fixed account type | CONTEXT.md: User can be student + trainer simultaneously; roles computed from StudentProfile/ProfessionalProfile presence. | 2026-07-07 |
| AD-010 | **MVP clients: API-first** — mobile/web UI shells come after API vertical slices | Backend delivers value first; Expo and web-portal consume REST. | 2026-07-07 |
| AD-011 | **Billing: Stripe** — student `free`/`pro` + professional paid-only; Pro gates AI food | Students free without AI; professionals require paid subscription; AI food Pro-only (P2 feature). | 2026-07-07 |
| AD-012 | **Guidance: rule-based** (no AI in MVP) | Suggestions from health goal + activity data; AI food photo is P2. | 2026-07-07 |
| AD-013 | **Integration tests** as primary test strategy (Supertest + test DB) | No unit-test ceremony; e2e per acceptance criteria. Strong default from tlc-spec-driven. | 2026-07-07 |
| AD-014 | **Fastify adapter** (already in scaffold) | Performance; already chosen in main.ts. | 2026-07-07 |
| AD-015 | **Shared types in `packages/types`** | DTOs stay in API modules; shared enums/interfaces for clients. | 2026-07-07 |
| AD-016 | **OAuth P1** — Google, Apple, Facebook in Phase 1 alongside email OTP | User confirmed; not deferred to P2. | 2026-07-07 |
| AD-017 | **Stripe entitlements** — student free/pro; professional paid-only; AI food Pro-gated | Monetization model confirmed: students can use free tier without AI; trainers/nutritionists need paid plan. | 2026-07-07 |
| AD-018 | **i18n pt-BR + en** — full API and user-facing string support from MVP | Not UI-only later; `Accept-Language` drives localized errors and messages. | 2026-07-07 |
| AD-019 | **OTP via Resend** — production email; mock in dev/test | Confirmed email provider for OTP delivery. | 2026-07-07 |
| AD-020 | **Manual food/training MVP**; curated food DB + exercise video library P2 | MVP: manual macro logging and manual exercise setup; searchable food DB and video library explicit P2 scope. | 2026-07-07 |
| AD-021 | **Mobile visual system = Apple Fitness Summary × Forma green** | Prototype Variant A accepted; Wise/Shopify rejected. Docs in `DESIGN.md` + `.specs/ui/`. Expo prototype deleted — scaffold from specs. | 2026-07-08 |
| AD-022 | **Color roles:** primary `#30D158` for brand/CTAs; Move pink `#FA114F` for outer ring/energy only | Keep three-ring Activity read while Forma owns chrome. | 2026-07-08 |
| AD-023 | **Frontend starts clean via tlc-spec-driven** — no committed Expo prototype | `apps/mobile` removed; UI rules and Apple Fitness anatomy live under `.specs/ui/` + root `DESIGN.md`. | 2026-07-08 |
| AD-024 | **Mobile MVP = student-only, slice-based** — one feature folder/spec per vertical slice; no pro UI in Expo yet | Context optimization + shippable demos; professional web later | 2026-07-08 |
| AD-025 | **Theme: light + dark** from first mobile scaffold | User requested; dark = canonical Apple Fitness black; light = surfaces remapped, same green brand | 2026-07-08 |
| AD-026 | **Mobile MVP UI out of scope:** billing screens, multi-profile switcher, coaching chat | Deferred; invite-accept may ship later as thin flow if needed | 2026-07-08 |
| AD-027 | **Training streak protection (priority):** (1) explicit rest-day mark → (2) plan-scheduled rest → (3) at most 1 grace gap per Mon–Sun week; 2nd gap resets. Nutrition streak unchanged. | Happy path includes rest; API+UI in Slice 2 `mobile-training` | 2026-07-08 |
| AD-028 | **Mobile navigation** = Expo Router Protected routes (SDK 53+); JWT in SecureStore | Current Expo auth pattern; secure token storage | 2026-07-08 |
| AD-029 | **Mobile API client** = thin `fetch` + `EXPO_PUBLIC_API_URL`; onboarding gate = `student` role from `GET /identity/me` | Simple; matches MeResponseDto roles | 2026-07-08 |
| AD-030 | **Mobile client state = Zustand** — session, locale, and per-slice feature state live in Zustand stores under `apps/mobile/src/stores/`; thin hooks (`useSession`, `useLocale`) read stores; **no React Context** for app state | Session + locale migrated from Context; theme follows system via `useColorScheme` in `useFormaTheme()` (no store until user override); `SessionBootstrap` runs SecureStore restore on mount; API client wired via `wireApiStores` | 2026-07-08 |
| AD-031 | **Mobile web testing = Expo Web + Playwright** — agents and CI smoke the student UI in Chromium at `http://localhost:19006`; `testID` on auth/onboarding/tabs; API dev CORS enables browser `PUT` (student goal); SecureStore → `localStorage` on web | No iOS/Android simulator in Cursor Cloud; `pnpm --filter @forma/mobile test:e2e` boots Postgres + API mock + Expo web; see `AGENTS.md` | 2026-07-09 |

## Mobile slice roadmap (student)

Execute **one slice at a time**. Each slice = `.specs/features/[name]/` + own chat/agent. Do **not** parallelize slices that both edit `apps/mobile` until Slice 0 lands.

**Mobile state (AD-030):** All client state uses **Zustand** (`src/stores/`). Session + locale migrated; theme = `useFormaTheme()` + system scheme. New slices add a store per feature domain — no React Context for app state.

| # | Feature folder | Ships | Depends on | Typical agent prompt |
|---|----------------|-------|------------|----------------------|
| **0** | `mobile-foundation` | Expo app, tokens light/dark, i18n, nav shell, API client, Auth (OAuth+OTP), Student onboarding | API | `/tlc-spec-driven implement mobile-foundation` |
| **1** | `mobile-home-summary` | Home Summary (rings, tiles, guidance, CTA), tab bar | Slice 0 | new chat + STATE handoff |
| **2** | `mobile-training` | Exercises, plans, session log, **rest day** | Slice 0–1 | after Home |
| **3** | `mobile-nutrition` | Meal log macros, daily summary vs plan | Slice 0–1 | parallel-ok **after** Slice 0 if Home done or queued |
| **4** | `mobile-progress` | Weight log, streaks UI, history | Slice 0–1 + rest-day API from 2 | after training streak rule |
| **5** | `mobile-invite-accept` *(optional thin)* | Accept coaching invite deep link | Slice 0 | P2-ish if not blocking daily loop |

**Multi-agent playbook:**
1. Parent chat holds roadmap + STATE; never loads >1 full feature spec.
2. Per slice: Specify → Design → Tasks → Execute in a **dedicated agent/chat** (fresh context).
3. Inside a slice with >~8 tasks: offer batch workers (~7 tasks/batch), sequential batches.
4. After last task of a slice: Verifier runs automatically; update STATE Handoff before starting next slice.
5. Parallel only Slice 3 vs polish-on-2 once foundations + contracts are frozen — prefer sequential until Home ships.

## MVP Scope Boundaries

**In scope (P1) — API (done) + mobile student slices 0–4:**
1. Monorepo structure + shared packages + test harness + i18n (pt-BR + en)
2. Identity/Auth (email OTP via Resend, OAuth Google/Apple/Facebook, JWT sessions)
3. Student onboarding + health goal + rule-based guidance
4. Training (manual exercise creation, workout plan, session logging) + rest day ≠ streak break
5. Nutrition (manual macro/meal logging, prescribed plan)
6. Progress (weight tracking, streaks)
7. Coaching (professional-student link, invite, basic dashboard API; professional subscription required) — API only; thin invite-accept UI optional
8. Billing (Stripe) — API only; no mobile billing UI yet
9. Mobile Expo student surfaces (Slices 0–4), light + dark

**Out of scope (P2+):**
- AI food photo analysis (Pro-gated when shipped)
- Curated food database (searchable; TACO/USDA)
- Exercise library with instructional videos
- WhatsApp integration
- Billing UI / paywall screens on mobile
- Multi-profile switcher in app
- Coaching chat
- Web portal UI (professionals)
- Advanced periodization
- WhatsApp groups
- Worker/Redis deploy

## Handoff

**Backend:** `platform-foundation` — MVP P1 API complete (merge to `main` as needed). Streak today resets on gap day — rest-day rule **not** implemented yet (AD-027).

**Frontend:** `mobile-home-summary` **Execute complete** (T1–T16) on `feature/home-summary`. Slice 1 ships Home Summary (rings, tiles, guidance, CTA), Zustand `homeStore` (AD-030), pull-to-refresh, tab bar icons, and i18n `home.*` keys. **Verifier PASS** — see `.specs/features/mobile-home-summary/validation.md`.

| Item | Value |
|------|-------|
| Branch | `feature/home-summary` |
| Package | `@forma/mobile` → `apps/mobile` |
| Run | `pnpm install` → `pnpm --filter @forma/mobile start` (simulador) **ou** `pnpm --filter @forma/mobile dev:web` → `http://localhost:19006` (API: `pnpm --filter @forma/api dev`) |
| Env | `EXPO_PUBLIC_API_URL` (default `http://localhost:3000`); `EXPO_PUBLIC_OAUTH_SUCCESS_URL` (default `forma://oauth`); API `OAUTH_MOCK=true` + `OAUTH_MOBILE_SUCCESS_URL=forma://oauth` for OAuth on device |
| Auth entry | `app/(auth)/index.tsx` — email OTP or OAuth (Google/Apple/Facebook); dev mock + OTP mock helpers in `__DEV__` |
| Gates | `pnpm --filter @forma/mobile test` (unit) · `pnpm --filter @forma/mobile test:e2e` (Playwright web smoke) · `pnpm --filter @forma/mobile check-types && pnpm lint` |
| Agent setup | [`AGENTS.md`](../../AGENTS.md) — Postgres por sessão, Expo Web, seletores `testID` |
| Smoke | Authenticated student opens Home → Summary anatomy (header, rings, 2×2 tiles, guidance, green CTA); pull-to-refresh; partial errors when one endpoint fails |
| Slice 2 target | `mobile-training` — `.specs/features/mobile-training/` (exercises, plans, session log, rest day) |

**Slice 2:** `mobile-training` — **integrated on `main`** (merge `baf3a2e`); branch `feature/mobile-training` rebased onto `origin/main` (no conflicts). Training hub, exercises/plans/session flows, `trainingStore`, API clients, i18n `training.*` alongside home summary. See `.specs/features/mobile-training/validation.md`.

| Slice 2 item | Value |
|--------------|-------|
| Branch | `feature/mobile-training` (tracks `origin/main` at `baf3a2e`) |
| Gates (2026-07-08) | `pnpm --filter @forma/mobile test` — **63 passed**; `check-types` — **PASS**; `pnpm lint` — **FAIL** (Biome: 18 issues on `main`, mostly training format/import order + `noArrayIndexKey`; `pnpm` wrapper also OOM in this env — direct `biome check .` exits 1) |

---

**Backend notes:** Docker may be unavailable locally — e2e uses `TEST_DATABASE_URL` fallback. Historical test gate: `pnpm build && pnpm lint && pnpm --filter @forma/api test:e2e`. OAuth/email/Stripe mocks as before.
