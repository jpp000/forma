import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/src/i18n';
import { spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import { useFormaTheme } from '@/src/theme/useFormaTheme';

export default function IndexScreen() {
  const theme = useFormaTheme();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bg,
          paddingTop: insets.top + spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: theme.colors.primary }]} />
        <Text style={[type.largeTitle, styles.wordmark, { color: theme.colors.ink }]}>Forma</Text>
        <Text style={[type.body, styles.tagline, { color: theme.colors.inkSecondary }]}>
          {locale === 'pt-BR'
            ? 'Treino, nutrição e progresso em um só lugar.'
            : 'Training, nutrition and progress in one place.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          onPress={() => router.push('/prototype/home?variant=A')}
        >
          <Text style={styles.ctaText}>
            {locale === 'pt-BR' ? 'Explorar Home' : 'Explore Home'}
          </Text>
        </Pressable>

        <Text style={[type.caption, styles.hint, { color: theme.colors.inkTertiary }]}>
          A · {t.prototype.variantA}  ·  B · {t.prototype.variantB}  ·  C · {t.prototype.variantC}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  brand: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  mark: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  wordmark: {
    letterSpacing: -0.5,
  },
  tagline: {
    maxWidth: 280,
    lineHeight: 24,
  },
  footer: {
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  cta: {
    borderRadius: 999,
    paddingVertical: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  hint: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
