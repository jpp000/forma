import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { WeightHistoryRowModel } from '../types';

type WeightHistoryRowProps = {
  row: WeightHistoryRowModel;
};

export function WeightHistoryRow({ row }: WeightHistoryRowProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={[typography.body, { color: colors.labelPrimary }]}>
          {row.date}
        </Text>
        <Text
          style={[
            typography.body,
            styles.weight,
            { color: colors.stand },
          ]}
        >
          {row.weightLabel}
        </Text>
      </View>
      {row.deltaLabel ? (
        <Text
          style={[
            typography.footnote,
            styles.delta,
            {
              color: row.deltaPositive ? colors.error : colors.primary,
            },
          ]}
        >
          {row.deltaLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: 12,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  weight: {
    fontVariant: ['tabular-nums'],
  },
  delta: {
    fontVariant: ['tabular-nums'],
  },
});
