export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export const handleSupabaseError = (error: SupabaseError): AppError => {
  switch (error.code) {
    case '23505': // Unique violation
      return new AppError('This record already exists', 'DUPLICATE_ENTRY', 409);
    case '23503': // Foreign key violation
      return new AppError('Referenced record not found', 'INVALID_REFERENCE', 400);
    case 'PGRST116': // No rows found
      return new AppError('Record not found', 'NOT_FOUND', 404);
    case '42501': // Permission denied
      return new AppError('Permission denied', 'PERMISSION_DENIED', 403);
    case '22P02': // Invalid input syntax
      return new AppError('Invalid input format', 'INVALID_INPUT', 400);
    case 'PGRST301': // Too many rows
      return new AppError('Request returned too many rows', 'TOO_MANY_ROWS', 400);
    default:
      return new AppError(
        error.message || 'Database operation failed',
        'DATABASE_ERROR',
        500
      );
  }
};

export interface ErrorContext {
  userId?: string;
  action?: string;
  resource?: string;
  [key: string]: unknown;
}

export const logError = (error: Error | AppError, context: ErrorContext = {}): void => {
  const errorInfo = {
    message: error.message,
    code: 'code' in error ? error.code : undefined,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };

  console.error('Application Error:', errorInfo);

  // In production, you might want to send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  if (error instanceof Error && error.message.includes('network')) {
    return true;
  }
  
  return false;
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
