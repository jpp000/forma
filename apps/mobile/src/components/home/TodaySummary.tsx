import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import { useDailyMacros } from "@/hooks/useDailyMacros";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useTrainingPlanStore } from "@/store/trainingPlanStore";
import { formatMacroGrams } from "@/utils";
import type { DayOfWeek, MealType } from "@/types";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snack: "cafe-outline",
};

export function MacroBar() {
  const { consumed, goalMacros } = useDailyMacros();

  const macros = [
    {
      label: "Protein",
      value: consumed.protein,
      goal: goalMacros.protein,
      color: Colors.protein,
    },
    {
      label: "Carbs",
      value: consumed.carbs,
      goal: goalMacros.carbs,
      color: Colors.carbs,
    },
    {
      label: "Fat",
      value: consumed.fat,
      goal: goalMacros.fat,
      color: Colors.fat,
    },
  ];

  return (
    <View style={macroStyles.container}>
      {macros.map((m) => (
        <View key={m.label} style={macroStyles.item}>
          <View style={macroStyles.labelRow}>
            <View style={[macroStyles.dot, { backgroundColor: m.color }]} />
            <Text variant="caption1" color={Colors.textSecondary}>
              {m.label}
            </Text>
          </View>
          <Text variant="headline">
            {formatMacroGrams(m.value)}
            <Text variant="caption1" color={Colors.textTertiary}>
              {" "}
              / {formatMacroGrams(m.goal)}
            </Text>
          </Text>
          <View style={macroStyles.barBg}>
            <View
              style={[
                macroStyles.barFill,
                {
                  backgroundColor: m.color,
                  width: `${Math.min((m.value / m.goal) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const macroStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  item: {
    flex: 1,
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  barBg: {
    height: 4,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
});

export function MealsSummary() {
  const { meals } = useDailyMacros();

  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <View style={mealStyles.container}>
      <Text variant="headline" style={mealStyles.title}>
        Today's Meals
      </Text>
      {mealTypes.map((type) => {
        const meal = meals.find((m) => m.type === type);
        const totalCal = meal
          ? meal.items.reduce((sum, i) => sum + i.macros.calories, 0)
          : 0;
        const count = meal?.items.length ?? 0;

        return (
          <Card key={type} padding={Spacing.md} style={mealStyles.card}>
            <View style={mealStyles.row}>
              <View style={mealStyles.iconContainer}>
                <Ionicons
                  name={MEAL_ICONS[type] as any}
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View style={mealStyles.info}>
                <Text variant="subheadline" weight="600">
                  {MEAL_LABELS[type]}
                </Text>
                <Text variant="caption1" color={Colors.textSecondary}>
                  {count > 0 ? `${count} items` : "No items logged"}
                </Text>
              </View>
              <Text variant="subheadline" weight="600">
                {totalCal > 0 ? `${Math.round(totalCal)} kcal` : "—"}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const mealStyles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  card: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
});

export function WorkoutStatusCard() {
  const { activeWorkout, progress } = useActiveWorkout();
  const activePlanId = useTrainingPlanStore((s) => s.activePlanId);
  const plans = useTrainingPlanStore((s) => s.plans);
  const todayPlanDay = useMemo(() => {
    const plan = plans.find((p) => p.id === activePlanId);
    if (!plan) return null;
    const dow = dayjs().day() as DayOfWeek;
    return plan.days.find((d) => d.dayOfWeek === dow) ?? null;
  }, [plans, activePlanId]);

  const label = activeWorkout
    ? activeWorkout.planDayLabel
    : todayPlanDay?.label ?? null;

  const isRestDay = !activeWorkout && todayPlanDay?.isRestDay;

  return (
    <View style={workoutStyles.container}>
      <Text variant="headline" style={workoutStyles.title}>
        Today's Workout
      </Text>
      <Card padding={Spacing.lg} lifted>
        {activeWorkout ? (
          <View style={workoutStyles.content}>
            <View style={workoutStyles.header}>
              <Ionicons name="barbell" size={24} color={Colors.secondary} />
              <View style={workoutStyles.info}>
                <Text variant="subheadline" weight="600">
                  {label}
                </Text>
                <Text variant="caption1" color={Colors.textSecondary}>
                  {activeWorkout.exercises.length} exercises ·{" "}
                  {progress.completed}/{progress.total} sets
                </Text>
              </View>
            </View>
            <View style={workoutStyles.progressBar}>
              <View
                style={[
                  workoutStyles.progressFill,
                  { width: `${progress.percent}%` },
                ]}
              />
            </View>
          </View>
        ) : isRestDay ? (
          <View style={workoutStyles.empty}>
            <Ionicons name="bed-outline" size={32} color={Colors.textTertiary} />
            <Text
              variant="subheadline"
              color={Colors.textSecondary}
              align="center"
            >
              Rest day — recovery matters
            </Text>
          </View>
        ) : label ? (
          <View style={workoutStyles.content}>
            <View style={workoutStyles.header}>
              <Ionicons name="barbell-outline" size={24} color={Colors.secondary} />
              <View style={workoutStyles.info}>
                <Text variant="subheadline" weight="600">
                  {label}
                </Text>
                <Text variant="caption1" color={Colors.textSecondary}>
                  {todayPlanDay?.exercises.length ?? 0} exercises planned
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={workoutStyles.empty}>
            <Ionicons
              name="barbell-outline"
              size={32}
              color={Colors.textTertiary}
            />
            <Text
              variant="subheadline"
              color={Colors.textSecondary}
              align="center"
            >
              No workout planned for today
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const workoutStyles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
});
