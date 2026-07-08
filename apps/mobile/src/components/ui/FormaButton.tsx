import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface FormaButtonProps {
  theme: FormaTheme;
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export function FormaButton({
  theme,
  label,
  onPress,
  variant = 'primary',
  fullWidth = true,
}: FormaButtonProps) {
  const { colors } = theme;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? theme.isDark
          ? colors.surfaceElevated
          : colors.surface
        : 'transparent';

  const textColor =
    variant === 'primary' ? '#000000' : variant === 'ghost' ? colors.primary : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: bg,
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text style={[type.body, styles.label, { color: textColor, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  label: { textAlign: 'center' },
});
