import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RuntimeTimerProps {
  startTime?: Date | null;
  isRunning?: boolean;
  className?: string;
}

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const RuntimeTimer = ({ startTime, isRunning = false, className }: RuntimeTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!startTime || !isRunning) {
      if (!isRunning) setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border',
        isRunning && 'border-neon/30 bg-neon/5',
        className
      )}
    >
      <Clock
        className={cn(
          'w-4 h-4',
          isRunning ? 'text-neon animate-pulse-glow' : 'text-muted-foreground'
        )}
      />
      <span
        className={cn(
          'font-mono text-lg font-semibold tabular-nums',
          isRunning ? 'text-neon text-glow-neon' : 'text-muted-foreground'
        )}
      >
        {formatTime(elapsedSeconds)}
      </span>
    </div>
  );
};

export default RuntimeTimer;
