import type { Exercise } from "@/types";

export const EXERCISES: Exercise[] = [
  // Chest
  { id: "ex01", name: "Bench Press", muscleGroup: "chest" },
  { id: "ex02", name: "Incline Dumbbell Press", muscleGroup: "chest" },
  { id: "ex03", name: "Cable Fly", muscleGroup: "chest" },
  { id: "ex04", name: "Push-Up", muscleGroup: "chest" },

  // Back
  { id: "ex05", name: "Deadlift", muscleGroup: "back" },
  { id: "ex06", name: "Pull-Up", muscleGroup: "back" },
  { id: "ex07", name: "Barbell Row", muscleGroup: "back" },
  { id: "ex08", name: "Lat Pulldown", muscleGroup: "back" },
  { id: "ex09", name: "Seated Cable Row", muscleGroup: "back" },

  // Shoulders
  { id: "ex10", name: "Overhead Press", muscleGroup: "shoulders" },
  { id: "ex11", name: "Lateral Raise", muscleGroup: "shoulders" },
  { id: "ex12", name: "Face Pull", muscleGroup: "shoulders" },
  { id: "ex13", name: "Arnold Press", muscleGroup: "shoulders" },

  // Biceps
  { id: "ex14", name: "Barbell Curl", muscleGroup: "biceps" },
  { id: "ex15", name: "Hammer Curl", muscleGroup: "biceps" },
  { id: "ex16", name: "Incline Dumbbell Curl", muscleGroup: "biceps" },

  // Triceps
  { id: "ex17", name: "Tricep Pushdown", muscleGroup: "triceps" },
  { id: "ex18", name: "Skull Crusher", muscleGroup: "triceps" },
  { id: "ex19", name: "Overhead Tricep Extension", muscleGroup: "triceps" },

  // Legs
  { id: "ex20", name: "Squat", muscleGroup: "legs" },
  { id: "ex21", name: "Leg Press", muscleGroup: "legs" },
  { id: "ex22", name: "Romanian Deadlift", muscleGroup: "legs" },
  { id: "ex23", name: "Leg Extension", muscleGroup: "legs" },
  { id: "ex24", name: "Leg Curl", muscleGroup: "legs" },
  { id: "ex25", name: "Calf Raise", muscleGroup: "legs" },

  // Glutes
  { id: "ex26", name: "Hip Thrust", muscleGroup: "glutes" },
  { id: "ex27", name: "Bulgarian Split Squat", muscleGroup: "glutes" },

  // Core
  { id: "ex28", name: "Plank", muscleGroup: "core" },
  { id: "ex29", name: "Cable Crunch", muscleGroup: "core" },
  { id: "ex30", name: "Hanging Leg Raise", muscleGroup: "core" },

  // Cardio
  { id: "ex31", name: "Running", muscleGroup: "cardio" },
  { id: "ex32", name: "Cycling", muscleGroup: "cardio" },
];

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Legs",
  glutes: "Glutes",
  core: "Core",
  cardio: "Cardio",
  full_body: "Full Body",
};
