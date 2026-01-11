import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/agent';

interface QuickActionsProps {
  status: AgentStatus;
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onForceSwitch?: () => void;
  isLoading?: boolean;
  className?: string;
}

const QuickActions = ({
  status,
  onStart,
  onStop,
  onPause,
  onResume,
  onForceSwitch,
  isLoading,
  className,
}: QuickActionsProps) => {
  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isSwitching = status === 'SWITCHING_ACCOUNTS';
  const canStart = status === 'IDLE' || status === 'ERROR';

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {/* Start Button */}
      {canStart && (
        <Button
          onClick={onStart}
          disabled={isLoading}
          className="flex-1 min-w-[120px] bg-neon hover:bg-neon/90 text-background font-semibold gap-2"
          size="lg"
        >
          <Play className="w-5 h-5" />
          Start Agent
        </Button>
      )}

      {/* Pause/Resume Button */}
      {(isRunning || isPaused) && (
        <Button
          onClick={isPaused ? onResume : onPause}
          disabled={isLoading || isSwitching}
          variant="outline"
          className={cn(
            'flex-1 min-w-[100px] gap-2',
            isPaused && 'border-neon/50 text-neon hover:bg-neon/10'
          )}
          size="lg"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </Button>
      )}

      {/* Stop Button */}
      {(isRunning || isPaused || isSwitching) && (
        <Button
          onClick={onStop}
          disabled={isLoading}
          variant="destructive"
          className="flex-1 min-w-[100px] gap-2"
          size="lg"
        >
          <StopCircle className="w-4 h-4" />
          Stop
        </Button>
      )}

      {/* Force Switch Button */}
      {(isRunning || isPaused) && (
        <Button
          onClick={onForceSwitch}
          disabled={isLoading || isSwitching}
          variant="outline"
          className="gap-2 border-amber/50 text-amber hover:bg-amber/10"
          size="lg"
        >
          <RefreshCw className={cn('w-4 h-4', isSwitching && 'animate-spin')} />
          Switch Account
        </Button>
      )}
    </div>
  );
};

export default QuickActions;
