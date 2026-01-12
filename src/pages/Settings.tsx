import { useRef } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import SettingsSection from '@/components/Settings/SettingsSection';
import ToggleSwitch from '@/components/Settings/ToggleSwitch';
import NumberInput from '@/components/Settings/NumberInput';
import DangerZone, { RotateCcw, Trash2 } from '@/components/Settings/DangerZone';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Palette,
  Cog,
  Download,
  Upload,
  Save,
  Loader2,
  Server,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const {
    settings,
    loading,
    saving,
    hasChanges,
    saveSettings,
    updateAutomation,
    updateNotifications,
    updateUI,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const success = await saveSettings();
    if (success) {
      toast.success('Settings saved successfully');
    } else {
      toast.error('Failed to save settings');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const success = await importSettings(file);
    if (success) {
      toast.success('Settings imported successfully');
    } else {
      toast.error('Failed to import settings');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = () => {
    localStorage.clear();
    toast.success('All data cleared');
    window.location.reload();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-4 pb-24 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-mono font-bold text-primary">Settings</h1>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Backend Status Info */}
        <Alert className="border-primary/30 bg-primary/5">
          <Server className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <span className="font-semibold text-primary">Backend Managed:</span>{' '}
            API keys (OpenRouter) are configured on the backend server. No API key setup is required here.
          </AlertDescription>
        </Alert>

        {/* Automation Section */}
        <SettingsSection
          title="Automation"
          description="Configure automation behavior and timing"
          icon={Cog}
        >
          <ToggleSwitch
            label="Headless Mode"
            description="Run browser in background without visible window"
            checked={settings.automation.headlessMode}
            onChange={(checked) => updateAutomation('headlessMode', checked)}
          />
          <NumberInput
            label="Retry Attempts"
            value={settings.automation.retryAttempts}
            onChange={(value) => updateAutomation('retryAttempts', value)}
            min={1}
            max={10}
            description="Number of times to retry failed operations"
          />
          <NumberInput
            label="Timeout Duration"
            value={settings.automation.timeoutDuration}
            onChange={(value) => updateAutomation('timeoutDuration', value)}
            min={5000}
            max={120000}
            step={1000}
            unit="ms"
            description="Maximum wait time for operations"
          />
          <NumberInput
            label="Screenshot Interval"
            value={settings.automation.screenshotInterval}
            onChange={(value) => updateAutomation('screenshotInterval', value)}
            min={1000}
            max={30000}
            step={1000}
            unit="ms"
            description="Time between screenshot captures"
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          title="Notifications"
          description="Manage push notifications and alerts"
          icon={Bell}
        >
          <ToggleSwitch
            label="Push Notifications"
            description="Enable push notifications on this device"
            checked={settings.notifications.pushEnabled}
            onChange={(checked) => updateNotifications('pushEnabled', checked)}
          />
          <ToggleSwitch
            label="Error Alerts"
            description="Get notified when automation encounters errors"
            checked={settings.notifications.errorAlerts}
            onChange={(checked) => updateNotifications('errorAlerts', checked)}
          />
          <ToggleSwitch
            label="Success Alerts"
            description="Get notified when tasks complete successfully"
            checked={settings.notifications.successAlerts}
            onChange={(checked) => updateNotifications('successAlerts', checked)}
          />
          <ToggleSwitch
            label="GPU Quota Warnings"
            description="Get notified when GPU quota is running low"
            checked={settings.notifications.quotaWarnings}
            onChange={(checked) => updateNotifications('quotaWarnings', checked)}
          />
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection
          title="Appearance"
          description="Customize the app theme and display"
          icon={Palette}
        >
          <ToggleSwitch
            label="Auto-scroll Logs"
            description="Automatically scroll to latest log entries"
            checked={settings.ui.autoScroll}
            onChange={(checked) => updateUI('autoScroll', checked)}
          />
          <ToggleSwitch
            label="Compact Mode"
            description="Reduce spacing for more content on screen"
            checked={settings.ui.compactMode}
            onChange={(checked) => updateUI('compactMode', checked)}
          />
        </SettingsSection>

        {/* Import/Export Section */}
        <SettingsSection
          title="Configuration"
          description="Import or export your settings"
          icon={Download}
        >
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={exportSettings}>
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Import Settings
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <DangerZone
          actions={[
            {
              id: 'reset',
              label: 'Reset',
              description: 'Reset all settings to defaults',
              confirmText: 'This will reset all settings to their default values. Your configurations will be lost.',
              icon: <RotateCcw size={14} />,
              onConfirm: () => {
                resetSettings();
                toast.success('Settings reset to defaults');
              },
            },
            {
              id: 'clear',
              label: 'Clear All',
              description: 'Clear all app data including accounts',
              confirmText: 'This will permanently delete all your data including accounts, settings, and logs. This action cannot be undone.',
              icon: <Trash2 size={14} />,
              onConfirm: handleClearAllData,
            },
          ]}
        />
      </div>
    </MainLayout>
  );
};

export default Settings;
