import { Stack } from 'expo-router';
import { useFormaTheme } from '../../src/theme';

export default function AuthLayout() {
  const { colors } = useFormaTheme();

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
