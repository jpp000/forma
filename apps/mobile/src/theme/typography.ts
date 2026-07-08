import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  default: 'System',
});

export const type = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  } satisfies TextStyle,
  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.35,
  } satisfies TextStyle,
  title3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.38,
  } satisfies TextStyle,
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    lineHeight: 24,
  } satisfies TextStyle,
  callout: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.32,
    lineHeight: 22,
  } satisfies TextStyle,
  subhead: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
    lineHeight: 20,
  } satisfies TextStyle,
  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
    lineHeight: 18,
  } satisfies TextStyle,
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 16,
  } satisfies TextStyle,
  metric: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.36,
  } satisfies TextStyle,
  metricLarge: {
    fontFamily,
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  } satisfies TextStyle,
} as const;
