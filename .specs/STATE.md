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

## MVP Scope Boundaries

**In scope (P1):**
1. Monorepo structure + shared packages + test harness + i18n (pt-BR + en)
2. Identity/Auth (email OTP via Resend, OAuth Google/Apple/Facebook, JWT sessions)
3. Student onboarding + health goal + rule-based guidance
4. Training (manual exercise creation, workout plan, session logging)
5. Nutrition (manual macro/meal logging, prescribed plan)
6. Progress (weight tracking, streaks)
7. Coaching (professional-student link, invite, basic dashboard API; professional subscription required)
8. Billing (Stripe student free/pro + professional paid tiers; Pro AI entitlement)

**Out of scope (P2+):**
- AI food photo analysis (Pro-gated when shipped)
- Curated food database (searchable; TACO/USDA)
- Exercise library with instructional videos
- WhatsApp integration
- Mobile app polish / full UI
- Web portal UI (professionals)
- Advanced periodization
- WhatsApp groups
- Worker/Redis deploy

## Handoff

**Feature in flight:** `platform-foundation` — Phase 1 complete (Identity & Student).

**Branch:** `feat-platform-foundation` (synced with `origin/main`, pushed).

**Completed:** T01–T13 (Phase 0 + Phase 1).

**Next task:** T14 — Custom exercise CRUD (Training phase).

**Blockers:** Docker unavailable locally — e2e uses `TEST_DATABASE_URL` fallback (`postgresql://${USER}@localhost:5432/forma`). CI should use `docker compose postgres` with `postgresql://forma:forma@localhost:5432/forma`.

**Test gate (Phase 1):** `pnpm build && pnpm lint && pnpm --filter @forma/api test:e2e` — 27/27 e2e tests passing.

**Notes:** OAuth runs in mock mode when `OAUTH_MOCK=true` or `GOOGLE_CLIENT_ID` unset. Email OTP uses mock provider in test/dev.
