# LESSONS — auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation — do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 — When a dashboard row exposes summary fields from the API, assert each field’s rendered value with a non-empty fixture—not only empty or error states
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-portal` · harmful: 0
- features: web-portal
- evidence: W1-03.2 / DashboardPage activity columns (apps/web-portal)
- last seen: 2026-07-12T20:36:13Z

### L-002 — For form submits that map API errors to UI, assert the visible localized error for validation and rate-limit status codes—not only the success path
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-portal` · harmful: 0
- features: web-portal
- evidence: W1-04.2 invite API errors (apps/web-portal)
- last seen: 2026-07-12T20:36:13Z

### L-003 — When an HTTP client delegates 401 to an onUnauthorized hook, assert the wired side effect clears the stored session—not only that a mock callback was invoked
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `apps/web-portal` · harmful: 0
- features: web-portal
- evidence: sensor mutant 8 wire.ts onUnauthorized (apps/web-portal)
- last seen: 2026-07-12T20:36:13Z

### L-004 — Auth recovery ACs that require both clearing storage and returning to login need assertions for both outcomes, not the error-kind mapper alone
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `apps/web-portal` · harmful: 0
- features: web-portal
- evidence: W1-01.4 401 clear session and return to auth (apps/web-portal) (+1 more)
- last seen: 2026-07-12T20:47:19Z

### L-005 — Exercise the production HTTP wiring module (or an exported factory) when asserting 401 session clear—locally reconstructing the same onUnauthorized callback leaves wire.ts untested
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `apps/web-portal` · harmful: 0
- features: web-portal
- evidence: sensor mutant 8 wire.ts onUnauthorized (re-verify iter 1) (apps/web-portal)
- last seen: 2026-07-12T20:47:19Z

### L-006 — When an AC spans accept API plus portal roster refresh, assert the portal-visible student row after accept—or explicitly accept API-only system proof in the AC
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `apps/web-portal` · harmful: 0
- features: web-portal
- evidence: W1-04.3 student accept appears on dashboard after refresh (apps/web-portal) (+1 more)
- last seen: 2026-07-12T20:50:04Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
