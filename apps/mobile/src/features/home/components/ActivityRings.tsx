import { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { ringConfig } from '../../../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProps = {
  progress: number;
  color: string;
  track: string;
  radius: number;
  center: number;
  strokeWidth: number;
  delay: number;
  reducedMotion: boolean;
};

function Ring({
  progress,
  color,
  track,
  radius,
  center,
  strokeWidth,
  delay,
  reducedMotion,
}: RingProps) {
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.min(progress, 1);
    if (reducedMotion) {
      animatedProgress.value = clamped;
      return;
    }
    animatedProgress.value = withDelay(
      delay,
      withTiming(clamped, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      }),
    );
  }, [animatedProgress, delay, progress, reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={track}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        animatedProps={animatedProps}
        cx={center}
        cy={center}
        fill="none"
        r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </>
  );
}

type ActivityRingsProps = {
  move: number;
  exercise: number;
  stand: number;
  size?: number;
  lineWidth?: number;
  reducedMotion?: boolean;
};

export function ActivityRings({
  move,
  exercise,
  stand,
  size = 130,
  lineWidth = 14,
  reducedMotion = false,
}: ActivityRingsProps) {
  const center = size / 2;
  const radii = [
    center - lineWidth / 2 - 2,
    center - lineWidth * 1.5 - 5,
    center - lineWidth * 2.5 - 8,
  ];
  const values = [move, exercise, stand];

  return (
    <Svg height={size} width={size}>
      {ringConfig.map((config, index) => (
        <Ring
          key={config.key}
          center={center}
          color={config.color}
          delay={index * 80}
          progress={values[index]}
          radius={radii[index]}
          reducedMotion={reducedMotion}
          strokeWidth={lineWidth}
          track={config.track}
        />
      ))}
    </Svg>
  );
}
