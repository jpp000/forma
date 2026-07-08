import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';
import { brand } from '../../../theme/colors';
import { InlineError, PrimaryButton } from '../../../ui';
import type { GuidanceSuggestion } from '../types';

type GuidanceListProps = {
  suggestions: GuidanceSuggestion[];
  error?: string;
  onRetry?: () => void;
};

function dotColor(type: GuidanceSuggestion['type']): string {
  switch (type) {
    case 'training':
      return brand.exercise;
    case 'nutrition':
      return brand.move;
    case 'progress':
      return brand.stand;
    default:
      return brand.primary;
  }
}

export function GuidanceList({
  suggestions,
  error,
  onRetry,
}: GuidanceListProps) {
  const { colors, typography } = useFormaTheme();
  const t = useT();
  const visible = suggestions.slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: colors.grouped }]}>
      <Text style={[typography.title, { color: colors.labelPrimary }]}>
        {t('home.guidance.title')}
      </Text>

      {error ? (
        <View style={styles.state}>
          <InlineError message={error} />
          {onRetry ? (
            <PrimaryButton label={t('common.retry')} onPress={onRetry} />
          ) : null}
        </View>
      ) : visible.length === 0 ? (
        <Text
          style={[
            typography.body,
            styles.empty,
            { color: colors.labelSecondary },
          ]}
        >
          {t('home.guidance.empty')}
        </Text>
      ) : (
        <View style={styles.list}>
          {visible.map((item) => (
            <View key={`${item.type}-${item.priority}`} style={styles.row}>
              <View
                style={[styles.dot, { backgroundColor: dotColor(item.type) }]}
              />
              <Text
                style={[
                  typography.body,
                  styles.message,
                  { color: colors.labelPrimary },
                ]}
              >
                {item.message}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  message: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 12,
  },
  state: {
    gap: 12,
  },
});
