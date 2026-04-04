export type MacroSummary = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type FoodItem = {
  id: string;
  name: string;
  macros: MacroSummary;
  servingSize?: string;
  imageUri?: string;
  aiAnalyzed?: boolean;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  type: MealType;
  items: FoodItem[];
  date: string;
};

export type DailyLog = {
  date: string;
  meals: Meal[];
  totalMacros: MacroSummary;
  goalMacros: MacroSummary;
  waterMl?: number;
};

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core"
  | "glutes"
  | "cardio"
  | "full_body";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  icon?: string;
};

export type WorkoutSet = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  restSeconds?: number;
};

export type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
  durationMinutes?: number;
  completed: boolean;
  notes?: string;
};

export type UserGoals = {
  dailyCalories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
};

export type UserProfile = {
  id: string;
  name: string;
  avatarUri?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  goals: UserGoals;
};

export type ProgressEntry = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  workoutVolume?: number;
  bodyWeightKg?: number;
};

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
};
