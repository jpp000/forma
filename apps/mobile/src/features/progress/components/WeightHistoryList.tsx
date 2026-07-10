import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { WeightHistoryRowModel } from '../types';
import { WeightHistoryRow } from './WeightHistoryRow';

type WeightHistoryListProps = {
  title: string;
  rows: WeightHistoryRowModel[];
  emptyLabel: string;
};

export function WeightHistoryList({
  title,
  rows,
  emptyLabel,
}: WeightHistoryListProps) {
  const { colors, typography } = useFormaTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.title, { color: colors.labelPrimary }]}>
        {title}
      </Text>
      {rows.length === 0 ? (
        <Text style={[typography.body, { color: colors.labelTertiary }]}>
          {emptyLabel}
        </Text>
      ) : (
        rows.map((row) => <WeightHistoryRow key={row.id} row={row} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
});
