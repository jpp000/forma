import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRingsRow } from '@/src/components/home/ActivityRingsRow';
import { DesignButton } from '@/src/components/home/DesignButton';
import { DesignGroupedList, DesignListRow, DesignSeparator } from '@/src/components/home/DesignGroupedList';
import { shopifySystem } from '@/src/design-systems/shopify';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

/** C — Shopify cinematic (apps/mobile/shopify) */
export function VariantC({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const ds = shopifySystem;
  const p = ds.palette(theme);
  const cinematic = theme.isDark;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: p.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={[ds.type.hero, { color: p.ink }]}>{data.dateLabel}</Text>
        <Text style={[ds.type.body, { color: p.inkSecondary, marginTop: 16, maxWidth: 320, lineHeight: 26 }]}>
          {data.guidanceMessage}
        </Text>
        <Text style={[ds.type.caption, { color: p.inkTertiary, marginTop: 12 }]}>
          {data.streak} {t.home.streak} · {t.home.greeting}, {data.userName}
        </Text>
      </View>

      <ActivityRingsRow
        data={data}
        palette={p}
        isDark={cinematic}
        size={88}
        strokeWidth={9}
        showLabels={false}
      />

      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: p.surface,
            borderRadius: ds.radius.card,
            borderWidth: cinematic ? 0 : StyleSheet.hairlineWidth,
            borderColor: p.separator,
          },
        ]}
      >
        <View style={styles.statRow}>
          <Text style={[ds.type.caption, { color: p.inkSecondary }]}>{t.home.training}</Text>
          <Text style={[ds.type.metric, { color: p.ink }]}>{data.rings.training.detail}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: p.separator }]} />
        <View style={styles.statRow}>
          <Text style={[ds.type.caption, { color: p.inkSecondary }]}>{t.home.nutrition}</Text>
          <Text style={[ds.type.metric, { color: p.ink }]}>
            {data.macros.calories.consumed} {t.home.kcal}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: p.separator }]} />
        <View style={styles.statRow}>
          <Text style={[ds.type.caption, { color: p.inkSecondary }]}>{t.home.progress}</Text>
          <Text style={[ds.type.metric, { color: p.ink }]}>
            {data.weight.current} {t.home.kg}
          </Text>
        </View>
      </View>

      {!cinematic && p.accent ? (
        <View style={[styles.mintBand, { backgroundColor: p.accentSoft, borderRadius: ds.radius.card }]}>
          <Text style={[ds.type.bodyStrong, { color: p.ink }]}>{data.workout.name}</Text>
          <Text style={[ds.type.caption, { color: p.inkSecondary, marginTop: 4 }]}>
            {data.workout.setsDone}/{data.workout.setsTotal} {t.home.sets} {t.home.planned}
          </Text>
        </View>
      ) : (
        <DesignGroupedList ds={ds} palette={p} title={t.home.today}>
          <DesignListRow
            ds={ds}
            palette={p}
            title={data.workout.name}
            subtitle={`${data.workout.setsDone}/${data.workout.setsTotal} ${t.home.sets}`}
            dotColor={p.training}
          />
          <DesignSeparator palette={p} />
          <DesignListRow
            ds={ds}
            palette={p}
            title={t.home.logMeal}
            subtitle={`${data.macros.calories.target - data.macros.calories.consumed} ${t.home.kcal} ${t.home.remaining}`}
            dotColor={p.nutrition}
          />
        </DesignGroupedList>
      )}

      <View style={styles.actions}>
        <DesignButton ds={ds} palette={p} theme={theme} label={t.home.startWorkout} variant="primary" />
        <DesignButton ds={ds} palette={p} theme={theme} label={t.home.logMeal} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 36 },
  hero: { gap: 0 },
  statsCard: { paddingHorizontal: 20, paddingVertical: 8 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  statDivider: { height: StyleSheet.hairlineWidth },
  mintBand: { padding: 24 },
  actions: { gap: 12, marginTop: 8 },
});
