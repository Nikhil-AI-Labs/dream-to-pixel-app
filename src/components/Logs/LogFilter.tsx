import { LogLevel } from '@/types/agent';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

const LOG_LEVELS: LogLevel[] = ['ACTIONS', 'VISION', 'ALERTS', 'ERROR', 'INFO'];

const levelStyles: Record<LogLevel, { active: string; inactive: string }> = {
  ACTIONS: {
    active: 'bg-primary text-primary-foreground',
    inactive: 'bg-secondary text-muted-foreground hover:bg-secondary/80',
  },
  VISION: {
    active: 'bg-cyan-500 text-white',
    inactive: 'bg-secondary text-muted-foreground hover:bg-secondary/80',
  },
  ALERTS: {
    active: 'bg-amber-500 text-white',
    inactive: 'bg-secondary text-muted-foreground hover:bg-secondary/80',
  },
  ERROR: {
    active: 'bg-destructive text-destructive-foreground',
    inactive: 'bg-secondary text-muted-foreground hover:bg-secondary/80',
  },
  INFO: {
    active: 'bg-muted-foreground text-background',
    inactive: 'bg-secondary text-muted-foreground hover:bg-secondary/80',
  },
};

interface LogFilterProps {
  activeFilters: LogLevel[];
  searchTerm: string;
  onFilterChange: (level: LogLevel) => void;
  onSearchChange: (term: string) => void;
  onClear: () => void;
}

const LogFilter = ({
  activeFilters,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onClear,
}: LogFilterProps) => {
  return (
    <div className="bg-card p-4 border-b border-border space-y-3">
      {/* Level filters */}
      <div className="flex flex-wrap gap-2">
        {LOG_LEVELS.map((level) => {
          const isActive = activeFilters.includes(level);
          const styles = levelStyles[level];

          return (
            <button
              key={level}
              onClick={() => onFilterChange(level)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-mono transition-colors',
                isActive ? styles.active : styles.inactive
              )}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Search and clear */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        {(activeFilters.length > 0 || searchTerm) && (
          <Button variant="outline" size="icon" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LogFilter;
