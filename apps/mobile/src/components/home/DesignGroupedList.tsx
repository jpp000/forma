import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DesignPalette, DesignSystem } from '@/src/design-systems/types';

interface DesignGroupedListProps {
  ds: DesignSystem;
  palette: DesignPalette;
  title?: string;
  children: ReactNode;
}

export function DesignGroupedList({ ds, palette, title, children }: DesignGroupedListProps) {
  return (
    <View style={styles.wrap}>
      {title ? (
        <Text style={[ds.type.caption, styles.title, { color: palette.inkSecondary }]}>{title}</Text>
      ) : null}
      <View style={[styles.group, { backgroundColor: palette.surface, borderRadius: ds.radius.group }]}>
        {children}
      </View>
    </View>
  );
}

export function DesignSeparator({ palette }: { palette: DesignPalette }) {
  return <View style={[styles.sep, { backgroundColor: palette.separator }]} />;
}

export function DesignListRow({
  ds,
  palette,
  title,
  subtitle,
  value,
  dotColor,
}: {
  ds: DesignSystem;
  palette: DesignPalette;
  title: string;
  subtitle?: string;
  value?: string;
  dotColor?: string;
}) {
  return (
    <View style={styles.row}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <View style={styles.textCol}>
        <Text style={[ds.type.body, { color: palette.ink }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[ds.type.caption, { color: palette.inkSecondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[ds.type.caption, { color: palette.inkTertiary, fontVariant: ['tabular-nums'] }]}>
          {value}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: { marginLeft: 16, fontWeight: '500' },
  group: { overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 44 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 52,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  textCol: { flex: 1, gap: 2 },
});
