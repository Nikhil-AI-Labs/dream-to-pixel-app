import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { realtimeService, AutomationCommand } from '@/services/realtime';
import { storageService } from '@/services/storage';
import type { AutomationSession, LogEntry } from '@/types/agent';

interface ScreenshotData {
  id: string;
  file_path: string;
  created_at: string;
  url: string;
}

export const useAutomationSession = () => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<AutomationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof realtimeService.subscribeToAutomationSession> | null>(null);

  useEffect(() => {
    if (!user) return;

    const handleSessionUpdate = (payload: { eventType: string; new: unknown; old: unknown }) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          setSessionData(newRecord as AutomationSession);
          break;
        case 'DELETE':
          if ((oldRecord as AutomationSession)?.id === sessionData?.id) {
            setSessionData(null);
          }
          break;
      }
    };

    subscriptionRef.current = realtimeService.subscribeToAutomationSession(
      user.id,
      handleSessionUpdate
    );

    setIsConnected(true);

    return () => {
      if (subscriptionRef.current) {
        realtimeService.unsubscribe(`sessions_${user.id}`);
        setIsConnected(false);
      }
    };
  }, [user, sessionData?.id]);

  const sendCommand = useCallback(async (command: AutomationCommand, payload: Record<string, unknown> = {}): Promise<boolean> => {
    if (!user || !isConnected) return false;

    try {
      await realtimeService.sendAutomationCommand(user.id, command, payload);
      return true;
    } catch (error) {
      console.error('Failed to send command:', error);
      return false;
    }
  }, [user, isConnected]);

  return {
    sessionData,
    isConnected,
    sendCommand
  };
};

export const useLiveLogs = (sessionId: string | null) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof realtimeService.subscribeToLogs> | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLogs([]);
      return;
    }

    const handleLogUpdate = (newLog: Record<string, unknown>) => {
      const formattedLog: LogEntry = {
        id: newLog.id as string,
        timestamp: new Date(newLog.created_at as string),
        level: newLog.level as LogEntry['level'],
        message: newLog.message as string,
        source: newLog.source as string | undefined,
        metadata: newLog.metadata as Record<string, unknown> | undefined
      };

      setLogs((prevLogs) => {
        // Prevent duplicates
        const exists = prevLogs.find((log) => log.id === formattedLog.id);
        if (exists) return prevLogs;

        // Add new log and keep only last 1000 entries
        const updatedLogs = [...prevLogs, formattedLog];
        return updatedLogs.slice(-1000);
      });
    };

    subscriptionRef.current = realtimeService.subscribeToLogs(sessionId, handleLogUpdate);
    setIsConnected(true);

    return () => {
      if (subscriptionRef.current) {
        realtimeService.unsubscribe(`logs_${sessionId}`);
        setIsConnected(false);
      }
    };
  }, [sessionId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    isConnected,
    clearLogs
  };
};

export const useLiveScreenshots = (sessionId: string | null) => {
  const [currentScreenshot, setCurrentScreenshot] = useState<ScreenshotData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof realtimeService.subscribeToScreenshots> | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setCurrentScreenshot(null);
      return;
    }

    // Load initial screenshot
    const loadInitialScreenshot = async () => {
      setIsLoading(true);
      try {
        const screenshot = await storageService.getLatestScreenshot(sessionId);
        if (screenshot) {
          setCurrentScreenshot({
            id: sessionId,
            file_path: screenshot.file_path,
            created_at: screenshot.created_at,
            url: screenshot.url
          });
        }
      } catch (error) {
        console.error('Failed to load initial screenshot:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialScreenshot();

    const handleScreenshotUpdate = async (screenshotRecord: Record<string, unknown>) => {
      try {
        const signedUrl = await storageService.getScreenshotUrl(
          screenshotRecord.file_path as string
        );

        setCurrentScreenshot({
          id: screenshotRecord.id as string,
          file_path: screenshotRecord.file_path as string,
          created_at: screenshotRecord.created_at as string,
          url: signedUrl
        });
      } catch (error) {
        console.error('Failed to load screenshot:', error);
      }
    };

    subscriptionRef.current = realtimeService.subscribeToScreenshots(
      sessionId,
      handleScreenshotUpdate
    );

    setIsConnected(true);

    return () => {
      if (subscriptionRef.current) {
        realtimeService.unsubscribe(`screenshots_${sessionId}`);
        setIsConnected(false);
      }
    };
  }, [sessionId]);

  return {
    currentScreenshot,
    isConnected,
    isLoading
  };
};
