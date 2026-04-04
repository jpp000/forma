import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "@/components/ui";
import type { FoodItem } from "@/types";

type FoodRowProps = {
  food: FoodItem;
  onDelete?: () => void;
};

export function FoodRow({ food, onDelete }: FoodRowProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={Layout.springify()}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text variant="subheadline" weight="500" numberOfLines={1}>
            {food.name}
          </Text>
          <View style={styles.macros}>
            <Text variant="caption1" color={Colors.textSecondary}>
              P: {Math.round(food.macros.protein)}g
            </Text>
            <Text variant="caption1" color={Colors.textSecondary}>
              C: {Math.round(food.macros.carbs)}g
            </Text>
            <Text variant="caption1" color={Colors.textSecondary}>
              F: {Math.round(food.macros.fat)}g
            </Text>
          </View>
        </View>
        <Text variant="subheadline" weight="600" color={Colors.primary}>
          {Math.round(food.macros.calories)}
        </Text>
        {food.aiAnalyzed && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color={Colors.secondary} />
          </View>
        )}
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  macros: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  aiBadge: {
    padding: 2,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
});
