import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { type ColorScheme, type FormaColors, palettes } from './colors';
import { type FormaTypography, typography } from './typography';

type FormaTheme = {
  colors: FormaColors;
  typography: FormaTypography;
  scheme: ColorScheme;
};

const ThemeContext = createContext<FormaTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'light' ? 'light' : 'dark';

  const value = useMemo<FormaTheme>(
    () => ({
      colors: palettes[scheme],
      typography,
      scheme,
    }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useFormaTheme(): FormaTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useFormaTheme must be used within ThemeProvider');
  }
  return theme;
}
