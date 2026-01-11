import { Card, CardContent } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';
import RuntimeTimer from './RuntimeTimer';
import type { AgentStatus } from '@/types/agent';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  status: AgentStatus;
  startTime?: Date | null;
  className?: string;
}

const statusMessages: Record<AgentStatus, string> = {
  IDLE: 'Agent is idle. Start automation to begin.',
  RUNNING: 'Automation is active and running.',
  SWITCHING_ACCOUNTS: 'Switching to next account in queue.',
  PAUSED: 'Automation is paused.',
  ERROR: 'An error occurred. Check logs for details.',
};

const StatusCard = ({ status, startTime, className }: StatusCardProps) => {
  const isRunning = status === 'RUNNING' || status === 'SWITCHING_ACCOUNTS';

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border bg-card transition-all duration-300',
        status === 'RUNNING' && 'border-neon/30 glow-neon',
        status === 'ERROR' && 'border-destructive/30',
        status === 'SWITCHING_ACCOUNTS' && 'border-amber/30 glow-amber',
        className
      )}
    >
      {/* Scan line effect for running state */}
      {isRunning && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-primary/10 to-transparent animate-scan" />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <StatusIndicator status={status} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="font-mono font-semibold text-primary text-sm uppercase tracking-wide">
                Agent Status
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {statusMessages[status]}
              </p>
            </div>
          </div>

          <RuntimeTimer
            startTime={startTime}
            isRunning={isRunning}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
