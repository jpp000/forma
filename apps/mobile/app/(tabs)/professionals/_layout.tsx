import { Stack } from 'expo-router';
import { useT } from '../../../src/i18n';
import { useFormaTheme } from '../../../src/theme';

export default function ProfessionalsLayout() {
  const { colors } = useFormaTheme();
  const t = useT();

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
      <Stack.Screen
        name="[idOrSlug]"
        options={{ title: t('professionals.detailTitle') }}
      />
    </Stack>
  );
}
