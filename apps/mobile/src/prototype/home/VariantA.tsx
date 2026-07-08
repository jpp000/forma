import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRingsRow } from '@/src/components/home/ActivityRingsRow';
import { DesignButton } from '@/src/components/home/DesignButton';
import {
  DesignGroupedList,
  DesignListRow,
  DesignSeparator,
} from '@/src/components/home/DesignGroupedList';
import { appleFitnessSystem } from '@/src/design-systems/appleFitness';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

/** A — Apple Fitness Summary (apps/mobile/apple) */
export function VariantA({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const ds = appleFitnessSystem;
  const p = ds.palette(theme);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: p.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[ds.type.hero, { color: p.ink }]}>{data.dateLabel}</Text>
      <Text style={[ds.type.caption, { color: p.inkSecondary, marginTop: 2 }]}>
        {t.home.greeting}, {data.userName}
      </Text>

      <View style={styles.ringsBlock}>
        <ActivityRingsRow data={data} palette={p} isDark={theme.isDark} size={116} strokeWidth={13} />
        <View style={styles.streakLine}>
          <Text style={[ds.type.caption, { color: p.inkSecondary }]}>{t.home.streak}</Text>
          <Text style={[ds.type.metric, { color: p.primary }]}>{data.streak}</Text>
        </View>
      </View>

      <DesignGroupedList ds={ds} palette={p} title={t.home.guidance}>
        <DesignListRow ds={ds} palette={p} title={data.guidanceMessage} dotColor={p.primary} />
      </DesignGroupedList>

      <DesignGroupedList ds={ds} palette={p} title={t.home.today}>
        <DesignListRow
          ds={ds}
          palette={p}
          title={data.workout.name}
          subtitle={`${data.workout.setsDone}/${data.workout.setsTotal} ${t.home.sets}`}
          value={`${Math.round(data.rings.training.value * 100)}%`}
          dotColor={p.training}
        />
        <DesignSeparator palette={p} />
        <DesignListRow
          ds={ds}
          palette={p}
          title={t.home.nutrition}
          subtitle={`${data.macros.calories.consumed} / ${data.macros.calories.target} ${t.home.kcal}`}
          value={`${data.macros.protein.consumed}g`}
          dotColor={p.nutrition}
        />
        <DesignSeparator palette={p} />
        <DesignListRow
          ds={ds}
          palette={p}
          title={t.home.progress}
          subtitle={`${data.weight.current} ${t.home.kg}`}
          value={`${data.weight.delta > 0 ? '+' : ''}${data.weight.delta}`}
          dotColor={p.progress}
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
  content: { paddingHorizontal: 20, gap: 28 },
  ringsBlock: { gap: 16, paddingVertical: 8 },
  streakLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  actions: { gap: 8, marginTop: 4 },
});
