import { StyleSheet, Text, View } from 'react-native';
import { useFormaTheme } from '../../../theme';
import type { StreakPair } from '../../home/types';

type StreakPairCardProps = {
  title: string;
  streak: StreakPair | null;
  currentLabel: (count: number) => string;
  longestLabel: (count: number) => string;
  zeroHint: string;
};

export function StreakPairCard({
  title,
  streak,
  currentLabel,
  longestLabel,
  zeroHint,
}: StreakPairCardProps) {
  const { colors, typography } = useFormaTheme();
  const current = streak?.current ?? 0;
  const longest = streak?.longest ?? 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.grouped }]}>
      <Text style={[typography.title, { color: colors.labelPrimary }]}>
        {title}
      </Text>
      <Text
        style={[
          typography.title,
          styles.metric,
          { color: colors.labelPrimary },
        ]}
      >
        {currentLabel(current)}
      </Text>
      <Text
        style={[
          typography.body,
          styles.metric,
          { color: colors.labelSecondary },
        ]}
      >
        {longestLabel(longest)}
      </Text>
      {current === 0 ? (
        <Text style={[typography.footnote, { color: colors.labelTertiary }]}>
          {zeroHint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    gap: 6,
    minWidth: 0,
  },
  metric: {
    fontVariant: ['tabular-nums'],
  },
});
