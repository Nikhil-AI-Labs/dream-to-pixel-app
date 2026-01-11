import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '@/types/agent';
import StatusBadge from './StatusBadge';
import AccountActions from './AccountActions';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AccountCardProps {
  account: Account;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  isTestLoading?: boolean;
  isDragging?: boolean;
}

const AccountCard = ({
  account,
  onEdit,
  onDelete,
  onTest,
  isTestLoading,
}: AccountCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-border bg-card transition-all duration-200',
        isDragging && 'opacity-50 shadow-lg shadow-primary/20 z-50',
        'hover:border-primary/30'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 rounded hover:bg-secondary cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">
                {account.name}
              </h3>
              <StatusBadge status={account.status} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {account.email}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-amber font-mono">
                Priority #{account.priority}
              </span>
              {account.lastLogin && (
                <span className="text-xs text-muted-foreground">
                  Last login: {account.lastLogin.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <AccountActions
            accountId={account.id}
            notebookUrl={account.notebookUrl}
            onEdit={() => onEdit(account.id)}
            onDelete={() => onDelete(account.id)}
            onTest={() => onTest(account.id)}
            isTestLoading={isTestLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
