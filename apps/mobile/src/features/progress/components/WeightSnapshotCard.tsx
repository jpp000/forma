import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { WeightTrend } from '../types';
import { TrendBadge } from './TrendBadge';

type WeightSnapshotCardProps = {
  weightLabel: string;
  latestWeightLabel: string;
  noWeightLabel: string;
  trend: WeightTrend | null;
  trendLabels: {
    up: string;
    down: string;
    stable: string;
    insufficient: string;
  };
};

export function WeightSnapshotCard({
  weightLabel,
  latestWeightLabel,
  noWeightLabel,
  trend,
  trendLabels,
}: WeightSnapshotCardProps) {
  const { colors, typography } = useFormaTheme();
  const hasWeight = weightLabel !== '—';

  return (
    <View style={[styles.card, { backgroundColor: colors.grouped }]}>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {latestWeightLabel}
      </Text>
      <Text
        style={[
          typography.title,
          styles.weightValue,
          { color: colors.stand },
        ]}
      >
        {hasWeight ? weightLabel : noWeightLabel}
      </Text>
      <TrendBadge trend={trend} labels={trendLabels} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  weightValue: {
    fontVariant: ['tabular-nums'],
  },
});
