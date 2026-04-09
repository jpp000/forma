import { useRef, useState } from "react";
import { ScrollView, Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text } from "@/components/ui";
import { useTrainingPlanStore } from "@/store/trainingPlanStore";
import { useWorkoutStore } from "@/store/workoutStore";

type WorkoutCalendarStripProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

type DayStatus = "completed" | "today" | "rest" | "upcoming" | "missed";

export function WorkoutCalendarStrip({
  selectedDate,
  onSelectDate,
}: WorkoutCalendarStripProps) {
  const getPlanDayForDate = useTrainingPlanStore((s) => s.getPlanDayForDate);
  const logs = useWorkoutStore((s) => s.logs);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    dayjs(selectedDate).startOf("month"),
  );
  const monthCacheRef = useRef<Record<string, CalendarDay[]>>({});

  const selected = dayjs(selectedDate);
  const today = dayjs();
  const startOfWeek = selected.startOf("week");

  type CalendarDay = {
    date: string;
    dayName: string;
    dayNumber: string;
    isToday: boolean;
    isCurrentMonth?: boolean;
    status: DayStatus;
    isRestDay: boolean;
  };

  const buildDay = (d: dayjs.Dayjs): CalendarDay => {
    const dateStr = d.format("YYYY-MM-DD");
    const planDay = getPlanDayForDate(dateStr);
    const hasLog = logs.some((l) => l.date === dateStr && l.completed);
    const isToday = d.isSame(today, "day");
    const isPast = d.isBefore(today, "day");

    let status: DayStatus = "upcoming";
    if (hasLog) status = "completed";
    else if (planDay?.isRestDay) status = "rest";
    else if (isToday) status = "today";
    else if (isPast) status = "missed";

    return {
      date: dateStr,
      dayName: d.format("ddd"),
      dayNumber: d.format("D"),
      isToday,
      status,
      isRestDay: planDay?.isRestDay ?? false,
    };
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = startOfWeek.add(i, "day");
    return buildDay(d);
  });

  const getMonthDays = (month: dayjs.Dayjs) => {
    const monthKey = month.format("YYYY-MM");
    if (monthCacheRef.current[monthKey]) {
      return monthCacheRef.current[monthKey];
    }

    const start = month.startOf("month").startOf("week");
    const days = Array.from({ length: 42 }, (_, i) => {
      const d = start.add(i, "day");
      const day = buildDay(d);
      return {
        ...day,
        isCurrentMonth: d.month() === month.month(),
      };
    });

    monthCacheRef.current[monthKey] = days;
    return days;
  };

  const monthKey = visibleMonth.format("YYYY-MM");
  delete monthCacheRef.current[monthKey];
  const monthDays = getMonthDays(visibleMonth);

  const getDotColor = (status: DayStatus) => {
    switch (status) {
      case "completed":
        return Colors.success;
      case "today":
        return Colors.secondary;
      case "missed":
        return Colors.error;
      default:
        return undefined;
    }
  };

  const weekDayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Animated.View layout={LinearTransition.springify()} style={styles.wrapper}>
      <View style={styles.topRow}>
        <Text variant="subheadline" color={Colors.textSecondary} weight="600">
          {isExpanded ? visibleMonth.format("MMMM YYYY") : "This Week"}
        </Text>
        <Pressable
          style={styles.expandBtn}
          onPress={() => {
            Haptics.selectionAsync();
            const nextExpanded = !isExpanded;
            setIsExpanded(nextExpanded);
            if (nextExpanded) {
              setVisibleMonth(dayjs(selectedDate).startOf("month"));
            }
          }}
        >
          <Text variant="caption1" color={Colors.secondary} weight="600">
            {isExpanded ? "Collapse" : "Expand"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.secondary}
          />
        </Pressable>
      </View>

      {!isExpanded && (
        <Animated.View entering={FadeInDown.duration(180)} exiting={FadeOutUp.duration(120)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
          >
            {weekDays.map((day) => {
              const isSelected = day.date === selectedDate;
              const dotColor = getDotColor(day.status);

              return (
                <Pressable
                  key={day.date}
                  style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelectDate(day.date);
                  }}
                >
                  <Text
                    variant="caption2"
                    color={isSelected ? Colors.white : Colors.textSecondary}
                    weight="500"
                  >
                    {day.dayName}
                  </Text>
                  <Text
                    variant="headline"
                    color={isSelected ? Colors.white : Colors.textPrimary}
                  >
                    {day.dayNumber}
                  </Text>
                  <View style={styles.statusSlot}>
                    {dotColor && (
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isSelected ? Colors.white : dotColor },
                        ]}
                      />
                    )}
                    {day.isRestDay && !dotColor && (
                      <Text
                        variant="caption2"
                        color={isSelected ? Colors.white : Colors.textTertiary}
                        style={styles.restLabel}
                      >
                        Rest
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}

      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(120)}>
          <View style={styles.monthHeader}>
            <Pressable
              style={styles.monthNavBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setVisibleMonth((prev) => prev.subtract(1, "month"));
              }}
            >
              <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
            </Pressable>
            <Text variant="headline">{visibleMonth.format("MMMM YYYY")}</Text>
            <Pressable
              style={styles.monthNavBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setVisibleMonth((prev) => prev.add(1, "month"));
              }}
            >
              <Ionicons name="chevron-forward" size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.weekdayHeaderRow}>
            {weekDayHeaders.map((label) => (
              <Text
                key={label}
                variant="caption2"
                color={Colors.textSecondary}
                align="center"
                style={styles.weekdayHeaderCell}
              >
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.monthGrid}>
            {monthDays.map((day) => {
              const isSelected = day.date === selectedDate;
              const dotColor = getDotColor(day.status);

              return (
                <Pressable
                  key={day.date}
                  style={[
                    styles.monthDayCell,
                    isSelected && styles.monthDayCellSelected,
                    day.isCurrentMonth === false && styles.monthDayCellMuted,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelectDate(day.date);
                  }}
                >
                  <Text
                    variant="subheadline"
                    color={isSelected ? Colors.white : Colors.textPrimary}
                    align="center"
                  >
                    {day.dayNumber}
                  </Text>
                  <View style={styles.statusSlot}>
                    {dotColor && (
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isSelected ? Colors.white : dotColor },
                        ]}
                      />
                    )}
                    {day.isRestDay && !dotColor && (
                      <Text
                        variant="caption2"
                        color={isSelected ? Colors.white : Colors.textTertiary}
                        style={styles.restLabel}
                      >
                        Rest
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  topRow: {
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.secondary}14`,
  },
  container: {
    gap: Spacing.sm,
  },
  dayItem: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
    minWidth: 52,
  },
  dayItemSelected: {
    backgroundColor: Colors.primary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusSlot: {
    minHeight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  restLabel: {
    fontSize: 8,
    lineHeight: 10,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  monthNavBtn: {
    margin: 10,
    marginTop: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  weekdayHeaderRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  weekdayHeaderCell: {
    flex: 1,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  monthDayCell: {
    width: "13.2%",
    minHeight: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: Colors.surface,
  },
  monthDayCellSelected: {
    backgroundColor: Colors.primary,
  },
  monthDayCellMuted: {
    opacity: 0.4,
  },
});
