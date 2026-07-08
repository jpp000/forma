import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useT } from '../../src/i18n';
import { useFormaTheme } from '../../src/theme';

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
};

function TabIcon({ name, color }: TabIconProps) {
  return <Ionicons color={color} name={name} size={24} />;
}

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
        tabBarLabelStyle: {
          fontSize: 10,
        },
        tabBarItemStyle: {
          minHeight: 44,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home" />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: t('tabs.training'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="barbell" />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t('tabs.nutrition'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name="nutrition" />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="trending-up" />
          ),
        }}
      />
    </Tabs>
  );
}
