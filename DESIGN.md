# Forma — Design System

> Forma × **Apple Fitness iOS** (Summary tab). Spec canônica em `apps/mobile/apple/DESIGN.md`.
> Fonte: [Spectr Apple Fitness](https://www.spectr.to/gallery/apple-fitness) / [awesome-ios-design-md](https://github.com/Meliwat/awesome-ios-design-md/tree/main/design-md/fitness/apple-fitness).

## Visual Theme & Atmosphere

- **Canvas iPhone:** true black `#000000` — the rings are the brightest thing on screen
- **Brand = three Activity rings** (immutable): Move / Exercise / Stand
- **Chrome accent:** Move-pink `#FF375F` (tabs, links, See All)
- **Surfaces:** grouped `#1C1C1E` / `#2C2C2E` — depth from lightness, not shadows
- **Type:** SF Pro + Apple label-opacity ramp (100% / 60% / 30%)
- **Summary anatomy:** header → large title → ring hero → metric tiles → Fitness+ shelf

## Color Palette (Apple Fitness — primary product UI)

| Token | Hex | Role |
|-------|-----|------|
| `canvas` | `#000000` | App background (iPhone) |
| `grouped1` | `#1C1C1E` | Ring card, metric tiles |
| `grouped2` | `#2C2C2E` | Nested / raised |
| `primary` / `accent` | `#30D158` | Brand CTAs, day eyebrow, See All, guidance |
| `primaryPressed` | `#248A3D` | Pressed primary |
| `move` / `moveLabel` | `#FA114F` / `#FF375F` | Outer Activity ring + energy accents (steps tile, Fitness+ type) |
| `exercise` | `#92E82A` | Middle ring |
| `stand` | `#1EE4E1` | Inner ring |
| `ringTrack` | ring @ 22% opacity | Unfilled groove |
| `fitnessPlus` | `#C969E0` | Fitness+ tint |
| `awardGold` | `#FFD60A` | Awards / streak |
| `onPrimary` | `#000000` | Text on green CTA |
| `error` | `#FF453A` | Errors |

**Color roles:** green = brand actions; pink = Move ring / energy only — not competitive CTAs.

## Typography

Apple HIG SF Pro scale — see `apps/mobile/apple/DESIGN.md` §3 and `src/design-systems/appleFitness.ts` (`afTypography`).

## Signature Components

- **ActivityRings** — concentric Move/Exercise/Stand, thick round-capped, sweep animation
- **RingHeroCard** — rings + legend on grouped 18pt card
- **MetricTile** — 2-up grid, tinted symbol + tabular value
- **FitnessPlusShelf** — 168×200 artwork, frosted badge + play
- **AFPrimaryButton** — Move fill `#FA114F`, 14pt radius

## i18n

`pt-BR` default + full `en`. Never hardcode UI strings.
