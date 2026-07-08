/**
 * PROTOTYPE — Home layout variants (throwaway)
 * Question: qual estrutura de Home combina com Forma × Apple Fitness?
 * Variants: A Anéis | B Coach | C Timeline — switch via ?variant=A|B|C
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { useTranslation } from '@/src/i18n';
import { PrototypeSwitcher, type PrototypeVariant } from '@/src/prototype/PrototypeSwitcher';
import { getHomeMockData } from '@/src/prototype/home/mockData';
import { VariantA } from '@/src/prototype/home/VariantA';
import { VariantB } from '@/src/prototype/home/VariantB';
import { VariantC } from '@/src/prototype/home/VariantC';
import { useFormaTheme } from '@/src/theme/useFormaTheme';

function parseVariant(raw: string | string[] | undefined): PrototypeVariant {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

export default function HomePrototypeScreen() {
  const theme = useFormaTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { variant: variantParam } = useLocalSearchParams<{ variant?: string }>();
  const variant = parseVariant(variantParam);
  const data = getHomeMockData(t);

  const labels = {
    A: t.prototype.variantA,
    B: t.prototype.variantB,
    C: t.prototype.variantC,
  };

  const onChange = (next: PrototypeVariant) => {
    router.setParams({ variant: next });
  };

  const props = { data, theme, t };

  return (
    <View style={{ flex: 1 }}>
      {variant === 'A' && <VariantA {...props} />}
      {variant === 'B' && <VariantB {...props} />}
      {variant === 'C' && <VariantC {...props} />}
      <PrototypeSwitcher current={variant} labels={labels} onChange={onChange} />
    </View>
  );
}
