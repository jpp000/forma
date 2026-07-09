import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { TrainingExercise } from '../types';

type ExerciseListRowProps = {
  exercise: TrainingExercise;
  onPress?: () => void;
};

export function ExerciseListRow({ exercise, onPress }: ExerciseListRowProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.grouped }]}
    >
      <Text style={[typography.body, { color: colors.labelPrimary }]}>
        {exercise.name}
      </Text>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {exercise.muscleGroup} · {exercise.equipment}
      </Text>
    </Pressable>
  );
}

export function GroupedList({ children }: { children: ReactNode }) {
  const { colors } = useFormaTheme();
  return (
    <View style={[styles.group, { backgroundColor: colors.grouped }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
});
