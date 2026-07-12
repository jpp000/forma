import { afterEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '../../stores/sessionStore';
import { ApiError, createApiClient } from '../client';

describe('401 clears session (WPORT-02)', () => {
  afterEach(() => {
    useSessionStore.setState({
      token: null,
      user: null,
      isLoading: false,
    });
  });

  it('clears in-memory session when onUnauthorized runs clearSession', async () => {
    useSessionStore.setState({
      token: 'stale-token',
      user: { id: 'u1', email: 'a@example.com', roles: [] },
      isLoading: false,
    });

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
      getToken: () => useSessionStore.getState().token,
      onUnauthorized: () => {
        useSessionStore.getState().clearSession();
      },
      fetchImpl: async () =>
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
    });

    await expect(client.request('/api/identity/me')).rejects.toBeInstanceOf(
      ApiError,
    );

    expect(useSessionStore.getState().token).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
  });
});
