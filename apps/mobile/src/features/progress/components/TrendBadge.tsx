import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { WeightTrend } from '../types';

type TrendBadgeProps = {
  trend: WeightTrend | null;
  labels: {
    up: string;
    down: string;
    stable: string;
    insufficient: string;
  };
};

export function TrendBadge({ trend, labels }: TrendBadgeProps) {
  const { colors, typography } = useFormaTheme();

  if (trend === null) {
    return (
      <Text style={[typography.footnote, { color: colors.labelTertiary }]}>
        {labels.insufficient}
      </Text>
    );
  }

  const label =
    trend === 'up' ? labels.up : trend === 'down' ? labels.down : labels.stable;

  return (
    <View style={styles.row}>
      <Text style={[typography.body, { color: colors.stand }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 24,
    justifyContent: 'center',
  },
});
