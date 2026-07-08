export type { ApiClient, ApiClientOptions } from './client';
export { ApiError, createApiClient } from './client';
export type {
  AuthResponse,
  IdentityApi,
  MeResponse,
  OAuthProvider,
} from './identity';
export { createIdentityApi } from './identity';
export { mapApiError } from './mapApiError';
export type {
  ProgressApi,
  StreaksResponse,
  StreakSummary,
  TrainingRestDay,
} from './progress';
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
  WorkoutPlan,
  WorkoutPlanItem,
  WorkoutSession,
  WorkoutSet,
} from './training';
export { createTrainingApi } from './training';
export {
  getWiredIdentityApi,
  getWiredProgressApi,
  getWiredStudentApi,
  getWiredTrainingApi,
} from './wired';
