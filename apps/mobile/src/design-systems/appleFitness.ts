/**
 * Forma × Apple Fitness — from apps/mobile/apple/DESIGN.md + iOS Fitness Summary patterns.
 * True-black dark, parchment light, SF scale, grouped lists, domain rings.
 */
import { Platform, StyleSheet } from 'react-native';

import type { DesignSystem } from './types';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

const font = Platform.select({ ios: 'System', default: 'System' });

export const appleFitnessSystem: DesignSystem = {
  id: 'apple-fitness',
  label: 'Apple Fitness',
  palette: (theme) => {
    const d = theme.isDark;
    return {
      bg: d ? '#000000' : '#FFFFFF',
      surface: d ? '#1C1C1E' : '#F2F2F7',
      surfaceElevated: d ? '#2C2C2E' : '#FFFFFF',
      ink: d ? '#FFFFFF' : '#1D1D1F',
      inkSecondary: d ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)',
      inkTertiary: d ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)',
      separator: d ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)',
      border: d ? 'rgba(84,84,88,0.45)' : 'rgba(60,60,67,0.16)',
      primary: '#30D158',
      primaryOn: '#000000',
      training: '#FFD60A',
      nutrition: '#FF9F0A',
      progress: '#64D2FF',
    };
  },
  type: {
    hero: {
      fontFamily: font,
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: 0.37,
    },
    title: {
      fontFamily: font,
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: 0.35,
    },
    body: {
      fontFamily: font,
      fontSize: 17,
      fontWeight: '400',
      letterSpacing: -0.41,
      lineHeight: 24,
    },
    bodyStrong: {
      fontFamily: font,
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: -0.41,
      lineHeight: 22,
    },
    caption: {
      fontFamily: font,
      fontSize: 13,
      fontWeight: '400',
      letterSpacing: -0.08,
      lineHeight: 18,
    },
    metric: {
      fontFamily: font,
      fontSize: 28,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
      letterSpacing: 0.36,
    },
    metricHero: {
      fontFamily: font,
      fontSize: 40,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
      letterSpacing: 0.4,
    },
  },
  radius: { card: 14, button: 999, group: 14 },
  buttonPrimary: (p) => ({
    backgroundColor: p.primary,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 22,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonPrimaryText: () => ({
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  }),
  buttonSecondary: (p) => ({
    backgroundColor: 'transparent',
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 22,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonSecondaryText: (p) => ({
    color: p.primary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  }),
};

export const appleFitnessStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 28 },
  ringsHero: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 20,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
});
