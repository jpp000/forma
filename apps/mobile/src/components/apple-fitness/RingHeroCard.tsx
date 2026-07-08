import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActivityRings } from '@/src/components/apple-fitness/ActivityRings';
import {
  afColors,
  afSurface,
  afTypography,
  ringConfig,
} from '@/src/design-systems/appleFitness';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

export interface RingLegendItem {
  name: string;
  value: string;
  goal: string;
}

interface RingHeroCardProps {
  theme: FormaTheme;
  move: number;
  exercise: number;
  stand: number;
  legend: [RingLegendItem, RingLegendItem, RingLegendItem];
  onPress?: () => void;
}

export function RingHeroCard({
  theme,
  move,
  exercise,
  stand,
  legend,
  onPress,
}: RingHeroCardProps) {
  const s = afSurface(theme);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: s.grouped,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <ActivityRings move={move} exercise={exercise} stand={stand} size={130} lineWidth={14} />
      <View style={styles.legend}>
        {legend.map((item, i) => (
          <View key={item.name} style={styles.legendRow}>
            <Text style={[afTypography.eyebrow, { color: ringConfig[i].label }]}>{item.name}</Text>
            <View style={styles.valueRow}>
              <Text style={[afTypography.ringValue, { color: s.ink }]}>{item.value}</Text>
              <Text style={[afTypography.footnote, { color: s.inkSecondary }]}>{item.goal}</Text>
            </View>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginHorizontal: 16,
    padding: 22,
    borderRadius: 18,
  },
  legend: { flex: 1, gap: 14 },
  legendRow: { gap: 2 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 },
});

export { afColors };
