import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';
import { ringConfig } from '../../../theme/colors';
import { InlineError } from '../../../ui';
import type { RingLegendSet } from '../summaryMappers';
import { ActivityRings } from './ActivityRings';

type RingHeroCardProps = {
  move: number;
  exercise: number;
  stand: number;
  legend: RingLegendSet;
  error?: string;
  reducedMotion?: boolean;
};

const ringLabelKeys = [
  'home.rings.move',
  'home.rings.exercise',
  'home.rings.stand',
] as const;

export function RingHeroCard({
  move,
  exercise,
  stand,
  legend,
  error,
  reducedMotion = false,
}: RingHeroCardProps) {
  const { colors, typography } = useFormaTheme();
  const t = useT();
  const legends = [legend.move, legend.exercise, legend.stand];

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: colors.grouped }]}>
        <ActivityRings
          exercise={exercise}
          move={move}
          reducedMotion={reducedMotion}
          stand={stand}
        />
        <View style={styles.legend}>
          {ringLabelKeys.map((labelKey, index) => {
            const item = legends[index];
            const goalText =
              item.hasTarget || index > 0
                ? item.goal
                : t('home.rings.noTarget');

            return (
              <View key={labelKey}>
                <Text
                  style={[
                    typography.eyebrow,
                    { color: ringConfig[index].label },
                  ]}
                >
                  {t(labelKey)}
                </Text>
                <View style={styles.valueRow}>
                  <Text
                    allowFontScaling={false}
                    style={[
                      typography.title,
                      typography.tabular,
                      styles.value,
                      { color: colors.labelPrimary },
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={[
                      typography.footnote,
                      { color: colors.labelSecondary },
                    ]}
                  >
                    {goalText}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 22,
    borderRadius: 18,
  },
  legend: {
    flex: 1,
    gap: 14,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  value: {
    fontSize: 19,
    lineHeight: 21,
  },
});
