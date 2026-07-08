export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => Promise<string | null> | string | null;
  getLocale?: () => string;
  onUnauthorized?: () => void | Promise<void>;
  fetchImpl?: typeof fetch;
};

type RequestInitWithJson = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

function resolveBaseUrl(explicit?: string): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const base = explicit ?? fromEnv ?? 'http://localhost:3000';
  return base.replace(/\/$/, '');
}

export function createApiClient(options: ApiClientOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const getLocale = options.getLocale ?? (() => 'pt-BR');

  async function request<T>(
    path: string,
    init: RequestInitWithJson = {},
  ): Promise<T> {
    const baseUrl = resolveBaseUrl(options.baseUrl);
    const url = path.startsWith('http')
      ? path
      : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers = new Headers(init.headers);
    if (!headers.has('Accept-Language')) {
      headers.set('Accept-Language', getLocale());
    }

    const token = options.getToken ? await options.getToken() : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let body = init.body as BodyInit | undefined;
    if (
      init.body !== undefined &&
      !(init.body instanceof FormData) &&
      typeof init.body !== 'string'
    ) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(init.body);
    }

    const response = await fetchImpl(url, {
      ...init,
      headers,
      body,
    });

    if (response.status === 401) {
      await options.onUnauthorized?.();
    }

    if (response.status === 204 || response.status === 202) {
      return undefined as T;
    }

    const text = await response.text();
    const parsed = text ? safeJson(text) : undefined;

    if (!response.ok) {
      const message =
        typeof parsed === 'object' &&
        parsed !== null &&
        'message' in parsed &&
        typeof (parsed as { message: unknown }).message === 'string'
          ? (parsed as { message: string }).message
          : `HTTP ${response.status}`;
      throw new ApiError(response.status, message, parsed);
    }

    return parsed as T;
  }

  return { request };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export type ApiClient = ReturnType<typeof createApiClient>;
