# Forma — Design System (canonical)

> Product UI direction: **Apple Fitness Summary anatomy × Forma primary green**.
> Spec-driven frontend work (`tlc-spec-driven`) must follow this file + `.specs/ui/`.

**Status:** Design locked. Prototype Expo code removed — scaffold & implement from these references, not from deleted prototype source.

## Sources of truth

| Doc | Role |
|-----|------|
| **This file** (`DESIGN.md`) | Brand roles, colors, type, layout rules, agent prompt |
| [`.specs/ui/RULES.md`](.specs/ui/RULES.md) | UX/UI do’s & don’ts for every screen |
| [`.specs/ui/references/apple-fitness-DESIGN.md`](.specs/ui/references/apple-fitness-DESIGN.md) | Full Apple Fitness iOS anatomy (rings, Summary, cards) |
| [`.specs/ui/references/apple-fitness-DESIGN-expo.md`](.specs/ui/references/apple-fitness-DESIGN-expo.md) | Expo translation notes when scaffolding RN |
| Gallery | https://www.spectr.to/gallery/apple-fitness |

**Rejected:** Wise and Shopify explorations — do not use for product UI.

## Visual theme

- **Canvas (iPhone):** true black `#000000`
- **Surfaces:** grouped `#1C1C1E` / `#2C2C2E` — depth from lightness, not drop shadows
- **Type:** SF Pro (system) + Apple label-opacity ramp (100% / 60% / 30%)
- **Home anatomy (Summary):** day eyebrow → date → large title → concentric ring hero → 2×2 metric tiles → guidance → optional shelf → primary CTA
- **Mood:** precise, calm, premium — rings/artwork carry energy; chrome stays quiet

## Color roles

| Role | Hex | Use |
|------|-----|-----|
| **Brand primary** | `#30D158` | CTAs, day eyebrow, See All, guidance, active tab, brand chrome |
| Primary pressed | `#248A3D` | Pressed primary |
| Primary soft | `rgba(48,209,88,0.18)` | Tinted secondary actions |
| On primary | `#000000` | Text on green fills |
| **Move ring** | `#FA114F` · label `#FF375F` | Outer Activity ring + energy accents only |
| **Exercise ring** | `#92E82A` | Middle ring / training cue |
| **Stand ring** | `#1EE4E1` | Inner ring / progress cue |
| Ring track | ring color @ **22%** opacity | Unfilled groove |
| Canvas | `#000000` | App background |
| Grouped card | `#1C1C1E` | Cards, hero plates |
| Raised | `#2C2C2E` | Nested / pressed surfaces |
| Separator | `#38383A` | Hairlines |
| Labels | white / white@60% / white@30% | Primary / secondary / tertiary |
| Fitness+ tint | `#C969E0` | Optional shelf / catalog tint |
| Award | `#FFD60A` | Streak / awards |
| Error | `#FF453A` | Errors |

**Rule:** green = brand actions. Pink = Move energy only — never the primary CTA.

## Domain → color mapping

| Forma domain | Cue |
|--------------|-----|
| Training | Exercise `#92E82A` |
| Nutrition / energy | Move `#FA114F` |
| Progress | Stand `#1EE4E1` |
| Brand / guidance / chrome | Primary `#30D158` |

## Typography

Follow Apple HIG SF Pro text styles from the Apple Fitness reference (Large Title, Date, Section, Body, Footnote, Eyebrow). Tabular numerals on all metrics. Do not invent a bespoke scale.

## Signature patterns to implement

When scaffolding `apps/mobile`, recreate these — names are guidance, not legacy imports:

1. **ActivityRings** — concentric Move / Exercise / Stand, thick round-capped stroke, 12 o’clock start, soft glow, sweep animation
2. **RingHeroCard** — rings + legend on 18pt grouped card
3. **MetricTile** — 2-up grid, icon tint + tabular value
4. **Primary button** — fill `#30D158`, label black, ~14pt radius
5. **Grouped lists/cards** — `#1C1C1E`, 14–18pt radius, no drop shadow

## MVP mobile surfaces (build order)

1. Auth — OAuth-first + email OTP; black canvas, green CTAs  
2. Onboarding mínimo — health goal  
3. Home = Summary (anatomy above)  
4. Training / Nutrition / Progress — same tokens  
5. Tab bar — active tint `#30D158`

## i18n

`pt-BR` default + full `en`. No hard-coded user-facing strings.

## Client state (mobile Expo, AD-030)

- **Zustand** stores in `apps/mobile/src/stores/` — session, locale, per-slice feature state.
- Hooks: `useSession`, `useLocale`, `useFormaTheme()` (system light/dark via `useColorScheme`).
- No React Context for app state. API client reads stores via `wireApiStores`.

## Agent prompt (paste into specs / tasks)

```
Forma mobile UI: Apple Fitness Summary anatomy on true black.
Brand primary #30D158 (CTAs, chrome). Move #FA114F, Exercise #92E82A, Stand #1EE4E1.
Follow DESIGN.md + .specs/ui/RULES.md + .specs/ui/references/apple-fitness-DESIGN.md.
Grouped #1C1C1E cards, SF Pro, label-opacity text, tabular metrics. No drop-shadow cards.
Green brand ≠ Move pink. Do not use Wise/Shopify aesthetics.
```
