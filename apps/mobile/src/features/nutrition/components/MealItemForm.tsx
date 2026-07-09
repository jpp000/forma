import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';
import { TextField } from '../../../ui';
import type { MealItemDraft, MealItemInput } from '../types';

type MealItemFormProps = {
  index: number;
  item: MealItemDraft;
  errors?: Partial<Record<keyof MealItemInput, string>>;
  onChange: (item: MealItemDraft) => void;
};

export function MealItemForm({
  index,
  item,
  errors,
  onChange,
}: MealItemFormProps) {
  const t = useT();
  const { colors, typography } = useFormaTheme();

  const updateField = <K extends keyof MealItemInput>(key: K, raw: string) => {
    if (key === 'name') {
      onChange({ ...item, name: raw });
      return;
    }
    const parsed = raw.trim() === '' ? Number.NaN : Number.parseFloat(raw);
    onChange({ ...item, [key]: parsed });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.grouped }]}>
      <Text style={[typography.title, { color: colors.move }]}>
        {t('nutrition.meal.item', { index: index + 1 })}
      </Text>
      <TextField
        label={t('nutrition.fields.name')}
        value={item.name}
        onChangeText={(value) => updateField('name', value)}
        error={errors?.name}
      />
      <TextField
        label={t('nutrition.fields.calories')}
        value={Number.isNaN(item.calories) ? '' : String(item.calories)}
        onChangeText={(value) => updateField('calories', value)}
        keyboardType="numeric"
        error={errors?.calories}
      />
      <TextField
        label={t('nutrition.fields.protein')}
        value={Number.isNaN(item.protein) ? '' : String(item.protein)}
        onChangeText={(value) => updateField('protein', value)}
        keyboardType="numeric"
        error={errors?.protein}
      />
      <TextField
        label={t('nutrition.fields.carbs')}
        value={Number.isNaN(item.carbs) ? '' : String(item.carbs)}
        onChangeText={(value) => updateField('carbs', value)}
        keyboardType="numeric"
        error={errors?.carbs}
      />
      <TextField
        label={t('nutrition.fields.fat')}
        value={Number.isNaN(item.fat) ? '' : String(item.fat)}
        onChangeText={(value) => updateField('fat', value)}
        keyboardType="numeric"
        error={errors?.fat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
});
