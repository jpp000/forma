import { create } from "zustand";
import type { TrainingPlan, PlanDay, DayOfWeek } from "@/types";
import { TRAINING_PLANS } from "@/constants/trainingPlans";
import dayjs from "dayjs";

type TrainingPlanState = {
  plans: TrainingPlan[];
  activePlanId: string | null;
  getActivePlan: () => TrainingPlan | null;
  selectPlan: (planId: string) => void;
  clearPlan: () => void;
  getPlanDayForDate: (date: string) => PlanDay | null;
  getTodayPlanDay: () => PlanDay | null;
};

export const useTrainingPlanStore = create<TrainingPlanState>((set, get) => ({
  plans: TRAINING_PLANS,
  activePlanId: "ppl",

  getActivePlan: () => {
    const { plans, activePlanId } = get();
    return plans.find((p) => p.id === activePlanId) ?? null;
  },

  selectPlan: (planId) => {
    set({ activePlanId: planId });
  },

  clearPlan: () => {
    set({ activePlanId: null });
  },

  getPlanDayForDate: (date) => {
    const plan = get().getActivePlan();
    if (!plan) return null;
    const dow = dayjs(date).day() as DayOfWeek;
    return plan.days.find((d) => d.dayOfWeek === dow) ?? null;
  },

  getTodayPlanDay: () => {
    return get().getPlanDayForDate(dayjs().format("YYYY-MM-DD"));
  },
}));
