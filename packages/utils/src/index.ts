import dayjs from "dayjs";
import type { FoodItem, MacroSummary, Meal } from "@forma/types";

export function calculateMealMacros(items: FoodItem[]): MacroSummary {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.macros.calories,
      protein: acc.protein + item.macros.protein,
      carbs: acc.carbs + item.macros.carbs,
      fat: acc.fat + item.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function calculateDailyMacros(meals: Meal[]): MacroSummary {
  const allItems = meals.flatMap((m) => m.items);
  return calculateMealMacros(allItems);
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString();
}

export function formatMacroGrams(grams: number): string {
  return `${Math.round(grams)}g`;
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((value / total) * 100, 100);
}

export function getWeekDays(centerDate?: string) {
  const center = centerDate ? dayjs(centerDate) : dayjs();
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = center.add(i, "day");
    days.push({
      date: d.format("YYYY-MM-DD"),
      dayName: d.format("ddd"),
      dayNumber: d.format("D"),
      isToday: d.isSame(dayjs(), "day"),
    });
  }
  return days;
}

export function formatDate(date: string, format = "dddd, D MMM"): string {
  return dayjs(date).format(format);
}

export function todayISO(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
