import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { validatePlanForm } from '../../../../src/features/training/planValidation';
import { useTrainingStore } from '../../../../src/features/training/trainingStore';
import { useT } from '../../../../src/i18n';
import { useFormaTheme } from '../../../../src/theme';
import {
  InlineError,
  PrimaryButton,
  Screen,
  TextField,
} from '../../../../src/ui';

export default function NewPlanScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const { exercises, fetchExercises, createPlan, submitLoading, submitError } =
    useTrainingStore();

  const [name, setName] = useState('');
  const [items, setItems] = useState([
    { exerciseId: '', sets: '3', reps: '10', restSeconds: '60' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void fetchExercises();
  }, [fetchExercises]);

  const onSubmit = async () => {
    const result = validatePlanForm({ name, items });
    if (!result.ok) {
      setFormError(t(`training.errors.${result.error}`));
      return;
    }
    setFormError(null);
    try {
      await createPlan(result.payload);
      router.back();
    } catch {
      // submitError inline
    }
  };

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('training.plans.new')}
      </Text>

      <TextField
        label={t('training.fields.name')}
        value={name}
        onChangeText={setName}
      />

      {items.map((item, index) => (
        <View
          key={`item-${index}`}
          style={[styles.card, { backgroundColor: colors.grouped }]}
        >
          <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
            {t('training.plans.item', { index: index + 1 })}
          </Text>
          <View style={styles.picker}>
            {exercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  const next = [...items];
                  next[index] = { ...next[index], exerciseId: exercise.id };
                  setItems(next);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      item.exerciseId === exercise.id
                        ? colors.primarySoft
                        : colors.raised,
                  },
                ]}
              >
                <Text style={{ color: colors.labelPrimary }}>
                  {exercise.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextField
            label={t('training.fields.sets')}
            value={item.sets}
            onChangeText={(value) => {
              const next = [...items];
              next[index] = { ...next[index], sets: value };
              setItems(next);
            }}
            keyboardType="number-pad"
          />
          <TextField
            label={t('training.fields.reps')}
            value={item.reps}
            onChangeText={(value) => {
              const next = [...items];
              next[index] = { ...next[index], reps: value };
              setItems(next);
            }}
            keyboardType="number-pad"
          />
          <TextField
            label={t('training.fields.restSeconds')}
            value={item.restSeconds}
            onChangeText={(value) => {
              const next = [...items];
              next[index] = { ...next[index], restSeconds: value };
              setItems(next);
            }}
            keyboardType="number-pad"
          />
        </View>
      ))}

      <PrimaryButton
        label={t('training.plans.addItem')}
        onPress={() => {
          setItems([
            ...items,
            { exerciseId: '', sets: '3', reps: '10', restSeconds: '60' },
          ]);
        }}
      />

      {formError ? <InlineError message={formError} /> : null}
      {submitError ? <InlineError message={submitError} /> : null}

      <PrimaryButton
        label={t('training.plans.save')}
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
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
});
