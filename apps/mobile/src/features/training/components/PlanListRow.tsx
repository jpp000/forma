import { Pressable, StyleSheet, Text } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { WorkoutPlan } from '../types';

type PlanListRowProps = {
  plan: WorkoutPlan;
  onPress?: () => void;
};

export function PlanListRow({ plan, onPress }: PlanListRowProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.grouped }]}
    >
      <Text style={[typography.body, { color: colors.labelPrimary }]}>
        {plan.name}
      </Text>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {plan.items.length}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
});
