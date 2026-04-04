import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card, Button } from "@/components/ui";
import { ExerciseRow } from "@/components/workout/ExerciseRow";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useWorkoutStore } from "@/store/workoutStore";

const AI_SUGGESTIONS = [
  "Push Day: Bench, OHP, Flies",
  "Pull Day: Deadlift, Rows, Curls",
  "Leg Day: Squats, RDL, Leg Press",
];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    activeWorkout,
    progress,
    completeSet,
    addSetToExercise,
    finishWorkout,
  } = useActiveWorkout();
  const workouts = useWorkoutStore((s) => s.workouts);

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    finishWorkout();
  };

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
      bounces
    >
      <View style={styles.headerRow}>
        <Text variant="title2">Workout</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/(modals)/exercise-library" as any)}
        >
          <Ionicons name="add" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {activeWorkout ? (
        <Animated.View entering={FadeInDown.springify()} style={styles.section}>
          <View style={styles.activeHeader}>
            <View style={styles.activeInfo}>
              <Text variant="title3">{activeWorkout.name}</Text>
              <Text variant="footnote" color={Colors.textSecondary}>
                {progress.completed}/{progress.total} sets completed
              </Text>
            </View>
            <View style={styles.progressPill}>
              <Text variant="caption2" weight="600" color={Colors.secondary}>
                {Math.round(progress.percent)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress.percent}%` },
              ]}
            />
          </View>

          <View style={styles.exercises}>
            {activeWorkout.exercises.map((we, idx) => (
              <Animated.View
                key={we.id}
                entering={FadeInDown.delay(100 + idx * 80).springify()}
              >
                <ExerciseRow
                  workoutExercise={we}
                  onToggleSet={(setId) => completeSet(we.id, setId)}
                  onAddSet={() => addSetToExercise(we.id)}
                />
              </Animated.View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Button
              title="Add Exercise"
              variant="secondary"
              icon={
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
              }
              onPress={() => router.push("/(modals)/exercise-library" as any)}
              fullWidth
            />
            <Button
              title="Finish Workout"
              onPress={handleFinish}
              fullWidth
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.springify()}>
          <Card padding={Spacing.xxl}>
            <View style={styles.emptyState}>
              <Ionicons
                name="barbell-outline"
                size={48}
                color={Colors.textTertiary}
              />
              <Text
                variant="subheadline"
                color={Colors.textSecondary}
                align="center"
              >
                No active workout
              </Text>
              <Text
                variant="caption1"
                color={Colors.textTertiary}
                align="center"
              >
                Start a workout or get an AI suggestion
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* AI Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={18} color={Colors.secondary} />
          <Text variant="headline">Workout Suggestions</Text>
        </View>
        <View style={styles.suggestions}>
          {AI_SUGGESTIONS.map((suggestion, idx) => (
            <Animated.View
              key={idx}
              entering={FadeInDown.delay(200 + idx * 60).springify()}
            >
              <Pressable style={styles.suggestionItem}>
                <Ionicons
                  name="flash-outline"
                  size={18}
                  color={Colors.secondary}
                />
                <Text variant="subheadline" style={styles.suggestionText}>
                  {suggestion}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textTertiary}
                />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* History */}
      {workouts.filter((w) => w.completed).length > 0 && (
        <View style={styles.section}>
          <Text variant="headline" style={styles.sectionTitle}>
            History
          </Text>
          <View style={styles.history}>
            {workouts
              .filter((w) => w.completed)
              .map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
          </View>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  activeInfo: {
    flex: 1,
    gap: 2,
  },
  progressPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: `${Colors.secondary}15`,
    borderRadius: BorderRadius.full,
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
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  exercises: {
    gap: Spacing.md,
  },
  actionRow: {
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  suggestions: {
    gap: Spacing.sm,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  suggestionText: {
    flex: 1,
  },
  history: {
    gap: Spacing.sm,
  },
});
