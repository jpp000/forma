import { Platform, type TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Inter',
  default: 'System',
});

export type FormaTypography = {
  largeTitle: TextStyle;
  title: TextStyle;
  body: TextStyle;
  footnote: TextStyle;
  eyebrow: TextStyle;
  button: TextStyle;
  tabular: TextStyle;
};

export const typography: FormaTypography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
  },
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400',
  },
  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
  },
  eyebrow: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
};
