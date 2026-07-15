import type { ApiClient } from './client';

export type PublicProfessional = {
  id: string;
  userId: string;
  type: string;
  credentials: string;
  displayName: string | null;
  bio: string | null;
  slug: string | null;
};

export type LinkRequest = {
  id: string;
  professionalUserId: string;
  studentUserId?: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
};

export function createCoachingApi(api: ApiClient) {
  return {
    listProfessionals(q?: string): Promise<{ professionals: PublicProfessional[] }> {
      const params = new URLSearchParams();
      if (q?.trim()) params.set('q', q.trim());
      const query = params.toString();
      return api.request(
        `/api/coaching/professionals${query ? `?${query}` : ''}`,
      );
    },
    getProfessional(idOrSlug: string): Promise<PublicProfessional> {
      return api.request(
        `/api/coaching/professionals/${encodeURIComponent(idOrSlug)}`,
      );
    },
    createLinkRequest(professionalUserId: string): Promise<LinkRequest> {
      return api.request('/api/coaching/requests', {
        method: 'POST',
        body: { professionalUserId },
      });
    },
    listMyLinkRequests(): Promise<{ requests: LinkRequest[] }> {
      return api.request('/api/coaching/requests/mine');
    },
  };
}

export type CoachingApi = ReturnType<typeof createCoachingApi>;
