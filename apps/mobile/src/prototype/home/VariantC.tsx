import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRing } from '@/src/components/ActivityRing';
import { FormaButton } from '@/src/components/ui/FormaButton';
import { GroupedSection, GroupedSeparator } from '@/src/components/ui/GroupedSection';
import { ListRow } from '@/src/components/ui/ListRow';
import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import { ringTrack } from '@/src/theme/color';
import { spacing } from '@/src/theme/tokens';
import { type } from '@/src/theme/typography';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

interface VariantProps {
  data: HomeMockData;
  theme: FormaTheme;
  t: Translation;
}

function domainColor(type: string, colors: FormaTheme['colors']) {
  switch (type) {
    case 'training':
      return colors.training;
    case 'nutrition':
      return colors.nutrition;
    case 'progress':
      return colors.progress;
    default:
      return colors.primary;
  }
}

export function VariantC({ data, theme, t }: VariantProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={[type.largeTitle, { color: colors.ink }]}>{data.dateLabel}</Text>
        <Text style={[type.subhead, { color: colors.inkSecondary }]}>
          {data.streak} {t.home.streak}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.miniRings}>
          <ActivityRing
            size={72}
            strokeWidth={8}
            progress={data.rings.training.value}
            color={colors.training}
            trackColor={ringTrack(colors.training, isDark)}
            label=""
            detail=""
            theme={theme}
            compact
          />
          <ActivityRing
            size={72}
            strokeWidth={8}
            progress={data.rings.nutrition.value}
            color={colors.nutrition}
            trackColor={ringTrack(colors.nutrition, isDark)}
            label=""
            detail=""
            theme={theme}
            compact
          />
          <ActivityRing
            size={72}
            strokeWidth={8}
            progress={data.rings.progress.value}
            color={colors.progress}
            trackColor={ringTrack(colors.progress, isDark)}
            label=""
            detail=""
            theme={theme}
            compact
          />
        </View>

        <GroupedSection title={t.home.today} theme={theme}>
          {data.timeline.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <GroupedSeparator theme={theme} /> : null}
              <ListRow
                theme={theme}
                title={item.title}
                subtitle={item.subtitle}
                value={item.time}
                accentColor={domainColor(item.type, colors)}
                showChevron={!item.done}
              />
            </View>
          ))}
        </GroupedSection>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.bg,
            borderTopColor: colors.separator,
            paddingBottom: insets.bottom + 72,
          },
        ]}
      >
        <FormaButton theme={theme} label={t.home.startWorkout} variant="primary" />
        <FormaButton theme={theme} label={t.home.logMeal} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xxl,
  },
  miniRings: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
