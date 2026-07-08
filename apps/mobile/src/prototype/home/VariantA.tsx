import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AFPrimaryButton } from '@/src/components/apple-fitness/AFPrimaryButton';
import { FitnessPlusShelf } from '@/src/components/apple-fitness/FitnessPlusShelf';
import { MetricTile } from '@/src/components/apple-fitness/MetricTile';
import { RingHeroCard } from '@/src/components/apple-fitness/RingHeroCard';
import { afColors, afSurface, afTypography } from '@/src/design-systems/appleFitness';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

/**
 * A — Apple Fitness Summary tab (full parity with Spectr / DESIGN.md)
 * https://www.spectr.to/gallery/apple-fitness
 */
export function VariantA({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const s = afSurface(theme);

  const dayEyebrow = data.dayEyebrow ?? 'QUARTA';
  const dateLabel = data.dateFull ?? '8 de jul';

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: s.canvas }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: 132 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header: day eyebrow + date + profile */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[afTypography.eyebrow, { color: afColors.moveLabel }]}>{dayEyebrow}</Text>
          <Text style={[afTypography.date, { color: s.ink }]}>{dateLabel}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: afColors.fill }]}>
          <Text style={[afTypography.body, { color: s.ink }]}>
            {data.userName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[afTypography.largeTitle, styles.largeTitle, { color: s.ink }]}>
        {t.prototype.summaryTitle}
      </Text>

      {/* Activity rings hero */}
      <RingHeroCard
        theme={theme}
        move={data.activity.move.progress}
        exercise={data.activity.exercise.progress}
        stand={data.activity.stand.progress}
        legend={[
          {
            name: t.prototype.move,
            value: String(data.activity.move.value),
            goal: `/${data.activity.move.goal} ${t.prototype.kcal}`,
          },
          {
            name: t.prototype.exercise,
            value: String(data.activity.exercise.value),
            goal: `/${data.activity.exercise.goal} ${t.prototype.min}`,
          },
          {
            name: t.prototype.stand,
            value: String(data.activity.stand.value),
            goal: `/${data.activity.stand.goal} ${t.prototype.hr}`,
          },
        ]}
      />

      {/* Metric tile grid 2-up */}
      <View style={styles.tileGrid}>
        <View style={styles.tileRow}>
          <MetricTile
            theme={theme}
            name={t.prototype.steps}
            value={data.metrics.steps.value}
            sub={data.metrics.steps.sub}
            tint={afColors.moveLabel}
            icon="walk"
          />
          <MetricTile
            theme={theme}
            name={t.prototype.distance}
            value={data.metrics.distance.value}
            unit={t.prototype.km}
            sub={data.metrics.distance.sub}
            tint={afColors.exercise}
            icon="map-outline"
          />
        </View>
        <View style={styles.tileRow}>
          <MetricTile
            theme={theme}
            name={t.prototype.workouts}
            value={String(data.metrics.workouts.value)}
            sub={data.metrics.workouts.sub}
            tint={afColors.stand}
            icon="fitness"
          />
          <MetricTile
            theme={theme}
            name={t.home.streak}
            value={String(data.streak)}
            sub={t.prototype.daysInARow}
            tint={afColors.awardGold}
            icon="flame"
          />
        </View>
      </View>

      {/* Guidance as a quiet grouped card */}
      <View style={[styles.guidance, { backgroundColor: s.grouped }]}>
        <Text style={[afTypography.eyebrow, { color: afColors.accent }]}>{t.home.guidance}</Text>
        <Text style={[afTypography.bodyReg, { color: s.ink, marginTop: 6 }]}>
          {data.guidanceMessage}
        </Text>
      </View>

      {/* Fitness+ cinematic shelf */}
      <FitnessPlusShelf
        theme={theme}
        title={t.prototype.fitnessPlus}
        seeAllLabel={t.prototype.seeAll}
        items={data.fitnessPlus}
      />

      <AFPrimaryButton title={t.home.startWorkout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  headerText: { gap: 2 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeTitle: { paddingHorizontal: 16, marginTop: 4, marginBottom: 4 },
  tileGrid: { paddingHorizontal: 16, gap: 10 },
  tileRow: { flexDirection: 'row', gap: 10 },
  guidance: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
});
