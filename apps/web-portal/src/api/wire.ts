import { getActiveLocale } from '../stores/localeStore';
import { useSessionStore } from '../stores/sessionStore';
import { createBillingApi } from './billing';
import { createApiClient } from './client';
import { createIdentityApi } from './identity';

function createWiredClient() {
  return createApiClient({
    getToken: () => useSessionStore.getState().token,
    getLocale: () => getActiveLocale(),
    onUnauthorized: () => {
      useSessionStore.getState().clearSession();
    },
  });
}

const client = createWiredClient();
const identityApi = createIdentityApi(client);
const billingApi = createBillingApi(client);

export function getIdentityApi() {
  return identityApi;
}

export function getBillingApi() {
  return billingApi;
}
