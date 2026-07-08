# Forma — Contexto para Desenvolvedores

Referência rápida de domínio, linguagem e convenções da API. Para especificação completa, critérios de aceite e decisões de implementação, veja [`.specs/features/platform-foundation/`](.specs/features/platform-foundation/).

**UI / design (frontend):**

| Doc | Role |
|-----|------|
| [`DESIGN.md`](DESIGN.md) | Design system canônico (Apple Fitness Summary × Forma green) |
| [`.specs/ui/RULES.md`](.specs/ui/RULES.md) | Regras UX/UI obrigatórias |
| [`.specs/ui/`](.specs/ui/) | Referências Apple Fitness (anatomy) |
| [`.specs/STATE.md`](.specs/STATE.md) | Decisões + handoff |

Não há app Expo no monorepo até uma feature frontend ser especificada/scaffoldada com **tlc-spec-driven**. Backend MVP: API-first NestJS.

## O que é o Forma

Plataforma integrada de saúde, treino e nutrição que conecta **alunos** a **profissionais** (personal trainers e nutricionistas). O aluno registra treino, alimentação e progresso no dia a dia; o profissional prescreve planos, convida alunos e acompanha evolução. Backend MVP: **API-first** (NestJS modular monolith). Clientes mobile (Expo) e portal web: a scaffoldar via specs. Canais futuros incluem WhatsApp.

---

## Atores e papéis

| Ator | Entidade no código | Como surge | Capacidades principais |
|------|-------------------|------------|------------------------|
| **User** | `IdentityUser` | Login (OTP e-mail ou OAuth) | Identidade base; pode ter vários papéis ao mesmo tempo |
| **Aluno** | `StudentProfile` | Onboarding do aluno | Metas, treino, nutrição, progresso, orientação |
| **Personal** | `CoachingProfessionalProfile` (`trainer`) | Perfil profissional + assinatura paga | Prescrever treino, convidar alunos, dashboard |
| **Nutricionista** | `CoachingProfessionalProfile` (`nutritionist`) | Perfil profissional + assinatura paga | Prescrever plano nutricional, convidar alunos, dashboard |

**Papéis (`Role`)** não são um “tipo de conta” fixo — são derivados dos perfis ativos:

| Papel | Valor | Condição |
|-------|-------|----------|
| `student` | aluno | `StudentProfile` ativo |
| `trainer` | personal | `ProfessionalProfile` com tipo trainer |
| `nutritionist` | nutricionista | `ProfessionalProfile` com tipo nutritionist |

Um mesmo `User` pode ser aluno **e** profissional simultaneamente.

**Tiers de billing (aluno):** `free` (sem IA) · `pro` (desbloqueia IA de alimento em P2). **Profissionais:** assinatura paga obrigatória — sem free tier.

---

## Linguagem ubíqua

Use estes termos em código, DTOs, Swagger e UI. Evite sinônimos listados em *Evitar*.

| Termo | Significado | Evitar |
|-------|-------------|--------|
| **User** | Identidade autenticada (e-mail, sessão JWT) | Account, conta |
| **StudentProfile** | Perfil de quem treina, registra refeições e progresso | Aluno (no código), cliente |
| **ProfessionalProfile** | Perfil de quem prescreve e acompanha (`CoachingProfessionalProfile`) | Profissional (no código), prestador, coach |
| **Aluno** | Termo de **UI** para User com `StudentProfile` | Estudante, usuário final |
| **Profissional** | Termo de **UI** para User com `ProfessionalProfile` | Expert |
| **Health goal** | Meta de saúde (perder peso, ganhar massa, manter, saúde geral) | Objetivo genérico |
| **Workout plan** | Plano de treino com exercícios, séries, reps, descanso | Rotina (ambíguo) |
| **Workout session** | Sessão de treino executada (sets/reps/peso reais) | Treino (quando ambíguo com plano) |
| **Meal log** | Registro de refeição com macros manuais | Diário alimentar |
| **Nutrition plan** | Plano prescrito com metas diárias de macro | Dieta |
| **Coaching link** | Vínculo ativo profissional ↔ aluno | Relacionamento, amizade |
| **Invite** | Convite com token único (expira em 7 dias) | Link de cadastro |
| **Streak** | Sequência de dias com atividade (treino ou nutrição) | Sequência |
| **Guidance** | Sugestões diárias baseadas em regras (meta + atividade recente) | Dica de IA (MVP não usa IA) |
| **Tier / entitlement** | Plano Stripe e permissões derivadas | Plano genérico sem contexto |

