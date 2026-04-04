import { useMemo } from "react";
import { useNutritionStore } from "@/store/nutritionStore";
import { useUserStore } from "@/store/userStore";
import { calculateDailyMacros, todayISO } from "@/utils";
import type { MacroSummary } from "@/types";

export function useDailyMacros(date?: string) {
  const targetDate = date || todayISO();
  const meals = useNutritionStore((s) => s.meals);
  const goals = useUserStore((s) => s.profile.goals);

  return useMemo(() => {
    const dayMeals = meals.filter((m) => m.date === targetDate);
    const consumed = calculateDailyMacros(dayMeals);

    const goalMacros: MacroSummary = {
      calories: goals.dailyCalories,
      protein: Math.round((goals.dailyCalories * goals.proteinPercent) / 100 / 4),
      carbs: Math.round((goals.dailyCalories * goals.carbsPercent) / 100 / 4),
      fat: Math.round((goals.dailyCalories * goals.fatPercent) / 100 / 9),
    };

    return { consumed, goalMacros, meals: dayMeals };
  }, [meals, goals, targetDate]);
}
