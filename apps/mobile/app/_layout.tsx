import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { I18nProvider } from '../src/i18n';
import { SessionProvider, useSession } from '../src/session';
import { ThemeProvider, useFormaTheme } from '../src/theme';
import { LoadingState } from '../src/ui';

function RootNavigator() {
  const { scheme, colors } = useFormaTheme();
  const { isLoading, token, isStudent } = useSession();
  const isAuthenticated = Boolean(token);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.canvas }]}>
        <LoadingState />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && !isStudent}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && isStudent}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
