import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService, AccountData } from '@/services/database';
import { logError, getErrorMessage } from '@/utils/errorHandler';
import type { Account } from '@/types/agent';

export { type Account } from '@/types/agent';

export const useAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getUserAccounts(user.id);
      setAccounts(data as Account[]);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), { 
        action: 'loadAccounts', 
        userId: user.id 
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const createAccount = useCallback(async (accountData: Omit<AccountData, 'priority'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const newAccount = await DatabaseService.createAccount(user.id, accountData);
      setAccounts(prev => [...prev, newAccount as Account]);
      return newAccount;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), { 
        action: 'createAccount', 
        userId: user.id 
      });
      throw err;
    }
  }, [user]);

  const updateAccount = useCallback(async (accountId: string, updates: Partial<AccountData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const updatedAccount = await DatabaseService.updateAccount(accountId, updates);
      setAccounts(prev =>
        prev.map(acc => acc.id === accountId ? updatedAccount as Account : acc)
      );
      return updatedAccount;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), { 
        action: 'updateAccount', 
        userId: user.id,
        accountId 
      });
      throw err;
    }
  }, [user]);

  const deleteAccount = useCallback(async (accountId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      await DatabaseService.deleteAccount(accountId);
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), { 
        action: 'deleteAccount', 
        userId: user.id,
        accountId 
      });
      throw err;
    }
  }, [user]);

  const reorderAccounts = useCallback(async (reorderedAccounts: Account[]) => {
    if (!user) throw new Error('User not authenticated');

    const accountIds = reorderedAccounts.map(acc => acc.id);
    const previousAccounts = [...accounts];

    // Optimistically update UI
    const updatedAccounts = reorderedAccounts.map((acc, index) => ({
      ...acc,
      priority: index + 1,
    }));
    setAccounts(updatedAccounts);

    try {
      setError(null);
      await DatabaseService.reorderAccounts(user.id, accountIds);
    } catch (err) {
      // Rollback on error
      setAccounts(previousAccounts);
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), { 
        action: 'reorderAccounts', 
        userId: user.id 
      });
      throw err;
    }
  }, [user, accounts]);

  const testAccount = useCallback(async (accountId: string): Promise<boolean> => {
    // This will be implemented when we add the automation backend
    // For now, simulate a test
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.3;
  }, []);

  const getAccountById = useCallback(
    (id: string) => accounts.find(acc => acc.id === id),
    [accounts]
  );

  return {
    accounts,
    loading,
    error,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    reorderAccounts,
    testAccount,
    getAccountById,
    refetch: loadAccounts,
  };
};
