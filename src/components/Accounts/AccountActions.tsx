import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, TestTube, ExternalLink } from 'lucide-react';

interface AccountActionsProps {
  accountId: string;
  notebookUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  isTestLoading?: boolean;
}

const AccountActions = ({
  notebookUrl,
  onEdit,
  onDelete,
  onTest,
  isTestLoading,
}: AccountActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {notebookUrl && (
          <DropdownMenuItem asChild>
            <a
              href={notebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Notebook
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onTest} disabled={isTestLoading}>
          <TestTube className="w-4 h-4 mr-2" />
          {isTestLoading ? 'Testing...' : 'Test Connection'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountActions;
