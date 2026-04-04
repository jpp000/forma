import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "@/constants/theme";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { DailyRing } from "@/components/home/DailyRing";
import {
  MacroBar,
  MealsSummary,
  WorkoutStatusCard,
} from "@/components/home/TodaySummary";
import { useDailyMacros } from "@/hooks/useDailyMacros";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useProgress } from "@/hooks/useProgress";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { consumed, goalMacros } = useDailyMacros();
  const { streak } = useProgress("7d");

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <GreetingHeader />

        <View style={styles.ringSection}>
          <DailyRing consumed={consumed.calories} goal={goalMacros.calories} />
        </View>

        <MacroBar />

        <View style={styles.streakContainer}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={Colors.carbs} />
            <Text variant="footnote" weight="600">
              {streak} day streak
            </Text>
          </View>
        </View>

        <MealsSummary />

        <WorkoutStatusCard />
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
  },
  ringSection: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  streakContainer: {
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
});
