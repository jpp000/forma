import { Tabs } from 'expo-router';
import { useT } from '../../src/i18n';
import { useFormaTheme } from '../../src/theme';

export default function TabsLayout() {
  const { colors } = useFormaTheme();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.labelSecondary,
        tabBarStyle: {
          backgroundColor: colors.grouped,
          borderTopColor: colors.separator,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), headerShown: false }}
      />
      <Tabs.Screen name="training" options={{ title: t('tabs.training') }} />
      <Tabs.Screen name="nutrition" options={{ title: t('tabs.nutrition') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress') }} />
    </Tabs>
  );
}
