import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { type ColorScheme, type FormaColors, palettes } from './colors';
import { type FormaTypography, typography } from './typography';

export type FormaTheme = {
  colors: FormaColors;
  typography: FormaTypography;
  scheme: ColorScheme;
};

/** Resolves light/dark tokens from the system color scheme (no user override in MVP). */
export function useFormaTheme(): FormaTheme {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'light' ? 'light' : 'dark';

  return useMemo<FormaTheme>(
    () => ({
      colors: palettes[scheme],
      typography,
      scheme,
    }),
    [scheme],
  );
}
