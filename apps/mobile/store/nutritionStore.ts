import { create } from "zustand";
import type { Meal, FoodItem, MealType } from "@/types";
import { generateId, todayISO } from "@/utils";

type NutritionState = {
  meals: Meal[];
  addFoodToMeal: (type: MealType, food: FoodItem, date?: string) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  getMealsForDate: (date: string) => Meal[];
};

const today = todayISO();

const SEED_MEALS: Meal[] = [
  {
    id: "meal-1",
    type: "breakfast",
    date: today,
    items: [
      {
        id: "food-1",
        name: "Ovos Mexidos (3 ovos)",
        macros: { calories: 231, protein: 18, carbs: 2, fat: 17 },
      },
      {
        id: "food-2",
        name: "Pão Integral",
        macros: { calories: 120, protein: 5, carbs: 22, fat: 2 },
      },
      {
        id: "food-3",
        name: "Café com Leite",
        macros: { calories: 45, protein: 3, carbs: 5, fat: 2 },
      },
    ],
  },
  {
    id: "meal-2",
    type: "lunch",
    date: today,
    items: [
      {
        id: "food-4",
        name: "Frango Grelhado (200g)",
        macros: { calories: 330, protein: 62, carbs: 0, fat: 7 },
      },
      {
        id: "food-5",
        name: "Arroz Integral (150g)",
        macros: { calories: 170, protein: 4, carbs: 36, fat: 1 },
      },
      {
        id: "food-6",
        name: "Brócolis (100g)",
        macros: { calories: 34, protein: 3, carbs: 7, fat: 0 },
      },
    ],
  },
  {
    id: "meal-3",
    type: "snack",
    date: today,
    items: [
      {
        id: "food-7",
        name: "Whey Protein",
        macros: { calories: 120, protein: 25, carbs: 3, fat: 1 },
      },
      {
        id: "food-8",
        name: "Banana",
        macros: { calories: 105, protein: 1, carbs: 27, fat: 0 },
      },
    ],
  },
];

export const useNutritionStore = create<NutritionState>((set, get) => ({
  meals: SEED_MEALS,

  addFoodToMeal: (type, food, date) => {
    const targetDate = date || todayISO();
    set((state) => {
      const existing = state.meals.find(
        (m) => m.type === type && m.date === targetDate,
      );
      if (existing) {
        return {
          meals: state.meals.map((m) =>
            m.id === existing.id ? { ...m, items: [...m.items, food] } : m,
          ),
        };
      }
      return {
        meals: [
          ...state.meals,
          { id: generateId(), type, date: targetDate, items: [food] },
        ],
      };
    });
  },

  removeFoodFromMeal: (mealId, foodId) => {
    set((state) => ({
      meals: state.meals.map((m) =>
        m.id === mealId
          ? { ...m, items: m.items.filter((i) => i.id !== foodId) }
          : m,
      ),
    }));
  },

  getMealsForDate: (date) => {
    return get().meals.filter((m) => m.date === date);
  },
}));
