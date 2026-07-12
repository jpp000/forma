# Web Portal (Professionals) Specification

**Status**: Approved — Tasks ready; Execute W1 next  
**Context**: `.specs/features/web-portal/context.md`  
**Size**: Large (phased W1–W4)

## Problem Statement

Professionals (trainers and nutritionists) have API support for profiles, invites, dashboard stats, and nutrition prescription, but no workplace UI. Students cannot discover professionals or request coaching. Training prescription for linked students and reusable templates/periodization are missing or incomplete. Without a dedicated portal and discovery loop, Forma cannot monetize or operationalize the coaching side of the product.

## Goals

- [ ] Ship `apps/web-portal` (Vite + React SPA) on Render as the professional workplace
- [ ] Let professionals subscribe, onboard a profile, manage clients, and invite by email (W1)
- [ ] Let students browse professional profiles in mobile and request a link; pros accept in portal (W2)
- [ ] Let trainers create training templates and prescribe routines to linked students (W3)
- [ ] Let nutritionists create nutrition/menu templates; support light periodization blocks (W4)
- [ ] Keep visual language pro-dashboard but brand-aligned with `DESIGN.md`

## Out of Scope

| Feature | Reason |
|---------|--------|
| Food DB (TACO/USDA) | Separate P2 track |
| Exercise video library | Separate P2 track |
| AI food photo | Separate P2; Pro student entitlement |
| Exact Stripe price points / packaging copy | Deferred (checkout still uses professional plan) |
| Advanced periodization / WhatsApp groups | P3 |
| Coaching chat | AD-026 / deferred |
| Student mode inside the portal | Portal is professional-only |
| `apps/web-landing` marketing site | Separate |
| Native iOS/Android portal | Web only |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Stack | Vite + React SPA on Render | User 1B | y |
| Link creation | Email invite **and** student request → pro accept | User 2C | y |
| Phase order | W1 → W2 → W3 → W4 as below | User 3A | y |
| Periodization v1 | Light: weeks/blocks chaining workout plans | User 4A | y |
| Design | Pro dashboard × Forma tokens | User | y |
| Pricing amounts | Deferred; paid professional plan required | User | y |
| Auth | Bearer JWT from OTP/OAuth; production CORS for portal origin | SPA constraint | y |
| Portal i18n | pt-BR + en | AD-018 | y |
| State on portal | Zustand preferred (parity AD-030) | Agent discretion until Design | n → assume y |
| Training prescribe API | Must be added in W3 (gap vs nutrition) | Codebase fact | y |
| Multi-link students | No exclusivity in v1 | Undiscussed default | y |

**Open questions:** none for boundary — pricing deferred explicitly.

---

## Delivery Phases

### W1 — Portal foundation (subscribe, roster, invites)

### W2 — Professional discovery (“LinkedIn”) + request/accept

### W3 — Training templates + prescribe/routine

### W4 — Nutrition templates/menus + light periodization

Each phase is independently demoable. Later phases may ship API + portal + mobile touchpoints as needed.

---

## User Stories

### P1 / W1-01: Portal scaffold & auth ⭐

**User Story**: As a Professional, I want to sign in to a web portal so that I can manage my coaching business.

**Why P1**: No portal exists; all W1 flows depend on auth shell.

**Acceptance Criteria**:

1. WHEN operator deploys the portal THEN `apps/web-portal` SHALL be a Vite + React SPA served on Render
2. WHEN User completes email OTP or OAuth in the portal THEN system SHALL store a Bearer access token and call `GET /api/identity/me`
3. WHEN User has no `trainer` or `nutritionist` role AND no active path to create one THEN portal SHALL guide them into paid professional onboarding (W1-02)
4. WHEN API returns 401 THEN portal SHALL clear session and return to auth

**Independent Test**: Open portal → mock/OTP login → see authenticated shell.

---

### P1 / W1-02: Paid professional signup & profile ⭐

**User Story**: As a User, I want to subscribe as a professional and create my profile so that I can coach on Forma.

**Why P1**: Portal is the paid entry point for professionals.

