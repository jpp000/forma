import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GroupedList } from '../../../../src/features/training/components/ExerciseListRow';
import { PlanListRow } from '../../../../src/features/training/components/PlanListRow';
import { useTrainingStore } from '../../../../src/features/training/trainingStore';
import { useT } from '../../../../src/i18n';
import { useFormaTheme } from '../../../../src/theme';
import {
  InlineError,
  LoadingState,
  PrimaryButton,
  Screen,
} from '../../../../src/ui';

export default function PlansScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const {
    plans,
    exercises,
    plansLoading,
    listError,
    fetchPlans,
    fetchExercises,
  } = useTrainingStore();

  useEffect(() => {
    void fetchPlans();
    void fetchExercises();
  }, [fetchPlans, fetchExercises]);

  const canCreatePlan = exercises.length > 0;

  if (plansLoading && plans.length === 0) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('training.plans.title')}
      </Text>

      {listError ? <InlineError message={listError} /> : null}

      {plans.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.labelSecondary }]}>
            {canCreatePlan
              ? t('training.plans.empty')
              : t('training.plans.needExercise')}
          </Text>
          {canCreatePlan ? (
            <PrimaryButton
              label={t('training.plans.new')}
              onPress={() => router.push('/(tabs)/training/plans/new' as Href)}
            />
          ) : (
            <PrimaryButton
              label={t('training.exercises.new')}
              onPress={() =>
                router.push('/(tabs)/training/exercises/new' as Href)
              }
            />
          )}
        </View>
      ) : (
        <GroupedList>
          {plans.map((plan) => (
            <PlanListRow key={plan.id} plan={plan} />
          ))}
        </GroupedList>
      )}

      {plans.length > 0 && canCreatePlan ? (
        <PrimaryButton
          label={t('training.plans.new')}
          onPress={() => router.push('/(tabs)/training/plans/new' as Href)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  empty: {
    gap: 16,
    paddingVertical: 24,
  },
});
