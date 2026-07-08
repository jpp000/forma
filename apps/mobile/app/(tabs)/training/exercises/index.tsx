import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ExerciseListRow,
  GroupedList,
} from '../../../../src/features/training/components/ExerciseListRow';
import { useTrainingStore } from '../../../../src/features/training/trainingStore';
import { useT } from '../../../../src/i18n';
import { useFormaTheme } from '../../../../src/theme';
import {
  InlineError,
  LoadingState,
  PrimaryButton,
  Screen,
} from '../../../../src/ui';

export default function ExercisesScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const { exercises, listLoading, listError, fetchExercises } =
    useTrainingStore();

  useEffect(() => {
    void fetchExercises();
  }, [fetchExercises]);

  if (listLoading && exercises.length === 0) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('training.exercises.title')}
      </Text>

      {listError ? <InlineError message={listError} /> : null}

      {exercises.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.labelSecondary }]}>
            {t('training.exercises.empty')}
          </Text>
          <PrimaryButton
            label={t('training.exercises.new')}
            onPress={() => router.push('/(tabs)/training/exercises/new' as Href)}
          />
        </View>
      ) : (
        <GroupedList>
          {exercises.map((exercise) => (
            <ExerciseListRow key={exercise.id} exercise={exercise} />
          ))}
        </GroupedList>
      )}

      {exercises.length > 0 ? (
        <PrimaryButton
          label={t('training.exercises.new')}
          onPress={() => router.push('/(tabs)/training/exercises/new' as Href)}
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
