import { View, StyleSheet } from "react-native";
import dayjs from "dayjs";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import type { ProgressEntry } from "@/types";

type StreakCalendarProps = {
  entries: ProgressEntry[];
};

export function StreakCalendar({ entries }: StreakCalendarProps) {
  const last28 = entries.slice(-28);

  const getIntensity = (entry?: ProgressEntry) => {
    if (!entry || entry.calories === 0) return Colors.surfaceSecondary;
    if (entry.calories > 1800) return Colors.secondary;
    if (entry.calories > 1000) return `${Colors.secondary}99`;
    return `${Colors.secondary}44`;
  };

  return (
    <Card padding={Spacing.lg}>
      <Text variant="headline" style={styles.title}>
        Activity
      </Text>
      <View style={styles.grid}>
        {last28.map((entry, idx) => (
          <View key={idx} style={styles.cell}>
            <View
              style={[
                styles.dot,
                { backgroundColor: getIntensity(entry) },
              ]}
            />
            {idx % 7 === 0 && (
              <Text variant="caption2" color={Colors.textTertiary}>
                {dayjs(entry.date).format("DD")}
              </Text>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cell: {
    alignItems: "center",
    gap: 2,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
