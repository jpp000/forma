# @forma/mobile — Handoff

Expo app for Forma students (and later professionals on other surfaces).

## Status

| Item | Value |
|------|-------|
| Branch | `feat-frontend-foundation` |
| Design decision | **Accepted:** Apple Fitness Summary × Forma primary green (**Variant A**) |
| Tokens | `src/design-systems/appleFitness.ts` |
| Spec (anatomy) | `apple/DESIGN.md` + `apple/DESIGN-expo.md` |
| Project design root | `/DESIGN.md` |

## What is prototype vs product

| Path | Role |
|------|------|
| `src/prototype/home/VariantA.tsx` | **Accepted visual reference** — promote into real Home |
| `src/prototype/home/VariantB.tsx` | Rejected (Wise) — do not use for product |
| `src/prototype/home/VariantC.tsx` | Rejected (Shopify) — do not use for product |
| `src/components/apple-fitness/*` | **Keep** — production building blocks |
| `app/prototype/home.tsx` | Throwaway switcher — remove after Home ships |

## Color contract

- **Primary / CTAs / brand chrome:** `#30D158`
- **Move ring / energy accents:** `#FA114F` / `#FF375F`
- **Exercise / Stand rings:** `#92E82A` / `#1EE4E1`
- **Canvas:** `#000000` · **Cards:** `#1C1C1E`

## Run

```bash
cd apps/mobile
pnpm ios          # preferred — Summary look is dark-first
pnpm start        # Expo Go
```

Open app → **Abrir Summary** → Variant **A**. Dark mode (`Cmd+Shift+A`) for canonical look.

## Next agent — full app (suggested order)

1. Read `/DESIGN.md` and `src/design-systems/appleFitness.ts`
2. Real tab shell: Home / Training / Nutrition / Progress — active tint green
3. Lift Variant A → `app/(tabs)/index` (or `home`) as production Summary
4. Auth + onboarding mínimo (OAuth first)
5. Wire API (`feat-platform-foundation` / `/api/docs`) — replace mock data
6. Delete `/prototype` and Wise/Shopify design-system files when no longer needed

## Do not

- Restyle primary CTAs to Move-pink
- Rebuild from Wise or Shopify prototypes
- Use cream/beige canvases or generic card dashboards
- Drop-shadow elevation on grouped cards (surface lightness only)
