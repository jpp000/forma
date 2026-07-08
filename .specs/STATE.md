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

**Backend:** `platform-foundation` — MVP P1 API complete (merge to `main` as needed).

**Frontend:** design locked; **code slate clean**.

| Item | Value |
|------|-------|
| Branch | `feat-frontend-foundation` |
| Design | Apple Fitness Summary × Forma `#30D158` — see `DESIGN.md` |
| UI rules | `.specs/ui/RULES.md` |
| Anatomy refs | `.specs/ui/references/apple-fitness-DESIGN.md` (+ Expo companion) |
| App code | **None** — `apps/mobile` deleted on purpose |

**Next task:** run **tlc-spec-driven** for the first mobile feature (recommend: Expo scaffold + Home Summary, or Auth). Specs must cite `DESIGN.md` + `.specs/ui/RULES.md`. Do not restore Wise/Shopify prototypes.

**Blockers:** none for specifying frontend. Logo TBD. API client env TBD at Execute.

---

**Backend notes:** Docker may be unavailable locally — e2e uses `TEST_DATABASE_URL` fallback. Historical test gate: `pnpm build && pnpm lint && pnpm --filter @forma/api test:e2e`. OAuth/email/Stripe mocks as before.
