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

export type CoachingProfile = {
  id: string;
  userId: string;
  type: string;
  credentials: string;
  displayName: string | null;
  bio: string | null;
  slug: string | null;
  isPublished: boolean;
};

export type UpdateProfileInput = {
  displayName?: string;
  bio?: string;
  slug?: string;
  isPublished?: boolean;
  credentials?: string;
};

export type InviteResponse = {
  token: string;
  expiresAt: string;
  studentEmail: string;
};

export type LinkRequestRow = {
  id: string;
  studentUserId: string;
  studentEmail: string;
  status: string;
  createdAt: string;
};

export function createCoachingApi(client: ApiClient) {
  return {
    getDashboard: () =>
      client.request<DashboardResponse>('/api/coaching/dashboard'),
    getProfile: () => client.request<CoachingProfile>('/api/coaching/profile'),
    createProfile: (body: CreateProfileInput) =>
      client.request('/api/coaching/profile', {
        method: 'POST',
        body,
      }),
    updateProfile: (body: UpdateProfileInput) =>
      client.request<CoachingProfile>('/api/coaching/profile', {
        method: 'PATCH',
        body,
      }),
    createInvite: (studentEmail: string) =>
      client.request<InviteResponse>('/api/coaching/invites', {
        method: 'POST',
        body: { studentEmail },
      }),
    listLinkRequests: () =>
      client.request<{ requests: LinkRequestRow[] }>('/api/coaching/requests'),
    acceptLinkRequest: (id: string) =>
      client.request(`/api/coaching/requests/${id}/accept`, {
        method: 'POST',
      }),
    declineLinkRequest: (id: string) =>
      client.request(`/api/coaching/requests/${id}/decline`, {
        method: 'POST',
      }),
  };
}

export type CoachingApi = ReturnType<typeof createCoachingApi>;
