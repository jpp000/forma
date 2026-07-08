import { Stack } from 'expo-router';
import { useFormaTheme } from '../../../src/theme';

export default function TrainingLayout() {
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
      <Stack.Screen name="exercises/index" />
      <Stack.Screen name="exercises/new" />
      <Stack.Screen name="plans/index" />
      <Stack.Screen name="plans/new" />
      <Stack.Screen name="session/new" />
    </Stack>
  );
}
