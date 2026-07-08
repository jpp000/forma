import { Stack } from 'expo-router';
import { useFormaTheme } from '../../src/theme';

export default function AuthLayout() {
  const { colors } = useFormaTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    />
  );
}
