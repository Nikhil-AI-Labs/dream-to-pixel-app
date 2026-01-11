import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/agent';
import { Activity, Pause, AlertTriangle, RefreshCw, Power } from 'lucide-react';

interface StatusIndicatorProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig: Record<AgentStatus, {
  label: string;
  color: string;
  bgColor: string;
  pulseClass: string;
  icon: typeof Activity;
}> = {
  IDLE: {
    label: 'Idle',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    pulseClass: '',
    icon: Power,
  },
  RUNNING: {
    label: 'Running',
    color: 'text-neon',
    bgColor: 'bg-neon/20',
    pulseClass: 'pulse-neon',
    icon: Activity,
  },
  SWITCHING_ACCOUNTS: {
    label: 'Switching',
    color: 'text-amber',
    bgColor: 'bg-amber/20',
    pulseClass: 'pulse-amber',
    icon: RefreshCw,
  },
  PAUSED: {
    label: 'Paused',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    pulseClass: 'pulse-electric',
    icon: Pause,
  },
  ERROR: {
    label: 'Error',
    color: 'text-destructive',
    bgColor: 'bg-destructive/20',
    pulseClass: '',
    icon: AlertTriangle,
  },
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const StatusIndicator = ({ status, size = 'md', showLabel = false }: StatusIndicatorProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          config.bgColor,
          config.pulseClass,
          size === 'sm' && 'w-4 h-4',
          size === 'md' && 'w-6 h-6',
          size === 'lg' && 'w-8 h-8'
        )}
      >
        <div
          className={cn(
            'rounded-full',
            config.bgColor,
            sizeClasses[size]
          )}
        />
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <Icon className={cn('w-4 h-4', config.color)} />
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
