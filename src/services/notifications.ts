/**
 * Notification Service for PWA Push Notifications
 */

export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  data?: Record<string, any>;
  silent?: boolean;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permissionStatus: NotificationPermission = 'default';

  constructor() {
    this.checkPermission();
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permissionStatus = Notification.permission;
    }
  }

  get isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  get permission(): NotificationPermission {
    return this.permissionStatus;
  }

  get isGranted(): boolean {
    return this.permissionStatus === 'granted';
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready for notifications');
        return true;
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }

    return false;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async show(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!this.isGranted) {
      console.warn('Notification permission not granted');
      return false;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    };

    try {
      // Use service worker notification if available (works in background)
      if (this.registration) {
        await this.registration.showNotification(title, defaultOptions);
      } else {
        // Fallback to regular notification
        new Notification(title, defaultOptions);
      }
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // Agent-specific notifications
  async notifyAgentStarted(accountName: string): Promise<void> {
    await this.show('Agent Started', {
      body: `Automation started for ${accountName}`,
      tag: 'agent-status',
      data: { type: 'agent-started', account: accountName },
    });
  }

  async notifyAgentStopped(): Promise<void> {
    await this.show('Agent Stopped', {
      body: 'Automation has been stopped',
      tag: 'agent-status',
      data: { type: 'agent-stopped' },
    });
  }

  async notifyError(message: string): Promise<void> {
    await this.show('Automation Error', {
      body: message,
      tag: 'agent-error',
      requireInteraction: true,
      data: { type: 'error', message },
    });
  }

  async notifyGPUQuotaLow(): Promise<void> {
    await this.show('GPU Quota Warning', {
      body: 'GPU quota is running low. Account switch may be needed.',
      tag: 'gpu-quota',
      requireInteraction: true,
      data: { type: 'gpu-quota' },
    });
  }

  async notifyAccountSwitch(fromAccount: string, toAccount: string): Promise<void> {
    await this.show('Switching Account', {
      body: `Switching from ${fromAccount} to ${toAccount}`,
      tag: 'account-switch',
      data: { type: 'account-switch', from: fromAccount, to: toAccount },
    });
  }

  async notifyTrainingComplete(sessionMinutes: number): Promise<void> {
    await this.show('Training Complete', {
      body: `Session completed after ${sessionMinutes} minutes`,
      tag: 'training-complete',
      data: { type: 'training-complete', duration: sessionMinutes },
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();

export default notificationService;
