import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/src/i18n';
import { spacing } from '@/src/theme/tokens';
import { useFormaTheme } from '@/src/theme/useFormaTheme';

export default function IndexScreen() {
  const theme = useFormaTheme();
  const { t, locale } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.ink }]}>Forma</Text>
      <Text style={[styles.subtitle, { color: theme.colors.inkSecondary }]}>
        {locale === 'pt-BR' ? 'Protótipo de UI — Home' : 'UI prototype — Home'}
      </Text>

      <Link href="/prototype/home?variant=A" asChild>
        <Pressable
          style={[styles.cta, { backgroundColor: theme.colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>
            {locale === 'pt-BR' ? 'Ver variações da Home' : 'View Home variants'}
          </Text>
        </Pressable>
      </Link>

      <Text style={[styles.hint, { color: theme.colors.inkSecondary }]}>
        A — {t.prototype.variantA} · B — {t.prototype.variantB} · C — {t.prototype.variantC}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: { fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 17, textAlign: 'center' },
  cta: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ctaText: { color: '#000000', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
