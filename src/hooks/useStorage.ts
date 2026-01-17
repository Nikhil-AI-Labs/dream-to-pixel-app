import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/services/storage';

export const useStorage = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadCookieFile = useCallback(async (accountId: string, file: File) => {
    if (!user) throw new Error('User not authenticated');

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress since Supabase doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await storageService.uploadCookieFile(user.id, accountId, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const deleteCookieFile = useCallback(async (filePath: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await storageService.deleteCookieFile(filePath);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      throw err;
    }
  }, [user]);

  const exportLogs = useCallback(async (logs: unknown[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const downloadUrl = await storageService.exportLogs(user.id, logs);
      return downloadUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setError(message);
      throw err;
    }
  }, [user]);

  const cleanupOldFiles = useCallback(async (olderThanDays = 30) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await storageService.cleanupOldFiles(user.id, olderThanDays);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cleanup failed';
      setError(message);
      throw err;
    }
  }, [user]);

  return {
    uploadCookieFile,
    deleteCookieFile,
    exportLogs,
    cleanupOldFiles,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null)
  };
};
