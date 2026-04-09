import { useMemo } from "react";
import dayjs from "dayjs";
import { useNutritionStore } from "@/store/nutritionStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { calculateDailyMacros } from "@/utils";
import type { ProgressEntry, PersonalRecord } from "@/types";

export type TimeRange = "7d" | "30d" | "3m";

export function useProgress(range: TimeRange = "7d") {
  const meals = useNutritionStore((s) => s.meals);
  const workouts = useWorkoutStore((s) => s.logs);

  return useMemo(() => {
    const daysCount = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const entries: ProgressEntry[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      const dayMeals = meals.filter((m) => m.date === date);
      const macros = calculateDailyMacros(dayMeals);

      const dayWorkouts = workouts.filter((w) => w.date === date);
      const volume = dayWorkouts.reduce(
        (acc, w) =>
          acc +
          w.exercises.reduce(
            (ea, e) =>
              ea +
              e.sets
                .filter((s) => s.completed)
                .reduce((sa, s) => sa + s.reps * s.weight, 0),
            0,
          ),
        0,
      );

      entries.push({
        date,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        workoutVolume: volume,
        bodyWeightKg: 79 - i * 0.05 + Math.random() * 0.5,
      });
    }

    const prs: PersonalRecord[] = [];
    const prMap = new Map<string, PersonalRecord>();
    for (const w of workouts) {
      for (const e of w.exercises) {
        for (const s of e.sets.filter((s) => s.completed)) {
          const key = e.exercise.id;
          const existing = prMap.get(key);
          if (!existing || s.weight > existing.weight) {
            prMap.set(key, {
              exerciseId: e.exercise.id,
              exerciseName: e.exercise.name,
              weight: s.weight,
              reps: s.reps,
              date: w.date,
            });
          }
        }
      }
    }
    prs.push(...Array.from(prMap.values()));

    const streak = entries.filter(
      (e) => e.calories > 0 || (e.workoutVolume ?? 0) > 0,
    ).length;

    return { entries, prs, streak };
  }, [meals, workouts, range]);
}
