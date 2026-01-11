import { useState, useCallback } from 'react';
import type { Account } from '@/types/agent';

// Mock initial accounts for demo
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Training Account 1',
    email: 'ml-training-1@example.com',
    notebookUrl: 'https://colab.research.google.com/drive/example1',
    priority: 1,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Training Account 2',
    email: 'ml-training-2@example.com',
    notebookUrl: 'https://colab.research.google.com/drive/example2',
    priority: 2,
    status: 'INACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      // Will be replaced with Supabase call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAccounts(mockAccounts);
      setError(null);
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newAccount: Account = {
        ...data,
        id: crypto.randomUUID(),
        priority: accounts.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAccounts((prev) => [...prev, newAccount]);
      setError(null);
      return newAccount;
    } catch (err) {
      setError('Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accounts.length]);

  const updateAccount = useCallback(async (id: string, data: Partial<Account>) => {
    setLoading(true);
    try {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, ...data, updatedAt: new Date() } : acc
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to update account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    setLoading(true);
    try {
      setAccounts((prev) => {
        const filtered = prev.filter((acc) => acc.id !== id);
        // Re-assign priorities
        return filtered.map((acc, index) => ({
          ...acc,
          priority: index + 1,
        }));
      });
      setError(null);
    } catch (err) {
      setError('Failed to delete account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderAccounts = useCallback(async (reorderedAccounts: Account[]) => {
    const updatedAccounts = reorderedAccounts.map((acc, index) => ({
      ...acc,
      priority: index + 1,
      updatedAt: new Date(),
    }));
    setAccounts(updatedAccounts);
  }, []);

  const testAccount = useCallback(async (id: string): Promise<boolean> => {
    // Simulate testing connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return Math.random() > 0.3; // 70% success rate for demo
  }, []);

  const getAccountById = useCallback(
    (id: string) => accounts.find((acc) => acc.id === id),
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
  };
};
