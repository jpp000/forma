import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../../../i18n';
import { useFormaTheme } from '../../../theme';

type SummaryHeaderProps = {
  date: string;
};

export function SummaryHeader({ date }: SummaryHeaderProps) {
  const { colors, typography } = useFormaTheme();
  const { locale, t } = useLocale();
  const parsed = new Date(`${date}T12:00:00.000Z`);
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  const eyebrow = new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long',
  })
    .format(parsed)
    .toUpperCase();

  const dateLabel = new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'long',
  }).format(parsed);

  return (
    <View style={styles.header}>
      <Text style={[typography.eyebrow, { color: colors.primary }]}>
        {eyebrow}
      </Text>
      <Text
        style={[
          typography.largeTitle,
          { color: colors.labelPrimary, marginTop: 4 },
        ]}
      >
        {dateLabel}
      </Text>
      <Text
        style={[
          typography.title,
          { color: colors.labelSecondary, marginTop: 4 },
        ]}
      >
        {t('home.title')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
});
