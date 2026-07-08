import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRing } from '@/src/components/ActivityRing';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import { radius, spacing } from '@/src/theme/tokens';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

function trackColor(hex: string) {
  return `${hex}38`;
}

export function VariantA({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.inkSecondary }]}>
            {t.home.greeting}, {data.userName}
          </Text>
          <Text style={[styles.display, { color: colors.ink }]}>{data.dateLabel}</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: `${colors.primary}22` }]}>
          <Text style={[styles.streakNum, { color: colors.primary }]}>{data.streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.primary }]}>{t.home.streak}</Text>
        </View>
      </View>

      <View style={styles.ringsRow}>
        <ActivityRing
          size={100}
          strokeWidth={12}
          progress={data.rings.training.value}
          color={colors.training}
          trackColor={trackColor(colors.training)}
          label={data.rings.training.label}
          detail={data.rings.training.detail}
          theme={theme}
        />
        <ActivityRing
          size={100}
          strokeWidth={12}
          progress={data.rings.nutrition.value}
          color={colors.nutrition}
          trackColor={trackColor(colors.nutrition)}
          label={data.rings.nutrition.label}
          detail={data.rings.nutrition.detail}
          theme={theme}
        />
        <ActivityRing
          size={100}
          strokeWidth={12}
          progress={data.rings.progress.value}
          color={colors.progress}
          trackColor={trackColor(colors.progress)}
          label={data.rings.progress.label}
          detail={data.rings.progress.detail}
          theme={theme}
        />
      </View>

      <View
        style={[
          styles.guidanceCard,
          {
            backgroundColor: colors.surface,
            borderLeftColor: colors.primary,
          },
        ]}
      >
        <Text style={[styles.cardEyebrow, { color: colors.primary }]}>{t.home.guidance}</Text>
        <Text style={[styles.body, { color: colors.ink }]}>{data.guidanceMessage}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.training }]}
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnTextDark}>{t.home.startWorkout}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.nutrition }]}
          accessibilityRole="button"
        >
          <Text style={styles.actionBtnTextDark}>{t.home.logMeal}</Text>
        </Pressable>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.ink }]}>{data.workout.name}</Text>
        <Text style={[styles.caption, { color: colors.inkSecondary }]}>
          {data.workout.setsDone}/{data.workout.setsTotal} {t.home.sets} ·{' '}
          {data.macros.calories.consumed}/{data.macros.calories.target} {t.home.kcal}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 15, marginBottom: 4 },
  display: { fontSize: 34, fontWeight: '700' },
  streakBadge: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 72,
  },
  streakNum: { fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  streakLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  guidanceCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 3,
    gap: spacing.sm,
  },
  cardEyebrow: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: 17, lineHeight: 24 },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  actionBtnTextDark: { color: '#1D1D1F', fontSize: 15, fontWeight: '700' },
  summaryCard: { borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  caption: { fontSize: 13 },
});
