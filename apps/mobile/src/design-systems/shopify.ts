/**
 * Shopify-inspired cinematic — apps/mobile/shopify/DESIGN.md
 * Near-black canvas, thin display type, outline pills, mint accents on light bands.
 */
import { Platform } from 'react-native';

import type { DesignSystem } from './types';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

const display = Platform.select({ ios: 'System', default: 'System' });

export const shopifySystem: DesignSystem = {
  id: 'shopify',
  label: 'Shopify',
  palette: (theme) => {
    const cinematic = theme.isDark;
    return {
      bg: cinematic ? '#000000' : '#FBFBF5',
      surface: cinematic ? '#0A0A0A' : '#FFFFFF',
      surfaceElevated: cinematic ? '#1E2C31' : '#FFFFFF',
      ink: cinematic ? '#FFFFFF' : '#000000',
      inkSecondary: cinematic ? '#A1A1AA' : '#52525B',
      inkTertiary: cinematic ? '#71717A' : '#A1A1AA',
      separator: cinematic ? 'rgba(255,255,255,0.08)' : '#E4E4E7',
      border: cinematic ? '#FFFFFF' : '#000000',
      primary: '#000000',
      primaryOn: '#FFFFFF',
      training: '#FFD60A',
      nutrition: '#FF9F0A',
      progress: '#64D2FF',
      accent: '#C1FBD4',
      accentSoft: '#D4F9E0',
    };
  },
  type: {
    hero: {
      fontFamily: display,
      fontSize: 48,
      fontWeight: '300',
      letterSpacing: 0.5,
      lineHeight: 52,
    },
    title: {
      fontFamily: display,
      fontSize: 28,
      fontWeight: '500',
      letterSpacing: 0.42,
      lineHeight: 36,
    },
    body: {
      fontFamily: display,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyStrong: {
      fontFamily: display,
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontFamily: display,
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 0.28,
      lineHeight: 20,
    },
    metric: {
      fontFamily: display,
      fontSize: 32,
      fontWeight: '300',
      fontVariant: ['tabular-nums'],
      letterSpacing: 0.5,
    },
    metricHero: {
      fontFamily: display,
      fontSize: 56,
      fontWeight: '300',
      fontVariant: ['tabular-nums'],
      letterSpacing: 1,
      lineHeight: 58,
    },
  },
  radius: { card: 12, button: 999, group: 12 },
  buttonPrimary: (p) => ({
    backgroundColor: 'transparent',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: p.ink,
    paddingVertical: 14,
    paddingHorizontal: 26,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonPrimaryText: (p) => ({
    color: p.ink,
    fontSize: 16,
    fontWeight: '500',
  }),
  buttonSecondary: (p) => ({
    backgroundColor: 'transparent',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: p.inkSecondary,
    paddingVertical: 14,
    paddingHorizontal: 26,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  }),
  buttonSecondaryText: (p) => ({
    color: p.inkSecondary,
    fontSize: 16,
    fontWeight: '500',
  }),
};
