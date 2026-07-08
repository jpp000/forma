import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../src/i18n';
import { useSession } from '../../src/session';
import { useFormaTheme } from '../../src/theme';
import { LoadingState, Screen } from '../../src/ui';

export default function HomeTabScreen() {
  const { colors, typography } = useFormaTheme();
  const t = useT();
  const { signOut } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Screen style={styles.content}>
      <View style={styles.main}>
        <Text style={[typography.title, { color: colors.labelPrimary }]}>
          {t('tabs.home')}
        </Text>
        <Text style={[typography.body, { color: colors.labelSecondary }]}>
          {t('tabs.homePlaceholder')}
        </Text>
      </View>

      {isLoggingOut ? <LoadingState /> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isLoggingOut}
        onPress={() => void handleLogout()}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            borderColor: colors.separator,
            opacity: isLoggingOut ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[typography.button, { color: colors.labelPrimary }]}>
          {t('common.logout')}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  main: {
    gap: 8,
  },
  logoutButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
