import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { afSurface, afTypography } from '@/src/design-systems/appleFitness';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface MetricTileProps {
  theme: FormaTheme;
  name: string;
  value: string;
  unit?: string;
  sub: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function MetricTile({
  theme,
  name,
  value,
  unit,
  sub,
  tint,
  icon,
  onPress,
}: MetricTileProps) {
  const s = afSurface(theme);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: s.grouped,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          minHeight: 88,
        },
      ]}
    >
      <View style={styles.top}>
        <Ionicons name={icon} size={16} color={tint} />
        <Text style={[afTypography.footnote, styles.name, { color: s.inkSecondary }]}>{name}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[afTypography.tileValue, { color: s.ink }]}>{value}</Text>
        {unit ? <Text style={[afTypography.footnote, { color: s.inkSecondary }]}>{unit}</Text> : null}
      </View>
      <Text style={[afTypography.footnote, { color: s.inkTertiary, marginTop: 2 }]}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 12, fontWeight: '600' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 8 },
});
