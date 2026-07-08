# Forma — Design System

> **Canonical product UI:** Forma × Apple Fitness Summary (prototype **Variant A**).
> Layout/anatomy from the Apple Fitness iOS pack; brand chrome is Forma green.

| Resource | Path / URL |
|----------|------------|
| Accepted prototype | `apps/mobile/src/prototype/home/VariantA.tsx` |
| Tokens + type | `apps/mobile/src/design-systems/appleFitness.ts` |
| Components | `apps/mobile/src/components/apple-fitness/` |
| Apple Fitness spec (anatomy) | `apps/mobile/apple/DESIGN.md` |
| Expo companion | `apps/mobile/apple/DESIGN-expo.md` |
| Gallery | https://www.spectr.to/gallery/apple-fitness |
| Upstream pack | https://github.com/Meliwat/awesome-ios-design-md/tree/main/design-md/fitness/apple-fitness |

**Not product direction:** Wise (Variant B) and Shopify (Variant C) prototypes — keep only as rejected explorations.

## Visual Theme & Atmosphere

- **Canvas (iPhone):** true black `#000000`
- **Surfaces:** grouped `#1C1C1E` / `#2C2C2E` — depth from lightness, not drop shadows
- **Type:** SF Pro (system) + Apple label-opacity ramp (100% / 60% / 30%)
- **Summary anatomy:** day eyebrow → date → large title → ring hero → 2×2 metric tiles → guidance → Fitness+ shelf → primary CTA
- **Mood:** precise, calm, premium — rings and artwork carry energy; chrome stays quiet

## Color Roles (Forma remapping)

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| **Brand primary** | `primary` | `#30D158` | CTAs, day eyebrow, See All, guidance, tab active, brand chrome |
| Pressed | `primaryPressed` | `#248A3D` | Pressed primary |
| Soft | `primarySoft` | green @ 18% | Tinted secondary buttons |
| On primary | `onPrimary` | `#000000` | Text on green fills |
| **Move ring** | `move` / `moveLabel` | `#FA114F` / `#FF375F` | Outer Activity ring + energy accents (steps, Fitness+ type labels) |
| **Exercise ring** | `exercise` | `#92E82A` | Middle ring |
| **Stand ring** | `stand` | `#1EE4E1` | Inner ring |
| Ring track | `*Track` | ring @ 22% opacity | Unfilled groove |
| Surfaces | `canvas` / `grouped1` / `grouped2` | `#000000` / `#1C1C1E` / `#2C2C2E` | App bg + cards |
| Labels | primary / secondary / tertiary | white / white@60% / white@30% | Text on dark |
| Fitness+ | `fitnessPlus` | `#C969E0` | Shelf tint |
| Award | `awardGold` | `#FFD60A` | Streak / awards |
| Error | `error` | `#FF453A` | Errors |

**Rule:** green = brand actions. Pink = Move energy only — never the primary CTA.

## Domain → ring mapping (Forma product)

| Forma domain | Visual cue |
|--------------|------------|
| Training | Exercise green `#92E82A` |
| Nutrition / energy | Move pink `#FA114F` |
| Progress | Stand cyan `#1EE4E1` |
| Brand / guidance / streak chrome | Primary green `#30D158` |

## Typography

Apple HIG SF Pro scale — implement via `afTypography` in `appleFitness.ts`.  
Tabular numerals on all metrics. Do not invent a bespoke type scale.

## Signature Components (reuse for full app)

| Component | File | Notes |
|-----------|------|-------|
| `ActivityRings` | `components/apple-fitness/ActivityRings.tsx` | Concentric Move/Exercise/Stand, sweep |
| `RingHeroCard` | `components/apple-fitness/RingHeroCard.tsx` | Rings + legend on 18pt grouped card |
| `MetricTile` | `components/apple-fitness/MetricTile.tsx` | 2-up grid tiles |
| `FitnessPlusShelf` | `components/apple-fitness/FitnessPlusShelf.tsx` | Horizontal cinematic cards |
| `AFPrimaryButton` | `components/apple-fitness/AFPrimaryButton.tsx` | Green fill + black label |

## Screens to build next (full app)

Promote Variant A patterns into real routes (do not keep product UI under `/prototype`):

1. Auth (OAuth-first + OTP) — quiet black canvas, green primary CTAs
2. Onboarding mínimo — health goal
3. Home = Summary (Variant A → production)
4. Training session / Nutrition log / Progress — same tokens + grouped cards
5. Tab bar — active tint `primary` `#30D158`

## i18n

`pt-BR` default + full `en`. Never hardcode user-facing strings.

## Agent prompt (canonical)

```
Forma mobile UI: Apple Fitness Summary anatomy on true black.
Brand primary #30D158 (CTAs, chrome). Move ring #FA114F, Exercise #92E82A, Stand #1EE4E1.
Use tokens from apps/mobile/src/design-systems/appleFitness.ts and components under
apps/mobile/src/components/apple-fitness/. Match Variant A — not Wise/Shopify prototypes.
Grouped #1C1C1E cards, SF Pro, label-opacity text, tabular metrics. No drop-shadow cards.
```
