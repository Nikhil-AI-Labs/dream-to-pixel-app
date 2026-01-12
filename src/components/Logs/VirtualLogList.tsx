import { List, ListImperativeAPI, RowComponentProps } from 'react-window';
import { LogEntry } from '@/types/agent';
import LogEntryComponent from './LogEntry';
import { useRef, useEffect, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface VirtualLogListProps {
  logs: LogEntry[];
  height?: number;
  autoScroll?: boolean;
  compact?: boolean;
  className?: string;
}

interface RowProps {
  logs: LogEntry[];
  compact: boolean;
}

const Row = ({ 
  index, 
  style, 
  logs, 
  compact 
}: { 
  index: number; 
  style: CSSProperties;
  logs: LogEntry[];
  compact: boolean;
} & Partial<RowComponentProps>) => (
  <div style={style}>
    <LogEntryComponent log={logs[index]} compact={compact} />
  </div>
);

const VirtualLogList = ({
  logs,
  height = 400,
  autoScroll = false,
  compact = false,
  className,
}: VirtualLogListProps) => {
  const listRef = useRef<ListImperativeAPI>(null);

  // Auto-scroll to top (most recent) when new logs arrive
  useEffect(() => {
    if (autoScroll && listRef.current && logs.length > 0) {
      listRef.current.scrollToRow({ index: 0 });
    }
  }, [logs.length, autoScroll]);

  if (logs.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-muted-foreground bg-card',
          className
        )}
        style={{ height }}
      >
        <div className="text-center">
          <p className="font-mono">No logs to display</p>
          <p className="text-sm mt-1">Start automation to see logs here</p>
        </div>
      </div>
    );
  }

  return (
    <List<RowProps>
      listRef={listRef}
      rowCount={logs.length}
      rowHeight={compact ? 48 : 64}
      rowProps={{ logs, compact }}
      rowComponent={Row}
      className={cn('bg-card', className)}
      style={{ height, width: '100%' }}
    />
  );
};

export default VirtualLogList;
