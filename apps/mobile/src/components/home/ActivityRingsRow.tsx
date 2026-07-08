import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActivityRing } from '@/src/components/ActivityRing';
import type { DesignPalette } from '@/src/design-systems/types';
import { ringTrack } from '@/src/theme/color';
import type { HomeMockData } from '@/src/prototype/home/mockData';

interface ActivityRingsRowProps {
  data: HomeMockData;
  palette: DesignPalette;
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
  isDark: boolean;
}

export function ActivityRingsRow({
  data,
  palette,
  size = 112,
  strokeWidth = 12,
  showLabels = true,
  isDark,
}: ActivityRingsRowProps) {
  const rings = [
    {
      progress: data.rings.training.value,
      color: palette.training,
      label: data.rings.training.label,
      detail: data.rings.training.detail,
    },
    {
      progress: data.rings.nutrition.value,
      color: palette.nutrition,
      label: data.rings.nutrition.label,
      detail: data.rings.nutrition.detail,
    },
    {
      progress: data.rings.progress.value,
      color: palette.progress,
      label: data.rings.progress.label,
      detail: data.rings.progress.detail,
    },
  ];

  return (
    <View style={styles.row}>
      {rings.map((ring) => (
        <ActivityRing
          key={ring.label}
          size={size}
          strokeWidth={strokeWidth}
          progress={ring.progress}
          color={ring.color}
          trackColor={ringTrack(ring.color, isDark)}
          label={ring.label}
          detail={ring.detail}
          ink={palette.ink}
          inkSecondary={palette.inkSecondary}
          compact={!showLabels}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
});