**Acceptance Criteria**:

1. WHEN User starts professional signup THEN portal SHALL offer checkout for the existing **professional** billing plan (`POST /api/billing/checkout` or equivalent)
2. WHEN User lacks professional entitlement and calls create-profile THEN API SHALL return 402 and portal SHALL show paywall/checkout CTA
3. WHEN User with entitlement submits trainer or nutritionist profile THEN system SHALL create `CoachingProfessionalProfile` and roles SHALL appear on `/identity/me`
4. WHEN profile is created THEN portal SHALL collect credentials/bio fields needed for later public profile (W2) — at minimum type + credentials text

**Independent Test**: Checkout (or test entitlement) → create trainer profile → dashboard accessible.

---

### P1 / W1-03: Client dashboard ⭐

**User Story**: As a Professional, I want a dashboard of my linked students so that I can see who I coach and recent activity.

**Why P1**: Core “manage clients” workplace.

**Acceptance Criteria**:

1. WHEN Professional opens dashboard THEN portal SHALL render linked students from `GET /api/coaching/dashboard`
2. WHEN a student has `lastWorkout`, `lastMeal`, or `weightTrend` THEN portal SHALL display those summary fields
3. WHEN Professional has zero links THEN portal SHALL show empty state with CTA to invite (W1-04)
4. WHEN dashboard request fails THEN portal SHALL show recoverable error + retry

**Independent Test**: Linked pro → open dashboard → see student rows.

---

### P1 / W1-04: Email invites ⭐

**User Story**: As a Professional, I want to invite a student by email so that we can form a coaching link.

**Why P1**: Existing API path; required for roster growth before discovery (W2).

**Acceptance Criteria**:

1. WHEN Professional submits student email THEN portal SHALL call `POST /api/coaching/invites` and show success with expiry hint (7 days)
2. WHEN invite API returns validation/rate errors THEN portal SHALL show localized message
3. WHEN Student accepts via existing accept API THEN student SHALL appear on dashboard after refresh

**Independent Test**: Send invite → accept as student → student listed on dashboard.

---

### P1 / W2-01: Public professional profile ⭐

**User Story**: As a Professional, I want a public profile so that students can discover and trust me.

**Why P1**: “LinkedIn for professionals” foundation.

**Acceptance Criteria**:

1. WHEN Professional completes profile publishing fields THEN API SHALL expose a **public** professional profile (safe fields only: display name/credentials/bio/type — no private student data)
2. WHEN unauthenticated or student client requests public profile by id/slug THEN system SHALL return 200 with public payload
3. WHEN Professional updates bio/credentials in portal THEN public profile SHALL reflect changes after save

**Independent Test**: Publish profile → fetch public endpoint without pro session → see public fields only.

---

### P1 / W2-02: Mobile professionals tab & discovery ⭐

**User Story**: As a Student, I want a mobile tab to browse professionals so that I can choose a coach.

**Why P1**: Student-side half of discovery.

**Acceptance Criteria**:

1. WHEN Student opens the Professionals tab THEN app SHALL list discoverable professionals (search and/or browse)
2. WHEN Student opens a professional THEN app SHALL show the public profile
3. WHEN list/profile fails THEN app SHALL show recoverable error
4. WHEN design tokens apply THEN tab SHALL follow `DESIGN.md` (not a separate visual system)

**Independent Test**: Authenticated student → Professionals tab → open a profile.

---

### P1 / W2-03: Request link & pro accept/decline ⭐

**User Story**: As a Student, I want to request coaching from a professional, and as a Professional I want to accept or decline, so that either side can initiate the relationship.

**Why P1**: Complements email invite (both required).

**Acceptance Criteria**:

1. WHEN Student requests coaching from a professional THEN system SHALL create a pending request (idempotent per student↔pro pair while pending)
2. WHEN Professional views pending requests in portal THEN system SHALL list requester identity (email/name as available)
3. WHEN Professional accepts THEN system SHALL create a coaching link and request SHALL leave pending
4. WHEN Professional declines THEN request SHALL close without a link and Student SHALL be able to see declined/closed state
5. WHEN unauthenticated or non-student requests THEN system SHALL reject appropriately (401/403)
6. WHEN email invite flow is used THEN it SHALL continue to work alongside requests (no regression)

