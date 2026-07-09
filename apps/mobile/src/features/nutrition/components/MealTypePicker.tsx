import { MealType } from '@forma/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type TranslationKey, useT } from '../../../i18n';
import { useFormaTheme } from '../../../theme';

const MEAL_TYPES = [
  MealType.Breakfast,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Snack,
] as const;

const MEAL_TYPE_KEYS: Record<MealType, TranslationKey> = {
  [MealType.Breakfast]: 'nutrition.meal.type.breakfast',
  [MealType.Lunch]: 'nutrition.meal.type.lunch',
  [MealType.Dinner]: 'nutrition.meal.type.dinner',
  [MealType.Snack]: 'nutrition.meal.type.snack',
};

type MealTypePickerProps = {
  value: MealType;
  onChange: (value: MealType) => void;
};

export function MealTypePicker({ value, onChange }: MealTypePickerProps) {
  const t = useT();
  const { colors, typography } = useFormaTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.footnote, { color: colors.labelSecondary }]}>
        {t('nutrition.meal.typeLabel')}
      </Text>
      <View style={styles.row}>
        {MEAL_TYPES.map((mealType) => {
          const selected = value === mealType;
          return (
            <Pressable
              key={mealType}
              onPress={() => onChange(mealType)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? colors.primarySoft
                    : colors.grouped,
                  borderColor: selected ? colors.primary : colors.separator,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  typography.footnote,
                  {
                    color: selected ? colors.primary : colors.labelSecondary,
                  },
                ]}
              >
                {t(MEAL_TYPE_KEYS[mealType])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
});
