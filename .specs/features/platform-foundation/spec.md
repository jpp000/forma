# Platform Foundation Specification

## Problem Statement

Forma precisa de uma base técnica sólida para conectar alunos a profissionais de saúde/treino/nutrição. Hoje existe apenas um scaffold (health endpoints, Prisma mínimo, deploy Render). Sem fundação — auth, perfis, módulos de domínio, testes — nenhuma feature de produto pode ser entregue de forma incremental e confiável.

## Goals

- [ ] Entregar API REST modular com bounded contexts claros e código legível (sem over-engineering)
- [ ] Permitir vertical slices MVP: aluno registra treino/alimentação/progresso; profissional vincula e prescreve; billing básico
- [ ] Cada slice testável via integration tests alinhados a acceptance criteria
- [ ] Deploy funcional no Render (API + Postgres) após Phase 0

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI food photo analysis | P2 — requer worker/IA |
| WhatsApp (mensagens, grupos) | P2/P3 — canal pós-MVP |
| Mobile app UI completa | P2 — API-first no MVP |
| Web portal UI (profissionais) | P2 — dashboard API no MVP |
| Advanced periodization | P3 — complexidade de domínio |
| Worker/Redis em produção | AD-005 — jobs assíncronos futuros |
| CQRS / Event Sourcing / Clean Architecture layers | AD-001 — cerimônia rejeitada pelo usuário |
| Multi-database / schema-per-module | AD-006 — single schema com prefixos |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Idioma da API (mensagens de erro) | Português (pt-BR) | Produto brasileiro; CONTEXT.md em PT | n |
| OTP delivery | Email via provider genérico (Resend/SendGrid) — mock em dev | Sem SMS no MVP; email já no escopo auth | n |
| OAuth timing | Mesma fase que OTP se Passport setup for simples; senão P2 | User disse "later or same phase if simple" | n |
| Stripe tiers | `free` (limitado) + `pro` (ilimitado básico) | MVP billing mínimo | n |
| Unidade de peso | kg (padrão BR) | Mercado alvo | n |
| Timezone streaks | UTC com data do servidor | Simplicidade MVP; timezone do user em P2 | n |
| Professional invite | Link com token único, expira em 7 dias | Padrão comum; evita complexidade | n |
| Exercise library seed | Dataset inicial curado (~50 exercícios) | Evita biblioteca vazia no demo | n |
| Food database | Tabela manual + busca por nome; sem integração TACO/USDA no MVP | Pragmatismo | n |
| Rate limit OTP | 3 requests/email/15min | Previne abuso | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1-01: Project Structure + Shared Packages ⭐ MVP

**User Story**: As a developer, I want a well-organized monorepo with shared packages and test harness so that features can be built incrementally with consistent tooling.

**Why P1**: Foundation for all subsequent work.

**Acceptance Criteria**:

1. WHEN the monorepo is cloned THEN `pnpm install && pnpm build` SHALL succeed without errors
2. WHEN `packages/types` is imported by API THEN shared enums/interfaces SHALL be available at compile time
3. WHEN `pnpm test` runs THEN the Jest + Supertest harness SHALL execute at least one passing health e2e test
4. WHEN API starts THEN global validation pipe, Swagger docs, and exception filter SHALL be active

**Independent Test**: Clone repo, install, run tests, hit `/api/health` and `/api/docs`.

**Requirements**: `FOUND-01`, `FOUND-02`, `FOUND-03`, `FOUND-04`

---

### P1-02: Identity & Auth (Email OTP) ⭐ MVP

**User Story**: As a User, I want to sign in with my email via OTP so that I can access Forma without managing a password.

**Why P1**: Every other feature requires authenticated identity.

**Acceptance Criteria**:

1. WHEN a User requests OTP with valid email THEN system SHALL send OTP and return `202 Accepted` without revealing if email exists
2. WHEN a User submits correct OTP within 10 minutes THEN system SHALL return JWT access token and create/update User record
3. WHEN a User submits expired or wrong OTP THEN system SHALL return `401` with clear error
4. WHEN a request includes valid JWT THEN protected endpoints SHALL identify the User
5. WHEN OTP is requested more than 3 times in 15 minutes for same email THEN system SHALL return `429 Too Many Requests`

**Independent Test**: Request OTP → verify → use token on `GET /api/identity/me`.

**Requirements**: `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-05`

---

### P1-03: Student Onboarding + Health Goal + Guidance ⭐ MVP

**User Story**: As a new aluno, I want to complete onboarding, set a health goal, and receive rule-based guidance so that I know what to focus on daily.

**Why P1**: Core value proposition — personalized direction without AI.

**Acceptance Criteria**:

1. WHEN authenticated User creates StudentProfile THEN system SHALL store onboarding data (age, sex, height, activity level) and assign `student` role
2. WHEN Student sets health goal (lose weight / gain muscle / maintain / improve health) THEN system SHALL persist goal with target metrics
3. WHEN Student requests daily guidance THEN system SHALL return rule-based suggestions based on goal + recent activity (training/nutrition/progress)
4. WHEN User without StudentProfile requests student endpoints THEN system SHALL return `403 Forbidden`

