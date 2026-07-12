import { getActiveLocale } from '../stores/localeStore';
import { useSessionStore } from '../stores/sessionStore';
import { createApiClient } from './client';
import { createIdentityApi } from './identity';

let identityApi = createIdentityApi(
  createApiClient({
    getToken: () => useSessionStore.getState().token,
    getLocale: () => getActiveLocale(),
    onUnauthorized: () => {
      useSessionStore.getState().clearSession();
    },
  }),
);

export function getIdentityApi() {
  return identityApi;
}

/** Test seam — replace wired client. */
export function setIdentityApiForTests(
  api: ReturnType<typeof createIdentityApi>,
) {
  identityApi = api;
}
