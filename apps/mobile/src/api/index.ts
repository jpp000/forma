export type { ApiClient, ApiClientOptions } from './client';
export { ApiError, createApiClient } from './client';
export type { GuidanceApi } from './guidance';
export { createGuidanceApi } from './guidance';
export type {
  AuthResponse,
  IdentityApi,
  MeResponse,
  OAuthProvider,
} from './identity';
export { createIdentityApi } from './identity';
export { mapApiError } from './mapApiError';
export type { NutritionApi } from './nutrition';
export { createNutritionApi } from './nutrition';
export type { ProgressApi, TrainingRestDay } from './progress';
export { createProgressApi } from './progress';
export type {
  SetHealthGoalInput,
  StudentApi,
  StudentProfileInput,
} from './student';
export { createStudentApi } from './student';
export type {
  CreateExerciseInput,
  CreateWorkoutPlanInput,
  CreateWorkoutSessionInput,
  Paginated,
  SessionExercise,
  TrainingApi,
  TrainingExercise,
  TrainingWorkoutSession,
  WorkoutPlan,
  WorkoutPlanItem,
  WorkoutSet,
} from './training';
export { createTrainingApi } from './training';
export { useApiClient } from './useApiClient';
export {
  getWiredIdentityApi,
  getWiredProgressApi,
  getWiredStudentApi,
  getWiredTrainingApi,
} from './wired';
