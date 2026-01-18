import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AutomationEngine, createAutomationEngine, type AutomationStatus } from "@/services/automation";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface AutomationSession {
  id: string;
  user_id: string;
  account_id: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  runtime_seconds: number | null;
  error_message: string | null;
  metadata: Json | null;
  created_at: string;
}

export function useAutomation() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AutomationStatus>("IDLE");
  const [currentSession, setCurrentSession] = useState<AutomationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const engineRef = useRef<AutomationEngine | null>(null);

  useEffect(() => {
    if (!user) return;

    const initEngine = async () => {
      try {
        const engine = createAutomationEngine(user.id);
        
        engine.setStatusChangeCallback((newStatus) => {
          setStatus(newStatus);
        });

        engine.setSessionUpdateCallback((session) => {
          setCurrentSession(session as AutomationSession);
        });

        await engine.initialize();
        engineRef.current = engine;
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize automation engine:", error);
        toast.error("Failed to initialize automation engine");
      }
    };

    initEngine();

    return () => {
      engineRef.current = null;
      setIsInitialized(false);
    };
  }, [user]);

  const startAutomation = useCallback(async (accountId?: string) => {
    if (!engineRef.current) {
      toast.error("Automation engine not initialized");
      return;
    }

    setIsLoading(true);
    try {
      const session = await engineRef.current.startAutomation(accountId);
      setCurrentSession(session as AutomationSession);
      toast.success("Automation started");
    } catch (error) {
      console.error("Failed to start automation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start automation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopAutomation = useCallback(async () => {
    if (!engineRef.current) return;

    setIsLoading(true);
    try {
      await engineRef.current.stopAutomation();
      setStatus("STOPPED");
      toast.success("Automation stopped");
    } catch (error) {
      console.error("Failed to stop automation:", error);
      toast.error("Failed to stop automation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseAutomation = useCallback(async () => {
    if (!engineRef.current) return;

    setIsLoading(true);
    try {
      await engineRef.current.pauseAutomation();
      toast.success("Automation paused");
    } catch (error) {
      console.error("Failed to pause automation:", error);
      toast.error("Failed to pause automation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resumeAutomation = useCallback(async () => {
    if (!engineRef.current) return;

    setIsLoading(true);
    try {
      await engineRef.current.resumeAutomation();
      toast.success("Automation resumed");
    } catch (error) {
      console.error("Failed to resume automation:", error);
      toast.error("Failed to resume automation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceAccountSwitch = useCallback(async () => {
    if (!engineRef.current) return;

    setIsLoading(true);
    try {
      await engineRef.current.forceAccountSwitch();
      toast.success("Switching accounts...");
    } catch (error) {
      console.error("Failed to switch accounts:", error);
      toast.error("Failed to switch accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    currentSession,
    isLoading,
    isInitialized,
    startAutomation,
    stopAutomation,
    pauseAutomation,
    resumeAutomation,
    forceAccountSwitch
  };
}
