import type { MealItemDraft, MealItemInput } from './types';

export type { MealItemDraft };

export type MealValidationErrors = {
  items?: string;
  fields?: Record<number, Partial<Record<keyof MealItemInput, string>>>;
};

export function validateMealItems(
  items: MealItemInput[],
  messages: {
    required: string;
    minItems: string;
    invalidNumber: string;
  },
): MealValidationErrors | null {
  if (items.length === 0) {
    return { items: messages.minItems };
  }

  const fields: Record<
    number,
    Partial<Record<keyof MealItemInput, string>>
  > = {};
  let hasFieldError = false;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const fieldErrors: Partial<Record<keyof MealItemInput, string>> = {};

    if (!item.name.trim()) {
      fieldErrors.name = messages.required;
    }

    for (const key of ['calories', 'protein', 'carbs', 'fat'] as const) {
      const value = item[key];
      if (Number.isNaN(value) || value < 0) {
        fieldErrors[key] = messages.invalidNumber;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      fields[index] = fieldErrors;
      hasFieldError = true;
    }
  }

  if (hasFieldError) {
    return { fields };
  }

  return null;
}

export function parseMacroInput(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') {
    return Number.NaN;
  }
  return Number.parseFloat(trimmed);
}

let mealItemCounter = 0;

export function createEmptyMealItem(): MealItemDraft {
  mealItemCounter += 1;
  return {
    id: `meal-item-${mealItemCounter}`,
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
}
