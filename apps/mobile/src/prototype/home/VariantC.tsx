import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Translation } from '@/src/i18n';
import type { HomeMockData } from '@/src/prototype/home/mockData';
import { radius, spacing } from '@/src/theme/tokens';
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
  const { colors } = theme;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={[styles.date, { color: colors.ink }]}>{data.dateLabel}</Text>
          <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
            {t.home.greeting}, {data.userName}
          </Text>
        </View>
        <View style={[styles.streakPill, { backgroundColor: colors.surface }]}>
          <Text style={[styles.streakText, { color: colors.primary }]}>
            {data.streak} {t.home.streak}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.timelineContent}>
        {data.timeline.map((item, index) => {
          const dotColor = domainColor(item.type, colors);
          const isLast = index === data.timeline.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
              </View>
              <View
                style={[
                  styles.timelineCard,
                  {
                    backgroundColor: colors.surface,
                    opacity: item.done ? 0.65 : 1,
                  },
                ]}
              >
                <View style={styles.timelineCardHeader}>
                  <Text style={[styles.time, { color: colors.inkSecondary }]}>{item.time}</Text>
                  {item.done && (
                    <Text style={[styles.doneBadge, { color: colors.primary }]}>
                      {t.home.completed}
                    </Text>
                  )}
                </View>
                <Text style={[styles.timelineTitle, { color: colors.ink }]}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={[styles.timelineSubtitle, { color: colors.inkSecondary }]}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 72,
          },
        ]}
      >
        <View style={styles.footerStats}>
          <FooterStat label={t.home.training} value="65%" color={colors.training} theme={theme} />
          <FooterStat
            label={t.home.nutrition}
            value={`${data.macros.calories.consumed}`}
            color={colors.nutrition}
            theme={theme}
          />
          <FooterStat
            label={t.home.progress}
            value={`${data.weight.current}`}
            color={colors.progress}
            theme={theme}
          />
        </View>
        <View style={styles.footerActions}>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: colors.training }]}
            accessibilityRole="button"
          >
            <Text style={styles.footerBtnText}>{t.home.startWorkout}</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: colors.nutrition }]}
            accessibilityRole="button"
          >
            <Text style={styles.footerBtnText}>{t.home.logMeal}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FooterStat({
  label,
  value,
  color,
  theme,
}: {
  label: string;
  value: string;
  color: string;
  theme: FormaTheme;
}) {
  return (
    <View style={styles.footerStat}>
      <View style={[styles.footerDot, { backgroundColor: color }]} />
      <Text style={[styles.footerLabel, { color: theme.colors.inkSecondary }]}>{label}</Text>
      <Text style={[styles.footerValue, { color: theme.colors.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  date: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 2 },
  streakPill: { borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  streakText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timelineContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  timelineRow: { flexDirection: 'row', gap: spacing.md },
  timelineRail: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 18 },
  line: { flex: 1, width: 2, marginTop: 4 },
  timelineCard: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  timelineCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  doneBadge: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  timelineTitle: { fontSize: 17, fontWeight: '600' },
  timelineSubtitle: { fontSize: 14, lineHeight: 20 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  footerStats: { flexDirection: 'row', justifyContent: 'space-between' },
  footerStat: { alignItems: 'center', gap: 2, flex: 1 },
  footerDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  footerLabel: { fontSize: 11 },
  footerValue: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  footerActions: { flexDirection: 'row', gap: spacing.md },
  footerBtn: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  footerBtnText: { color: '#1D1D1F', fontSize: 14, fontWeight: '700' },
});
