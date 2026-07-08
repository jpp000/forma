import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { radius, spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface GroupedSectionProps {
  title?: string;
  theme: FormaTheme;
  children: ReactNode;
  style?: ViewProps['style'];
}

export function GroupedSection({ title, theme, children, style }: GroupedSectionProps) {
  const { colors } = theme;

  return (
    <View style={[styles.wrap, style]}>
      {title ? (
        <Text style={[type.footnote, styles.title, { color: colors.inkSecondary }]}>{title}</Text>
      ) : null}
      <View
        style={[
          styles.group,
          {
            backgroundColor: theme.isDark ? colors.surfaceElevated : colors.surface,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function GroupedSeparator({ theme }: { theme: FormaTheme }) {
  return (
    <View
      style={[
        styles.separator,
        {
          backgroundColor: theme.colors.separator,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    marginLeft: spacing.lg,
    textTransform: 'none',
  },
  group: {
    borderRadius: radius.md + 2,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg + 28,
  },
});
