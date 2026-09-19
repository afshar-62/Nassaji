export interface ApiMeta {
  requestId: string;
  timestamp: string;
  version: string;
  locale?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: ApiMeta;
}
