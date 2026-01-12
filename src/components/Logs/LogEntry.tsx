import { formatDistanceToNow } from 'date-fns';
import { LogEntry as LogEntryType, LogLevel } from '@/types/agent';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const levelColors: Record<LogLevel, string> = {
  ACTIONS: 'text-primary',
  VISION: 'text-cyan-400',
  ALERTS: 'text-amber-400',
  ERROR: 'text-destructive',
  INFO: 'text-muted-foreground',
};

const levelBgColors: Record<LogLevel, string> = {
  ACTIONS: 'bg-primary/10',
  VISION: 'bg-cyan-400/10',
  ALERTS: 'bg-amber-400/10',
  ERROR: 'bg-destructive/10',
  INFO: 'bg-muted/10',
};

interface LogEntryProps {
  log: LogEntryType;
  compact?: boolean;
}

const LogEntryComponent = ({ log, compact = false }: LogEntryProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-2 px-3 hover:bg-secondary/50 transition-colors border-b border-border/50',
        compact && 'py-1.5'
      )}
    >
      {/* Level badge */}
      <span
        className={cn(
          'text-xs font-mono px-1.5 py-0.5 rounded shrink-0',
          levelColors[log.level],
          levelBgColors[log.level]
        )}
      >
        [{log.level}]
      </span>

      {/* Timestamp */}
      <span className="text-xs text-muted-foreground font-mono min-w-[70px] shrink-0">
        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {hasMetadata && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-mono break-words">
              {log.message}
            </p>
            {log.source && (
              <span className="text-xs text-muted-foreground">
                [{log.source}]
              </span>
            )}
          </div>
        </div>

        {/* Metadata */}
        {expanded && hasMetadata && (
          <pre className="text-xs text-muted-foreground mt-2 p-2 bg-card rounded border border-border overflow-x-auto font-mono">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LogEntryComponent;
