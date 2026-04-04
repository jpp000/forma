import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card, Divider } from "@/components/ui";
import { SetRow } from "./SetRow";
import type { WorkoutExercise } from "@/types";
import { MUSCLE_GROUP_LABELS } from "@/constants/exercises";

type ExerciseRowProps = {
  workoutExercise: WorkoutExercise;
  onToggleSet: (setId: string) => void;
  onAddSet: () => void;
};

export function ExerciseRow({
  workoutExercise,
  onToggleSet,
  onAddSet,
}: ExerciseRowProps) {
  const completedSets = workoutExercise.sets.filter((s) => s.completed).length;
  const totalSets = workoutExercise.sets.length;

  return (
    <Card padding={Spacing.lg}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text variant="headline">{workoutExercise.exercise.name}</Text>
          <Text variant="caption1" color={Colors.textSecondary}>
            {MUSCLE_GROUP_LABELS[workoutExercise.exercise.muscleGroup]} ·{" "}
            {completedSets}/{totalSets} sets
          </Text>
        </View>
      </View>

      <Divider marginVertical={Spacing.sm} />

      <View style={styles.sets}>
        {workoutExercise.sets.map((set, idx) => (
          <SetRow
            key={set.id}
            set={set}
            index={idx}
            onToggle={() => onToggleSet(set.id)}
          />
        ))}
      </View>

      <Pressable style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={Colors.secondary} />
        <Text variant="caption1" color={Colors.secondary} weight="600">
          Add Set
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInfo: {
    gap: 2,
  },
  sets: {
    gap: Spacing.xs,
  },
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    borderStyle: "dashed",
  },
});
