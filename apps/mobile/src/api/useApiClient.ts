import { useMemo } from 'react';
import { getActiveLocale } from '../stores/localeStore';
import { useSessionStore } from '../stores/sessionStore';
import { type ApiClient, createApiClient } from './client';

export function useApiClient(): ApiClient {
  const token = useSessionStore((state) => state.token);
  const signOut = useSessionStore((state) => state.signOut);

  return useMemo(
    () =>
      createApiClient({
        getToken: () => token,
        getLocale: () => getActiveLocale(),
        onUnauthorized: () => {
          void signOut();
        },
      }),
    [token, signOut],
  );
}
