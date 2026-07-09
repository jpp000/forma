import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTrainingStore } from '../../../../src/features/training/trainingStore';
import { useT } from '../../../../src/i18n';
import { useFormaTheme } from '../../../../src/theme';
import {
  InlineError,
  PrimaryButton,
  Screen,
  TextField,
} from '../../../../src/ui';

export default function NewExerciseScreen() {
  const router = useRouter();
  const t = useT();
  const { typography, colors } = useFormaTheme();
  const { createExercise, submitLoading, submitError } = useTrainingStore();

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t('training.validation.required');
    if (!muscleGroup.trim()) {
      next.muscleGroup = t('training.validation.required');
    }
    if (!equipment.trim()) next.equipment = t('training.validation.required');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    try {
      await createExercise({
        name: name.trim(),
        muscleGroup: muscleGroup.trim(),
        equipment: equipment.trim(),
      });
      router.back();
    } catch {
      // submitError shown below
    }
  };

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('training.exercises.new')}
      </Text>

      <TextField
        label={t('training.fields.name')}
        value={name}
        onChangeText={setName}
        error={errors.name}
      />
      <TextField
        label={t('training.fields.muscleGroup')}
        value={muscleGroup}
        onChangeText={setMuscleGroup}
        error={errors.muscleGroup}
      />
      <TextField
        label={t('training.fields.equipment')}
        value={equipment}
        onChangeText={setEquipment}
        error={errors.equipment}
      />

      {submitError ? <InlineError message={submitError} /> : null}

      <PrimaryButton
        label={t('training.exercises.new')}
        loading={submitLoading}
        disabled={submitLoading}
        onPress={() => {
          void onSubmit();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
});
