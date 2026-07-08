export const brand = {
  primary: '#30D158',
  primaryPressed: '#248A3D',
  primarySoft: 'rgba(48,209,88,0.18)',
  onPrimary: '#000000',
  move: '#FA114F',
  moveLabel: '#FF375F',
  exercise: '#92E82A',
  stand: '#1EE4E1',
  fitnessPlus: '#C969E0',
  award: '#FFD60A',
  error: '#FF453A',
} as const;

export type ColorScheme = 'light' | 'dark';

export type FormaColors = {
  canvas: string;
  grouped: string;
  raised: string;
  separator: string;
  labelPrimary: string;
  labelSecondary: string;
  labelTertiary: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  error: string;
  move: string;
  exercise: string;
  stand: string;
};

const dark: FormaColors = {
  canvas: '#000000',
  grouped: '#1C1C1E',
  raised: '#2C2C2E',
  separator: '#38383A',
  labelPrimary: '#FFFFFF',
  labelSecondary: 'rgba(255,255,255,0.6)',
  labelTertiary: 'rgba(255,255,255,0.3)',
  primary: brand.primary,
  primaryPressed: brand.primaryPressed,
  primarySoft: brand.primarySoft,
  onPrimary: brand.onPrimary,
  error: brand.error,
  move: brand.move,
  exercise: brand.exercise,
  stand: brand.stand,
};

const light: FormaColors = {
  canvas: '#F2F2F7',
  grouped: '#FFFFFF',
  raised: '#E5E5EA',
  separator: '#C6C6C8',
  labelPrimary: '#000000',
  labelSecondary: 'rgba(0,0,0,0.6)',
  labelTertiary: 'rgba(0,0,0,0.3)',
  primary: brand.primary,
  primaryPressed: brand.primaryPressed,
  primarySoft: brand.primarySoft,
  onPrimary: brand.onPrimary,
  error: brand.error,
  move: brand.move,
  exercise: brand.exercise,
  stand: brand.stand,
};

export const palettes = { dark, light } as const;
