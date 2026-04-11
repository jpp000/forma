import {
  Pressable,
  type PressableProps,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors, BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Text } from "./Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const sizeConfig = {
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, ...Typography.footnote },
  md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, ...Typography.callout },
  lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, ...Typography.headline },
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  onPress,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  const sizeStyles = sizeConfig[size];

  return (
    <AnimatedPressable
      style={[
        styles.base,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: isPrimary
            ? Colors.primary
            : isGhost
              ? "transparent"
              : Colors.surfaceSecondary,
          borderRadius: BorderRadius.md,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            variant="headline"
            color={isPrimary ? Colors.white : Colors.primary}
            style={{
              fontSize: sizeStyles.fontSize,
              fontWeight: sizeStyles.fontWeight,
              marginLeft: icon ? Spacing.sm : 0,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
});
