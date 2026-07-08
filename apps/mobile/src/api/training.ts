import type { ApiClient } from './client';

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TrainingExercise = {
  id: string;
  userId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutPlanItem = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
  sortOrder: number;
  exercise?: TrainingExercise;
};

export type WorkoutPlan = {
  id: string;
  userId: string;
  name: string;
  items: WorkoutPlanItem[];
  createdAt: string;
  updatedAt: string;
};

export type WorkoutSet = {
  reps: number;
  weightKg: number;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  exercise?: TrainingExercise;
};

export type TrainingWorkoutSession = {
  id: string;
  userId: string;
  planId: string | null;
  completedAt: string;
  exercises: SessionExercise[];
  createdAt: string;
};

export type CreateExerciseInput = {
  name: string;
  muscleGroup: string;
  equipment: string;
};

export type CreateWorkoutPlanInput = {
  name: string;
  items: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    restSeconds: number;
  }>;
};

export type CreateWorkoutSessionInput = {
  planId?: string;
  completedAt: string;
  exercises: Array<{
    exerciseId: string;
    sets: WorkoutSet[];
  }>;
};

export function createTrainingApi(api: ApiClient) {
  return {
    createExercise(input: CreateExerciseInput): Promise<TrainingExercise> {
      return api.request('/api/training/exercises', {
        method: 'POST',
        body: input,
      });
    },

    listExercises(
      page = 1,
      limit = 20,
    ): Promise<Paginated<TrainingExercise>> {
      return api.request(
        `/api/training/exercises?page=${page}&limit=${limit}`,
      );
    },

    createPlan(input: CreateWorkoutPlanInput): Promise<WorkoutPlan> {
      return api.request('/api/training/plans', {
        method: 'POST',
        body: input,
      });
    },

    listPlans(page = 1, limit = 20): Promise<Paginated<WorkoutPlan>> {
      return api.request(`/api/training/plans?page=${page}&limit=${limit}`);
    },

    logSession(
      input: CreateWorkoutSessionInput,
    ): Promise<TrainingWorkoutSession> {
      return api.request('/api/training/sessions', {
        method: 'POST',
        body: input,
      });
    },

    listSessions(
      page = 1,
      limit = 20,
    ): Promise<Paginated<TrainingWorkoutSession>> {
      return api.request(
        `/api/training/sessions?page=${page}&limit=${limit}`,
      );
    },
  };
}

export type TrainingApi = ReturnType<typeof createTrainingApi>;
