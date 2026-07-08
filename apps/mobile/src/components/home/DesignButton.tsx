import { Pressable, Text } from 'react-native';

import type { DesignPalette, DesignSystem } from '@/src/design-systems/types';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface DesignButtonProps {
  ds: DesignSystem;
  palette: DesignPalette;
  theme: FormaTheme;
  label: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
}

export function DesignButton({
  ds,
  palette,
  theme,
  label,
  variant = 'primary',
  onPress,
}: DesignButtonProps) {
  const isShopifyDark = ds.id === 'shopify' && theme.isDark;

  const primaryStyle =
    ds.id === 'shopify'
      ? {
          backgroundColor: isShopifyDark ? 'transparent' : palette.primary,
          borderWidth: isShopifyDark ? 2 : 0,
          borderColor: palette.ink,
          borderRadius: ds.radius.button,
          paddingVertical: 14,
          paddingHorizontal: 26,
          minHeight: 50,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        }
      : ds.buttonPrimary(palette);

  const secondaryStyle = ds.buttonSecondary(palette);

  const style = variant === 'primary' ? primaryStyle : secondaryStyle;
  const textStyle =
    variant === 'primary' ? ds.buttonPrimaryText(palette) : ds.buttonSecondaryText(palette);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [style, { opacity: pressed ? 0.88 : 1, alignSelf: 'stretch' }]}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}
