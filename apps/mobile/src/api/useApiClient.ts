import { useMemo } from 'react';
import { createApiClient, type ApiClient } from './client';
import { useSession } from '../session';
import { getActiveLocale } from '../stores/localeStore';
import { useSessionStore } from '../stores/sessionStore';

export function useApiClient(): ApiClient {
  const { signOut } = useSession();

  return useMemo(
    () =>
      createApiClient({
        getToken: () => useSessionStore.getState().token,
        getLocale: () => getActiveLocale(),
        onUnauthorized: () => {
          void signOut();
        },
      }),
    [signOut],
  );
}
