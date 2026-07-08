import { useState } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { useFormaTheme, useReduceMotion } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const { colors, typography } = useFormaTheme();
  const reduceMotion = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const showPressed = pressed && !reduceMotion;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        if (!reduceMotion) {
          setPressed(true);
        }
      }}
      onPressOut={() => {
        if (!reduceMotion) {
          setPressed(false);
        }
      }}
      style={[
        styles.button,
        {
          backgroundColor: showPressed ? colors.primaryPressed : colors.primary,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
    >
      {loading && !reduceMotion ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : loading ? (
        <Text style={[typography.button, { color: colors.onPrimary }]}>…</Text>
      ) : (
        <Text style={[typography.button, { color: colors.onPrimary }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
