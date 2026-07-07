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
| AD-008 | **Auth: email OTP first**; OAuth (Google/Apple) in same phase if straightforward, otherwise P2 | Lowest friction for MVP; OTP avoids password management. | 2026-07-07 |
| AD-009 | **Roles derived from profiles** — not a fixed account type | CONTEXT.md: User can be student + trainer simultaneously; roles computed from StudentProfile/ProfessionalProfile presence. | 2026-07-07 |
| AD-010 | **MVP clients: API-first** — mobile/web UI shells come after API vertical slices | Backend delivers value first; Expo and web-portal consume REST. | 2026-07-07 |
| AD-011 | **Billing: Stripe** with free/pro tiers | Standard SaaS pattern; webhook handler in API (no worker needed for basic flows). | 2026-07-07 |
| AD-012 | **Guidance: rule-based** (no AI in MVP) | Suggestions from health goal + activity data; AI food photo is P2. | 2026-07-07 |
| AD-013 | **Integration tests** as primary test strategy (Supertest + test DB) | No unit-test ceremony; e2e per acceptance criteria. Strong default from tlc-spec-driven. | 2026-07-07 |
| AD-014 | **Fastify adapter** (already in scaffold) | Performance; already chosen in main.ts. | 2026-07-07 |
| AD-015 | **Shared types in `packages/types`** | DTOs stay in API modules; shared enums/interfaces for clients. | 2026-07-07 |

## MVP Scope Boundaries

**In scope (P1):**
1. Monorepo structure + shared packages + test harness
2. Identity/Auth (email OTP, JWT sessions)
3. Student onboarding + health goal + rule-based guidance
4. Training (exercise library, workout plan, session logging)
5. Nutrition (macros, manual meal logging, prescribed plan)
6. Progress (weight tracking, streaks)
7. Coaching (professional-student link, invite, basic dashboard API)
8. Billing (Stripe free/pro tiers)

**Out of scope (P2+):**
- AI food photo analysis
- WhatsApp integration
- Mobile app polish / full UI
- Web portal UI (professionals)
- Advanced periodization
- WhatsApp groups
- Worker/Redis deploy
- OAuth (if not done in Phase 1)

## Handoff

**Feature in flight:** `platform-foundation` — planning complete, ready for Execute (Phase 0).

**Next task:** T01 — Create shared packages (`packages/types`, `packages/config`).

**Blockers:** None.
