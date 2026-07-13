import type { ApiClient } from './client';

export type TemplateExerciseItem = {
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: number;
  restSeconds: number;
};

export type WorkoutTemplate = {
  id: string;
  professionalUserId: string;
  name: string;
  items: TemplateExerciseItem[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateInput = {
  name: string;
  items: TemplateExerciseItem[];
};

export type PrescribePlanInput = {
  studentUserId: string;
  templateId?: string;
  name?: string;
  items?: TemplateExerciseItem[];
};

export function createTrainingApi(client: ApiClient) {
  return {
    listTemplates: () =>
      client.request<{ templates: WorkoutTemplate[] }>(
        '/api/training/templates',
      ),
    createTemplate: (body: CreateTemplateInput) =>
      client.request<WorkoutTemplate>('/api/training/templates', {
        method: 'POST',
        body,
      }),
    prescribePlan: (body: PrescribePlanInput) =>
      client.request('/api/training/plans/prescribe', {
        method: 'POST',
        body,
      }),
  };
}

export type TrainingApi = ReturnType<typeof createTrainingApi>;
