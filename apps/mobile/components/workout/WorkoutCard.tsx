import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import type { Workout } from "@/types";

type WorkoutCardProps = {
  workout: Workout;
  onPress?: () => void;
};

export function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  const totalSets = workout.exercises.reduce(
    (sum, e) => sum + e.sets.length,
    0,
  );
  const completedSets = workout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0,
  );

  return (
    <Pressable onPress={onPress}>
      <Card padding={Spacing.lg}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons
              name={workout.completed ? "checkmark-circle" : "barbell"}
              size={20}
              color={workout.completed ? Colors.success : Colors.secondary}
            />
          </View>
          <View style={styles.info}>
            <Text variant="subheadline" weight="600">
              {workout.name}
            </Text>
            <Text variant="caption1" color={Colors.textSecondary}>
              {workout.exercises.length} exercises · {completedSets}/{totalSets}{" "}
              sets
              {workout.durationMinutes
                ? ` · ${workout.durationMinutes} min`
                : ""}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.textTertiary}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
