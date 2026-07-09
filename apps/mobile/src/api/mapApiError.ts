import { type TranslationKey, t } from '../i18n';
import { ApiError } from './client';

const API_CODE_TO_KEY: Record<string, TranslationKey> = {
  'errors.otp_invalid': 'auth.otpInvalid',
  'errors.otp_expired': 'auth.otpInvalid',
  'errors.otp_rate_limit': 'auth.otpRateLimit',
  'errors.oauth_invalid': 'auth.oauthFailed',
  'errors.unauthorized': 'auth.otpInvalid',
  'billing.upgrade_required': 'nutrition.errors.upgrade_required',
};

export function mapApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return t('auth.otpRateLimit');
    }

    if (error.status === 401) {
      return mapApiMessage(error.message) ?? t('auth.otpInvalid');
    }

    const mapped = mapApiMessage(error.message);
    if (mapped) {
      return mapped;
    }
  }

  if (error instanceof Error && error.name === 'TypeError') {
    return t('errors.network');
  }

  return t('errors.generic');
}

function mapApiMessage(message: string): string | undefined {
  const key = API_CODE_TO_KEY[message];
  if (key) {
    return t(key);
  }

  if (message && !message.startsWith('errors.')) {
    return message;
  }

  return undefined;
}
