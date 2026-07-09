import {
  createEmptyMealItem,
  parseMacroInput,
  validateMealItems,
} from '../mealValidation';

const messages = {
  required: 'required',
  minItems: 'minItems',
  invalidNumber: 'invalidNumber',
};

describe('validateMealItems', () => {
  it('requires at least one item', () => {
    expect(validateMealItems([], messages)).toEqual({
      items: 'minItems',
    });
  });

  it('requires food name', () => {
    const errors = validateMealItems(
      [{ ...createEmptyMealItem(), name: '   ' }],
      messages,
    );
    expect(errors?.fields?.[0]?.name).toBe('required');
  });

  it('rejects negative macro values', () => {
    const errors = validateMealItems(
      [{ name: 'Oats', calories: -1, protein: 0, carbs: 0, fat: 0 }],
      messages,
    );
    expect(errors?.fields?.[0]?.calories).toBe('invalidNumber');
  });

  it('passes valid items', () => {
    expect(
      validateMealItems(
        [{ name: 'Oats', calories: 300, protein: 10, carbs: 50, fat: 6 }],
        messages,
      ),
    ).toBeNull();
  });
});

describe('parseMacroInput', () => {
  it('returns NaN for empty strings', () => {
    expect(Number.isNaN(parseMacroInput(''))).toBe(true);
  });

  it('parses numeric strings', () => {
    expect(parseMacroInput('12.5')).toBe(12.5);
  });
});
