import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService } from '@/services/database';
import { logError, getErrorMessage } from '@/utils/errorHandler';

export interface AutomationSession {
  id: string;
  user_id: string;
  account_id: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  runtime_seconds: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  accounts?: {
    name: string;
    email: string;
    notebook_url?: string;
  } | null;
}

export const useSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AutomationSession[]>([]);
  const [activeSession, setActiveSession] = useState<AutomationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async (limit = 10) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getUserSessions(user.id, limit);
      setSessions(data as AutomationSession[]);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'loadSessions',
        userId: user.id,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadActiveSession = useCallback(async () => {
    if (!user) return;

    try {
      const data = await DatabaseService.getActiveSession(user.id);
      setActiveSession(data as AutomationSession | null);
    } catch (err) {
      const message = getErrorMessage(err);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'loadActiveSession',
        userId: user.id,
      });
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
    loadActiveSession();
  }, [loadSessions, loadActiveSession]);

  const createSession = useCallback(async (accountId: string, metadata = {}) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const session = await DatabaseService.createAutomationSession(user.id, accountId, metadata);
      setSessions(prev => [session as AutomationSession, ...prev]);
      setActiveSession(session as AutomationSession);
      return session;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'createSession',
        userId: user.id,
        accountId,
      });
      throw err;
    }
  }, [user]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<AutomationSession>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const updatedSession = await DatabaseService.updateAutomationSession(sessionId, updates);
      
      setSessions(prev =>
        prev.map(s => s.id === sessionId ? updatedSession as AutomationSession : s)
      );
      
      if (activeSession?.id === sessionId) {
        setActiveSession(updatedSession as AutomationSession);
      }
      
      return updatedSession;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'updateSession',
        userId: user.id,
        sessionId,
      });
      throw err;
    }
  }, [user, activeSession]);

  const stopSession = useCallback(async (sessionId: string, errorMessage?: string) => {
    return updateSession(sessionId, {
      status: errorMessage ? 'ERROR' : 'STOPPED',
      ended_at: new Date().toISOString(),
      error_message: errorMessage || null,
    });
  }, [updateSession]);

  return {
    sessions,
    activeSession,
    loading,
    error,
    createSession,
    updateSession,
    stopSession,
    refetch: loadSessions,
    refetchActive: loadActiveSession,
  };
};
