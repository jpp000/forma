import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRing } from '@/src/components/ActivityRing';
import { FormaButton } from '@/src/components/ui/FormaButton';
import { GroupedSection, GroupedSeparator } from '@/src/components/ui/GroupedSection';
import { ListRow } from '@/src/components/ui/ListRow';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import { ringTrack } from '@/src/theme/color';
import { spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

export function VariantA({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[type.largeTitle, { color: colors.ink }]}>{data.dateLabel}</Text>
        <Text style={[type.subhead, { color: colors.inkSecondary }]}>
          {t.home.greeting}, {data.userName}
        </Text>
      </View>

      <View
        style={[
          styles.ringsPlate,
          {
            backgroundColor: isDark ? colors.surface : colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.ringsRow}>
          <ActivityRing
            size={108}
            strokeWidth={11}
            progress={data.rings.training.value}
            color={colors.training}
            trackColor={ringTrack(colors.training, isDark)}
            label={data.rings.training.label}
            detail={data.rings.training.detail}
            theme={theme}
          />
          <ActivityRing
            size={108}
            strokeWidth={11}
            progress={data.rings.nutrition.value}
            color={colors.nutrition}
            trackColor={ringTrack(colors.nutrition, isDark)}
            label={data.rings.nutrition.label}
            detail={data.rings.nutrition.detail}
            theme={theme}
          />
          <ActivityRing
            size={108}
            strokeWidth={11}
            progress={data.rings.progress.value}
            color={colors.progress}
            trackColor={ringTrack(colors.progress, isDark)}
            label={data.rings.progress.label}
            detail={data.rings.progress.detail}
            theme={theme}
          />
        </View>
        <View style={[styles.streakRow, { borderTopColor: colors.separator }]}>
          <Text style={[type.footnote, { color: colors.inkSecondary }]}>{t.home.streak}</Text>
          <Text style={[type.metric, { color: colors.primary }]}>{data.streak}</Text>
        </View>
      </View>

      <GroupedSection title={t.home.guidance} theme={theme}>
        <ListRow
          theme={theme}
          title={data.guidanceMessage}
          accentColor={colors.primary}
        />
      </GroupedSection>

      <GroupedSection title={t.home.today} theme={theme}>
        <ListRow
          theme={theme}
          title={data.workout.name}
          subtitle={`${data.workout.setsDone}/${data.workout.setsTotal} ${t.home.sets}`}
          value={`${Math.round(data.rings.training.value * 100)}%`}
          accentColor={colors.training}
          showChevron
        />
        <GroupedSeparator theme={theme} />
        <ListRow
          theme={theme}
          title={t.home.nutrition}
          subtitle={`${data.macros.calories.consumed} / ${data.macros.calories.target} ${t.home.kcal}`}
          value={`${data.macros.protein.consumed}g`}
          accentColor={colors.nutrition}
          showChevron
        />
        <GroupedSeparator theme={theme} />
        <ListRow
          theme={theme}
          title={t.home.progress}
          subtitle={`${data.weight.delta > 0 ? '+' : ''}${data.weight.delta} ${t.home.kg} ${t.home.thisWeek}`}
          value={`${data.weight.current}`}
          accentColor={colors.progress}
          showChevron
        />
      </GroupedSection>

      <View style={styles.actions}>
        <FormaButton theme={theme} label={t.home.startWorkout} variant="primary" />
        <FormaButton theme={theme} label={t.home.logMeal} variant="ghost" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    gap: spacing.xxl,
  },
  header: { gap: 4 },
  ringsPlate: {
    borderRadius: 20,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
});
