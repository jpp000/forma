import { useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text } from "@/components/ui";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RestTimerProps = {
  seconds: number;
  onDismiss: () => void;
  onFinish: () => void;
};

export function RestTimer({ seconds, onDismiss, onFinish }: RestTimerProps) {
  const size = 120;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(1);
  const remaining = useSharedValue(seconds);

  const handleFinish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    progress.value = withTiming(0, {
      duration: seconds * 1000,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      remaining.value -= 1;
      if (remaining.value <= 0) {
        clearInterval(interval);
        runOnJS(handleFinish)();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const mins = Math.floor(Math.max(remaining.value, 0) / 60);
  const secs = Math.max(remaining.value, 0) % 60;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >
      <View style={styles.container}>
        <Text variant="caption1" color={Colors.textSecondary} weight="600">
          REST
        </Text>

        <View style={styles.timerContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.surfaceSecondary}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.secondary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.timerLabel}>
            <Text variant="title1">
              {mins}:{secs.toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        <Pressable style={styles.skipBtn} onPress={onDismiss}>
          <Ionicons name="play-skip-forward" size={18} color={Colors.textSecondary} />
          <Text variant="subheadline" color={Colors.textSecondary} weight="600">
            Skip Rest
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerLabel: {
    position: "absolute",
    alignItems: "center",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
});
