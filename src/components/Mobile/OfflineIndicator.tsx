import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useEffect, useState } from 'react';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator = ({ className }: OfflineIndicatorProps) => {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Show "reconnected" message briefly when coming back online
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Don't show anything if online and not recently reconnected
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
        isOnline ? 'bg-neon/90' : 'bg-destructive/90',
        className
      )}
    >
      <div className="safe-top">
        <div className="flex items-center justify-center gap-2 py-2 px-4">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-background" />
              <span className="text-sm font-medium text-background">
                Back online
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-destructive-foreground animate-pulse" />
              <span className="text-sm font-medium text-destructive-foreground">
                You're offline
              </span>
              <AlertTriangle className="w-4 h-4 text-destructive-foreground ml-1" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
