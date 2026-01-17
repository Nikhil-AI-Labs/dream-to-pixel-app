import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Wifi, WifiOff, Database, Radio, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

const ConnectionStatus = ({ className, showDetails = false }: ConnectionStatusProps) => {
  const { isOnline, isRealtimeConnected, isDatabaseConnected, isFullyConnected } = useConnectionStatus();

  const getStatusIcon = () => {
    if (isFullyConnected) {
      return <Wifi className="w-4 h-4 text-neon" />;
    }
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-destructive" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber" />;
  };

  const getStatusText = () => {
    if (isFullyConnected) return 'Connected';
    if (!isOnline) return 'Offline';
    if (!isDatabaseConnected) return 'Database disconnected';
    if (!isRealtimeConnected) return 'Realtime disconnected';
    return 'Partial connection';
  };

  if (showDetails) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <Check className="w-4 h-4 text-neon" />
          ) : (
            <WifiOff className="w-4 h-4 text-destructive" />
          )}
          <span className={isOnline ? 'text-neon' : 'text-destructive'}>
            Internet: {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isDatabaseConnected ? (
            <Database className="w-4 h-4 text-neon" />
          ) : (
            <Database className="w-4 h-4 text-destructive" />
          )}
          <span className={isDatabaseConnected ? 'text-neon' : 'text-destructive'}>
            Database: {isDatabaseConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isRealtimeConnected ? (
            <Radio className="w-4 h-4 text-neon" />
          ) : (
            <Radio className="w-4 h-4 text-destructive" />
          )}
          <span className={isRealtimeConnected ? 'text-neon' : 'text-destructive'}>
            Realtime: {isRealtimeConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1.5 cursor-help', className)}>
            {getStatusIcon()}
            <span className={cn(
              'text-xs font-medium',
              isFullyConnected ? 'text-neon' : !isOnline ? 'text-destructive' : 'text-amber'
            )}>
              {getStatusText()}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              {isOnline ? <Check className="w-3 h-3 text-neon" /> : <WifiOff className="w-3 h-3 text-destructive" />}
              <span>Internet</span>
            </div>
            <div className="flex items-center gap-2">
              {isDatabaseConnected ? <Check className="w-3 h-3 text-neon" /> : <Database className="w-3 h-3 text-destructive" />}
              <span>Database</span>
            </div>
            <div className="flex items-center gap-2">
              {isRealtimeConnected ? <Check className="w-3 h-3 text-neon" /> : <Radio className="w-3 h-3 text-destructive" />}
              <span>Realtime</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;
