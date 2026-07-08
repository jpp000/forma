/**
 * Forma × Apple Fitness Summary layout.
 * Anatomy from apps/mobile/apple/DESIGN.md.
 *
 * Brand primary (CTAs, See All, brand chrome): Forma green `#30D158`
 * Move ring (energy): Apple pink `#FA114F` / label `#FF375F` — kept where the
 * three-ring Activity identity needs it
 * Exercise / Stand: Apple lime / cyan
 */
import { Platform, type TextStyle } from 'react-native';

import type { FormaTheme } from '@/src/theme/useFormaTheme';

import type { DesignPalette, DesignSystem } from './types';

export const afColors = {
  // Forma brand — primary chrome
  primary: '#30D158',
  primaryPressed: '#248A3D',
  primarySoft: 'rgba(48,209,88,0.18)',
  onPrimary: '#000000',

  // Move ring — Apple energy pink (rings keep their identity)
  move: '#FA114F',
  moveLabel: '#FF375F',
  moveTrack: 'rgba(250,17,79,0.22)',

  exercise: '#92E82A',
  exerciseHi: '#66FF00',
  exerciseTrack: 'rgba(146,232,42,0.22)',

  stand: '#1EE4E1',
  standHi: '#00F0FF',
  standTrack: 'rgba(30,228,225,0.22)',

  // Brand aliases used by chrome helpers
  accent: '#30D158',
  accentPressed: '#248A3D',
  accentSoft: 'rgba(48,209,88,0.18)',
  fitnessPlus: '#C969E0',

  canvas: '#000000',
  grouped1: '#1C1C1E',
  grouped2: '#2C2C2E',
  grouped3: '#3A3A3C',
  separator: '#38383A',
  fill: 'rgba(118,118,128,0.24)',

  labelPrimary: '#FFFFFF',
  labelSecondary: 'rgba(235,235,245,0.60)',
  labelTertiary: 'rgba(235,235,245,0.30)',

  lightCanvas: '#F2F2F7',
  lightSurface: '#FFFFFF',
  lightSeparator: '#C6C6C8',
  lightLabel: '#000000',
  lightLabelSecondary: 'rgba(60,60,67,0.60)',
  lightLabelTertiary: 'rgba(60,60,67,0.30)',

  success: '#32D74B',
  error: '#FF453A',
  awardGold: '#FFD60A',
} as const;

export const ringConfig = [
  {
    key: 'move' as const,
    color: afColors.move,
    track: afColors.moveTrack,
    label: afColors.moveLabel,
  },
  {
    key: 'exercise' as const,
    color: afColors.exercise,
    track: afColors.exerciseTrack,
    label: afColors.exercise,
  },
  {
    key: 'stand' as const,
    color: afColors.stand,
    track: afColors.standTrack,
    label: afColors.stand,
  },
] as const;

const f = (
  ios: TextStyle['fontWeight'],
  _fallback: string,
): Pick<TextStyle, 'fontFamily' | 'fontWeight'> =>
  Platform.OS === 'ios'
    ? { fontWeight: ios }
    : { fontFamily: 'System', fontWeight: ios };

const TABULAR: TextStyle = { fontVariant: ['tabular-nums'] };

export const afTypography = {
  largeTitle: {
    color: afColors.labelPrimary,
    ...f('800', 'System'),
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  date: {
    color: afColors.labelPrimary,
    ...f('800', 'System'),
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.6,
  },
  header: {
    color: afColors.labelPrimary,
    ...f('800', 'System'),
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  section: {
    color: afColors.labelPrimary,
    ...f('800', 'System'),
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  title3: {
    color: afColors.labelPrimary,
    ...f('700', 'System'),
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.3,
  },
  body: {
    color: afColors.labelPrimary,
    ...f('600', 'System'),
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  bodyReg: {
    color: afColors.labelPrimary,
    ...f('400', 'System'),
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  ringValue: {
    ...TABULAR,
    color: afColors.labelPrimary,
    ...f('800', 'System'),
    fontSize: 19,
    lineHeight: 21,
  },
  tileValue: {
    ...TABULAR,
    color: afColors.labelPrimary,
    ...f('800', 'System'),
    fontSize: 22,
    lineHeight: 24,
  },
  cardTitle: {
    color: afColors.labelPrimary,
    ...f('600', 'System'),
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  footnote: {
    color: afColors.labelSecondary,
    ...f('400', 'System'),
    fontSize: 13,
    lineHeight: 18,
  },
  eyebrow: {
    ...f('700', 'System'),
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
  button: {
    color: afColors.labelPrimary,
    ...f('600', 'System'),
    fontSize: 17,
    lineHeight: 17,
    letterSpacing: -0.2,
  },
  badge: {
    color: afColors.labelPrimary,
    ...f('700', 'System'),
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} satisfies Record<string, TextStyle>;

export function afSurface(theme: FormaTheme) {
  if (theme.isDark) {
    return {
      canvas: afColors.canvas,
      grouped: afColors.grouped1,
      raised: afColors.grouped2,
      separator: afColors.separator,
      ink: afColors.labelPrimary,
      inkSecondary: afColors.labelSecondary,
      inkTertiary: afColors.labelTertiary,
    };
  }
  return {
    canvas: afColors.lightCanvas,
    grouped: afColors.lightSurface,
    raised: afColors.lightSurface,
    separator: afColors.lightSeparator,
    ink: afColors.lightLabel,
    inkSecondary: afColors.lightLabelSecondary,
    inkTertiary: afColors.lightLabelTertiary,
  };
}

/** DesignSystem adapter used by shared prototype switcher (Variant A only). */
export const appleFitnessSystem: DesignSystem = {
  id: 'apple-fitness',
  label: 'Apple Fitness',
  palette: (theme) => {
    const s = afSurface(theme);
    return {
      bg: s.canvas,
      surface: s.grouped,
      surfaceElevated: s.raised,
      ink: s.ink,
      inkSecondary: s.inkSecondary,
      inkTertiary: s.inkTertiary,
      separator: s.separator,
      border: s.separator,
      primary: afColors.primary,
      primaryOn: afColors.onPrimary,
      training: afColors.exercise,
      nutrition: afColors.move,
      progress: afColors.stand,
    } satisfies DesignPalette;
  },
  type: {
    hero: afTypography.date,
    title: afTypography.section,
    body: afTypography.bodyReg,
    bodyStrong: afTypography.body,
    caption: afTypography.footnote,
    metric: afTypography.tileValue,
    metricHero: afTypography.largeTitle,
  },
  radius: { card: 14, button: 14, group: 18 },
  buttonPrimary: () => ({
    backgroundColor: afColors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonPrimaryText: () => ({
    ...afTypography.button,
    color: afColors.onPrimary,
  }),
  buttonSecondary: () => ({
    backgroundColor: afColors.primarySoft,
    borderRadius: 12,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonSecondaryText: () => ({
    ...afTypography.button,
    fontSize: 15,
    color: afColors.primary,
  }),
};
