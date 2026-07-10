import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import { brand } from '../../theme/colors';
import { InlineError, LoadingState, PrimaryButton, Screen } from '../../ui';
import { MacroSummaryCard } from './components/MacroSummaryCard';
import { isEmptyDay } from './macroProgress';
import { useNutritionStore } from './nutritionStore';

export function NutritionHubScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();

  const { fetchHub, hubLoading, hubErrors, dailySummary, streaks, todayUtc } =
    useNutritionStore();

  useFocusEffect(
    useCallback(() => {
      void fetchHub();
    }, [fetchHub]),
  );

  const onRefresh = useCallback(() => {
    void fetchHub();
  }, [fetchHub]);

  if (hubLoading && !dailySummary) {
    return (
      <Screen testID="nutrition-screen">
        <LoadingState />
      </Screen>
    );
  }

  if (hubErrors.daily && !dailySummary) {
    return (
      <Screen style={styles.centered} testID="nutrition-screen">
        <InlineError message={hubErrors.daily} />
        <PrimaryButton
          label={t('common.retry')}
          onPress={onRefresh}
          testID="nutrition-retry-button"
        />
      </Screen>
    );
  }

  const emptyDay = isEmptyDay(dailySummary);

  return (
    <Screen
      scroll
      style={styles.content}
      testID="nutrition-screen"
      refreshControl={
        <RefreshControl
          refreshing={hubLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('nutrition.title')}
      </Text>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {todayUtc}
      </Text>

      {hubErrors.streaks ? (
        <InlineError message={hubErrors.streaks} />
      ) : (
        <Text style={[typography.body, { color: brand.award }]}>
          {t('nutrition.hub.streak', {
            count: streaks?.nutrition.current ?? 0,
          })}
        </Text>
      )}

      {hubErrors.daily ? (
        <InlineError message={hubErrors.daily} />
      ) : (
        <MacroSummaryCard summary={dailySummary} />
      )}

      {emptyDay ? (
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('nutrition.hub.empty')}
        </Text>
      ) : null}

      <View style={styles.ctaWrap}>
        <PrimaryButton
          label={t('nutrition.hub.logMeal')}
          onPress={() =>
            router.push('/(tabs)/nutrition/meal/new' as Href)
          }
          testID="nutrition-log-meal-button"
        />
      </View>
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
  ctaWrap: {
    marginTop: 8,
  },
});
