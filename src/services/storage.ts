import { supabase } from '@/integrations/supabase/client';

export const STORAGE_BUCKETS = {
  SCREENSHOTS: 'screenshots',
  COOKIE_FILES: 'cookie-files',
  EXPORTS: 'exports'
} as const;

export class StorageService {
  // Upload cookie file
  async uploadCookieFile(userId: string, accountId: string, file: File): Promise<{ path: string }> {
    const fileName = `${userId}/${accountId}/cookies_${Date.now()}.txt`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.COOKIE_FILES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Update account with cookie file path
    await supabase
      .from('accounts')
      .update({ cookie_file_path: data.path })
      .eq('id', accountId);

    return data;
  }

  // Get cookie file
  async getCookieFile(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.COOKIE_FILES)
      .download(filePath);

    if (error) throw error;
    return data;
  }

  // Delete cookie file
  async deleteCookieFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.COOKIE_FILES)
      .remove([filePath]);

    if (error) throw error;
  }

  // Upload screenshot
  async uploadScreenshot(
    sessionId: string,
    userId: string,
    imageBlob: Blob
  ): Promise<{ storage: { path: string }; record: Record<string, unknown> }> {
    const fileName = `${userId}/${sessionId}/screenshot_${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.SCREENSHOTS)
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Record screenshot in database
    const { data: screenshotRecord, error: recordError } = await supabase
      .from('screenshots')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          file_path: data.path,
          file_size: imageBlob.size
        }
      ])
      .select()
      .single();

    if (recordError) throw recordError;

    return {
      storage: data,
      record: screenshotRecord
    };
  }

  // Get screenshot signed URL
  async getScreenshotUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.SCREENSHOTS)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  // Get latest screenshot for session
  async getLatestScreenshot(sessionId: string): Promise<{ url: string; created_at: string; file_path: string } | null> {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const signedUrl = await this.getScreenshotUrl(data.file_path);
      return {
        ...data,
        url: signedUrl
      };
    }

    return null;
  }

  // Export logs to file and get download URL
  async exportLogs(userId: string, logs: unknown[]): Promise<string> {
    const fileName = `${userId}/logs_export_${Date.now()}.json`;
    const logsBlob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    });

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.EXPORTS)
      .upload(fileName, logsBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKETS.EXPORTS)
      .createSignedUrl(data.path, 300); // 5 minutes

    if (downloadError) throw downloadError;
    return downloadData.signedUrl;
  }

  // Clean up old files
  async cleanupOldFiles(userId: string, olderThanDays = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Clean up old screenshots from database records
    const { data: oldScreenshots } = await supabase
      .from('screenshots')
      .select('file_path')
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (oldScreenshots && oldScreenshots.length > 0) {
      const filePaths = oldScreenshots.map((s) => s.file_path);
      await supabase.storage.from(STORAGE_BUCKETS.SCREENSHOTS).remove(filePaths);
    }

    // Clean up old exports
    const { data: exports } = await supabase.storage
      .from(STORAGE_BUCKETS.EXPORTS)
      .list(`${userId}/`, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    const oldExports = exports?.filter((file) => {
      const fileDate = new Date(file.created_at);
      return fileDate < cutoffDate;
    });

    if (oldExports && oldExports.length > 0) {
      const exportPaths = oldExports.map((e) => `${userId}/${e.name}`);
      await supabase.storage.from(STORAGE_BUCKETS.EXPORTS).remove(exportPaths);
    }
  }

  // Delete all user files
  async deleteAllUserFiles(userId: string): Promise<void> {
    const buckets = Object.values(STORAGE_BUCKETS);

    for (const bucket of buckets) {
      const { data: files } = await supabase.storage.from(bucket).list(`${userId}/`);

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from(bucket).remove(filePaths);
      }
    }
  }
}

export const storageService = new StorageService();
