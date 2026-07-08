import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ActivityRings } from '@/src/components/apple-fitness/ActivityRings';
import { afColors, afSurface, afTypography } from '@/src/design-systems/appleFitness';
import { useTranslation } from '@/src/i18n';
import { useFormaTheme } from '@/src/theme/useFormaTheme';

export default function IndexScreen() {
  const theme = useFormaTheme();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = afSurface(theme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: s.canvas,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={styles.hero}>
        <ActivityRings move={0.78} exercise={1.1} stand={0.65} size={120} lineWidth={12} />
        <Text style={[afTypography.largeTitle, { color: s.ink, marginTop: 28 }]}>Forma</Text>
        <Text style={[afTypography.bodyReg, { color: s.inkSecondary, marginTop: 10, maxWidth: 300 }]}>
          {locale === 'pt-BR'
            ? 'Baseado no Apple Fitness — Summary, anéis e Fitness+.'
            : 'Based on Apple Fitness — Summary, rings and Fitness+.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: pressed ? afColors.primaryPressed : afColors.primary,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          accessibilityRole="button"
          onPress={() => router.push('/prototype/home?variant=A')}
        >
          <Text style={[afTypography.button, { color: afColors.onPrimary }]}>
            {locale === 'pt-BR' ? 'Abrir Summary' : 'Open Summary'}
          </Text>
        </Pressable>

        <Text style={[afTypography.footnote, { color: s.inkTertiary, textAlign: 'center' }]}>
          A · {t.prototype.variantA} · B · {t.prototype.variantB} · C · {t.prototype.variantC}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  footer: { gap: 16 },
  cta: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
});
