# Platform Foundation Context

**Gathered:** 2026-07-07
**Spec:** `.specs/features/platform-foundation/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Deliver the Forma platform foundation: modular monolith API with identity (email OTP + OAuth), student/professional profiles, manual training and nutrition logging, progress tracking, coaching links, and Stripe billing — deployable on Render with full pt-BR + en i18n.

---

## Implementation Decisions

### Authentication

- Email OTP ships in MVP Phase 1 via **Resend** in production; **mock email provider** in development/test
- **OAuth P1** alongside OTP: Google, Apple, and Facebook — not deferred to P2
- OTP rate limit: 3 requests per email per 15 minutes

### Billing & Entitlements

- **Student tiers:** `free` (no AI) and `pro` (unlocks AI food recognition when shipped)
- **Professional tier:** trainers and nutritionists require an **active paid professional subscription** — no free tier for professional profiles
- **AI food photo → macros** is **Pro-only** (feature ships P2; entitlement model defined in P1 billing)
- Stripe handles checkout and webhook-driven subscription lifecycle

### Training & Nutrition (MVP vs P2)

- **MVP (P1):** Manual exercise creation and manual workout setup; manual food/macro logging (user-entered values, no curated database)
- **P2 (explicit):** Ready-made food database (searchable) + workout exercise library with instructional videos

### Internationalization

- **Full i18n:** pt-BR and en for API error messages, validation messages, and all user-facing strings — not UI-only later
- Pragmatic approach: JSON locale files + simple resolver (see design.md)

### Identity & Roles

- Roles derived from profiles (student, trainer, nutritionist) — unchanged from AD-009
- Professional invite: link with unique token, 7-day expiry

### Agent's Discretion

- i18n resolver implementation details (nestjs-i18n vs lightweight JSON — design picks simplest)
- OAuth Passport strategy wiring order (can ship Google first if needed, but all three are P1 scope)
- Exact professional plan pricing and Stripe product IDs

### Declined / Undiscussed Gray Areas → Assumptions

| Area | Default | Rationale |
|------|---------|-----------|
| Weight unit | kg | Brazilian market default |
| Timezone streaks | UTC (server date) | MVP simplicity; user timezone in P2 |
| Exercise library seed (MVP) | **Not in MVP** — manual only | User confirmed manual MVP |
| Food database (MVP) | **Not in MVP** — manual macro entry | User confirmed manual MVP |

---

## Specific References

- OTP provider: [Resend](https://resend.com) for production email delivery
- OAuth providers: Google, Apple, Facebook (standard Passport strategies)
- Billing: Stripe with distinct student (free/pro) and professional (paid-only) entitlements

---

## Deferred Ideas

- AI food photo analysis (P2 — Pro-gated when shipped)
- Curated food database + TACO/USDA integration (P2)
- Exercise library with video content (P2)
- WhatsApp channel (P2/P3)
- Mobile/web UI polish (P2)
- User timezone for streak calculation (P2)
