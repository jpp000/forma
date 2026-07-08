import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignButton } from '@/src/components/home/DesignButton';
import { DesignGroupedList, DesignListRow, DesignSeparator } from '@/src/components/home/DesignGroupedList';
import { wiseSystem } from '@/src/design-systems/wise';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

function MetricTile({
  label,
  value,
  bg,
  ds,
  palette,
}: {
  label: string;
  value: string;
  bg: string;
  ds: typeof wiseSystem;
  palette: ReturnType<typeof wiseSystem.palette>;
}) {
  return (
    <View style={[styles.metricTile, { backgroundColor: bg, borderRadius: ds.radius.card }]}>
      <Text style={[ds.type.caption, { color: palette.inkSecondary }]}>{label}</Text>
      <Text style={[ds.type.metric, { color: palette.ink }]}>{value}</Text>
    </View>
  );
}

/** B — Wise fintech (apps/mobile/wise) */
export function VariantB({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const ds = wiseSystem;
  const p = ds.palette(theme);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: p.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: p.surface, borderRadius: ds.radius.card }]}>
        <Text style={[ds.type.caption, { color: p.inkTertiary }]}>
          {t.home.greeting}, {data.userName}
        </Text>
        <Text style={[ds.type.metricHero, { color: p.ink }]}>{data.streak}</Text>
        <Text style={[ds.type.bodyStrong, { color: p.inkSecondary }]}>{t.home.streak}</Text>
        <Text style={[ds.type.title, { color: p.ink, marginTop: 20, lineHeight: 30 }]}>
          {data.guidanceMessage}
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <MetricTile
          label={t.home.training}
          value={data.rings.training.detail}
          bg={p.accentSoft ?? '#E2F6D5'}
          ds={ds}
          palette={p}
        />
        <MetricTile
          label={t.home.nutrition}
          value={`${data.macros.calories.consumed}`}
          bg={p.surface}
          ds={ds}
          palette={p}
        />
        <MetricTile
          label={t.home.progress}
          value={`${data.weight.current}`}
          bg={p.bg}
          ds={ds}
          palette={p}
        />
      </View>

      <DesignGroupedList ds={ds} palette={p} title={t.home.today}>
        <DesignListRow
          ds={ds}
          palette={p}
          title={data.workout.name}
          subtitle={data.rings.training.detail}
          dotColor={p.training}
        />
        <DesignSeparator palette={p} />
        <DesignListRow
          ds={ds}
          palette={p}
          title={t.home.nutrition}
          subtitle={`${data.macros.protein.consumed}g ${t.home.protein}`}
          dotColor={p.nutrition}
        />
      </DesignGroupedList>

      <View style={styles.actions}>
        <DesignButton ds={ds} palette={p} theme={theme} label={t.home.startWorkout} variant="primary" />
        <DesignButton ds={ds} palette={p} theme={theme} label={t.home.logMeal} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  heroCard: { padding: 24, gap: 4 },
  metricGrid: { flexDirection: 'row', gap: 12 },
  metricTile: { flex: 1, padding: 16, gap: 6, minHeight: 88 },
  actions: { gap: 12, marginTop: 4 },
});
