import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

import { afColors, afTypography } from '@/src/design-systems/appleFitness';

interface AFPrimaryButtonProps {
  title: string;
  onPress?: () => void;
}

export function AFPrimaryButton({ title, onPress }: AFPrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? afColors.accentPressed : afColors.move,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 16,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text style={afTypography.button}>{title}</Text>
    </Pressable>
  );
}
