import type { ApiClient } from './client';

export type CheckoutResponse = { url: string };

export function createBillingApi(client: ApiClient) {
  return {
    checkoutProfessional: () =>
      client.request<CheckoutResponse>('/api/billing/checkout', {
        method: 'POST',
        body: { planSlug: 'professional' },
      }),
  };
}

export type BillingApi = ReturnType<typeof createBillingApi>;
