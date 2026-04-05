import { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LineChart, BarChart } from "react-native-gifted-charts";
import dayjs from "dayjs";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import { StatCard } from "@/components/progress/StatCard";
import { StreakCalendar } from "@/components/progress/StreakCalendar";
import { useProgress, type TimeRange } from "@/hooks/useProgress";
import { formatCalories } from "@/utils";

const RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "3m", label: "3 Months" },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<TimeRange>("7d");
  const { entries, prs, streak } = useProgress(range);

  const calorieData = entries.map((e, i) => ({
    value: e.calories,
    label: range === "7d" ? dayjs(e.date).format("ddd") : "",
    dataPointText: range === "7d" ? String(Math.round(e.calories)) : undefined,
  }));

  const proteinData = entries.map((e) => ({ value: e.protein }));
  const carbsData = entries.map((e) => ({ value: e.carbs }));
  const fatData = entries.map((e) => ({ value: e.fat }));

  const volumeData = entries.map((e, i) => ({
    value: e.workoutVolume || 0,
    label: range === "7d" ? dayjs(e.date).format("ddd") : "",
    frontColor:
      (e.workoutVolume || 0) > 0 ? Colors.secondary : Colors.surfaceSecondary,
  }));

  const avgCalories =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, e) => sum + e.calories, 0) / entries.length,
        )
      : 0;

  const workoutDays = entries.filter((e) => (e.workoutVolume || 0) > 0).length;

  const chartWidth =
    range === "7d" ? 280 : range === "30d" ? 600 : 1200;

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
      <Text variant="title1" style={styles.title}>
        Progress
      </Text>

      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        {RANGES.map((r) => (
          <Pressable
            key={r.key}
            style={[
              styles.rangePill,
              range === r.key && styles.rangePillActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setRange(r.key);
            }}
          >
            <Text
              variant="footnote"
              weight="600"
              color={range === r.key ? Colors.white : Colors.textSecondary}
            >
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats Cards */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={styles.statsRow}>
          <StatCard
            title="Avg. Calories"
            value={formatCalories(avgCalories)}
            subtitle="kcal / day"
            color={Colors.calories}
          />
          <StatCard
            title="Workouts"
            value={String(workoutDays)}
            subtitle={`of ${entries.length} days`}
            color={Colors.secondary}
          />
          <StatCard
            title="Streak"
            value={`${streak}d`}
            color={Colors.carbs}
          />
        </View>
      </Animated.View>

      {/* Calorie Trend */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Card padding={Spacing.lg}>
          <Text variant="headline" style={styles.chartTitle}>
            Calorie Trend
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={calorieData}
              width={chartWidth}
              height={180}
              color={Colors.calories}
              thickness={2}
              startFillColor={`${Colors.calories}30`}
              endFillColor={`${Colors.calories}05`}
              areaChart
              curved
              hideDataPoints={range !== "7d"}
              dataPointsColor={Colors.calories}
              dataPointsRadius={4}
              xAxisColor={Colors.border}
              yAxisColor="transparent"
              yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
              hideRules
              noOfSections={4}
              spacing={range === "7d" ? 40 : range === "30d" ? 18 : 12}
              initialSpacing={10}
              endSpacing={10}
            />
          </ScrollView>
        </Card>
      </Animated.View>

      {/* Macro Breakdown */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Card padding={Spacing.lg}>
          <Text variant="headline" style={styles.chartTitle}>
            Macros
          </Text>
          <View style={styles.macroLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.protein }]} />
              <Text variant="caption1" color={Colors.textSecondary}>
                Protein
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.carbs }]} />
              <Text variant="caption1" color={Colors.textSecondary}>
                Carbs
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.fat }]} />
              <Text variant="caption1" color={Colors.textSecondary}>
                Fat
              </Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={proteinData}
              data2={carbsData}
              data3={fatData}
              width={chartWidth}
              height={160}
              color1={Colors.protein}
              color2={Colors.carbs}
              color3={Colors.fat}
              thickness={2}
              curved
              hideDataPoints
              xAxisColor={Colors.border}
              yAxisColor="transparent"
              yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
              hideRules
              noOfSections={4}
              spacing={range === "7d" ? 40 : range === "30d" ? 18 : 12}
              initialSpacing={10}
              endSpacing={10}
            />
          </ScrollView>
        </Card>
      </Animated.View>

      {/* Workout Volume */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Card padding={Spacing.lg}>
          <Text variant="headline" style={styles.chartTitle}>
            Workout Volume
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={volumeData}
              width={chartWidth}
              height={160}
              barWidth={range === "7d" ? 28 : 10}
              barBorderRadius={4}
              frontColor={Colors.secondary}
              xAxisColor={Colors.border}
              yAxisColor="transparent"
              yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
              hideRules
              noOfSections={4}
              spacing={range === "7d" ? 16 : range === "30d" ? 10 : 6}
              initialSpacing={10}
              endSpacing={10}
            />
          </ScrollView>
        </Card>
      </Animated.View>

      {/* Streak Calendar */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <StreakCalendar entries={entries} />
      </Animated.View>

      {/* Personal Records */}
      {prs.length > 0 && (
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Card padding={Spacing.lg}>
            <View style={styles.prHeader}>
              <Ionicons name="trophy" size={20} color={Colors.carbs} />
              <Text variant="headline">Personal Records</Text>
            </View>
            <View style={styles.prList}>
              {prs.map((pr) => (
                <View key={pr.exerciseId} style={styles.prItem}>
                  <Text variant="subheadline" weight="500" style={styles.prName}>
                    {pr.exerciseName}
                  </Text>
                  <Text variant="subheadline" weight="600" color={Colors.secondary}>
                    {pr.weight}kg × {pr.reps}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
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
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  rangeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  rangePill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  rangePillActive: {
    backgroundColor: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  chartTitle: {
    marginBottom: Spacing.md,
  },
  macroLegend: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  prHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  prList: {
    gap: Spacing.sm,
  },
  prItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  prName: {
    flex: 1,
  },
});
