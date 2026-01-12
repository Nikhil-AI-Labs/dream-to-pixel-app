import { useState, useEffect, useCallback } from 'react';
import { UserSettings, defaultSettings } from '@/types/settings';

const STORAGE_KEY = 'forger-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setLoading(false);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasChanges(false);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Update a specific settings section
  const updateSettings = useCallback(<K extends keyof UserSettings>(
    section: K,
    values: Partial<UserSettings[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }));
    setHasChanges(true);
  }, []);

  // Update automation config
  const updateAutomation = useCallback((key: keyof UserSettings['automation'], value: boolean | number) => {
    updateSettings('automation', { [key]: value });
  }, [updateSettings]);

  // Update notification config
  const updateNotifications = useCallback((key: keyof UserSettings['notifications'], value: boolean) => {
    updateSettings('notifications', { [key]: value });
  }, [updateSettings]);

  // Update UI config
  const updateUI = useCallback((key: keyof UserSettings['ui'], value: string | boolean) => {
    updateSettings('ui', { [key]: value });
  }, [updateSettings]);

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    setHasChanges(false);
  }, []);

  // Export settings
  const exportSettings = useCallback(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forger-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [settings]);

  // Import settings
  const importSettings = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...defaultSettings, ...imported });
          setHasChanges(true);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, []);

  return {
    settings,
    loading,
    saving,
    hasChanges,
    saveSettings,
    updateSettings,
    updateAutomation,
    updateNotifications,
    updateUI,
    resetSettings,
    exportSettings,
    importSettings,
  };
};
