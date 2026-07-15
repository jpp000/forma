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

export type PeriodizationBlockInput = {
  templateId: string;
  durationDays: number;
};

export type Periodization = {
  id: string;
  name: string;
  blocks: Array<{
    id: string;
    position: number;
    templateId: string;
    durationDays: number;
  }>;
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
    listPeriodizations: () =>
      client.request<{ periodizations: Periodization[] }>(
        '/api/training/periodizations',
      ),
    createPeriodization: (body: {
      name: string;
      blocks: PeriodizationBlockInput[];
    }) =>
      client.request<Periodization>('/api/training/periodizations', {
        method: 'POST',
        body,
      }),
    assignPeriodization: (
      id: string,
      body: { studentUserId: string },
    ) =>
      client.request<{
        assignment: { id: string };
        activePosition: number;
      }>(`/api/training/periodizations/${id}/assign`, {
        method: 'POST',
        body,
      }),
    advanceAssignment: (assignmentId: string) =>
      client.request(
        `/api/training/periodization-assignments/${assignmentId}/advance`,
        { method: 'POST' },
      ),
  };
}

export type TrainingApi = ReturnType<typeof createTrainingApi>;
