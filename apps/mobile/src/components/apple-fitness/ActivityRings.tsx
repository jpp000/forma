import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G } from 'react-native-svg';

import { ringConfig } from '@/src/design-systems/appleFitness';

const ACircle = Animated.createAnimatedComponent(Circle);

interface RingProps {
  progress: number;
  color: string;
  track: string;
  r: number;
  cx: number;
  cy: number;
  sw: number;
  delay: number;
  reduceMotion?: boolean;
}

function Ring({ progress, color, track, r, cx, cy, sw, delay, reduceMotion }: RingProps) {
  const C = 2 * Math.PI * r;
  const p = useSharedValue(reduceMotion ? Math.min(progress, 1.5) : 0);

  useEffect(() => {
    const target = Math.min(progress, 1.5);
    if (reduceMotion) {
      p.value = withTiming(target, { duration: 250 });
      return;
    }
    p.value = withDelay(
      delay,
      withTiming(target, { duration: 1000, easing: Easing.out(Easing.ease) }),
    );
  }, [delay, p, progress, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - Math.min(p.value, 1)),
  }));

  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} stroke={track} strokeWidth={sw} fill="none" />
      {/* Soft glow behind the lit arc */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={sw + 4}
        fill="none"
        strokeOpacity={0.18}
        strokeLinecap="round"
        strokeDasharray={`${C}`}
        strokeDashoffset={C * (1 - Math.min(progress, 1))}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <ACircle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={sw}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${C}`}
        animatedProps={animatedProps}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </G>
  );
}

export interface ActivityRingsProps {
  move: number;
  exercise: number;
  stand: number;
  size?: number;
  lineWidth?: number;
  reduceMotion?: boolean;
}

/** Three concentric Activity rings — Move outer, Exercise middle, Stand inner. */
export function ActivityRings({
  move,
  exercise,
  stand,
  size = 130,
  lineWidth = 14,
  reduceMotion = false,
}: ActivityRingsProps) {
  const c = size / 2;
  const radii = [c - lineWidth / 2 - 2, c - lineWidth * 1.5 - 5, c - lineWidth * 2.5 - 8];
  const vals = [move, exercise, stand];

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs />
        {ringConfig.map((rc, i) => (
          <Ring
            key={rc.key}
            progress={vals[i]}
            color={rc.color}
            track={rc.track}
            r={radii[i]}
            cx={c}
            cy={c}
            sw={lineWidth}
            delay={i * 80}
            reduceMotion={reduceMotion}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
