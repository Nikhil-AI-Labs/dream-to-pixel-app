import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type AutomationCommand = 'START' | 'STOP' | 'PAUSE' | 'RESUME' | 'FORCE_SWITCH' | 'EMERGENCY_STOP';

interface CommandPayload {
  command: AutomationCommand;
  data: Record<string, unknown>;
  timestamp: string;
  userId: string;
}

export class RealtimeService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Subscribe to automation session updates
  subscribeToAutomationSession(
    userId: string,
    onSessionUpdate: (payload: { eventType: string; new: unknown; old: unknown }) => void
  ): RealtimeChannel {
    const channelName = `automation_sessions:user_id=eq.${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_sessions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Session update:', payload);
          onSessionUpdate(payload as { eventType: string; new: unknown; old: unknown });
        }
      )
      .subscribe((status) => {
        console.log('Session subscription status:', status);
        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
        }
      });

    this.subscriptions.set(`sessions_${userId}`, channel);
    return channel;
  }

  // Subscribe to live logs
  subscribeToLogs(
    sessionId: string,
    onLogUpdate: (log: Record<string, unknown>) => void
  ): RealtimeChannel {
    const channelName = `automation_logs:session_id=eq.${sessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_logs',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New log entry:', payload.new);
          onLogUpdate(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    this.subscriptions.set(`logs_${sessionId}`, channel);
    return channel;
  }

  // Subscribe to screenshot updates
  subscribeToScreenshots(
    sessionId: string,
    onScreenshotUpdate: (screenshot: Record<string, unknown>) => void
  ): RealtimeChannel {
    const channelName = `screenshots:session_id=eq.${sessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'screenshots',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New screenshot:', payload.new);
          onScreenshotUpdate(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    this.subscriptions.set(`screenshots_${sessionId}`, channel);
    return channel;
  }

  // Broadcast automation commands
  async sendAutomationCommand(
    userId: string,
    command: AutomationCommand,
    payload: Record<string, unknown> = {}
  ): Promise<string> {
    const channel = supabase.channel(`automation_commands:${userId}`);

    await channel.subscribe();

    const commandPayload: CommandPayload = {
      command,
      data: payload,
      timestamp: new Date().toISOString(),
      userId
    };

    const response = await channel.send({
      type: 'broadcast',
      event: 'automation_command',
      payload: commandPayload
    });

    return response;
  }

  // Listen for automation command responses
  subscribeToCommandResponses(
    userId: string,
    onCommandResponse: (payload: unknown) => void
  ): RealtimeChannel {
    const channelName = `automation_responses:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'command_response' }, (payload) => {
        console.log('Command response:', payload);
        onCommandResponse(payload);
      })
      .subscribe();

    this.subscriptions.set(`responses_${userId}`, channel);
    return channel;
  }

  // Unsubscribe from specific channel
  unsubscribe(subscriptionKey: string): void {
    const channel = this.subscriptions.get(subscriptionKey);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Connection health monitoring
  monitorConnection(): void {
    const channel = supabase.channel('connection_monitor');

    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Connection healthy');
      })
      .on('presence', { event: 'leave' }, () => {
        console.log('Connection lost, attempting reconnect...');
        this.attemptReconnect();
      })
      .subscribe();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;

    setTimeout(async () => {
      try {
        // Re-establish critical subscriptions
        const activeSubscriptions = Array.from(this.subscriptions.keys());
        for (const key of activeSubscriptions) {
          this.unsubscribe(key);
        }

        // Trigger re-subscription in components
        window.dispatchEvent(new CustomEvent('realtime-reconnect'));
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnect();
      }
    }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
  }
}

export const realtimeService = new RealtimeService();
