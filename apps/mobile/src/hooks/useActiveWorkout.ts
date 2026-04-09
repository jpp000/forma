import { useMemo } from "react";
import { useWorkoutStore } from "@/store/workoutStore";

export function useActiveWorkout() {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const completeSet = useWorkoutStore((s) => s.completeSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const addSetToExercise = useWorkoutStore((s) => s.addSetToExercise);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const startWorkoutFromPlan = useWorkoutStore((s) => s.startWorkoutFromPlan);

  const progress = useMemo(() => {
    if (!activeWorkout) return { total: 0, completed: 0, percent: 0 };
    const allSets = activeWorkout.exercises.flatMap((e) => e.sets);
    const total = allSets.length;
    const completed = allSets.filter((s) => s.completed).length;
    return { total, completed, percent: total > 0 ? (completed / total) * 100 : 0 };
  }, [activeWorkout]);

  return {
    activeWorkout,
    progress,
    completeSet,
    updateSet,
    addSetToExercise,
    addExerciseToActive,
    finishWorkout,
    cancelWorkout,
    startWorkoutFromPlan,
  };
}