**Independent Test**: Create profile → set goal → GET guidance → verify suggestions match goal rules.

**Requirements**: `STUD-01`, `STUD-02`, `GUID-01`, `GUID-02`

---

### P1-04: Training — Exercise Library + Plans + Sessions ⭐ MVP

**User Story**: As a Student, I want to follow a workout plan and log my training sessions so that I track my exercise consistently.

**Why P1**: Training is a core pillar of Forma.

**Acceptance Criteria**:

1. WHEN Student queries exercise library THEN system SHALL return searchable list with name, muscle group, equipment
2. WHEN Student or linked Professional creates workout plan THEN system SHALL store plan with exercises, sets, reps, rest
3. WHEN Student starts and completes a workout session THEN system SHALL log exercises performed with actual sets/reps/weight
4. WHEN Student views workout history THEN system SHALL return sessions ordered by date

**Independent Test**: List exercises → create plan → log session → view history.

**Requirements**: `TRAIN-01`, `TRAIN-02`, `TRAIN-03`, `TRAIN-04`

---

### P1-05: Nutrition — Macros + Meal Logging + Prescribed Plan ⭐ MVP

**User Story**: As a Student, I want to log meals and follow a nutrition plan with macro targets so that I manage my diet.

**Why P1**: Nutrition is a core pillar alongside training.

**Acceptance Criteria**:

1. WHEN Student searches foods THEN system SHALL return items with calories, protein, carbs, fat per serving
2. WHEN Student logs a meal (breakfast/lunch/dinner/snack) THEN system SHALL store items and compute daily macro totals
3. WHEN Professional prescribes nutrition plan for linked Student THEN system SHALL store daily macro targets
4. WHEN Student views daily nutrition summary THEN system SHALL show consumed vs target macros

**Independent Test**: Search food → log meal → view daily summary → verify macro math.

**Requirements**: `NUTR-01`, `NUTR-02`, `NUTR-03`, `NUTR-04`

---

### P1-06: Progress — Weight + Streaks ⭐ MVP

**User Story**: As a Student, I want to record my weight and see activity streaks so that I stay motivated.

**Why P1**: Progress tracking closes the daily loop.

**Acceptance Criteria**:

1. WHEN Student logs weight THEN system SHALL store entry with date and value in kg
2. WHEN Student views weight history THEN system SHALL return entries for configurable date range
3. WHEN Student completes a training session or logs a meal on a calendar day THEN system SHALL count that day toward streak
4. WHEN Student views streaks THEN system SHALL return current streak and longest streak for training and nutrition separately

**Independent Test**: Log weight → log activity → verify streak increments.

**Requirements**: `PROG-01`, `PROG-02`, `PROG-03`, `PROG-04`

---

### P1-07: Coaching — Professional Link + Invite + Dashboard API ⭐ MVP

**User Story**: As a Professional, I want to invite students, manage my roster, and see their progress so that I can coach effectively.

**Why P1**: Differentiator — connects professionals to students.

**Acceptance Criteria**:

1. WHEN Professional creates profile (trainer or nutritionist) THEN system SHALL store credentials and assign corresponding role
2. WHEN Professional sends invite to student email THEN system SHALL create invite token valid for 7 days
3. WHEN Student accepts invite THEN system SHALL create coaching link between Professional and Student
4. WHEN Professional views dashboard THEN system SHALL return linked students with summary stats (last workout, last meal, weight trend)
5. WHEN unlinked Professional tries to prescribe plan THEN system SHALL return `403 Forbidden`

**Independent Test**: Create professional → invite → accept → view dashboard.

**Requirements**: `COACH-01`, `COACH-02`, `COACH-03`, `COACH-04`, `COACH-05`

---

### P1-08: Billing — Stripe Free/Pro Tiers ⭐ MVP

**User Story**: As a User, I want to subscribe to a pro plan so that I unlock premium features.

**Why P1**: Monetization path; even basic tiers validate Stripe integration.

**Acceptance Criteria**:

1. WHEN User views plans THEN system SHALL return free and pro tier details with feature limits
2. WHEN User starts checkout for pro THEN system SHALL create Stripe Checkout session and return URL
3. WHEN Stripe webhook confirms payment THEN system SHALL activate pro subscription on User
4. WHEN pro subscription expires or is cancelled THEN system SHALL downgrade User to free
5. WHEN free User exceeds feature limit THEN system SHALL return `402 Payment Required` with upgrade hint

**Independent Test**: List plans → checkout → simulate webhook → verify tier change.

**Requirements**: `BILL-01`, `BILL-02`, `BILL-03`, `BILL-04`, `BILL-05`

---

### P2: AI Food Photo Analysis

**User Story**: As a Student, I want to photograph my meal and get macro estimates so that logging is faster.

**Why P2**: Requires async worker + AI; not MVP.

**Acceptance Criteria**:

1. WHEN Student uploads meal photo THEN system SHALL enqueue analysis job and return job ID
2. WHEN analysis completes THEN system SHALL return estimated macros with confidence score

