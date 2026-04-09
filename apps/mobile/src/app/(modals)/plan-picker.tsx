import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors, Spacing } from "@/constants/theme";
import { Text, Card } from "@/components/ui";
import { useTrainingPlanStore } from "@/store/trainingPlanStore";
import type { TrainingPlan } from "@/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function PlanTemplateCard({
  plan,
  isActive,
  onSelect,
}: {
  plan: TrainingPlan;
  isActive: boolean;
  onSelect: () => void;
}) {
  const trainingDays = plan.days.filter((d) => !d.isRestDay).length;
  const restDays = plan.days.filter((d) => d.isRestDay).length;

  return (
    <Pressable onPress={onSelect}>
      <Card
        padding={Spacing.lg}
        lifted={isActive}
        style={isActive ? styles.activeCard : undefined}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text variant="title3">{plan.name}</Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.success}
                />
                <Text variant="caption2" color={Colors.success} weight="600">
                  Active
                </Text>
              </View>
            )}
          </View>
          <Text variant="caption1" color={Colors.textSecondary}>
            {plan.description}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text variant="title3" color={Colors.secondary}>
              {trainingDays}
            </Text>
            <Text variant="caption2" color={Colors.textSecondary}>
              Training
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text variant="title3" color={Colors.textTertiary}>
              {restDays}
            </Text>
            <Text variant="caption2" color={Colors.textSecondary}>
              Rest
            </Text>
          </View>
        </View>

        <View style={styles.weekPreview}>
          {plan.days
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map((day) => (
              <View key={day.dayOfWeek} style={styles.weekDay}>
                <Text variant="caption2" color={Colors.textSecondary}>
                  {DAY_NAMES[day.dayOfWeek]}
                </Text>
                <View
                  style={[
                    styles.weekDot,
                    {
                      backgroundColor: day.isRestDay
                        ? Colors.surfaceSecondary
                        : Colors.secondary,
                    },
                  ]}
                />
                <Text
                  variant="caption2"
                  color={
                    day.isRestDay ? Colors.textTertiary : Colors.textSecondary
                  }
                  numberOfLines={1}
                  style={styles.weekLabel}
                >
                  {day.isRestDay ? "Rest" : day.label}
                </Text>
              </View>
            ))}
        </View>

        {!isActive && (
          <View style={styles.selectRow}>
            <Text variant="subheadline" color={Colors.secondary} weight="600">
              Select Plan
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.secondary}
            />
          </View>
        )}
      </Card>
    </Pressable>
  );
}

export default function PlanPickerModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plans = useTrainingPlanStore((s) => s.plans);
  const activePlanId = useTrainingPlanStore((s) => s.activePlanId);
  const selectPlan = useTrainingPlanStore((s) => s.selectPlan);

  const handleSelect = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectPlan(planId);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.header}>
          <View>
            <Text variant="title1">Training Plans</Text>
            <Text variant="subheadline" color={Colors.textSecondary}>
              Choose a weekly split to follow
            </Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.plans}>
          {plans.map((plan, idx) => (
            <Animated.View
              key={plan.id}
              entering={FadeInDown.delay(80 + idx * 60).springify()}
            >
              <PlanTemplateCard
                plan={plan}
                isActive={plan.id === activePlanId}
                onSelect={() => handleSelect(plan.id)}
              />
            </Animated.View>
          ))}
        </View>
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
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  plans: {
    gap: Spacing.lg,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  cardHeader: {
    gap: Spacing.xs,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: Spacing.xl,
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.divider,
  },
  weekPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  weekDay: {
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekLabel: {
    fontSize: 9,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
