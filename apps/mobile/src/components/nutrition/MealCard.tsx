import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card, Divider } from "@/components/ui";
import { FoodRow } from "./FoodRow";
import type { Meal, MealType } from "@/types";

const MEAL_CONFIG: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: "Breakfast", icon: "sunny-outline" },
  lunch: { label: "Lunch", icon: "restaurant-outline" },
  dinner: { label: "Dinner", icon: "moon-outline" },
  snack: { label: "Snacks", icon: "cafe-outline" },
};

type MealCardProps = {
  type: MealType;
  meal?: Meal;
  onRemoveFood?: (mealId: string, foodId: string) => void;
};

export function MealCard({ type, meal, onRemoveFood }: MealCardProps) {
  const config = MEAL_CONFIG[type];
  const totalCal = meal
    ? meal.items.reduce((sum, i) => sum + i.macros.calories, 0)
    : 0;

  return (
    <Card padding={Spacing.lg}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon as any} size={18} color={Colors.primary} />
        </View>
        <Text variant="headline" style={styles.label}>
          {config.label}
        </Text>
        <Text variant="footnote" color={Colors.textSecondary} weight="600">
          {totalCal > 0 ? `${Math.round(totalCal)} kcal` : ""}
        </Text>
      </View>

      {meal && meal.items.length > 0 ? (
        <View>
          {meal.items.map((food, idx) => (
            <View key={food.id}>
              {idx > 0 && <Divider marginVertical={0} />}
              <FoodRow
                food={food}
                onDelete={
                  onRemoveFood
                    ? () => onRemoveFood(meal.id, food.id)
                    : undefined
                }
              />
            </View>
          ))}
        </View>
      ) : (
        <Text
          variant="footnote"
          color={Colors.textTertiary}
          style={styles.empty}
        >
          Tap + to add food
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
  },
  empty: {
    paddingVertical: Spacing.md,
    textAlign: "center",
  },
});
