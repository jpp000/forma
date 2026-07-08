# Mobile Foundation Specification

## Problem Statement

O backend MVP do Forma está pronto, mas não há app mobile. Sem um scaffold Expo limpo — auth, onboarding de aluno, design tokens light/dark, i18n e API client — as fatias de Home/Treino/Nutrição/Progresso não têm base estável. Esta fatia (Slice 0) entrega a fundação shippável do cliente aluno.

## Goals

- [ ] Scaffold `apps/mobile` (Expo + expo-router) integrado ao monorepo Turborepo/pnpm
- [ ] Aluno autentica (OAuth + e-mail OTP), completa onboarding (perfil + meta) e chega a um shell autenticado
- [ ] Tokens e chrome respeitam `DESIGN.md` + `.specs/ui/RULES.md` em **light e dark**
- [ ] i18n pt-BR (default) + en; zero copy hard-coded
- [ ] Código simples, tipado, pronto para fatias 1–4 sem retrabalho estrutural

## Out of Scope

| Feature | Reason |
|---------|--------|
| Home Summary (rings, tiles, guidance UI) | Slice 1 — `mobile-home-summary` |
| Treino / nutrição / progresso / rest-day streak API | Slices 2–4 |
| Billing UI / paywall | AD-026 |
| Multi-perfil / role switcher | AD-026 |
| Coaching chat | AD-026 |
| Portal web profissional | Outro produto |
| Restore Wise/Shopify prototypes | AD-021 / AD-023 |
| Aceitar invite deep-link | Optional thin slice later |
| Logo customizado | TBD — placeholder/text brand ok |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Ator deste app | **Só aluno** | AD-024 | y |
| Tema | **Light + dark** from day one | AD-025; dark = black Summary; light = remapped surfaces, same brand green | y |
| Navegação pós-auth | Stack auth/onboarding → placeholder tabs (Home stub ok) | Real Summary in Slice 1 | y |
| OAuth mobile | Expo AuthSession / browser redirect → API `GET /api/identity/oauth/:provider` + callback token handoff | Matches existing Nest OAuth controllers | y |
| OTP UX | E-mail → tela de código 6 dígitos → JWT persistido | Espelha `POST otp/request` + `otp/verify` | y |
| Sessão | JWT em storage seguro (SecureStore); attach `Authorization: Bearer` | API já usa Bearer JWT | y |
| Onboarding gate | Sem `StudentProfile` → fluxo obrigatório (idade, sexo, altura, activityLevel + health goal) antes das tabs | API: `POST /student/profile` + `PUT /student/goal` | y |
| Default locale | `pt-BR`; toggle/device can switch to `en` | AD-018 | y |
| API base URL | Env `EXPO_PUBLIC_API_URL` (dev default local API) | Fixed at Execute | y |
| Accept-Language | Header mirrors app locale | API i18n | y |
| Test strategy Slice 0 | Maestro/Detox **optional later**; MVP gate = TypeScript + lint + smoke (app boots, auth screens render) + critical unit/integration where cheap | Mobile e2e harness deferred unless already easy | n (assumption) |
| Logo | Text “Forma” / green mark until asset exists | Logo TBD | y |
| Rest-day / streak | **Not in this slice** — locked for Slice 2 per AD-027 | Avoid scope creep | y |

**Open questions:** none unmarked — confirm assumptions above with this spec approval.

---

## Design constraints (must cite)

Every screen/component in this feature SHALL follow:

- Root [`DESIGN.md`](../../../DESIGN.md) — Forma green `#30D158` CTAs; Move pink only for energy accents (no pink primary buttons)
- [`.specs/ui/RULES.md`](../../ui/RULES.md) — loading / empty / error on every shippable screen; no Wise/Shopify aesthetics
- Dark canvas `#000000` + grouped `#1C1C1E`; light theme uses equivalent grouped surfaces on a light canvas (agent defines exact light hexes in Design phase, brand green unchanged)
- Typography: SF Pro (iOS system) / Inter fallback Android; tabular numerals on metrics when shown
- Touch targets ≥44pt; 16pt side insets; safe areas

---

## User Stories

### P1-01: Expo app scaffold in monorepo ⭐ MVP

**User Story**: As a developer, I want `apps/mobile` bootable via Expo in the Turborepo so later slices share one app shell.

**Why P1**: No app = no UI work.

**Acceptance Criteria**:

1. WHEN `pnpm install` runs at repo root THEN `@forma/mobile` (or equivalent workspace name) SHALL be installable without breaking API/worker packages
2. WHEN developer runs the mobile app’s start script THEN Expo SHALL boot without fatal config errors
3. WHEN TypeScript check runs for mobile THEN it SHALL pass with strict config aligned to monorepo norms
4. WHEN lint runs THEN mobile sources SHALL pass the repo Biome (or agreed) lint gate without new exemptions for dead prototype code

**Independent Test**: From clean install, start Expo and open the entry screen.

