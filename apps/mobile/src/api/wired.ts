import { createApiClient } from './client';
import { createIdentityApi } from './identity';
import { createProgressApi } from './progress';
import { createStudentApi } from './student';
import { createTrainingApi } from './training';

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
let trainingApi: ReturnType<typeof createTrainingApi> | null = null;
let progressApi: ReturnType<typeof createProgressApi> | null = null;

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

export function getWiredTrainingApi() {
  if (!trainingApi) {
    trainingApi = createTrainingApi(createWiredClient());
  }
  return trainingApi;
}

export function getWiredProgressApi() {
  if (!progressApi) {
    progressApi = createProgressApi(createWiredClient());
  }
  return progressApi;
}
