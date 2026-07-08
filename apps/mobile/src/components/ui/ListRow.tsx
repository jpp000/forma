import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface ListRowProps {
  theme: FormaTheme;
  title: string;
  subtitle?: string;
  value?: string;
  accentColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ListRow({
  theme,
  title,
  subtitle,
  value,
  accentColor,
  onPress,
  showChevron = Boolean(onPress),
}: ListRowProps) {
  const { colors } = theme;
  const content = (
    <View style={styles.row}>
      {accentColor ? <View style={[styles.dot, { backgroundColor: accentColor }]} /> : null}
      <View style={styles.textCol}>
        <Text style={[type.body, { color: colors.ink }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[type.footnote, { color: colors.inkSecondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[type.subhead, styles.value, { color: colors.inkSecondary }]}>{value}</Text>
      ) : null}
      {showChevron ? <Text style={[styles.chevron, { color: colors.inkTertiary }]}>›</Text> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    gap: spacing.md,
    minHeight: 52,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textCol: { flex: 1, gap: 2 },
  value: { fontVariant: ['tabular-nums'] },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
});
