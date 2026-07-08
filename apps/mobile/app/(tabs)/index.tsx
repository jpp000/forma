import { StyleSheet, Text } from 'react-native';
import { useT } from '../../src/i18n';
import { useFormaTheme } from '../../src/theme';
import { Screen } from '../../src/ui';

export default function HomeTabScreen() {
  const { colors, typography } = useFormaTheme();
  const t = useT();

  return (
    <Screen style={styles.content}>
      <Text style={[typography.title, { color: colors.labelPrimary }]}>
        {t('tabs.home')}
      </Text>
      <Text style={[typography.body, { color: colors.labelSecondary }]}>
        {t('tabs.homePlaceholder')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: 8,
  },
});
