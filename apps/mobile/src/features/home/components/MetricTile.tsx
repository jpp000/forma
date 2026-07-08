import { StyleSheet, Text, View } from 'react-native';
import { brand } from '../../../theme/colors';
import { useFormaTheme } from '../../../theme';
import { useT } from '../../../i18n';
import type { TileModel } from '../summaryMappers';

type MetricTileProps = {
  tile: TileModel;
};

function accentColor(accent: TileModel['accent']): string {
  switch (accent) {
    case 'award':
      return brand.award;
    case 'move':
      return brand.move;
    case 'exercise':
      return brand.exercise;
    case 'stand':
      return brand.stand;
    default:
      return brand.primary;
  }
}

export function MetricTile({ tile }: MetricTileProps) {
  const { colors, typography } = useFormaTheme();
  const t = useT();
  const tint = tile.accent ? accentColor(tile.accent) : colors.primary;

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.grouped,
          borderColor: tile.error ? colors.error : 'transparent',
          borderWidth: tile.error ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <Text style={[typography.footnote, { color: tint }]}>{t(tile.labelKey)}</Text>
      <Text
        allowFontScaling={false}
        style={[
          typography.title,
          typography.tabular,
          styles.value,
          { color: colors.labelPrimary },
        ]}
      >
        {tile.value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    minHeight: 88,
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },
  value: {
    fontSize: 22,
    lineHeight: 24,
  },
});
