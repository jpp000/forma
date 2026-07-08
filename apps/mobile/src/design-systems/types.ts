import type { TextStyle, ViewStyle } from 'react-native';

import type { FormaTheme } from '@/src/theme/useFormaTheme';

export type DesignSystemId = 'apple-fitness' | 'wise' | 'shopify';

export interface DesignPalette {
  bg: string;
  surface: string;
  surfaceElevated: string;
  ink: string;
  inkSecondary: string;
  inkTertiary: string;
  separator: string;
  border: string;
  primary: string;
  primaryOn: string;
  training: string;
  nutrition: string;
  progress: string;
  accent?: string;
  accentSoft?: string;
}

export interface DesignSystem {
  id: DesignSystemId;
  label: string;
  palette: (theme: FormaTheme) => DesignPalette;
  type: {
    hero: TextStyle;
    title: TextStyle;
    body: TextStyle;
    bodyStrong: TextStyle;
    caption: TextStyle;
    metric: TextStyle;
    metricHero: TextStyle;
  };
  radius: {
    card: number;
    button: number;
    group: number;
  };
  buttonPrimary: (palette: DesignPalette) => ViewStyle;
  buttonPrimaryText: (palette: DesignPalette) => TextStyle;
  buttonSecondary: (palette: DesignPalette) => ViewStyle;
  buttonSecondaryText: (palette: DesignPalette) => TextStyle;
}
