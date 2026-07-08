# Forma UI/UX Rules

Mandatory for mobile and (later) web product surfaces. Used by agents running **tlc-spec-driven** on frontend features.

## Visual contract

1. Follow root [`DESIGN.md`](../../DESIGN.md) for colors, type, and Summary anatomy.
2. Use Apple Fitness anatomy in [references/apple-fitness-DESIGN.md](references/apple-fitness-DESIGN.md) for layout/component detail.
3. **Primary brand = green `#30D158`.** Move pink `#FA114F` is only for the outer ring and energy accents — never for primary CTAs.
4. iPhone chrome is **true black** `#000000` + grouped `#1C1C1E`. Depth = lighter surfaces, not drop shadows.
5. `pt-BR` default + `en` — no hard-coded UI copy.

## Do

- Build Home as Summary: eyebrow → date → title → ring hero → metric tiles → guidance → CTA
- Rings: Move outer / Exercise middle / Stand inner; tracks at 22% opacity of each ring color
- CTAs: green fill, black label; pressed `#248A3D`
- Active tab / See All / guidance chrome: green
- Tabular numerals on all metrics
- Safe areas, 44pt+ touch targets, 16pt side insets
- Respect `prefers-reduced-motion` — rings may crossfade instead of sweep

## Don’t

- Use Wise sage/lime or Shopify cream/cinematic thin-display as product direction
- Pink primary buttons or pink tab chrome
- Cream / beige / parchment canvas as default mobile shell
- Nested cards; side-stripe accent borders; decorative gradients as brand
- Gray hexes for secondary text — use white (or black on light) at 60% / 30% opacity
- Drop shadows on grouped cards
- reinvent typography outside SF Pro / Apple HIG sizes
- Ship screens without loading, empty, and error states

## Surfaces & actors

| Surface | Actor | Notes |
|---------|-------|-------|
| Mobile Expo | Aluno (first) | Canonical design |
| Web portal | Personal / Nutricionista | Same tokens; denser Linear/Cal layout later — secondary |

## Spec-driven checklist (every feature)

When writing `spec.md` / `design.md` / `tasks.md` for UI:

- [ ] Acceptance criteria mention dark Summary feel and primary green CTAs where relevant
- [ ] Copy keys planned for pt-BR + en
- [ ] Empty / loading / error states listed
- [ ] Design.md task notes point to `DESIGN.md` + this file
- [ ] No dependency on deleted `apps/mobile` prototype paths

## Client state (mobile, AD-030)

- **Zustand** for session, locale, and per-slice feature state (`apps/mobile/src/stores/`).
- Thin hooks (`useSession`, `useLocale`) read stores; screens stay dumb.
- **No React Context** for app state. Theme follows system via `useFormaTheme()` + `useColorScheme`.
- New slices: one `create()` store per feature domain (e.g. `homeSummaryStore`); wire API via `getWired*Api()` or `wireApiStores`.

## Scaffold note

`apps/mobile` is scaffolded via `mobile-foundation`. New UI slices follow this file + `DESIGN.md` — do not resurrect Wise/Shopify prototypes.