**Requirements**: `MFOUND-01`, `MFOUND-02`

---

### P1-02: Design tokens + light/dark theme ⭐ MVP

**User Story**: As an aluno, I want the app to look correct in light and dark so it feels native and on-brand.

**Why P1**: Visual contract locked; every later screen depends on tokens.

**Acceptance Criteria**:

1. WHEN the device/system appearance is dark THEN the app SHALL use true-black canvas and dark grouped surfaces per `DESIGN.md`
2. WHEN the device/system appearance is light THEN the app SHALL use a light canvas + light grouped surfaces with the **same** brand primary `#30D158` and ring colors unchanged
3. WHEN a primary CTA is shown THEN fill SHALL be `#30D158` with on-primary black label (pressed `#248A3D`); Move pink SHALL NOT be used as primary CTA
4. WHEN the user (or system) switches appearance THEN themed screens already mounted SHALL update without restart
5. WHEN `prefers-reduced-motion` / reduce-motion is enabled THEN ornamental motion on foundation screens SHALL degrade gracefully (no crash)

**Independent Test**: Toggle OS light/dark; verify canvas, CTA green, no pink buttons.

**Requirements**: `MFOUND-03`, `MFOUND-04`

---

### P1-03: i18n (pt-BR + en) ⭐ MVP

**User Story**: As an aluno, I want UI copy in Portuguese or English so the app matches the API locale story.

**Why P1**: AD-018; no hard-coded strings allowed by UI rules.

**Acceptance Criteria**:

1. WHEN the app locale is `pt-BR` THEN all Slice-0 user-visible strings SHALL render in Portuguese
2. WHEN the app locale is `en` THEN the same screens SHALL render in English
3. WHEN the app calls the API THEN it SHALL send `Accept-Language` matching the active locale (`pt-BR` or `en`)
4. WHEN a new string is added in Slice 0 THEN both locale catalogs SHALL include it (no missing-key fallbacks left as raw keys in UI)

**Independent Test**: Switch locale; re-check Auth + Onboarding copy and a localized API error display.

**Requirements**: `MFOUND-05`

---

### P1-04: API client + session persistence ⭐ MVP

**User Story**: As an aluno, I want my session remembered securely so I do not re-login every launch.

**Why P1**: All protected flows need JWT + base URL.

**Acceptance Criteria**:

1. WHEN a successful auth returns an access token THEN the app SHALL store it in secure storage (not plain AsyncStorage)
2. WHEN the app cold-starts with a valid stored token THEN authenticated routes SHALL be reachable without repeating OTP/OAuth
3. WHEN the API returns `401` on a protected call THEN the app SHALL clear the session and return the user to Auth
4. WHEN requests are made THEN `Authorization: Bearer <token>` and configured base URL from env SHALL be applied consistently

**Independent Test**: Login → kill app → relaunch still authenticated; force 401 → land on Auth.

**Requirements**: `MFOUND-06`, `MFOUND-07`

---

### P1-05: Auth — OAuth + email OTP ⭐ MVP

**User Story**: As a User, I want to sign in with Google/Apple/Facebook or email OTP so I can access Forma.

**Why P1**: Gate to everything else; mirrors API AUTH stories.

**Acceptance Criteria**:

1. WHEN the aluno opens Auth THEN the screen SHALL offer OAuth providers (Google, Apple, Facebook) and email OTP entry on black/light canvas with green primary CTAs per design constraints
2. WHEN the aluno completes an OAuth provider flow successfully THEN the app SHALL obtain a JWT and proceed to the post-auth gate (onboarding or shell)
3. WHEN the aluno requests OTP with a valid email THEN the app SHALL call `POST /api/identity/otp/request` and navigate to code entry without revealing whether the email exists (match API semantics)
4. WHEN the aluno submits a correct OTP THEN the app SHALL call `POST /api/identity/otp/verify`, store JWT, and proceed to the post-auth gate
5. WHEN OTP is wrong/expired or OAuth fails THEN the app SHALL show a localized error and remain on Auth (no crash, no silent stall)
6. WHEN OTP rate limit (`429`) occurs THEN the app SHALL show a localized rate-limit message
7. WHEN Auth screens are loading THEN a loading state SHALL be visible; empty email / invalid format SHALL block submit with validation feedback

**Independent Test**: OTP happy path + one forced error; one OAuth mock/dev path if available.

**Requirements**: `MAUTH-01`, `MAUTH-02`, `MAUTH-03`, `MAUTH-04`

---

### P1-06: Student onboarding + health goal ⭐ MVP

**User Story**: As a new aluno, I want to create my student profile and set a health goal so the app knows who I am.

**Why P1**: Student endpoints require profile; guidance/home later depend on goal.

**Acceptance Criteria**:

