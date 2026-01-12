import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DangerAction {
  id: string;
  label: string;
  description: string;
  confirmText: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
}

interface DangerZoneProps {
  actions: DangerAction[];
  className?: string;
}

const DangerZone = ({ actions, className }: DangerZoneProps) => {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  return (
    <div className={cn('border border-destructive/30 rounded-lg p-4 bg-destructive/5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-mono text-destructive">Danger Zone</h3>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>

            <AlertDialog
              open={openDialogId === action.id}
              onOpenChange={(open) => setOpenDialogId(open ? action.id : null)}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  {action.icon || <Trash2 size={14} />}
                  {action.label}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {action.confirmText}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      action.onConfirm();
                      setOpenDialogId(null);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DangerZone;

export { Trash2, RotateCcw };
