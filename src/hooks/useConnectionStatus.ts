import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatus {
  isOnline: boolean;
  isRealtimeConnected: boolean;
  isDatabaseConnected: boolean;
  isFullyConnected: boolean;
}

export const useConnectionStatus = (): ConnectionStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);

  const testDatabaseConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      setIsDatabaseConnected(!error);
    } catch {
      setIsDatabaseConnected(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor realtime connection
    const channel = supabase.channel('connection_test');

    channel
      .on('presence', { event: 'sync' }, () => {
        setIsRealtimeConnected(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsRealtimeConnected(false);
      })
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    // Test database connection periodically
    testDatabaseConnection();
    const dbTestInterval = setInterval(testDatabaseConnection, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      channel.unsubscribe();
      clearInterval(dbTestInterval);
    };
  }, [testDatabaseConnection]);

  return {
    isOnline,
    isRealtimeConnected,
    isDatabaseConnected,
    isFullyConnected: isOnline && isRealtimeConnected && isDatabaseConnected
  };
};
