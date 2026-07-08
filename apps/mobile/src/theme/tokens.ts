export const formaColors = {
  primary: '#30D158',
  training: '#FFD60A',
  nutrition: '#FF9F0A',
  progress: '#64D2FF',
  error: '#FF453A',
  light: {
    bg: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceElevated: '#FFFFFF',
    ink: '#1D1D1F',
    inkSecondary: 'rgba(60,60,67,0.6)',
    inkTertiary: 'rgba(60,60,67,0.3)',
    separator: 'rgba(60,60,67,0.12)',
    border: 'rgba(60,60,67,0.16)',
  },
  dark: {
    bg: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    ink: '#FFFFFF',
    inkSecondary: 'rgba(235,235,245,0.6)',
    inkTertiary: 'rgba(235,235,245,0.3)',
    separator: 'rgba(84,84,88,0.65)',
    border: 'rgba(84,84,88,0.45)',
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
