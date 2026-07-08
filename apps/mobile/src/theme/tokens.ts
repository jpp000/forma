export const formaColors = {
  primary: '#30D158',
  training: '#FFD60A',
  nutrition: '#FF9F0A',
  progress: '#64D2FF',
  error: '#FF453A',
  light: {
    bg: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceElevated: '#FFFFFF',
    ink: '#1D1D1F',
    inkSecondary: 'rgba(29,29,31,0.6)',
    border: 'rgba(0,0,0,0.08)',
  },
  dark: {
    bg: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    ink: '#F5F5F7',
    inkSecondary: 'rgba(245,245,247,0.6)',
    border: 'rgba(255,255,255,0.1)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;
