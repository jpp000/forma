export type { ApiClient, ApiClientOptions } from './client';
export { ApiError, createApiClient } from './client';
export type {
  AuthResponse,
  IdentityApi,
  MeResponse,
  OAuthProvider,
} from './identity';
export { createIdentityApi } from './identity';
export type {
  SetHealthGoalInput,
  StudentApi,
  StudentProfileInput,
} from './student';
export { createStudentApi } from './student';
