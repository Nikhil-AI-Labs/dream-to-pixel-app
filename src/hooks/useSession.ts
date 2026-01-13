import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SessionInfo {
  isValid: boolean;
  expiresAt: Date | null;
  refreshed: Date | null;
  timeUntilExpiry: number | null; // in seconds
}

export const useSession = () => {
  const { session } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isValid: false,
    expiresAt: null,
    refreshed: null,
    timeUntilExpiry: null,
  });

  useEffect(() => {
    if (session) {
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const isValid = expiresAt > now;
      const timeUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

      setSessionInfo({
        isValid,
        expiresAt,
        refreshed: new Date(),
        timeUntilExpiry,
      });

      // Set up auto-refresh 5 minutes before expiry
      const refreshTime = expiresAt.getTime() - now.getTime() - (5 * 60 * 1000);

      if (refreshTime > 0) {
        const refreshTimer = setTimeout(async () => {
          try {
            console.log('Auto-refreshing session...');
            await supabase.auth.refreshSession();
          } catch (error) {
            console.error('Session refresh failed:', error);
          }
        }, refreshTime);

        return () => clearTimeout(refreshTimer);
      }
    } else {
      setSessionInfo({
        isValid: false,
        expiresAt: null,
        refreshed: null,
        timeUntilExpiry: null,
      });
    }
  }, [session]);

  // Update time until expiry every minute
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      
      setSessionInfo(prev => ({
        ...prev,
        timeUntilExpiry,
        isValid: timeUntilExpiry > 0,
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session]);

  return sessionInfo;
};
