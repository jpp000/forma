import { StyleSheet, View } from 'react-native';
import { TextField } from '../../../ui/TextField';

type SetRowInputProps = {
  reps: string;
  weightKg: string;
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
};

export function SetRowInput({
  reps,
  weightKg,
  onChangeReps,
  onChangeWeight,
}: SetRowInputProps) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <TextField
          label="Reps"
          value={reps}
          onChangeText={onChangeReps}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.field}>
        <TextField
          label="kg"
          value={weightKg}
          onChangeText={onChangeWeight}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
});
