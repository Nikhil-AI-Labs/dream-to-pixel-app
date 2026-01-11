import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GPUStatus } from '@/types/agent';

interface GPUStatusMeterProps {
  gpuStatus?: GPUStatus | null;
  className?: string;
}

const GPUStatusMeter = ({ gpuStatus, className }: GPUStatusMeterProps) => {
  if (!gpuStatus) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="w-4 h-4" />
            <span className="text-sm">GPU status unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = Math.min((gpuStatus.used / gpuStatus.limit) * 100, 100);
  const isWarning = usagePercent > 70;
  const isCritical = usagePercent > 90;

  return (
    <Card
      className={cn(
        'border-border bg-card transition-colors',
        isCritical && 'border-destructive/50',
        isWarning && !isCritical && 'border-amber/50',
        className
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Cpu
              className={cn(
                'w-4 h-4',
                isCritical ? 'text-destructive' : isWarning ? 'text-amber' : 'text-primary'
              )}
            />
            <span className="text-sm font-medium">GPU Quota</span>
          </div>
          
          <div className="flex items-center gap-2">
            {(isWarning || isCritical) && (
              <AlertTriangle
                className={cn(
                  'w-4 h-4',
                  isCritical ? 'text-destructive' : 'text-amber'
                )}
              />
            )}
            <span
              className={cn(
                'text-sm font-mono font-semibold',
                isCritical ? 'text-destructive' : isWarning ? 'text-amber' : 'text-neon'
              )}
            >
              {gpuStatus.used}h / {gpuStatus.limit}h
            </span>
          </div>
        </div>

        <Progress
          value={usagePercent}
          className={cn(
            'h-2',
            isCritical && '[&>div]:bg-destructive',
            isWarning && !isCritical && '[&>div]:bg-amber',
            !isWarning && '[&>div]:bg-neon'
          )}
        />

        {gpuStatus.quotaResetAt && (
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            Resets: {gpuStatus.quotaResetAt.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GPUStatusMeter;
