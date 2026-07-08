import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PrototypeVariant = 'A' | 'B' | 'C';

const VARIANTS: PrototypeVariant[] = ['A', 'B', 'C'];

interface PrototypeSwitcherProps {
  current: PrototypeVariant;
  labels: Record<PrototypeVariant, string>;
  onChange: (variant: PrototypeVariant) => void;
}

export function PrototypeSwitcher({ current, labels, onChange }: PrototypeSwitcherProps) {
  const insets = useSafeAreaInsets();
  const index = VARIANTS.indexOf(current);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        const prev = VARIANTS[(index - 1 + VARIANTS.length) % VARIANTS.length];
        onChange(prev);
      }
      if (event.key === 'ArrowRight') {
        const next = VARIANTS[(index + 1) % VARIANTS.length];
        onChange(next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, onChange]);

  if (!__DEV__) return null;

  const goPrev = () => onChange(VARIANTS[(index - 1 + VARIANTS.length) % VARIANTS.length]);
  const goNext = () => onChange(VARIANTS[(index + 1) % VARIANTS.length]);

  return (
    <View
      style={[styles.bar, { bottom: insets.bottom + 12 }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        <Pressable onPress={goPrev} style={styles.arrow} accessibilityLabel="Previous variant">
          <Text style={styles.arrowText}>←</Text>
        </Pressable>
        <Text style={styles.label}>
          {current} — {labels[current]}
        </Text>
        <Pressable onPress={goNext} style={styles.arrow} accessibilityLabel="Next variant">
          <Text style={styles.arrowText}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28,28,30,0.92)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { color: '#F5F5F7', fontSize: 18, fontWeight: '600' },
  label: { color: '#F5F5F7', fontSize: 13, fontWeight: '600', minWidth: 160, textAlign: 'center' },
});
