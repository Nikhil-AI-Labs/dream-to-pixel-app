import { useState, useEffect, useCallback } from 'react';

export interface OfflineStatusResult {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
  connectionType: string | null;
}

export const useOfflineStatus = (): OfflineStatusResult => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  const updateConnectionType = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection?.effectiveType || null);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      updateConnectionType();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      updateConnectionType();
    };

    // Initial connection type
    updateConnectionType();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (mobile networks)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateConnectionType);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateConnectionType);
      }
    };
  }, [updateConnectionType]);

  return { isOnline, wasOffline, lastOnline, connectionType };
};

export default useOfflineStatus;
