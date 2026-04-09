import { create } from "zustand";
import type {
  WorkoutLog,
  WorkoutExercise,
  WorkoutSet,
  Exercise,
  PlanDay,
} from "@/types";
import { generateId, todayISO } from "@/utils";
import { EXERCISES } from "@/constants/exercises";

type WorkoutState = {
  logs: WorkoutLog[];
  activeWorkout: WorkoutLog | null;

  startWorkoutFromPlan: (planDay: PlanDay) => void;
  startEmptyWorkout: (name: string) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number,
  ) => void;
  addSetToExercise: (exerciseId: string) => void;
  addExerciseToActive: (exercise: Exercise) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  getLogsForDate: (date: string) => WorkoutLog[];
  getRecentLogs: (count: number) => WorkoutLog[];
};

function resolveExercise(id: string): Exercise {
  return EXERCISES.find((e) => e.id === id) ?? { id, name: id, muscleGroup: "full_body" };
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  logs: [],
  activeWorkout: null,

  startWorkoutFromPlan: (planDay) => {
    const exercises: WorkoutExercise[] = planDay.exercises.map((pe) => ({
      id: generateId(),
      exercise: resolveExercise(pe.exerciseId),
      sets: Array.from({ length: pe.defaultSets }, () => ({
        id: generateId(),
        reps: pe.defaultReps,
        weight: 0,
        completed: false,
        restSeconds: pe.defaultRestSeconds,
      })),
    }));

    const workout: WorkoutLog = {
      id: generateId(),
      date: todayISO(),
      planDayLabel: planDay.label,
      exercises,
      startedAt: new Date().toISOString(),
      completed: false,
    };

    set({ activeWorkout: workout });
  },

  startEmptyWorkout: (name) => {
    const workout: WorkoutLog = {
      id: generateId(),
      date: todayISO(),
      planDayLabel: name,
      exercises: [],
      startedAt: new Date().toISOString(),
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

  updateSet: (exerciseId, setId, field, value) => {
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
                    s.id === setId ? { ...s, [field]: value } : s,
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
              reps: lastSet?.reps ?? 10,
              weight: lastSet?.weight ?? 0,
              completed: false,
              restSeconds: lastSet?.restSeconds ?? 90,
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
        sets: Array.from({ length: 3 }, () => ({
          id: generateId(),
          reps: 10,
          weight: 0,
          completed: false,
          restSeconds: 90,
        })),
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
      const now = new Date();
      const startedAt = new Date(state.activeWorkout.startedAt);
      const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

      const completed: WorkoutLog = {
        ...state.activeWorkout,
        completed: true,
        finishedAt: now.toISOString(),
        durationSeconds,
      };
      return {
        activeWorkout: null,
        logs: [completed, ...state.logs],
      };
    });
  },

  cancelWorkout: () => {
    set({ activeWorkout: null });
  },

  getLogsForDate: (date) => {
    return get().logs.filter((l) => l.date === date);
  },

  getRecentLogs: (count) => {
    return get()
      .logs.filter((l) => l.completed)
      .slice(0, count);
  },
}));
