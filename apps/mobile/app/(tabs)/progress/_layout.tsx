import { Stack } from 'expo-router';
import { useFormaTheme } from '../../../src/theme';

export default function ProgressLayout() {
  const { colors } = useFormaTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.labelPrimary,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="weight/new" />
    </Stack>
  );
}
