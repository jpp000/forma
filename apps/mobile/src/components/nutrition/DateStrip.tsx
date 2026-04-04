import { ScrollView, Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text } from "@/components/ui";
import { getWeekDays } from "@/utils";

type DateStripProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const days = getWeekDays(selectedDate);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day) => {
        const isSelected = day.date === selectedDate;
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
            {day.isToday && (
              <View
                style={[
                  styles.todayDot,
                  isSelected && styles.todayDotSelected,
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
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
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.secondary,
  },
  todayDotSelected: {
    backgroundColor: Colors.white,
  },
});
