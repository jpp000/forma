import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme, useReduceMotion } from '../../theme';
import { InlineError, PrimaryButton, Screen } from '../../ui';
import { GuidanceList } from './components/GuidanceList';
import { MetricTileGrid } from './components/MetricTileGrid';
import { RingHeroCard } from './components/RingHeroCard';
import { SummaryHeader } from './components/SummaryHeader';
import { SummarySkeleton } from './components/SummarySkeleton';
import { useHomeSummary } from './useHomeSummary';

export function SummaryScreen() {
  const router = useRouter();
  const t = useT();
  const { colors } = useFormaTheme();
  const reduceMotion = useReduceMotion();
  const {
    status,
    today,
    rings,
    ringLegend,
    tiles,
    guidance,
    ringsError,
    guidanceError,
    fatalError,
    cta,
    refresh,
  } = useHomeSummary();

  const handleCta = useCallback(() => {
    router.push(cta.route);
  }, [cta.route, router]);

  if (status === 'loading' || status === 'idle') {
    return (
      <Screen scroll>
        <SummarySkeleton />
      </Screen>
    );
  }

  if (status === 'error' && fatalError) {
    return (
      <Screen scroll>
        <View style={styles.fatal}>
          <InlineError message={fatalError} />
          <PrimaryButton
            label={t('common.retry')}
            onPress={() => void refresh()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={status === 'refreshing'}
          tintColor={colors.primary}
          onRefresh={() => void refresh()}
        />
      }
      scroll
      style={styles.content}
    >
      <SummaryHeader date={today} />
      <RingHeroCard
        error={ringsError}
        exercise={rings.exercise}
        legend={ringLegend}
        move={rings.move}
        reducedMotion={reduceMotion}
        stand={rings.stand}
      />
      <MetricTileGrid tiles={tiles} />
      <GuidanceList
        error={guidanceError}
        onRetry={() => void refresh()}
        suggestions={guidance}
      />
      <PrimaryButton label={t(cta.labelKey)} onPress={handleCta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  fatal: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
  },
});
