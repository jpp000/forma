import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import { InlineError, LoadingState, PrimaryButton, Screen } from '../../ui';
import { TrainingStatusChip } from './components/TrainingStatusChip';
import { useTrainingStore } from './trainingStore';

export function TrainingHubScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();

  const {
    fetchHub,
    hubLoading,
    hubErrors,
    streaks,
    todayStatus,
    todayUtc,
    submitLoading,
    markRestDay,
  } = useTrainingStore();

  useFocusEffect(
    useCallback(() => {
      void fetchHub();
    }, [fetchHub]),
  );

  const restDisabled =
    todayStatus === 'workout' ||
    todayStatus === 'rest' ||
    submitLoading ||
    hubLoading;

  const restLabel =
    todayStatus === 'rest'
      ? t('training.hub.markRestDone')
      : t('training.hub.markRest');

  if (hubLoading && !streaks) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const hasPartialError = Boolean(
    hubErrors.streaks || hubErrors.sessions || hubErrors.restDays,
  );

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('training.title')}
      </Text>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {todayUtc}
      </Text>

      {hubErrors.streaks ? (
        <InlineError message={hubErrors.streaks} />
      ) : (
        <Text style={[typography.body, { color: colors.labelPrimary }]}>
          {t('training.hub.streak', {
            count: streaks?.training.current ?? 0,
          })}
        </Text>
      )}

      {hubErrors.sessions || hubErrors.restDays ? (
        <InlineError message={hubErrors.sessions ?? hubErrors.restDays ?? ''} />
      ) : (
        <TrainingStatusChip status={todayStatus} />
      )}

      {hasPartialError ? (
        <PrimaryButton
          label={t('common.retry')}
          onPress={() => {
            void fetchHub();
          }}
        />
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label={t('training.hub.startWorkout')}
          onPress={() => router.push('/(tabs)/training/session/new' as Href)}
        />
        <PrimaryButton
          label={restLabel}
          disabled={restDisabled}
          loading={submitLoading}
          onPress={() => {
            void markRestDay();
          }}
        />
        {todayStatus === 'workout' ? (
          <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
            {t('training.hub.restBlocked')}
          </Text>
        ) : null}
      </View>

      <View style={[styles.navGroup, { backgroundColor: colors.grouped }]}>
        <NavRow
          label={t('training.exercises.title')}
          onPress={() => router.push('/(tabs)/training/exercises' as Href)}
        />
        <View
          style={[styles.separator, { backgroundColor: colors.separator }]}
        />
        <NavRow
          label={t('training.plans.title')}
          onPress={() => router.push('/(tabs)/training/plans' as Href)}
        />
      </View>
    </Screen>
  );
}

function NavRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors, typography } = useFormaTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.navRow}
    >
      <Text style={[typography.body, { color: colors.labelPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  actions: {
    gap: 12,
  },
  navGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  navRow: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