**Independent Test**: Student request → pro accept → both see active link; decline path leaves no link.

---

### P1 / W3-01: Training templates ⭐

**User Story**: As a Trainer, I want to create reusable workout templates so that I can prescribe faster.

**Why P1**: Template library is explicit product requirement for pros.

**Acceptance Criteria**:

1. WHEN Trainer creates a training template THEN system SHALL store name + exercise structure (sets/reps/rest as applicable) owned by the professional
2. WHEN Trainer lists templates THEN system SHALL return only their templates
3. WHEN Trainer updates or archives a template THEN subsequent list/prescribe SHALL use the new state
4. WHEN Nutritionist without trainer role hits training template write APIs THEN system SHALL return 403

**Independent Test**: Create template → list → appears for owner only.

---

### P1 / W3-02: Prescribe training to linked student ⭐

**User Story**: As a Trainer, I want to prescribe a workout plan/routine to a linked student so that it appears in their training experience on the platform.

**Why P1**: Closes API gap (today plans are student-only) and integrates coaching into the product.

**Acceptance Criteria**:

1. WHEN linked Trainer prescribes a plan (from template or ad-hoc) to a student THEN system SHALL create/assign a workout plan for that student
2. WHEN unlinked Trainer tries to prescribe THEN system SHALL return 403
3. WHEN Student opens Training in mobile THEN prescribed plan SHALL be visible/usable in the existing student training flows
4. WHEN Nutritionist-only role tries training prescribe THEN system SHALL return 403

**Independent Test**: Link → prescribe from portal → student sees plan in app.

---

### P1 / W4-01: Nutrition templates / cardápios ⭐

**User Story**: As a Nutritionist, I want reusable nutrition plan/menu templates so that I can prescribe meal targets or cardápios consistently.

**Why P1**: Symmetric to training templates for nutritionists.

**Acceptance Criteria**:

1. WHEN Nutritionist creates a nutrition template THEN system SHALL store daily macro targets and optional menu structure owned by the professional
2. WHEN Nutritionist prescribes from template to a linked student THEN system SHALL create/update the student’s nutrition plan (existing prescribe semantics)
3. WHEN unlinked Nutritionist prescribes THEN system SHALL return 403
4. WHEN Trainer-only role writes nutrition templates THEN system SHALL return 403

**Independent Test**: Create nutrition template → prescribe to linked student → student daily summary shows targets.

---

### P1 / W4-02: Light periodization ⭐

**User Story**: As a Trainer, I want to define a light periodization (weeks/blocks of chained workout plans) so that students follow a progressive routine over time.

**Why P1**: Confirmed v1 depth (not advanced periodization).

**Acceptance Criteria**:

1. WHEN Trainer creates a periodization with ordered blocks/weeks THEN each block SHALL reference a workout plan or template
2. WHEN Trainer assigns periodization to a linked student THEN system SHALL expose the active block’s plan to the student training experience
3. WHEN current block ends (by date or completion rule defined in Design) THEN system SHALL advance to the next block or mark complete
4. WHEN unlinked Trainer assigns periodization THEN system SHALL return 403

**Independent Test**: Create 2-block periodization → assign → student sees active plan; advance → second plan active.

---

### P2: Portal polish (non-blocking)

**User Story**: As a Professional, I want denser tables, filters, and saved views so that large rosters are manageable.

**Why P2**: Nice-to-have after core loops work.

**Acceptance Criteria**:

1. WHEN Professional has many students THEN dashboard SHALL support basic search/filter by name/email
2. WHEN Professional returns to portal THEN last-visited section MAY be restored

**Independent Test**: Search filters roster.

---

## Edge Cases

