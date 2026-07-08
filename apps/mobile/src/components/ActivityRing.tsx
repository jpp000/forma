import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { type } from '@/src/theme/typography';

interface ActivityRingProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor: string;
  label: string;
  detail: string;
  ink: string;
  inkSecondary: string;
  compact?: boolean;
}

export function ActivityRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  label,
  detail,
  ink,
  inkSecondary,
  compact = false,
}: ActivityRingProps) {
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const clamped = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View style={[styles.ringWrap, { width: size }]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radiusPx}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radiusPx}
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
      {!compact ? (
        <>
          <Text style={[type.caption, styles.label, { color: inkSecondary }]}>
            {label}
          </Text>
          <Text style={[type.subhead, styles.detail, { color: ink }]}>{detail}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    marginTop: 10,
    fontWeight: '500',
  },
  detail: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
