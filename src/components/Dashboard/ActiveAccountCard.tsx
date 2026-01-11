import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, ExternalLink } from 'lucide-react';
import type { Account } from '@/types/agent';
import { cn } from '@/lib/utils';

interface ActiveAccountCardProps {
  account?: Account | null;
  onSwitch?: () => void;
  isLoading?: boolean;
  className?: string;
}

const ActiveAccountCard = ({ account, onSwitch, isLoading, className }: ActiveAccountCardProps) => {
  if (!account) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">No Active Account</p>
              <p className="text-xs text-muted-foreground">
                Configure accounts to start automation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {account.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {account.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {account.notebookUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a
                  href={account.notebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitch}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              Switch
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Priority</span>
            <span className="text-amber font-mono">#{account.priority}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveAccountCard;
