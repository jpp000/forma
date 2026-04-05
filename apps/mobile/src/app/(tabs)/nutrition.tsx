import { useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import { DateStrip } from "@/components/nutrition/DateStrip";
import { MealCard } from "@/components/nutrition/MealCard";
import { useNutritionStore } from "@/store/nutritionStore";
import { useDailyMacros } from "@/hooks/useDailyMacros";
import { todayISO, formatMacroGrams, formatCalories } from "@/utils";
import type { MealType } from "@/types";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const { consumed, goalMacros, meals } = useDailyMacros(selectedDate);
  const removeFoodFromMeal = useNutritionStore((s) => s.removeFoodFromMeal);

  const handleAddFood = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modals)/add-food" as any);
  }, [router]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        overScrollMode="always"
      >
        <Text variant="title1" style={styles.title}>
          Nutrition
        </Text>

        <DateStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.summaryBar}
        >
          <Card padding={Spacing.md}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="caption2" color={Colors.textSecondary}>
                  Calories
                </Text>
                <Text variant="headline">
                  {formatCalories(consumed.calories)}
                  <Text variant="caption1" color={Colors.textTertiary}>
                    {" "}
                    / {formatCalories(goalMacros.calories)}
                  </Text>
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text variant="caption2" color={Colors.protein}>
                  Protein
                </Text>
                <Text variant="footnote" weight="600">
                  {formatMacroGrams(consumed.protein)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="caption2" color={Colors.carbs}>
                  Carbs
                </Text>
                <Text variant="footnote" weight="600">
                  {formatMacroGrams(consumed.carbs)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="caption2" color={Colors.fat}>
                  Fat
                </Text>
                <Text variant="footnote" weight="600">
                  {formatMacroGrams(consumed.fat)}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.meals}>
          {MEAL_ORDER.map((type, idx) => {
            const meal = meals.find((m) => m.type === type);
            return (
              <Animated.View
                key={type}
                entering={FadeInDown.delay(150 + idx * 80).springify()}
              >
                <MealCard
                  type={type}
                  meal={meal}
                  onRemoveFood={removeFoodFromMeal}
                />
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Pressable style={[styles.fab, { bottom: insets.bottom + 100 }]} onPress={handleAddFood}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    gap: Spacing.lg,
  },
  title: {
    paddingHorizontal: Spacing.xl,
  },
  summaryBar: {
    paddingHorizontal: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.sm,
  },
  meals: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});