**Requirements**: `NUTR-05`, `NUTR-06`

---

### P2: WhatsApp Channel

**User Story**: As a Student, I want to receive reminders and log via WhatsApp so that I stay engaged without opening the app.

**Acceptance Criteria**:

1. WHEN Student opts in to WhatsApp THEN system SHALL link phone number to profile
2. WHEN reminder is scheduled THEN system SHALL send WhatsApp message at configured time

**Requirements**: `CHAN-01`, `CHAN-02`

---

### P2: Mobile App + Web Portal UI

**User Story**: As a User, I want polished mobile and web interfaces so that the experience feels production-ready.

**Acceptance Criteria**:

1. WHEN Student opens mobile app THEN all P1 API features SHALL be accessible via native UI
2. WHEN Professional opens web portal THEN dashboard, invites, and prescribing SHALL be usable

**Requirements**: `UI-01`, `UI-02`

---

### P3: Advanced Periodization + WhatsApp Groups

**User Story**: As a Professional, I want advanced training periodization and group coaching via WhatsApp.

**Acceptance Criteria**:

1. WHEN Professional creates periodized program THEN system SHALL support mesocycles with progressive overload rules
2. WHEN Professional creates WhatsApp group THEN linked students SHALL be added automatically

**Requirements**: `TRAIN-05`, `CHAN-03`

---

## Edge Cases

- WHEN email OTP provider fails THEN system SHALL return `503` and log error (no OTP leaked)
- WHEN JWT is expired THEN system SHALL return `401` with refresh guidance
- WHEN duplicate meal log for same meal type on same day THEN system SHALL append items (not replace)
- WHEN Student logs weight twice same day THEN system SHALL keep latest entry (upsert by date)
- WHEN invite token is expired THEN system SHALL return `410 Gone` with re-invite suggestion
- WHEN Stripe webhook signature is invalid THEN system SHALL return `400` and ignore payload
- WHEN coaching link already exists THEN system SHALL return `409 Conflict`
- WHEN empty exercise search query THEN system SHALL return paginated default list

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| FOUND-01 | P1-01 | 0 | Pending |
| FOUND-02 | P1-01 | 0 | Pending |
| FOUND-03 | P1-01 | 0 | Pending |
| FOUND-04 | P1-01 | 0 | Pending |
| AUTH-01 | P1-02 | 1 | Pending |
| AUTH-02 | P1-02 | 1 | Pending |
| AUTH-03 | P1-02 | 1 | Pending |
| AUTH-04 | P1-02 | 1 | Pending |
| AUTH-05 | P1-02 | 1 | Pending |
| STUD-01 | P1-03 | 1 | Pending |
| STUD-02 | P1-03 | 1 | Pending |
| GUID-01 | P1-03 | 4 | Pending |
| GUID-02 | P1-03 | 4 | Pending |
| TRAIN-01 | P1-04 | 2 | Pending |
| TRAIN-02 | P1-04 | 2 | Pending |
| TRAIN-03 | P1-04 | 2 | Pending |
| TRAIN-04 | P1-04 | 2 | Pending |
| NUTR-01 | P1-05 | 3 | Pending |
| NUTR-02 | P1-05 | 3 | Pending |
| NUTR-03 | P1-05 | 3 | Pending |
| NUTR-04 | P1-05 | 3 | Pending |
| PROG-01 | P1-06 | 4 | Pending |
| PROG-02 | P1-06 | 4 | Pending |
| PROG-03 | P1-06 | 4 | Pending |
| PROG-04 | P1-06 | 4 | Pending |
| COACH-01 | P1-07 | 5 | Pending |
| COACH-02 | P1-07 | 5 | Pending |
| COACH-03 | P1-07 | 5 | Pending |
| COACH-04 | P1-07 | 5 | Pending |
| COACH-05 | P1-07 | 5 | Pending |
| BILL-01 | P1-08 | 6 | Pending |
| BILL-02 | P1-08 | 6 | Pending |
| BILL-03 | P1-08 | 6 | Pending |
| BILL-04 | P1-08 | 6 | Pending |
| BILL-05 | P1-08 | 6 | Pending |

**Coverage:** 37 total, 0 mapped to tasks (pending tasks.md), 0 unmapped

---

## MVP Vertical Slices (Priority Order)

1. **Foundation** — monorepo packages, test harness, module skeleton, Swagger
2. **Identity** — email OTP, JWT, User CRUD
3. **Student + Goal** — onboarding, health goal
4. **Training** — exercises, plans, sessions
5. **Nutrition** — foods, meals, plans
6. **Progress + Guidance** — weight, streaks, rule-based suggestions
7. **Coaching** — professional profiles, invites, links, dashboard
8. **Billing** — Stripe free/pro

---

## Success Criteria

- [ ] All P1 acceptance criteria pass via integration tests
- [ ] API deploys to Render with migrations auto-applied
- [ ] Swagger docs cover all MVP endpoints
- [ ] No Clean Architecture layers — each module is controller + service + dto (max 1 extra folder)
- [ ] One atomic commit per task during Execute
