import { create } from "zustand";
import type { Workout, WorkoutExercise, WorkoutSet, Exercise } from "@/types";
import { generateId, todayISO } from "@/utils";
import { EXERCISES } from "@/constants/exercises";

type WorkoutState = {
  workouts: Workout[];
  activeWorkout: Workout | null;
  startWorkout: (name: string, exercises: WorkoutExercise[]) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  addSetToExercise: (exerciseId: string) => void;
  addExerciseToActive: (exercise: Exercise) => void;
  finishWorkout: () => void;
  getWorkoutsForDate: (date: string) => Workout[];
};

const today = todayISO();

const SEED_WORKOUTS: Workout[] = [
  {
    id: "w-1",
    name: "Upper Body Push",
    date: today,
    completed: false,
    durationMinutes: 55,
    exercises: [
      {
        id: "we-1",
        exercise: EXERCISES[0]!,
        sets: [
          { id: "s-1", reps: 10, weight: 80, completed: true },
          { id: "s-2", reps: 8, weight: 85, completed: true },
          { id: "s-3", reps: 8, weight: 85, completed: false },
          { id: "s-4", reps: 6, weight: 90, completed: false },
        ],
      },
      {
        id: "we-2",
        exercise: EXERCISES[1]!,
        sets: [
          { id: "s-5", reps: 12, weight: 30, completed: false },
          { id: "s-6", reps: 10, weight: 32, completed: false },
          { id: "s-7", reps: 10, weight: 32, completed: false },
        ],
      },
      {
        id: "we-3",
        exercise: EXERCISES[9]!,
        sets: [
          { id: "s-8", reps: 10, weight: 50, completed: false },
          { id: "s-9", reps: 8, weight: 55, completed: false },
          { id: "s-10", reps: 8, weight: 55, completed: false },
        ],
      },
    ],
  },
];

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: SEED_WORKOUTS,
  activeWorkout: SEED_WORKOUTS[0] || null,

  startWorkout: (name, exercises) => {
    const workout: Workout = {
      id: generateId(),
      name,
      date: todayISO(),
      exercises,
      completed: false,
    };
    set({ activeWorkout: workout });
  },

  completeSet: (exerciseId, setId) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id === setId ? { ...s, completed: !s.completed } : s,
                  ),
                }
              : e,
          ),
        },
      };
    });
  },

  addSetToExercise: (exerciseId) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) => {
            if (e.id !== exerciseId) return e;
            const lastSet = e.sets[e.sets.length - 1];
            const newSet: WorkoutSet = {
              id: generateId(),
              reps: lastSet?.reps || 10,
              weight: lastSet?.weight || 0,
              completed: false,
            };
            return { ...e, sets: [...e.sets, newSet] };
          }),
        },
      };
    });
  },

  addExerciseToActive: (exercise) => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const workoutExercise: WorkoutExercise = {
        id: generateId(),
        exercise,
        sets: [
          { id: generateId(), reps: 10, weight: 0, completed: false },
          { id: generateId(), reps: 10, weight: 0, completed: false },
          { id: generateId(), reps: 10, weight: 0, completed: false },
        ],
      };
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: [...state.activeWorkout.exercises, workoutExercise],
        },
      };
    });
  },

  finishWorkout: () => {
    set((state) => {
      if (!state.activeWorkout) return state;
      const completed = { ...state.activeWorkout, completed: true };
      return {
        activeWorkout: null,
        workouts: state.workouts.map((w) =>
          w.id === completed.id ? completed : w,
        ).concat(
          state.workouts.some((w) => w.id === completed.id) ? [] : [completed],
        ),
      };
    });
  },

  getWorkoutsForDate: (date) => {
    return get().workouts.filter((w) => w.date === date);
  },
}));
