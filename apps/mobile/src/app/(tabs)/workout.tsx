import { useState, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import { WorkoutCalendarStrip } from "@/components/workout/WorkoutCalendarStrip";
import { DayWorkoutCard } from "@/components/workout/DayWorkoutCard";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { useTrainingPlanStore } from "@/store/trainingPlanStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { todayISO } from "@/utils";

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const activePlanId = useTrainingPlanStore((s) => s.activePlanId);
  const plans = useTrainingPlanStore((s) => s.plans);
  const getPlanDayForDate = useTrainingPlanStore((s) => s.getPlanDayForDate);
  const activePlan = useMemo(
    () => plans.find((p) => p.id === activePlanId) ?? null,
    [plans, activePlanId],
  );
  const startWorkoutFromPlan = useWorkoutStore((s) => s.startWorkoutFromPlan);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const logs = useWorkoutStore((s) => s.logs);
  const recentLogs = useMemo(
    () => logs.filter((l) => l.completed).slice(0, 3),
    [logs],
  );

  const planDay = getPlanDayForDate(selectedDate);
  const isToday = selectedDate === todayISO();
  const hasCompletedToday = logs.some(
    (l) => l.date === selectedDate && l.completed,
  );

  const handleStartWorkout = useCallback(() => {
    if (!planDay || planDay.isRestDay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startWorkoutFromPlan(planDay);
    router.push("/(modals)/active-workout" as any);
  }, [planDay, startWorkoutFromPlan, router]);

  const handleContinueWorkout = useCallback(() => {
    router.push("/(modals)/active-workout" as any);
  }, [router]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text variant="title1">Workout</Text>
        </View>

        {/* Calendar Strip */}
        <WorkoutCalendarStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <View style={styles.section}>
          <View style={styles.planRow}>
            <View style={styles.planInfo}>
              <Text variant="caption2" color={Colors.textSecondary}>
                Training plan
              </Text>
              <Text variant="subheadline" weight="600">
                {activePlan ? activePlan.name : "No plan selected"}
              </Text>
            </View>
            <Pressable
              style={styles.planBtn}
              onPress={() => router.push("/(modals)/plan-picker" as any)}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.secondary} />
              <Text variant="caption1" color={Colors.secondary} weight="600">
                {activePlan ? "Change plan" : "Pick plan"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Active Workout Banner */}
        {activeWorkout && (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.section}
          >
            <Pressable onPress={handleContinueWorkout}>
              <Card padding={Spacing.lg} lifted>
                <View style={styles.activeBanner}>
                  <View style={styles.activePulse} />
                  <View style={styles.activeInfo}>
                    <Text variant="headline">
                      {activeWorkout.planDayLabel}
                    </Text>
                    <Text variant="caption1" color={Colors.textSecondary}>
                      Workout in progress · Tap to continue
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.secondary}
                  />
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        )}

        {/* Day Workout Card */}
        {planDay ? (
          <View style={styles.section}>
            <DayWorkoutCard
              planDay={planDay}
              isToday={isToday && !activeWorkout}
              hasCompleted={hasCompletedToday}
              onStartWorkout={handleStartWorkout}
            />
          </View>
        ) : (
          <Animated.View entering={FadeInDown.springify()} style={styles.section}>
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
                  {activePlan
                    ? "No workout scheduled for this day"
                    : "Pick a training plan to get started"}
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Recent History */}
        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <Text variant="headline" style={styles.sectionTitle}>
              Recent Workouts
            </Text>
            <View style={styles.history}>
              {recentLogs.map((log, idx) => (
                <Animated.View
                  key={log.id}
                  entering={FadeInDown.delay(100 + idx * 60).springify()}
                >
                  <WorkoutCard
                    workout={{
                      id: log.id,
                      name: log.planDayLabel,
                      date: log.date,
                      exercises: log.exercises,
                      durationMinutes: log.durationSeconds
                        ? Math.round(log.durationSeconds / 60)
                        : undefined,
                      completed: log.completed,
                    }}
                  />
                </Animated.View>
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
  content: {
    gap: Spacing.lg,
  },
  headerRow: {
    paddingHorizontal: Spacing.xl,
  },
  planBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.secondary}15`,
    borderRadius: BorderRadius.full,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  planInfo: {
    flex: 1,
    gap: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  activePulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  activeInfo: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  history: {
    gap: Spacing.sm,
  },
});
