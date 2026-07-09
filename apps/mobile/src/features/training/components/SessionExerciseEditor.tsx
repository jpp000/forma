import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { SessionExerciseInput } from '../sessionPayload';
import type { TrainingExercise } from '../types';
import { SetRowInput } from './SetRowInput';

type SessionExerciseEditorProps = {
  exercise?: TrainingExercise;
  row: SessionExerciseInput;
  onChangeRow: (row: SessionExerciseInput) => void;
};

export function SessionExerciseEditor({
  exercise,
  row,
  onChangeRow,
}: SessionExerciseEditorProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.grouped }]}>
      <Text style={[typography.title, { color: colors.exercise }]}>
        {exercise?.name ?? row.exerciseId}
      </Text>
      {row.sets.map((set, index) => (
        <SetRowInput
          key={`set-${index}`}
          reps={set.reps}
          weightKg={set.weightKg}
          onChangeReps={(value) => {
            const sets = [...row.sets];
            sets[index] = { ...sets[index], reps: value };
            onChangeRow({ ...row, sets });
          }}
          onChangeWeight={(value) => {
            const sets = [...row.sets];
            sets[index] = { ...sets[index], weightKg: value };
            onChangeRow({ ...row, sets });
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
});
