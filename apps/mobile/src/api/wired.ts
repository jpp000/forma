import { createApiClient } from './client';
import { createIdentityApi } from './identity';
import { createStudentApi } from './student';

type StoreRefs = {
  getToken: () => string | null;
  getLocale: () => string;
  onUnauthorized: () => void | Promise<void>;
};

let storeRefs: StoreRefs = {
  getToken: () => null,
  getLocale: () => 'pt-BR',
  onUnauthorized: () => {},
};

export function wireApiStores(refs: StoreRefs) {
  storeRefs = refs;
}

function createWiredClient() {
  return createApiClient({
    getToken: () => storeRefs.getToken(),
    getLocale: () => storeRefs.getLocale(),
    onUnauthorized: () => storeRefs.onUnauthorized(),
  });
}

let identityApi: ReturnType<typeof createIdentityApi> | null = null;
let studentApi: ReturnType<typeof createStudentApi> | null = null;

export function getWiredIdentityApi() {
  if (!identityApi) {
    identityApi = createIdentityApi(createWiredClient());
  }
  return identityApi;
}

export function getWiredStudentApi() {
  if (!studentApi) {
    studentApi = createStudentApi(createWiredClient());
  }
  return studentApi;
}
