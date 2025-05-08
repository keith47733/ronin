export type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export const API_ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return { data };
}

export function createApiError(code: string, message: string, details?: unknown): ApiResponse<never> {
  return {
    error: {
      code,
      message,
      details,
    },
  };
} 