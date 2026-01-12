export interface AutomationConfig {
  headlessMode: boolean;
  retryAttempts: number;
  timeoutDuration: number;
  screenshotInterval: number;
}

export interface NotificationConfig {
  pushEnabled: boolean;
  errorAlerts: boolean;
  successAlerts: boolean;
  quotaWarnings: boolean;
}

export interface UIConfig {
  theme: 'dark' | 'light' | 'system';
  autoScroll: boolean;
  compactMode: boolean;
}

export interface UserSettings {
  automation: AutomationConfig;
  notifications: NotificationConfig;
  ui: UIConfig;
}

export const defaultSettings: UserSettings = {
  automation: {
    headlessMode: true,
    retryAttempts: 3,
    timeoutDuration: 30000,
    screenshotInterval: 5000,
  },
  notifications: {
    pushEnabled: true,
    errorAlerts: true,
    successAlerts: true,
    quotaWarnings: true,
  },
  ui: {
    theme: 'dark',
    autoScroll: true,
    compactMode: false,
  },
};
