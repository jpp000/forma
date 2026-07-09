import { MealType } from '@forma/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useT } from '../../i18n';
import { useFormaTheme } from '../../theme';
import { InlineError, PrimaryButton, Screen } from '../../ui';
import { MealItemForm } from './components/MealItemForm';
import { MealTypePicker } from './components/MealTypePicker';
import {
  createEmptyMealItem,
  type MealItemDraft,
  type MealValidationErrors,
  validateMealItems,
} from './mealValidation';
import { useNutritionStore } from './nutritionStore';

export function LogMealScreen() {
  const router = useRouter();
  const t = useT();
  const { colors, typography } = useFormaTheme();
  const { logMeal, submitLoading, submitError } = useNutritionStore();

  const [mealType, setMealType] = useState<MealType>(MealType.Breakfast);
  const [items, setItems] = useState<MealItemDraft[]>([createEmptyMealItem()]);
  const [validationErrors, setValidationErrors] =
    useState<MealValidationErrors | null>(null);

  const onSubmit = async () => {
    const errors = validateMealItems(
      items.map(({ id: _id, ...item }) => item),
      {
        required: t('nutrition.validation.required'),
        minItems: t('nutrition.validation.minItems'),
        invalidNumber: t('nutrition.validation.invalidNumber'),
      },
    );
    if (errors) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors(null);
    try {
      await logMeal({
        mealType,
        items: items.map(({ id: _id, ...item }) => item),
      });
      router.back();
    } catch {
      // submitError shown below
    }
  };

  return (
    <Screen scroll style={styles.content}>
      <Text style={[typography.largeTitle, { color: colors.labelPrimary }]}>
        {t('nutrition.meal.title')}
      </Text>

      <MealTypePicker value={mealType} onChange={setMealType} />

      {items.map((item, index) => (
        <MealItemForm
          key={item.id}
          index={index}
          item={item}
          errors={validationErrors?.fields?.[index]}
          onChange={(next) => {
            setItems((current) =>
              current.map((row, rowIndex) => (rowIndex === index ? next : row)),
            );
          }}
        />
      ))}

      {validationErrors?.items ? (
        <InlineError message={validationErrors.items} />
      ) : null}

      <Pressable
        onPress={() =>
          setItems((current) => [...current, createEmptyMealItem()])
        }
        style={styles.addItem}
        accessibilityRole="button"
      >
        <Text style={[typography.body, { color: colors.primary }]}>
          {t('nutrition.meal.addItem')}
        </Text>
      </Pressable>

      {submitError ? <InlineError message={submitError} /> : null}

      <PrimaryButton
        label={t('nutrition.meal.save')}
        loading={submitLoading}
        disabled={submitLoading}
        onPress={onSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  addItem: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
