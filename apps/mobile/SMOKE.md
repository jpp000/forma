# Mobile Foundation — Smoke Checklist

Manual verification for Slice 0 (Verifier / QA). Run API (`pnpm --filter @forma/api dev`) and mobile (`pnpm --filter @forma/mobile start`) with `EXPO_PUBLIC_API_URL` pointing at the API.

## Prerequisites

- API running with `EMAIL_PROVIDER=mock` (or Resend configured) and `OAUTH_MOCK=true` for OAuth dev path
- Mobile `.env` sets `EXPO_PUBLIC_API_URL` (default `http://localhost:3000`)
- Fresh simulator/device; toggle light and dark once during pass

## 1. Cold start → Auth

| Step | Expected |
|------|----------|
| Launch app with no stored token | Loading briefly, then Auth sign-in screen |
| Auth screen | OAuth buttons + email field; green primary CTA; localized copy (pt-BR default) |

## 2. Email OTP → onboarding → tabs

| Step | Expected |
|------|----------|
| Enter valid email → request OTP | Navigates to OTP screen; no crash |
| Enter correct 6-digit code | JWT stored; lands on **Profile** onboarding (not Goal first) |
| Submit valid profile | Navigates to Goal step |
| Select health goal → submit | Lands in tab shell (Home / Training / Nutrition / Progress) |
| Active tab tint | Green `#30D158` |

## 3. Returning student skips onboarding

| Step | Expected |
|------|----------|
| Kill app and relaunch (same user) | Skips Auth and onboarding; opens tab shell directly |
| `GET /identity/me` has `student` role | Confirms gate uses roles, not a local flag |

## 4. Logout

| Step | Expected |
|------|----------|
| Home tab → **Sair** / **Log out** | Token cleared; Auth screen shown |
| Attempt deep link to tabs while logged out | Tabs not reachable (Protected guard) |

## 5. OAuth mock path (optional)

| Step | Expected |
|------|----------|
| Tap Google/Apple/Facebook with `OAUTH_MOCK=true` | Completes to JWT; post-auth gate same as OTP |
| Cancel browser session | Localized cancel message; stays on Auth |

Requires `EXPO_PUBLIC_OAUTH_SUCCESS_URL` aligned with API `OAUTH_MOBILE_SUCCESS_URL` when testing mobile redirect (T19).

## 6. Session / 401

| Step | Expected |
|------|----------|
| Revoke session server-side or expire JWT, then pull-to-refresh or any API call | App clears session and returns to Auth |
| SecureStore read failure | Treated as logged out → Auth |

## 7. Error / retry

| Step | Expected |
|------|----------|
| Airplane mode on profile or goal submit | Localized network error + retry on same step |
| Goal API fails after profile saved | Stays on Goal with error; does not re-collect profile |

## Automated gates (CI / agent)

```bash
pnpm --filter @forma/mobile test
pnpm --filter @forma/mobile check-types
pnpm lint
pnpm --filter @forma/api test:e2e   # includes OAuth mobile redirect after T19
```

**Slice 1** replaces Home placeholder in `app/(tabs)/index.tsx` — do not expect rings or Summary UI in this checklist.
