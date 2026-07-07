export interface EmailProvider {
  sendOtp(to: string, code: string, locale: string): Promise<void>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
