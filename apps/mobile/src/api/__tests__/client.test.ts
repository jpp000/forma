import { ApiError, createApiClient } from '../client';

describe('api client (MFOUND-05, MFOUND-06, MFOUND-07)', () => {
  const baseUrl = 'https://api.example.com';

  it('uses EXPO_PUBLIC_API_URL as the request base', async () => {
    const previous = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = baseUrl;
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const api = createApiClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      getLocale: () => 'pt-BR',
    });

    await api.request('/api/identity/me');

    expect(fetchImpl).toHaveBeenCalledWith(
      `${baseUrl}/api/identity/me`,
      expect.any(Object),
    );

    process.env.EXPO_PUBLIC_API_URL = previous;
  });

  it('attaches Authorization Bearer when a token is present', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: '1' }), { status: 200 }),
      );

    const api = createApiClient({
      baseUrl,
      getToken: () => 'jwt-token',
      getLocale: () => 'en',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await api.request('/api/identity/me');

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer jwt-token');
  });

  it('attaches Accept-Language from the active locale getter', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: '1' }), { status: 200 }),
      );

    const api = createApiClient({
      baseUrl,
      getLocale: () => 'pt-BR',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await api.request('/api/identity/me');

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Accept-Language')).toBe('pt-BR');
  });

  it('invokes onUnauthorized when the API returns HTTP 401', async () => {
    const onUnauthorized = jest.fn();
    const fetchImpl = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'unauthorized' }), {
        status: 401,
      }),
    );

    const api = createApiClient({
      baseUrl,
      getToken: () => 'stale-token',
      getLocale: () => 'en',
      onUnauthorized,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(api.request('/api/identity/me')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not set Authorization when no token is present', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const api = createApiClient({
      baseUrl,
      getToken: () => null,
      getLocale: () => 'en',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await api.request('/api/identity/otp/request', {
      method: 'POST',
      body: { email: 'a@b.com' },
    });

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBeNull();
  });
});
