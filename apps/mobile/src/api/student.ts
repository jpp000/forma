import type { HealthGoal } from '@forma/types';
import type { ApiClient } from './client';

export type StudentProfileInput = {
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
};

export type SetHealthGoalInput = {
  goalType: HealthGoal;
  targetWeightKg?: number;
  targetCalories?: number;
};

export function createStudentApi(api: ApiClient) {
  return {
    createProfile(input: StudentProfileInput): Promise<unknown> {
      return api.request('/api/student/profile', {
        method: 'POST',
        body: input,
      });
    },

    setGoal(input: SetHealthGoalInput): Promise<unknown> {
      return api.request('/api/student/goal', {
        method: 'PUT',
        body: input,
      });
    },
  };
}

export type StudentApi = ReturnType<typeof createStudentApi>;
