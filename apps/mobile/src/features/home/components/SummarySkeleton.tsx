import { StyleSheet, View } from 'react-native';
import { useFormaTheme } from '../../../theme';

function SkeletonBlock({
  height,
  width = '100%',
  radius = 12,
}: {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
}) {
  const { colors } = useFormaTheme();

  return (
    <View
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: colors.raised,
      }}
    />
  );
}

export function SummarySkeleton() {
  return (
    <View style={styles.wrap}>
      <SkeletonBlock height={18} width="40%" />
      <SkeletonBlock height={34} width="70%" radius={8} />
      <SkeletonBlock height={22} width="50%" radius={8} />
      <SkeletonBlock height={174} radius={18} />
      <View style={styles.grid}>
        <SkeletonBlock height={88} width="48%" radius={14} />
        <SkeletonBlock height={88} width="48%" radius={14} />
        <SkeletonBlock height={88} width="48%" radius={14} />
        <SkeletonBlock height={88} width="48%" radius={14} />
      </View>
      <SkeletonBlock height={120} radius={18} />
      <SkeletonBlock height={48} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
