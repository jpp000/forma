import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui";
import { formatCalories } from "@/utils";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type DailyRingProps = {
  consumed: number;
  goal: number;
  size?: number;
};

export function DailyRing({ consumed, goal, size = 180 }: DailyRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const remaining = Math.max(goal - consumed, 0);
  const percent = Math.min(consumed / goal, 1);

  useEffect(() => {
    progress.value = withTiming(percent, {
      duration: 1200,
      easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
    });
  }, [percent]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
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
          stroke={Colors.calories}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text variant="title1" align="center">
          {formatCalories(remaining)}
        </Text>
        <Text variant="caption1" color={Colors.textSecondary} align="center">
          kcal remaining
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
