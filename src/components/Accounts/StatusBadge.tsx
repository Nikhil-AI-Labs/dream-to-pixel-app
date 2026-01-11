import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Account } from '@/types/agent';

interface StatusBadgeProps {
  status: Account['status'];
  className?: string;
}

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-neon/20 text-neon border-neon/30 hover:bg-neon/30',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  },
  ERROR: {
    label: 'Error',
    className: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-mono', config.className, className)}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
