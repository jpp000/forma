import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import { radius, spacing } from '@/src/theme/tokens';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

function StatChip({
  label,
  value,
  color,
  theme,
}: {
  label: string;
  value: string;
  color: string;
  theme: FormaTheme;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipLabel, { color: theme.colors.inkSecondary }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: theme.colors.ink }]}>{value}</Text>
    </View>
  );
}

export function VariantB({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const kcalLeft = data.macros.calories.target - data.macros.calories.consumed;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
    >
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.isDark ? '#0A1F12' : '#E8F9EE',
            borderColor: `${colors.primary}44`,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <Text style={[styles.heroEyebrow, { color: colors.primary }]}>{t.home.guidance}</Text>
          <View style={styles.streakInline}>
            <Text style={[styles.streakBig, { color: colors.primary }]}>{data.streak}</Text>
            <Text style={[styles.streakSmall, { color: colors.primary }]}>{t.home.streak}</Text>
          </View>
        </View>
        <Text style={[styles.heroMessage, { color: colors.ink }]}>{data.guidanceMessage}</Text>
        <Text style={[styles.heroMeta, { color: colors.inkSecondary }]}>
          {t.home.greeting}, {data.userName} · {data.dateLabel}
        </Text>
      </View>

      <View style={styles.ctaStack}>
        <Pressable
          style={[styles.ctaPrimary, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={styles.ctaPrimaryText}>{t.home.startWorkout}</Text>
          <Text style={styles.ctaSubtext}>{data.workout.name}</Text>
        </Pressable>
        <Pressable
          style={[styles.ctaSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaSecondaryText, { color: colors.ink }]}>{t.home.logMeal}</Text>
          <Text style={[styles.ctaSubtextMuted, { color: colors.inkSecondary }]}>
            {kcalLeft} {t.home.kcal} {t.home.remaining}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.inkSecondary }]}>{t.home.today}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <StatChip
          label={t.home.training}
          value={data.rings.training.detail}
          color={colors.training}
          theme={theme}
        />
        <StatChip
          label={t.home.nutrition}
          value={`${data.macros.protein.consumed}g`}
          color={colors.nutrition}
          theme={theme}
        />
        <StatChip
          label={t.home.progress}
          value={`${data.weight.current} ${t.home.kg}`}
          color={colors.progress}
          theme={theme}
        />
        <StatChip
          label={t.home.kcal}
          value={`${data.macros.calories.consumed}`}
          color={colors.nutrition}
          theme={theme}
        />
      </ScrollView>

      <View style={[styles.macroBar, { backgroundColor: colors.surface }]}>
        <View style={styles.macroHeader}>
          <Text style={[styles.macroTitle, { color: colors.ink }]}>{t.home.nutrition}</Text>
          <Text style={[styles.macroNums, { color: colors.inkSecondary }]}>
            {data.macros.calories.consumed}/{data.macros.calories.target} {t.home.kcal}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: `${colors.nutrition}33` }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.nutrition,
                width: `${(data.macros.calories.consumed / data.macros.calories.target) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.xxl },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroEyebrow: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  streakInline: { alignItems: 'flex-end' },
  streakBig: { fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'], lineHeight: 42 },
  streakSmall: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  heroMessage: { fontSize: 22, fontWeight: '600', lineHeight: 30 },
  heroMeta: { fontSize: 13 },
  ctaStack: { gap: spacing.md },
  ctaPrimary: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 72,
    justifyContent: 'center',
  },
  ctaPrimaryText: { color: '#000000', fontSize: 17, fontWeight: '700' },
  ctaSubtext: { color: 'rgba(0,0,0,0.55)', fontSize: 13, marginTop: 2 },
  ctaSecondary: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    minHeight: 72,
    justifyContent: 'center',
  },
  ctaSecondaryText: { fontSize: 17, fontWeight: '600' },
  ctaSubtextMuted: { fontSize: 13, marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -8,
  },
  chipRow: { gap: spacing.md, paddingRight: spacing.xl },
  chip: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minWidth: 120,
    gap: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipLabel: { fontSize: 12, fontWeight: '500' },
  chipValue: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  macroBar: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroTitle: { fontSize: 17, fontWeight: '600' },
  macroNums: { fontSize: 13, fontVariant: ['tabular-nums'] },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
