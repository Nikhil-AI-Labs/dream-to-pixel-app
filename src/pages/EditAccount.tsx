import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import AccountForm from '@/components/Accounts/AccountForm';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from 'lucide-react';
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

const EditAccount = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accounts, updateAccount, deleteAccount, getAccountById } = useAccounts();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const account = id ? getAccountById(id) : null;

  useEffect(() => {
    if (!account && accounts.length > 0) {
      navigate('/accounts');
    }
  }, [account, accounts.length, navigate]);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    notebookUrl: string;
    priority: number;
    cookieFile?: File | null;
  }) => {
    if (!id) return;

    setIsLoading(true);
    try {
      await updateAccount(id, {
        name: data.name,
        email: data.email,
        notebook_url: data.notebookUrl,
        priority: data.priority,
        // Update cookie file path if new file uploaded
        ...(data.cookieFile && { cookie_file_path: data.cookieFile.name }),
      });

      toast({
        title: 'Account updated',
        description: 'Changes have been saved successfully.',
      });

      navigate('/accounts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteAccount(id);
      toast({
        title: 'Account deleted',
        description: 'The account has been removed.',
      });
      navigate('/accounts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  if (!account) {
    return (
      <MainLayout>
        <div className="p-4 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/accounts')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts
        </Button>

        {/* Form */}
        <AccountForm
          account={account}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          totalAccounts={accounts.length}
        />

        {/* Account Activity (placeholder) */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-muted-foreground">
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="font-mono">
                  {formatDate(account.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="font-mono">
                  {formatDate(account.updated_at)}
                </span>
              </div>
              {account.last_login && (
                <div className="flex justify-between">
                  <span>Last Login</span>
                  <span className="font-mono">
                    {formatDate(account.last_login)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete this account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">{account.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default EditAccount;
