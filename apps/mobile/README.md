# @forma/mobile

Expo student app (Slice 0 foundation). Home Summary rings ship in Slice 1 (`mobile-home-summary`).

## Prerequisites

- Node 20+ and pnpm (repo root `pnpm install`)
- Forma API running locally or reachable over the network

## Environment

Copy `.env.example` to `.env` in this folder (or set vars in your shell):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | API base URL (default `http://localhost:3000`) |
| `EXPO_PUBLIC_OAUTH_SUCCESS_URL` | Deep link receiving OAuth `accessToken` (default `forma://oauth`) |

API must set matching `OAUTH_MOBILE_SUCCESS_URL` when testing OAuth on device/simulator.

## Run

From repo root:

```bash
pnpm --filter @forma/api dev          # terminal 1 — API
pnpm --filter @forma/mobile start     # terminal 2 — Expo
```

Press `i` / `a` for iOS/Android simulator, or scan QR in Expo Go.

**Dev auth:** API `OAUTH_MOCK=true` enables mock OAuth; email OTP uses `EMAIL_PROVIDER=mock` in test/dev.

## Quality gates

```bash
pnpm --filter @forma/mobile test
pnpm --filter @forma/mobile check-types
pnpm lint
```

Manual smoke: see [`SMOKE.md`](./SMOKE.md).

## Slice 1 handoff

Replace the Home placeholder in `app/(tabs)/index.tsx` with Home Summary UI per `.specs/features/mobile-home-summary/`.
