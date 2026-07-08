import { useColorScheme } from 'react-native';

import { formaColors } from './tokens';

export function useFormaTheme() {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const palette = isDark ? formaColors.dark : formaColors.light;

  return {
    isDark,
    scheme,
    colors: {
      ...palette,
      primary: formaColors.primary,
      training: formaColors.training,
      nutrition: formaColors.nutrition,
      progress: formaColors.progress,
      error: formaColors.error,
    },
  };
}

export type FormaTheme = ReturnType<typeof useFormaTheme>;
