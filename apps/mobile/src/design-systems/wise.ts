/**
 * Wise-inspired — apps/mobile/wise/DESIGN.md
 * Sage canvas, lime CTA, 24px card radius, heavy display metrics.
 */
import { Platform } from 'react-native';

import type { DesignSystem } from './types';

const font = Platform.select({ ios: 'System', default: 'System' });

export const wiseSystem: DesignSystem = {
  id: 'wise',
  label: 'Wise',
  palette: () => ({
    bg: '#E8EBE6',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    ink: '#0E0F0C',
    inkSecondary: '#454745',
    inkTertiary: '#868685',
    separator: '#E2E4DF',
    border: '#0E0F0C',
    primary: '#9FE870',
    primaryOn: '#0E0F0C',
    training: '#FFD60A',
    nutrition: '#FF9F0A',
    progress: '#64D2FF',
    accent: '#9FE870',
    accentSoft: '#E2F6D5',
  }),
  type: {
    hero: {
      fontFamily: font,
      fontSize: 40,
      fontWeight: '900',
      letterSpacing: -0.5,
      lineHeight: 44,
    },
    title: {
      fontFamily: font,
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.48,
      lineHeight: 31,
    },
    body: {
      fontFamily: font,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyStrong: {
      fontFamily: font,
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontFamily: font,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    metric: {
      fontFamily: font,
      fontSize: 32,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
      lineHeight: 36,
    },
    metricHero: {
      fontFamily: font,
      fontSize: 64,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
      lineHeight: 58,
      letterSpacing: -1,
    },
  },
  radius: { card: 24, button: 24, group: 24 },
  buttonPrimary: (p) => ({
    backgroundColor: p.primary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonPrimaryText: (p) => ({
    color: p.primaryOn,
    fontSize: 16,
    fontWeight: '600',
  }),
  buttonSecondary: (p) => ({
    backgroundColor: p.bg,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: p.ink,
  }),
  buttonSecondaryText: (p) => ({
    color: p.ink,
    fontSize: 16,
    fontWeight: '600',
  }),
};