1. WHEN an authenticated User without `StudentProfile` opens the app THEN navigation SHALL force onboarding before tabs/home shell
2. WHEN the aluno submits valid profile fields (age, sex, heightCm, activityLevel) THEN the app SHALL `POST /api/student/profile` and continue to goal step
3. WHEN the aluno selects a health goal (`lose_weight` \| `gain_muscle` \| `maintain` \| `improve_health`) THEN the app SHALL `PUT /api/student/goal` and enter the authenticated shell
4. WHEN `GET /api/identity/me` (or equivalent) shows an existing student profile THEN onboarding SHALL be skipped
5. WHEN profile/goal API calls fail THEN the app SHALL show localized error and allow retry; partial success (profile ok, goal fail) SHALL not leave the user stuck without recovery
6. WHEN onboarding screens load or submit THEN loading and validation empty/error states SHALL be present

**Independent Test**: Fresh user → profile → goal → shell; returning user with profile → skip to shell.

**Requirements**: `MONB-01`, `MONB-02`, `MONB-03`

---

### P1-07: Authenticated shell + logout ⭐ MVP

**User Story**: As an aluno, I want a stable app shell after login so later slices plug into tabs without reshaping auth.

**Why P1**: Contract for Slices 1–4.

**Acceptance Criteria**:

1. WHEN onboarding is complete THEN the app SHALL show a tabbed shell with placeholders for Home, Training, Nutrition, Progress (labels i18n; active tab tint `#30D158`)
2. WHEN Home tab is selected in this slice THEN a minimal placeholder MAY render (not full Summary — Slice 1 owns that UI)
3. WHEN the aluno logs out THEN token SHALL be cleared and Auth SHALL show
4. WHEN unauthenticated THEN tab shell SHALL not be reachable

**Independent Test**: Complete onboarding → see tabs → logout → Auth.

**Requirements**: `MSHELL-01`, `MSHELL-02`

---

## Edge Cases

- WHEN SecureStore/token read fails THEN system SHALL treat as logged out and show Auth
- WHEN network is unavailable on auth/onboarding THEN system SHALL show localized offline/error state with retry
- WHEN OAuth redirect returns without token THEN system SHALL show localized failure and stay on Auth
- WHEN User has JWT but API says no student profile THEN system SHALL send to onboarding (not tabs)
- WHEN appearance toggles mid-onboarding THEN layout SHALL remain usable (no clipped CTAs)
- WHEN email format is invalid THEN system SHALL not call OTP request

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| MFOUND-01 | P1-01 Scaffold | Design | Pending |
| MFOUND-02 | P1-01 Scaffold | Design | Pending |
| MFOUND-03 | P1-02 Theme dark | Design | Pending |
| MFOUND-04 | P1-02 Theme light + brand | Design | Pending |
| MFOUND-05 | P1-03 i18n | Design | Pending |
| MFOUND-06 | P1-04 Secure session | Design | Pending |
| MFOUND-07 | P1-04 401 → Auth | Design | Pending |
| MAUTH-01 | P1-05 Auth screen | Design | Pending |
| MAUTH-02 | P1-05 OAuth | Design | Pending |
| MAUTH-03 | P1-05 OTP | Design | Pending |
| MAUTH-04 | P1-05 Auth errors | Design | Pending |
| MONB-01 | P1-06 Gate | Design | Pending |
| MONB-02 | P1-06 Profile | Design | Pending |
| MONB-03 | P1-06 Goal | Design | Pending |
| MSHELL-01 | P1-07 Tabs shell | Design | Pending |
| MSHELL-02 | P1-07 Logout | Design | Pending |

**Coverage:** 16 total, 0 mapped to tasks, 16 unmapped ⚠️ (Tasks phase next after confirm)

---

## Success Criteria

- [ ] Fresh install → Expo boots → Auth visible in light and dark with green CTAs
- [ ] Aluno completes OTP (or OAuth) → onboarding → placeholder tabs
- [ ] Cold start restores session; logout clears it; 401 returns to Auth
- [ ] pt-BR and en both cover Slice-0 strings; API gets matching `Accept-Language`
- [ ] No billing/multi-profile/chat UI; no dependency on deleted prototype paths
- [ ] Handoff updated so a **new agent/chat** can start Slice 1 without reloading this whole thread

---

## Agent / multi-chat notes

- **This chat:** Specify (current) → Design → Tasks → Execute Slice 0 only.
- **Next chat:** `mobile-home-summary` after Slice 0 Verifier PASS + STATE Handoff update.
- Load only this feature’s files + `DESIGN.md` + `.specs/ui/RULES.md` + STATE Decisions — not `platform-foundation` full spec unless API contract detail is needed.
- Rest-day streak (AD-027) is **documented for Slice 2**, not implemented here.

---

## Related locked product decisions (outside this slice)

| ID | Decision |
|----|----------|
| AD-027 | Training streak: explicit rest → plan rest → ≤1 Mon–Sun grace gap; nutrition streak separate |
| AD-024–026 | Student-only slices; light+dark; no billing/multi-profile/chat UI |
