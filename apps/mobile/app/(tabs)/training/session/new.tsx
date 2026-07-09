import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SessionExerciseEditor } from '../../../../src/features/training/components/SessionExerciseEditor';
import {
  buildSessionPayload,
  type SessionExerciseInput,
} from '../../../../src/features/training/sessionPayload';
import { useTrainingStore } from '../../../../src/features/training/trainingStore';
import { useT } from '../../../../src/i18n';
import { useFormaTheme } from '../../../../src/theme';
import {
  InlineError,
  PrimaryButton,
  Screen,
} from '../../../../src/ui';

export default function NewSessionScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const {
    exercises,
    plans,
    fetchExercises,
    fetchPlans,
    logSession,
    submitLoading,
    submitError,
  } = useTrainingStore();

  const [planId, setPlanId] = useState<string | undefined>();
  const [rows, setRows] = useState<SessionExerciseInput[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void fetchExercises();
    void fetchPlans();
  }, [fetchExercises, fetchPlans]);

  useEffect(() => {
    if (!planId) return;
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    setRows(
      plan.items.map((item) => ({
        exerciseId: item.exerciseId,
        sets: Array.from({ length: item.sets }, () => ({
          reps: String(item.reps),
          weightKg: '0',
        })),
      })),
    );
  }, [planId, plans]);

  const onSubmit = async () => {
    const result = buildSessionPayload({
      planId,
      completedAt: new Date().toISOString(),
      exercises: rows,
    });
    if (!result.ok) {
      setFormError(t(`training.errors.${result.error}`));
      return;
    }
    setFormError(null);
    try {
      await logSession(result.payload);
      router.replace('/(tabs)/training' as Href);
    } catch {
      // inline error
    }
  };

  if (exercises.length === 0) {
    return (
      <Screen style={styles.center}>
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('training.plans.needExercise')}
        </Text>
        <PrimaryButton
          label={t('training.exercises.new')}
          onPress={() => router.push('/(tabs)/training/exercises/new' as Href)}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('training.session.title')}
      </Text>

      <View style={styles.planPicker}>
        <Pressable
          onPress={() => setPlanId(undefined)}
          style={[styles.chip, { backgroundColor: colors.raised }]}
        >
          <Text style={{ color: colors.labelPrimary }}>
            {t('training.session.custom')}
          </Text>
        </Pressable>
        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            onPress={() => setPlanId(plan.id)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  planId === plan.id ? colors.primarySoft : colors.raised,
              },
            ]}
          >
            <Text style={{ color: colors.labelPrimary }}>{plan.name}</Text>
          </Pressable>
        ))}
      </View>

      {rows.map((row, index) => (
        <SessionExerciseEditor
          key={`${row.exerciseId}-${index}`}
          exercise={exercises.find((item) => item.id === row.exerciseId)}
          row={row}
          onChangeRow={(next) => {
            const copy = [...rows];
            copy[index] = next;
            setRows(copy);
          }}
        />
      ))}

      <PrimaryButton
        label={t('training.session.addExercise')}
        onPress={() => {
          if (exercises[0]) {
            setRows([
              ...rows,
              {
                exerciseId: exercises[0].id,
                sets: [{ reps: '10', weightKg: '0' }],
              },
            ]);
          }
        }}
      />

      {formError ? <InlineError message={formError} /> : null}
      {submitError ? <InlineError message={submitError} /> : null}

      <PrimaryButton
        label={t('training.session.log')}
        loading={submitLoading}
        disabled={submitLoading || rows.length === 0}
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
  center: {
    justifyContent: 'center',
    gap: 16,
  },
  planPicker: {
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
