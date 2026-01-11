import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import AccountForm from '@/components/Accounts/AccountForm';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createAccount, accounts } = useAccounts();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    notebookUrl: string;
    priority: number;
    cookieFile?: File | null;
  }) => {
    setIsLoading(true);
    try {
      await createAccount({
        name: data.name,
        email: data.email,
        notebookUrl: data.notebookUrl,
        priority: data.priority,
        status: 'INACTIVE',
        // In real implementation, upload cookie file first and store path
        cookieFilePath: data.cookieFile?.name,
      });

      toast({
        title: 'Account created',
        description: `${data.name} has been added successfully.`,
      });

      navigate('/accounts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

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
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          totalAccounts={accounts.length}
        />
      </div>
    </MainLayout>
  );
};

export default NewAccount;
