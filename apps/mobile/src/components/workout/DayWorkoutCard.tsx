import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card, Badge, Button } from "@/components/ui";
import { EXERCISES } from "@/constants/exercises";
import { MUSCLE_GROUP_LABELS } from "@/constants/exercises";
import type { PlanDay } from "@/types";

type DayWorkoutCardProps = {
  planDay: PlanDay;
  isToday: boolean;
  hasCompleted: boolean;
  onStartWorkout: () => void;
};

export function DayWorkoutCard({
  planDay,
  isToday,
  hasCompleted,
  onStartWorkout,
}: DayWorkoutCardProps) {
  if (planDay.isRestDay) {
    return (
      <Animated.View entering={FadeInDown.springify()}>
        <Card padding={Spacing.xxl}>
          <View style={styles.restState}>
            <Ionicons name="bed-outline" size={40} color={Colors.textTertiary} />
            <Text variant="title3" align="center">
              Rest Day
            </Text>
            <Text
              variant="subheadline"
              color={Colors.textSecondary}
              align="center"
            >
              Recovery is part of the process. Stretch, hydrate, and rest up.
            </Text>
          </View>
        </Card>
      </Animated.View>
    );
  }

  const exerciseNames = planDay.exercises.map((pe) => {
    const ex = EXERCISES.find((e) => e.id === pe.exerciseId);
    return {
      name: ex?.name ?? pe.exerciseId,
      sets: pe.defaultSets,
      reps: pe.defaultReps,
    };
  });

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <Card padding={Spacing.lg}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="barbell" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.headerInfo}>
              <Text variant="title3">{planDay.label}</Text>
              <Text variant="caption1" color={Colors.textSecondary}>
                {planDay.exercises.length} exercises
              </Text>
            </View>
          </View>
          {hasCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text variant="caption2" color={Colors.success} weight="600">
                Done
              </Text>
            </View>
          )}
        </View>

        <View style={styles.badges}>
          {planDay.muscleGroups.map((mg) => (
            <Badge key={mg} label={MUSCLE_GROUP_LABELS[mg] ?? mg} />
          ))}
        </View>

        <View style={styles.exerciseList}>
          {exerciseNames.map((ex, idx) => (
            <View key={idx} style={styles.exerciseItem}>
              <View style={styles.exerciseDot} />
              <Text variant="subheadline" style={styles.exerciseName}>
                {ex.name}
              </Text>
              <Text variant="caption1" color={Colors.textSecondary}>
                {ex.sets}×{ex.reps}
              </Text>
            </View>
          ))}
        </View>

        {isToday && !hasCompleted && (
          <Button
            title="Start Workout"
            onPress={onStartWorkout}
            fullWidth
            icon={
              <Ionicons name="play" size={16} color={Colors.white} />
            }
          />
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.secondary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    gap: 2,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: `${Colors.success}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  exerciseList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  exerciseName: {
    flex: 1,
  },
  restState: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
});
