import { describe, expect, it, vi } from 'vitest';
import { createApiClient, ApiError } from '../client';
import { createBillingApi } from '../billing';
import { createCoachingApi } from '../coaching';

describe('createApiClient 401 handling', () => {
  it('invokes onUnauthorized when API returns 401', async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      onUnauthorized,
    });

    await expect(client.request('/api/identity/me')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('sends Accept-Language from getLocale', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      getLocale: () => 'en',
    });

    await client.request('/api/health');
    const headers = fetchImpl.mock.calls[0][1].headers as Headers;
    expect(headers.get('Accept-Language')).toBe('en');
  });
});

describe('billing checkout plan', () => {
  it('posts planSlug professional', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://checkout.example/pro' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const billing = createBillingApi(client);
    const result = await billing.checkoutProfessional();

    expect(result.url).toBe('https://checkout.example/pro');
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      planSlug: 'professional',
    });
  });
});

describe('coaching invite payload', () => {
  it('posts studentEmail to invites endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 'abc',
          expiresAt: new Date().toISOString(),
          studentEmail: 'a@b.com',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const coaching = createCoachingApi(client);
    await coaching.createInvite('a@b.com');

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/coaching/invites');
    expect(JSON.parse(String(init.body))).toEqual({ studentEmail: 'a@b.com' });
  });
});
