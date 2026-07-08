import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormaButton } from '@/src/components/ui/FormaButton';
import { GroupedSection, GroupedSeparator } from '@/src/components/ui/GroupedSection';
import { ListRow } from '@/src/components/ui/ListRow';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import { spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

function MacroBar({
  theme,
  label,
  consumed,
  target,
  color,
  unit,
}: {
  theme: FormaTheme;
  label: string;
  consumed: number;
  target: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min(1, consumed / target);
  return (
    <View style={styles.macroBlock}>
      <View style={styles.macroHeader}>
        <Text style={[type.subhead, { color: theme.colors.ink }]}>{label}</Text>
        <Text style={[type.footnote, { color: theme.colors.inkSecondary, fontVariant: ['tabular-nums'] }]}>
          {consumed}/{target} {unit}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <View style={[styles.fill, { backgroundColor: color, width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

export function VariantB({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={[type.footnote, { color: colors.inkSecondary }]}>
          {t.home.greeting}, {data.userName}
        </Text>
        <Text style={[type.title2, styles.guidanceLead, { color: colors.ink }]}>
          {data.guidanceMessage}
        </Text>
        <View style={styles.streakBlock}>
          <Text style={[type.metricLarge, { color: colors.ink }]}>{data.streak}</Text>
          <Text style={[type.subhead, { color: colors.inkSecondary }]}>{t.home.streak}</Text>
        </View>
      </View>

      <View style={styles.ctaBlock}>
        <FormaButton theme={theme} label={t.home.startWorkout} variant="primary" />
        <FormaButton theme={theme} label={t.home.logMeal} variant="secondary" />
      </View>

      <GroupedSection title={t.home.today} theme={theme}>
        <ListRow
          theme={theme}
          title={data.workout.name}
          subtitle={data.rings.training.detail}
          accentColor={colors.training}
          showChevron
        />
        <GroupedSeparator theme={theme} />
        <ListRow
          theme={theme}
          title={t.home.nutrition}
          subtitle={`${data.macros.protein.consumed}g ${t.home.protein}`}
          accentColor={colors.nutrition}
          showChevron
        />
        <GroupedSeparator theme={theme} />
        <ListRow
          theme={theme}
          title={t.home.progress}
          subtitle={`${data.weight.current} ${t.home.kg}`}
          accentColor={colors.progress}
          showChevron
        />
      </GroupedSection>

      <View
        style={[
          styles.macroCard,
          {
            backgroundColor: theme.isDark ? colors.surfaceElevated : colors.surface,
          },
        ]}
      >
        <MacroBar
          theme={theme}
          label={t.home.kcal}
          consumed={data.macros.calories.consumed}
          target={data.macros.calories.target}
          color={colors.nutrition}
          unit={t.home.kcal}
        />
        <MacroBar
          theme={theme}
          label={t.home.protein}
          consumed={data.macros.protein.consumed}
          target={data.macros.protein.target}
          color={colors.primary}
          unit="g"
        />
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
  hero: { gap: spacing.md },
  guidanceLead: { lineHeight: 28 },
  streakBlock: { gap: 2, marginTop: spacing.sm },
  ctaBlock: { gap: spacing.md },
  macroCard: {
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  macroBlock: { gap: spacing.sm },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
