import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appleFitnessSystem } from '@/src/design-systems/appleFitness';
import { useTranslation } from '@/src/i18n';
import { useFormaTheme } from '@/src/theme/useFormaTheme';

export default function IndexScreen() {
  const theme = useFormaTheme();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = appleFitnessSystem.palette(theme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: p.bg,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      <View style={styles.brand}>
        <Text style={[appleFitnessSystem.type.hero, { color: p.ink }]}>Forma</Text>
        <Text style={[appleFitnessSystem.type.body, { color: p.inkSecondary, marginTop: 12, maxWidth: 300 }]}>
          {locale === 'pt-BR'
            ? 'Explore três direções visuais para a Home.'
            : 'Explore three visual directions for Home.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            appleFitnessSystem.buttonPrimary(p),
            { opacity: pressed ? 0.9 : 1 },
          ]}
          accessibilityRole="button"
          onPress={() => router.push('/prototype/home?variant=A')}
        >
          <Text style={appleFitnessSystem.buttonPrimaryText(p)}>
            {locale === 'pt-BR' ? 'Explorar variações' : 'Explore variants'}
          </Text>
        </Pressable>

        <Text style={[appleFitnessSystem.type.caption, { color: p.inkTertiary, textAlign: 'center' }]}>
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
  brand: { flex: 1, justifyContent: 'center' },
  footer: { gap: 16 },
});
