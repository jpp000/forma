import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface ActivityRingProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor: string;
  label: string;
  detail: string;
  theme: FormaTheme;
}

export function ActivityRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  label,
  detail,
  theme,
}: ActivityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View style={[styles.ringWrap, { width: size }]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>
      <Text style={[styles.label, { color: theme.colors.inkSecondary }]}>{label}</Text>
      <Text style={[styles.detail, { color: theme.colors.ink }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  detail: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
