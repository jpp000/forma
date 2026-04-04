import { useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Colors, Spacing } from "@/constants/theme";

type TabIconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: {
  icon: TabIconName;
  iconFocused: TabIconName;
  label: string;
}[] = [
  { icon: "home-outline", iconFocused: "home", label: "Home" },
  { icon: "restaurant-outline", iconFocused: "restaurant", label: "Nutrition" },
  { icon: "barbell-outline", iconFocused: "barbell", label: "Workout" },
  { icon: "stats-chart-outline", iconFocused: "stats-chart", label: "Progress" },
  { icon: "person-outline", iconFocused: "person", label: "Profile" },
];

function TabItem({
  index,
  isFocused,
  onPress,
  onLongPress,
}: {
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const config = TAB_CONFIG[index]!;
  const scale = useSharedValue(1);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withSpring(isFocused ? 1 : 0, { damping: 14 }) }],
  }));

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.82, { damping: 12, stiffness: 220 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 220 });
    }, 80);
    onPress();
  }, [onPress, scale]);

  return (
    <Pressable
      style={styles.tabItem}
      onPress={handlePress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
    >
      <Animated.View style={[styles.iconWrap, animatedIconStyle]}>
        <Ionicons
          name={isFocused ? config.iconFocused : config.icon}
          size={22}
          color={isFocused ? Colors.primary : Colors.textTertiary}
        />
      </Animated.View>
      <Animated.View style={[styles.activeDot, animatedDotStyle]} />
    </Pressable>
  );
}

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(400)}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              index={index}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: "rgba(248, 248, 248, 0.92)",
  },
  bar: {
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: Spacing.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
});
