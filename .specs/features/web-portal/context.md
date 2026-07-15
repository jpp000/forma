# Web Portal (Professionals) Context

**Gathered:** 2026-07-12
**Spec:** `.specs/features/web-portal/spec.md`
**Status:** Spec + Design + Tasks approved — Execute W1

---

## Feature Boundary

Deliver a **large, phased** professional product surface: a React (Vite SPA) web portal on Render where trainers and nutritionists subscribe, manage clients, create templates, prescribe routines/periodization and nutrition menus; plus a mobile “LinkedIn-style” discovery of professionals so students can request a coaching link (alongside existing email invites). Design language is **pro dashboard**, brand-aligned with Forma (`DESIGN.md`).

Food DB, exercise video library, AI food, WhatsApp, and detailed pricing are **out of this feature**.

---

## Implementation Decisions

### Stack & deploy

- **Vite + React SPA** (not Next.js)
- Deploy on **Render** (static site or equivalent SPA hosting)
- Auth: reuse API OTP + OAuth → store **Bearer JWT** in the portal (same as mobile pattern; no cookie session)

### Connection model (aluno ↔ profissional)

- **Both**:
  1. Professional sends **email invite** (existing API)
  2. Student discovers professionals in the **mobile app** and **requests** a link; professional **accepts/declines** in the portal

### Delivery phases (accepted order)

| Phase | Ships |
|-------|--------|
| **W1** | Portal scaffold: auth, paid signup/checkout, pro profile onboarding, client dashboard, email invites |
| **W2** | Public professional profile + mobile “Professionals” tab + request/accept link flow |
| **W3** | Training templates + prescribe/routine onto linked student (includes API gap: pro training prescribe) |
| **W4** | Nutrition templates/menus + **light periodization** (weeks/blocks chaining workout plans) |

### Periodization (v1)

- **Light**: weeks/blocks with **chained workout plans** — not advanced periodization (P3)

### Visual

- **Pro dashboard** density and information hierarchy
- Tokens and brand from `DESIGN.md` / `.specs/ui/RULES.md` (primary `#30D158`, surfaces, type ramp) — desktop-adapted, not a separate visual identity

### Pricing

- Professional use remains **paid subscription** (no free pro tier)
- Exact price points / Stripe product copy: **deferred** to a later discussion; checkout UX still ships in W1 against existing professional plan

### Roles

- Same app serves **trainer** and **nutritionist**; UI gates by role from `GET /identity/me`
- Users may still hold student + pro roles (AD-009); portal is the **professional** workplace

### Agent's Discretion

- Exact Vite folder layout under `apps/web-portal`, router (React Router), state library (prefer Zustand for parity with mobile AD-030 unless Design justifies otherwise)
- How public pro profile URLs are shaped (`/p/:slug` vs id)
- Table vs card density details within pro-dashboard language
- Whether request notifications are in-app only in W2 (no email/push required for v1)

### Declined / Undiscussed Gray Areas → Assumptions

| Area | Default | Rationale |
|------|---------|-----------|
| Portal i18n | pt-BR + en (same as API/mobile) | AD-018 |
| Student-facing invite accept UI | Thin deep link / existing accept API; not a full portal student mode | Portal is pro-only; mobile owns student |
| Pro profile media | Avatar URL + bio/credentials text in W1–W2; no portfolio gallery v1 | Keep LinkedIn metaphor lean |
| Concurrent multi-pro links per student | Allowed if API allows; no exclusivity rule in v1 | No exclusivity discussed |
| Render env | `EXPO`-style `VITE_API_URL`; production CORS allow portal origin | Required for SPA Bearer calls |

---

## Specific References

- Product metaphor: **“LinkedIn for professionals”** — students browse pro profiles in the app and close a coaching relationship
- Portal is where professionals **sign up and pay** to use the platform
- Pros manage clients, pass **periodization and workout routines** that integrate into the platform
- Pros create **training templates**; nutritionists also **meal-plan / cardápio templates**
- Design: pro dashboard, **well aligned to the Forma design system**

---

## Deferred Ideas

- Exact professional **pricing** and packaging
- Food DB (TACO/USDA) and exercise video library
- AI food photo
- Advanced periodization / WhatsApp groups (P3)
- Coaching chat
- Multi-profile switcher polish
- Web landing / marketing site (`web-landing`)
