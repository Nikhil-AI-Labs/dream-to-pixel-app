import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService } from '@/services/database';
import { logError, getErrorMessage } from '@/utils/errorHandler';

export interface AutomationLog {
  id: string;
  session_id: string | null;
  user_id: string;
  level: string;
  message: string;
  source: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const useAutomationLogs = (sessionId?: string) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (limit = 100) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = sessionId
        ? await DatabaseService.getSessionLogs(sessionId, limit)
        : await DatabaseService.getUserLogs(user.id, limit);
      
      setLogs(data as AutomationLog[]);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'loadLogs',
        userId: user.id,
        sessionId,
      });
    } finally {
      setLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const addLog = useCallback(async (
    level: string,
    message: string,
    source?: string,
    metadata = {}
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const log = await DatabaseService.createLog(
        user.id,
        sessionId || null,
        level,
        message,
        source,
        metadata
      );
      setLogs(prev => [log as AutomationLog, ...prev]);
      return log;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'addLog',
        userId: user.id,
        sessionId,
      });
      throw err;
    }
  }, [user, sessionId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    loading,
    error,
    addLog,
    clearLogs,
    refetch: loadLogs,
  };
};
