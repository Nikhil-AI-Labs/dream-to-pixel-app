import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService, SettingsData } from '@/services/database';
import { logError, getErrorMessage } from '@/utils/errorHandler';

export interface UserSettings {
  id: string;
  user_id: string;
  api_keys: Record<string, string>;
  automation_config: {
    headlessMode: boolean;
    retryAttempts: number;
    timeoutDuration: number;
    screenshotInterval: number;
  };
  notification_config: {
    pushEnabled: boolean;
    errorAlerts: boolean;
    successAlerts: boolean;
    quotaWarnings: boolean;
  };
  ui_config: {
    theme: string;
    autoScroll: boolean;
    compactMode: boolean;
  };
  created_at: string;
  updated_at: string;
}

const defaultSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  api_keys: {},
  automation_config: {
    headlessMode: true,
    retryAttempts: 3,
    timeoutDuration: 30000,
    screenshotInterval: 5000,
  },
  notification_config: {
    pushEnabled: true,
    errorAlerts: true,
    successAlerts: true,
    quotaWarnings: true,
  },
  ui_config: {
    theme: 'dark',
    autoScroll: true,
    compactMode: false,
  },
};

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getUserSettings(user.id);
      setSettings(data as UserSettings);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'loadSettings',
        userId: user.id,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (settingsUpdate: Partial<SettingsData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setSaving(true);
      setError(null);
      const updatedSettings = await DatabaseService.updateUserSettings(user.id, settingsUpdate);
      setSettings(updatedSettings as UserSettings);
      return updatedSettings;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      logError(err instanceof Error ? err : new Error(message), {
        action: 'updateSettings',
        userId: user.id,
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  const updateApiKeys = useCallback(async (apiKeys: Record<string, string>) => {
    return updateSettings({ api_keys: apiKeys });
  }, [updateSettings]);

  const updateAutomationConfig = useCallback(async (config: Partial<UserSettings['automation_config']>) => {
    if (!settings) return;
    return updateSettings({
      automation_config: { ...settings.automation_config, ...config },
    });
  }, [settings, updateSettings]);

  const updateNotificationConfig = useCallback(async (config: Partial<UserSettings['notification_config']>) => {
    if (!settings) return;
    return updateSettings({
      notification_config: { ...settings.notification_config, ...config },
    });
  }, [settings, updateSettings]);

  const updateUIConfig = useCallback(async (config: Partial<UserSettings['ui_config']>) => {
    if (!settings) return;
    return updateSettings({
      ui_config: { ...settings.ui_config, ...config },
    });
  }, [settings, updateSettings]);

  const resetSettings = useCallback(async () => {
    return updateSettings(defaultSettings);
  }, [updateSettings]);

  const exportSettings = useCallback(() => {
    if (!settings) return;
    
    const exportData = {
      automation_config: settings.automation_config,
      notification_config: settings.notification_config,
      ui_config: settings.ui_config,
      // Exclude api_keys for security
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forger-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          await updateSettings({
            automation_config: imported.automation_config,
            notification_config: imported.notification_config,
            ui_config: imported.ui_config,
          });
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, [updateSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    updateApiKeys,
    updateAutomationConfig,
    updateNotificationConfig,
    updateUIConfig,
    resetSettings,
    exportSettings,
    importSettings,
    refetch: loadSettings,
  };
};
