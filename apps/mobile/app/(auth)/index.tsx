import { StyleSheet, Text } from 'react-native';
import { useT } from '../../src/i18n';
import { useFormaTheme } from '../../src/theme';
import { Screen } from '../../src/ui';

export default function AuthIndexScreen() {
  const { colors, typography } = useFormaTheme();
  const t = useT();

  return (
    <Screen style={styles.content}>
      <Text style={[typography.title, { color: colors.labelPrimary }]}>
        {t('auth.welcome')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
});
