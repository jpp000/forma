import { getActiveLocale } from '../stores/localeStore';
import { useSessionStore } from '../stores/sessionStore';
import { createBillingApi } from './billing';
import { createApiClient } from './client';
import { createCoachingApi } from './coaching';
import { createIdentityApi } from './identity';

/** Production 401 handler — exported for WPORT-02 coverage. */
export function handleUnauthorized(): void {
  useSessionStore.getState().clearSession();
}

function createWiredClient() {
  return createApiClient({
    getToken: () => useSessionStore.getState().token,
    getLocale: () => getActiveLocale(),
    onUnauthorized: handleUnauthorized,
  });
}

const client = createWiredClient();
const identityApi = createIdentityApi(client);
const billingApi = createBillingApi(client);
const coachingApi = createCoachingApi(client);

export function getIdentityApi() {
  return identityApi;
}

export function getBillingApi() {
  return billingApi;
}

export function getCoachingApi() {
  return coachingApi;
}
