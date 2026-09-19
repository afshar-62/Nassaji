/**
 * TAROPOD API CLIENT
 * Typed HTTP transport layer with automatic envelope unwrap and error handling.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
    locale?: string;
  };
}

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code = 'UNKNOWN_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const BASE_URL = '/api/v1';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
      const errorMsg = json.error?.message || `خطای ارتباط با سرور (${response.status})`;
      throw new ApiError(errorMsg, json.error?.code || 'SERVER_ERROR', json.error?.details);
    }

    return json.data;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'خطای پیش‌بینی نشده در ارتباط با شبکه';
    throw new ApiError(message, 'NETWORK_ERROR');
  }
}
