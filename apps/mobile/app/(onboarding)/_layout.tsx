import { Stack } from 'expo-router';
import { useFormaTheme } from '../../src/theme';

export default function OnboardingLayout() {
  const { colors } = useFormaTheme();

  return (
    <Stack
      initialRouteName="profile"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="goal" />
    </Stack>
  );
}
