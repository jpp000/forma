import { t } from '../i18n';
import { ApiError } from './client';

export type MappedApiErrorKind =
  | 'unauthorized'
  | 'payment_required'
  | 'forbidden'
  | 'gone'
  | 'validation'
  | 'network'
  | 'generic';

export type MappedApiError = {
  kind: MappedApiErrorKind;
  message: string;
  status?: number;
};

export function mapApiError(error: unknown): MappedApiError {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {
        kind: 'unauthorized',
        message: error.message,
        status: 401,
      };
    }
    if (error.status === 402) {
      return {
        kind: 'payment_required',
        message: error.message,
        status: 402,
      };
    }
    if (error.status === 403) {
      return { kind: 'forbidden', message: error.message, status: 403 };
    }
    if (error.status === 410) {
      return { kind: 'gone', message: error.message, status: 410 };
    }
    if (error.status === 400 || error.status === 422 || error.status === 409) {
      return {
        kind: 'validation',
        message: error.message,
        status: error.status,
      };
    }
    return { kind: 'generic', message: error.message, status: error.status };
  }

  if (error instanceof TypeError) {
    return { kind: 'network', message: t('errors.network') };
  }

  if (error instanceof Error) {
    return { kind: 'generic', message: error.message };
  }

  return { kind: 'generic', message: t('errors.generic') };
}

export function isProfessionalRole(
  roles: readonly string[] | null | undefined,
): boolean {
  if (!roles?.length) {
    return false;
  }
  return roles.includes('trainer') || roles.includes('nutritionist');
}
