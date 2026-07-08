/**
 * Forma × Apple Fitness Summary layout.
 * Spec anatomy from apps/mobile/apple/DESIGN.md — brand chrome remapped to Forma primary green.
 * Source layout: https://github.com/Meliwat/awesome-ios-design-md/tree/main/design-md/fitness/apple-fitness
 *
 * Move ring + chrome = Forma primary `#30D158` (replaces Apple Move-pink).
 * Exercise / Stand keep Apple ring roles (lime / cyan) for a three-ring read.
 */
import { Platform, type TextStyle } from 'react-native';

import type { FormaTheme } from '@/src/theme/useFormaTheme';

import type { DesignPalette, DesignSystem } from './types';

export const afColors = {
  // Forma primary — owns Move ring + chrome (was Apple Move-pink)
  move: '#30D158',
  moveLabel: '#30D158',
  exercise: '#92E82A',
  exerciseHi: '#66FF00',
  stand: '#1EE4E1',
  standHi: '#00F0FF',

  moveTrack: 'rgba(48,209,88,0.22)',
  exerciseTrack: 'rgba(146,232,42,0.22)',
  standTrack: 'rgba(30,228,225,0.22)',

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

  // Distinct from Move — reserved for goal-met confirmations when needed
  success: '#32D74B',
  error: '#FF453A',
  awardGold: '#FFD60A',
  onPrimary: '#000000',
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
      primary: afColors.accent,
      primaryOn: afColors.labelPrimary,
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
    backgroundColor: afColors.move,
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
    backgroundColor: afColors.accentSoft,
    borderRadius: 12,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonSecondaryText: () => ({
    ...afTypography.button,
    fontSize: 15,
    color: afColors.accent,
  }),
};
