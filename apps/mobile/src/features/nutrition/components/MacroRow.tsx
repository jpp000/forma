import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';
import { formatMacroDisplay } from '../macroProgress';
import type { MacroRowModel } from '../types';

type MacroRowProps = {
  row: MacroRowModel;
  showNoTarget: boolean;
};

export function MacroRow({ row, showNoTarget }: MacroRowProps) {
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const display = formatMacroDisplay(row.consumed, row.target);

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={[typography.body, { color: colors.move }]}>
          {t(row.labelKey)}
        </Text>
        <Text
          style={[
            typography.body,
            styles.value,
            { color: colors.labelPrimary },
          ]}
        >
          {display.primary}
        </Text>
      </View>
      {display.showTarget ? (
        <View
          style={[styles.track, { backgroundColor: `${colors.move}38` }]}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(row.progress * 100),
          }}
        >
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.move,
                width: `${Math.round(row.progress * 100)}%`,
              },
            ]}
          />
        </View>
      ) : showNoTarget ? (
        <Text style={[typography.footnote, { color: colors.labelTertiary }]}>
          {t('nutrition.hub.noTarget')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