---

## Bounded contexts

Cada contexto = um módulo NestJS em `apps/api/src/modules/[context]/`. Tabelas Prisma com prefixo do módulo (`identity_`, `training_`, etc.).

| Contexto | Módulo | Responsabilidade |
|----------|--------|------------------|
| **Identity** | `identity` | Auth (OTP e-mail, OAuth Google/Apple/Facebook), JWT, `User` |
| **Student** | `student` | Onboarding, `StudentProfile`, meta de saúde |
| **Guidance** | `guidance` | Orientação diária baseada em regras |
| **Training** | `training` | Exercícios customizados, planos, sessões de treino |
| **Nutrition** | `nutrition` | Log manual de refeições/macros, planos prescritos |
| **Progress** | `progress` | Peso (kg), streaks, histórico |
| **Coaching** | `coaching` | Perfis profissionais, convites, vínculos, dashboard |
| **Billing** | `billing` | Planos Stripe, checkout, webhooks, entitlements |

**Domínios core:** Training, Nutrition, Coaching. **Supporting:** Student, Guidance, Progress. **Generic:** Identity, Billing.

**Comunicação entre módulos:** leituras síncronas via services exportados; efeitos colaterais via `EventEmitter` (ex.: `training.session.completed` → atualiza streak). Sem CQRS, sem event sourcing, sem camadas Clean Architecture.

---

## Convenções da API

| Aspecto | Convenção |
|---------|-----------|
| Base path | `/api` |
| Prefixo por módulo | `/api/[context]` (ex.: `/api/identity/me`) |
| Auth | `Authorization: Bearer <JWT>` |
| i18n | Header `Accept-Language: pt-BR` ou `en` (default `pt-BR`) — erros e mensagens localizados |
| Validação | `class-validator` + `ValidationPipe` global |
| Docs | Swagger em `/api/docs` |
| Erros | `{ statusCode, message, error }` via filter global |
| IDs | CUID (Prisma) |
| Paginação | `?page=1&limit=20` |

**Auth flows:** `POST /api/identity/otp/request` → `POST /api/identity/otp/verify` · OAuth: `GET /api/identity/oauth/:provider` · Perfil: `GET /api/identity/me`.

**Gates de pagamento:** features profissionais e IA retornam `402 Payment Required` quando entitlement ausente.

---

## Repositório e branch

| Item | Valor |
|------|-------|
| Branch ativa (MVP backend) | `feat-platform-foundation` |
| Specs e decisões | `.specs/` — estado em [`.specs/STATE.md`](.specs/STATE.md) |
| Feature spec | [`.specs/features/platform-foundation/spec.md`](.specs/features/platform-foundation/spec.md) |
| Design técnico | [`.specs/features/platform-foundation/design.md`](.specs/features/platform-foundation/design.md) |
| Tipos compartilhados | `packages/types` (enums `Role`, `HealthGoal`, etc.) |
| Schema | `prisma/schema.prisma` (schema único, prefixos por módulo) |

**Arquitetura intencionalmente simples:** controller + service + DTO por módulo; Prisma direto no service. Setup local, Docker e deploy → [README.md](README.md).

---

## Fora do MVP (P2+)

Não implementar nem assumir no código P1 sem checar spec:

- IA de foto de alimento (Pro-only; requer worker)
- Base curada de alimentos (TACO/USDA) e biblioteca de exercícios com vídeos
- WhatsApp, UI mobile/web completa, periodização avançada
- Worker + Redis em produção
