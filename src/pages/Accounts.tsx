import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import DraggableAccountList from '@/components/Accounts/DraggableAccountList';
import EmptyState from '@/components/Accounts/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const Accounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    accounts,
    loading,
    loadAccounts,
    deleteAccount,
    reorderAccounts,
    testAccount,
  } = useAccounts();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleEdit = (id: string) => {
    navigate(`/accounts/${id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteAccount(deleteId);
      toast({
        title: 'Account deleted',
        description: 'The account has been removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const success = await testAccount(id);
      toast({
        title: success ? 'Connection successful' : 'Connection failed',
        description: success
          ? 'The account cookie is valid.'
          : 'Could not authenticate with this account.',
        variant: success ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test account connection.',
        variant: 'destructive',
      });
    } finally {
      setTestingId(null);
    }
  };

  const accountToDelete = accounts.find((a) => a.id === deleteId);

  return (
    <MainLayout>
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-mono font-bold text-primary">Accounts</h1>
            {accounts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {accounts.length} account{accounts.length !== 1 ? 's' : ''} configured
              </p>
            )}
          </div>
          <Button onClick={() => navigate('/accounts/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : accounts.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground">
              Drag accounts to reorder priority
            </p>
            <DraggableAccountList
              accounts={accounts}
              onReorder={reorderAccounts}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onTest={handleTest}
              testingAccountId={testingId}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                {accountToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Accounts;
