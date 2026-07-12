import { afterEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '../../stores/sessionStore';
import { ApiError, createApiClient } from '../client';
import { handleUnauthorized } from '../wire';

describe('401 clears session (WPORT-02)', () => {
  afterEach(() => {
    useSessionStore.setState({
      token: null,
      user: null,
      isLoading: false,
    });
  });

  it('production handleUnauthorized clears in-memory session', () => {
    useSessionStore.setState({
      token: 'stale-token',
      user: { id: 'u1', email: 'a@example.com', roles: [] },
      isLoading: false,
    });

    handleUnauthorized();

    expect(useSessionStore.getState().token).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('client 401 invokes production handleUnauthorized', async () => {
    useSessionStore.setState({
      token: 'stale-token',
      user: { id: 'u1', email: 'a@example.com', roles: [] },
      isLoading: false,
    });

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
      getToken: () => useSessionStore.getState().token,
      onUnauthorized: handleUnauthorized,
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