- WHEN professional subscription lapses THEN portal SHALL block coaching mutations with 402 and show renew CTA; read-only dashboard behavior defined in Design
- WHEN invite token expired THEN accept API returns 410; portal invite UI SHALL allow resend
- WHEN student requests same professional twice while pending THEN system SHALL not create duplicate pending rows (idempotent)
- WHEN student already linked requests again THEN system SHALL return conflict or no-op with clear message
- WHEN public profile requested for unpublished/incomplete pro THEN system SHALL return 404
- WHEN CORS/origin misconfigured in production THEN portal SHALL fail safely (visible network error), not leak tokens
- WHEN user is student+professional THEN portal SHALL operate in professional context; mobile Professionals tab remains student discovery

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| WPORT-01 | W1-01 Portal scaffold & auth | W1 | In progress (T1) |
| WPORT-02 | W1-01 Session 401 handling | W1 | Pending |
| WPORT-03 | W1-02 Checkout professional plan | W1 | Pending |
| WPORT-04 | W1-02 Profile create + 402 paywall | W1 | Pending |
| WPORT-05 | W1-03 Dashboard roster | W1 | Pending |
| WPORT-06 | W1-03 Empty/error states | W1 | Pending |
| WPORT-07 | W1-04 Email invites | W1 | Pending |
| WPORT-08 | W2-01 Public pro profile API | W2 | Pending |
| WPORT-09 | W2-02 Mobile Professionals tab | W2 | Pending |
| WPORT-10 | W2-03 Request link | W2 | Pending |
| WPORT-11 | W2-03 Accept/decline request | W2 | Pending |
| WPORT-12 | W3-01 Training templates CRUD | W3 | Pending |
| WPORT-13 | W3-02 Prescribe training to linked student | W3 | Pending |
| WPORT-14 | W3-02 Student sees prescribed plan | W3 | Pending |
| WPORT-15 | W4-01 Nutrition templates + prescribe | W4 | Pending |
| WPORT-16 | W4-02 Light periodization assign/advance | W4 | Pending |
| WPORT-17 | Design: pro dashboard × Forma brand | All | Pending |
| WPORT-18 | i18n pt-BR + en on portal | All | Pending |
| WPORT-19 | Render deploy + prod CORS for portal | W1 | Pending |

**Coverage:** 19 total, 0 mapped to tasks, 19 unmapped ⚠️ (expected pre-Design/Tasks)

---

## Success Criteria

- [ ] Professional can go from signup → paid profile → invite → see student on dashboard (W1)
- [ ] Student can discover a pro in mobile, request, and get accepted (W2)
- [ ] Trainer can template + prescribe a plan the student uses in-app (W3)
- [ ] Nutritionist can template + prescribe nutrition; trainer can assign a 2+ block periodization (W4)
- [ ] Portal on Render; visual system recognizable as Forma, dashboard-dense for pros
- [ ] Gates per phase: API e2e for new endpoints + portal/mobile checks agreed in Tasks

---

## Implicit-requirement dimensions (Large sweep)

| Dimension | Resolution |
|-----------|------------|
| Input validation & bounds | Email invites, profile fields, template payloads validated via existing DTO patterns; public profile rejects empty publish |
| Failure / partial-failure | Checkout/profile/dashboard/request flows show recoverable errors; 402/403/410 mapped to CTAs |
| Idempotency / retry / duplicate | Pending request unique per pair; invite accept existing conflict rules; prescribe retries documented in Design |
| Auth boundaries & rate limits | Bearer JWT; role + link + entitlement checks; OTP rate limits unchanged; public read endpoints unauthenticated |
| Concurrency / ordering | Periodization advance rules single-threaded per assignment in Design; last-write-wins on template edit |
| Data lifecycle / expiry | Invites 7 days; pending requests TTL default **30 days** then auto-expire (assumption) |
| Observability | API existing logging; portal no PII in client logs |
| External-dependency failure | Stripe checkout failure → paywall error state; no silent entitlement grant |
| State-transition integrity | Request: pending → accepted\|declined\|expired; periodization blocks ordered; decline ≠ link |

---

## Confirm

Please confirm this spec (or request edits). After confirmation → **Design** (architecture for W1 first, with seams for W2–W4), then **Tasks**, then Execute starting at W1.
