import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';
import { buildMacroRows } from '../macroProgress';
import type { DailySummary } from '../types';
import { MacroRow } from './MacroRow';

type MacroSummaryCardProps = {
  summary: DailySummary | null;
};

export function MacroSummaryCard({ summary }: MacroSummaryCardProps) {
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const rows = buildMacroRows(summary);
  const hasTarget = summary?.target != null;

  return (
    <View style={[styles.card, { backgroundColor: colors.grouped }]}>
      <Text style={[typography.title, { color: colors.labelPrimary }]}>
        {t('nutrition.hub.summaryTitle')}
      </Text>
      <View style={styles.rows}>
        {rows.map((row) => (
          <MacroRow
            key={row.key}
            row={row}
            showNoTarget={!hasTarget && row.key === 'calories'}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  rows: {
    gap: 14,
  },
});
