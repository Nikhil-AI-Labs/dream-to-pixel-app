import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogEntry, LogLevel } from '@/types/agent';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface LogPreviewProps {
  logs?: LogEntry[];
  maxEntries?: number;
  className?: string;
}

const levelColors: Record<LogLevel, string> = {
  ACTIONS: 'text-primary',
  VISION: 'text-cyan',
  ALERTS: 'text-amber',
  ERROR: 'text-destructive',
  INFO: 'text-muted-foreground',
};

const LogPreview = ({ logs = [], maxEntries = 5, className }: LogPreviewProps) => {
  const navigate = useNavigate();
  const displayLogs = logs.slice(0, maxEntries);

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-mono font-medium text-primary flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Recent Logs
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => navigate('/logs')}
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-48 overflow-y-auto">
          {displayLogs.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No logs yet. Start automation to see activity.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-3 py-2 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        'text-xs font-mono font-medium flex-shrink-0 w-14',
                        levelColors[log.level]
                      )}
                    >
                      [{log.level}]
                    </span>
                    <p className="text-xs text-foreground font-code flex-1 truncate">
                      {log.message}
                    </p>
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground font-mono pl-16">
                    {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogPreview;
