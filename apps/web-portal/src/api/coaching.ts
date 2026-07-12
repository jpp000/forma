import type { ApiClient } from './client';

export type CoachingStudentRow = {
  studentId: string;
  email: string;
  lastWorkout: string | null;
  lastMeal: string | null;
  weightTrend: string | null;
};

export type DashboardResponse = {
  students: CoachingStudentRow[];
};

export type CreateProfileInput = {
  type: 'trainer' | 'nutritionist';
  credentials: string;
};

export type InviteResponse = {
  token: string;
  expiresAt: string;
  studentEmail: string;
};

export function createCoachingApi(client: ApiClient) {
  return {
    getDashboard: () =>
      client.request<DashboardResponse>('/api/coaching/dashboard'),
    createProfile: (body: CreateProfileInput) =>
      client.request('/api/coaching/profile', {
        method: 'POST',
        body,
      }),
    createInvite: (studentEmail: string) =>
      client.request<InviteResponse>('/api/coaching/invites', {
        method: 'POST',
        body: { studentEmail },
      }),
  };
}

export type CoachingApi = ReturnType<typeof createCoachingApi>;
