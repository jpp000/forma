import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Button } from "@/components/ui";
import { ExerciseRow } from "@/components/workout/ExerciseRow";
import { RestTimer } from "@/components/workout/RestTimer";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";

export default function ActiveWorkoutModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    activeWorkout,
    progress,
    completeSet,
    updateSet,
    addSetToExercise,
    finishWorkout,
    cancelWorkout,
  } = useActiveWorkout();

  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startedAtStr = activeWorkout?.startedAt;
  useEffect(() => {
    if (!startedAtStr) return;
    const startedAt = new Date(startedAtStr).getTime();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAtStr]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCompleteSet = useCallback(
    (exerciseId: string, setId: string) => {
      completeSet(exerciseId, setId);

      const exercise = activeWorkout?.exercises.find((e) => e.id === exerciseId);
      const set = exercise?.sets.find((s) => s.id === setId);
      if (set && !set.completed && set.restSeconds) {
        setRestTimer(set.restSeconds);
      }
    },
    [activeWorkout, completeSet],
  );

  const handleFinish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    finishWorkout();
    router.back();
  }, [finishWorkout, router]);

  const handleCancel = useCallback(() => {
    Alert.alert("Cancel Workout", "Are you sure? Your progress will be lost.", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "Cancel",
        style: "destructive",
        onPress: () => {
          cancelWorkout();
          router.back();
        },
      },
    ]);
  }, [cancelWorkout, router]);

  if (!activeWorkout) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <Text variant="title3" align="center">
            No active workout
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + (restTimer ? 260 : 120),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text variant="headline">{activeWorkout.planDayLabel}</Text>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={14} color={Colors.secondary} />
              <Text variant="caption1" color={Colors.secondary} weight="600">
                {formatElapsed(elapsed)}
              </Text>
            </View>
          </View>
          <View style={styles.progressPill}>
            <Text variant="caption2" weight="600" color={Colors.secondary}>
              {Math.round(progress.percent)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: `${progress.percent}%` }]}
            />
          </View>
          <Text variant="caption1" color={Colors.textSecondary}>
            {progress.completed}/{progress.total} sets
          </Text>
        </View>

        {/* Exercises */}
        <View style={styles.exercises}>
          {activeWorkout.exercises.map((we, idx) => (
            <Animated.View
              key={we.id}
              entering={FadeInDown.delay(80 + idx * 60).springify()}
            >
              <ExerciseRow
                workoutExercise={we}
                onToggleSet={(setId) => handleCompleteSet(we.id, setId)}
                onAddSet={() => addSetToExercise(we.id)}
                onUpdateSet={(setId, field, value) =>
                  updateSet(we.id, setId, field, value)
                }
              />
            </Animated.View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Add Exercise"
            variant="secondary"
            icon={
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={Colors.primary}
              />
            }
            onPress={() =>
              router.push("/(modals)/exercise-library" as any)
            }
            fullWidth
          />
          <Button title="Finish Workout" onPress={handleFinish} fullWidth />
        </View>
      </ScrollView>

      {/* Rest Timer */}
      {restTimer && (
        <RestTimer
          seconds={restTimer}
          onDismiss={() => setRestTimer(null)}
          onFinish={() => setRestTimer(null)}
        />
      )}
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
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: `${Colors.secondary}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: `${Colors.secondary}15`,
    borderRadius: BorderRadius.full,
  },
  progressBarContainer: {
    gap: Spacing.xs,
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
  exercises: {
    gap: Spacing.md,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
});
