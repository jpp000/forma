import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import { InlineError, LoadingState, PrimaryButton, Screen } from '../../ui';
import { StreakPairCard } from './components/StreakPairCard';
import { WeightHistoryList } from './components/WeightHistoryList';
import { WeightSnapshotCard } from './components/WeightSnapshotCard';
import { useProgressStore } from './progressStore';
import {
  buildHistoryRows,
  computeWeightTrend,
  formatWeightKg,
  latestWeight,
} from './weightMappers';

export function ProgressHubScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();

  const {
    fetchHub,
    hubLoading,
    hubErrors,
    weightEntries,
    streaks,
    todayUtc,
  } = useProgressStore();

  useFocusEffect(
    useCallback(() => {
      void fetchHub();
    }, [fetchHub]),
  );

  const onRefresh = useCallback(() => {
    void fetchHub();
  }, [fetchHub]);

  const hasAnyData = weightEntries.length > 0 || streaks !== null;
  const bothFailed =
    Boolean(hubErrors.weight) &&
    Boolean(hubErrors.streaks) &&
    !hasAnyData;

  if (hubLoading && !hasAnyData) {
    return (
      <Screen testID="progress-screen">
        <LoadingState />
      </Screen>
    );
  }

  if (bothFailed) {
    return (
      <Screen style={styles.centered} testID="progress-screen">
        <InlineError message={hubErrors.weight ?? hubErrors.streaks ?? ''} />
        <PrimaryButton
          label={t('common.retry')}
          onPress={onRefresh}
          testID="progress-retry-button"
        />
      </Screen>
    );
  }

  const latest = latestWeight(weightEntries);
  const trend = computeWeightTrend(weightEntries);
  const historyRows = buildHistoryRows(weightEntries);

  return (
    <Screen
      scroll
      style={styles.content}
      testID="progress-screen"
      refreshControl={
        <RefreshControl
          refreshing={hubLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('progress.title')}
      </Text>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {todayUtc}
      </Text>

      {hubErrors.weight ? (
        <InlineError message={hubErrors.weight} />
      ) : (
        <WeightSnapshotCard
          weightLabel={latest ? `${formatWeightKg(latest.weightKg)} kg` : '—'}
          latestWeightLabel={t('progress.hub.latestWeight')}
          noWeightLabel={t('progress.hub.noWeight')}
          trend={trend}
          trendLabels={{
            up: t('progress.hub.trend.up'),
            down: t('progress.hub.trend.down'),
            stable: t('progress.hub.trend.stable'),
            insufficient: t('progress.hub.trend.insufficient'),
          }}
        />
      )}

      {hubErrors.streaks ? (
        <InlineError message={hubErrors.streaks} />
      ) : (
        <View style={styles.streakRow}>
          <StreakPairCard
            title={t('progress.streak.training')}
            streak={streaks?.training ?? null}
            currentLabel={(count) => t('progress.streak.current', { count })}
            longestLabel={(count) => t('progress.streak.longest', { count })}
            zeroHint={t('progress.streak.zeroHint')}
          />
          <StreakPairCard
            title={t('progress.streak.nutrition')}
            streak={streaks?.nutrition ?? null}
            currentLabel={(count) => t('progress.streak.current', { count })}
            longestLabel={(count) => t('progress.streak.longest', { count })}
            zeroHint={t('progress.streak.zeroHint')}
          />
        </View>
      )}

      {!hubErrors.weight ? (
        <WeightHistoryList
          title={t('progress.hub.recentWeight')}
          rows={historyRows}
          emptyLabel={t('progress.hub.emptyHistory')}
        />
      ) : null}

      <PrimaryButton
        label={t('progress.hub.logWeight')}
        onPress={() => router.push('/(tabs)/progress/weight/new' as Href)}
        testID="progress-log-weight-button"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  centered: {
    justifyContent: 'center',
    gap: 16,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
