import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useT } from '../i18n';
import { useFormaTheme } from '../theme';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  const { colors, typography } = useFormaTheme();
  const t = useT();

  return (
    <View style={styles.wrap} accessibilityRole="progressbar">
      <ActivityIndicator color={colors.primary} />
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {message ?? t('common.loading')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
});
