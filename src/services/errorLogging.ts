/**
 * Error Logging Service - Centralized error logging and monitoring
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface ErrorData {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | null;
  sessionId?: string | null;
  context?: Record<string, unknown>;
  componentStack?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  data?: ErrorData;
}

const MAX_STORED_LOGS = 50;
const LOCAL_STORAGE_KEY = 'forger_error_logs';

export class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private userId: string | null = null;
  private sessionId: string | null = null;

  private constructor() {}

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  /**
   * Set user context for error logging
   */
  setUserContext(userId: string | null, sessionId?: string | null): void {
    this.userId = userId;
    this.sessionId = sessionId ?? null;
  }

  /**
   * Log an error with full context
   */
  async logError(
    error: Error | unknown,
    context: Record<string, unknown> = {}
  ): Promise<void> {
    const errorData = this.formatErrorData(error, context);

    try {
      // Always log to localStorage first (works offline)
      this.logToLocalStorage(errorData);

      // Log to Supabase if online and user is authenticated
      if (navigator.onLine && this.userId) {
        await this.logToSupabase(errorData);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Log a warning
   */
  async logWarning(message: string, context: Record<string, unknown> = {}): Promise<void> {
    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data: {
        message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        context
      }
    };

    this.storeLog(logEntry);
  }

  /**
   * Log info message
   */
  async logInfo(message: string, context: Record<string, unknown> = {}): Promise<void> {
    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data: {
        message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        context
      }
    };

    this.storeLog(logEntry);
  }

  /**
   * Format error data for logging
   */
  private formatErrorData(error: Error | unknown, context: Record<string, unknown>): ErrorData {
    const isError = error instanceof Error;

    return {
      message: isError ? error.message : String(error),
      stack: isError ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      context
    };
  }

  /**
   * Log to localStorage for offline support
   */
  private logToLocalStorage(errorData: ErrorData): void {
    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: errorData.timestamp,
      level: 'error',
      message: errorData.message,
      data: errorData
    };

    this.storeLog(logEntry);
  }

  /**
   * Store log entry in localStorage
   */
  private storeLog(logEntry: LogEntry): void {
    try {
      const logs = this.getStoredLogs();
      logs.push(logEntry);

      // Keep only the last N logs
      while (logs.length > MAX_STORED_LOGS) {
        logs.shift();
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store log:', e);
    }
  }

  /**
   * Get stored logs from localStorage
   */
  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  }

  /**
   * Log to Supabase for server-side storage
   */
  private async logToSupabase(errorData: ErrorData): Promise<void> {
    if (!this.userId) return;

    try {
      await supabase.from('automation_logs').insert([{
        user_id: this.userId,
        session_id: this.sessionId,
        level: 'ERROR',
        message: `Client Error: ${errorData.message}`,
        source: 'CLIENT',
        metadata: JSON.parse(JSON.stringify({
          stack: errorData.stack || null,
          url: errorData.url,
          userAgent: errorData.userAgent,
          context: errorData.context || null
        })) as Json
      }]);
    } catch (e) {
      console.error('Failed to log to Supabase:', e);
    }
  }

  /**
   * Sync offline logs to Supabase
   */
  async syncOfflineLogs(): Promise<void> {
    if (!navigator.onLine || !this.userId) return;

    const logs = this.getStoredLogs();
    const errorLogs = logs.filter(log => log.level === 'error');

    for (const log of errorLogs) {
      try {
        await supabase.from('automation_logs').insert([{
          user_id: this.userId,
          session_id: log.data?.sessionId,
          level: 'ERROR',
          message: `Synced Client Error: ${log.message}`,
          source: 'CLIENT_SYNC',
          metadata: log.data ? JSON.parse(JSON.stringify(log.data)) as Json : null
        }]);
      } catch {
        // Continue with other logs even if one fails
      }
    }

    // Clear synced logs
    this.clearStoredLogs();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Singleton instance
export const errorLogger = ErrorLoggingService.getInstance();

// Global error handler
export const setupGlobalErrorHandlers = (): void => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(event.reason, { type: 'unhandledRejection' });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorLogger.logError(event.error || event.message, { 
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
};

export default errorLogger;
