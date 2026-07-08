import { StyleSheet, View } from 'react-native';
import { InlineError } from '../../../ui';
import type { TileModel } from '../summaryMappers';
import { MetricTile } from './MetricTile';

type MetricTileGridProps = {
  tiles: TileModel[];
  error?: string;
};

export function MetricTileGrid({ tiles, error }: MetricTileGridProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <MetricTile key={tile.id} tile={tile} />
        ))}
      </View>
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
