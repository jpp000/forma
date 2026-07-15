import type { ApiClient } from './client';

export type MeResponse = {
  id: string;
  email: string;
  roles: string[];
};

export type OtpRequestResponse = { ok: true };
export type OtpVerifyResponse = { accessToken: string };

export function createIdentityApi(client: ApiClient) {
  return {
    getMe: () => client.request<MeResponse>('/api/identity/me'),
    requestOtp: (email: string) =>
      client.request<OtpRequestResponse>('/api/identity/otp/request', {
        method: 'POST',
        body: { email },
      }),
    verifyOtp: (email: string, code: string) =>
      client.request<OtpVerifyResponse>('/api/identity/otp/verify', {
        method: 'POST',
        body: { email, code },
      }),
    getDevLastOtp: (email: string) =>
      client.request<{ code: string }>(
        `/api/identity/otp/dev-last?email=${encodeURIComponent(email)}`,
      ),
    devProLogin: () =>
      client.request<OtpVerifyResponse>('/api/identity/dev/pro-login', {
        method: 'POST',
      }),
  };
}

export type IdentityApi = ReturnType<typeof createIdentityApi>;
