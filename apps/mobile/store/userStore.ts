import { create } from "zustand";
import type { UserProfile, UserGoals } from "@/types";

type UserState = {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  setGoals: (goals: Partial<UserGoals>) => void;
};

export const useUserStore = create<UserState>((set) => ({
  profile: {
    id: "user-1",
    name: "João",
    age: 27,
    heightCm: 178,
    weightKg: 79,
    goalWeightKg: 75,
    goals: {
      dailyCalories: 2200,
      proteinPercent: 35,
      carbsPercent: 40,
      fatPercent: 25,
    },
  },

  setProfile: (partial) =>
    set((state) => ({
      profile: { ...state.profile, ...partial },
    })),

  setGoals: (partial) =>
    set((state) => ({
      profile: {
        ...state.profile,
        goals: { ...state.profile.goals, ...partial },
      },
    })),
}));
