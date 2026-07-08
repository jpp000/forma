import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { afColors, afSurface, afTypography } from '@/src/design-systems/appleFitness';
import type { FormaTheme } from '@/src/theme/useFormaTheme';

export interface FitnessPlusItem {
  id: string;
  badge: string;
  type: string;
  title: string;
  meta: string;
  gradient: [string, string, ...string[]];
}

interface FitnessPlusShelfProps {
  theme: FormaTheme;
  title: string;
  seeAllLabel: string;
  items: FitnessPlusItem[];
  onSeeAll?: () => void;
}

export function FitnessPlusShelf({
  theme,
  title,
  seeAllLabel,
  items,
  onSeeAll,
}: FitnessPlusShelfProps) {
  const s = afSurface(theme);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[afTypography.section, { color: s.ink }]}>{title}</Text>
        <Pressable onPress={onSeeAll} accessibilityRole="button">
          <Text style={[afTypography.body, { color: afColors.accent }]}>{seeAllLabel}</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={168 + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.row}
      >
        {items.map((item) => (
          <FitnessPlusCard key={item.id} item={item} theme={theme} />
        ))}
      </ScrollView>
    </View>
  );
}

function FitnessPlusCard({ item, theme }: { item: FitnessPlusItem; theme: FormaTheme }) {
  const s = afSurface(theme);
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [{ width: 168, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      <View style={styles.thumb}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <BlurView intensity={28} tint="dark" style={styles.badge}>
          <Text style={[afTypography.badge, styles.badgeText]}>{item.badge}</Text>
        </BlurView>
        <BlurView intensity={36} tint="light" style={styles.play}>
          <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </BlurView>
      </View>
      <Text style={[afTypography.eyebrow, { color: afColors.moveLabel, marginTop: 10 }]}>
        {item.type}
      </Text>
      <Text style={[afTypography.cardTitle, { color: s.ink, marginTop: 3 }]}>{item.title}</Text>
      <Text style={[afTypography.footnote, { color: s.inkSecondary, marginTop: 2 }]}>{item.meta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
  },
  row: { paddingHorizontal: 16, gap: 12 },
  thumb: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeText: { paddingHorizontal: 8, paddingVertical: 4 },
  play: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
