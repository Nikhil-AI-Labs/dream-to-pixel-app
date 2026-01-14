import { supabase } from '@/integrations/supabase/client';

export interface AccountData {
  name: string;
  email: string;
  notebook_url: string;
  priority?: number;
  status?: string;
  cookie_file_path?: string;
}

export interface SettingsData {
  api_keys?: Record<string, string>;
  automation_config?: {
    headlessMode: boolean;
    retryAttempts: number;
    timeoutDuration: number;
    screenshotInterval: number;
  };
  notification_config?: {
    pushEnabled: boolean;
    errorAlerts: boolean;
    successAlerts: boolean;
    quotaWarnings: boolean;
  };
  ui_config?: {
    theme: string;
    autoScroll: boolean;
    compactMode: boolean;
  };
}

export class DatabaseService {
  // Account Operations
  static async createAccount(userId: string, accountData: AccountData) {
    const priority = accountData.priority || await this.getNextAccountPriority(userId);
    
    const { data, error } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: userId,
          name: accountData.name,
          email: accountData.email,
          notebook_url: accountData.notebook_url,
          priority,
          status: accountData.status || 'INACTIVE',
          cookie_file_path: accountData.cookie_file_path,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserAccounts(userId: string, orderBy: string = 'priority') {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order(orderBy);

    if (error) throw error;
    return data || [];
  }

  static async getAccountById(accountId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateAccount(accountId: string, updates: Partial<AccountData>) {
    const { data, error } = await supabase
      .from('accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteAccount(accountId: string) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
    return true;
  }

  static async reorderAccounts(userId: string, accountIds: string[]) {
    // Update each account's priority individually
    const promises = accountIds.map((id, index) =>
      supabase
        .from('accounts')
        .update({ priority: index + 1 })
        .eq('id', id)
        .eq('user_id', userId)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      throw errors[0].error;
    }
    
    return true;
  }

  static async getNextAccountPriority(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('accounts')
      .select('priority')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .limit(1);

    if (error) throw error;
    return (data && data.length > 0) ? data[0].priority + 1 : 1;
  }

  // Settings Operations
  static async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Create default settings if none exist
      return await this.createUserSettings(userId, {});
    }

    return data;
  }

  static async createUserSettings(userId: string, settingsData: SettingsData) {
    const defaultSettings = {
      api_keys: {},
      automation_config: {
        headlessMode: true,
        retryAttempts: 3,
        timeoutDuration: 30000,
        screenshotInterval: 5000
      },
      notification_config: {
        pushEnabled: true,
        errorAlerts: true,
        successAlerts: true,
        quotaWarnings: true
      },
      ui_config: {
        theme: 'dark',
        autoScroll: true,
        compactMode: false
      }
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert([
        {
          user_id: userId,
          ...defaultSettings,
          ...settingsData
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserSettings(userId: string, settingsUpdate: Partial<SettingsData>) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...settingsUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Automation Session Operations
  static async createAutomationSession(userId: string, accountId: string, metadata = {}) {
    const { data, error } = await supabase
      .from('automation_sessions')
      .insert([
        {
          user_id: userId,
          account_id: accountId,
          status: 'RUNNING',
          started_at: new Date().toISOString(),
          metadata
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAutomationSession(sessionId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('automation_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getActiveSession(userId: string) {
    const { data, error } = await supabase
      .from('automation_sessions')
      .select(`
        *,
        accounts (
          name,
          email,
          notebook_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'RUNNING')
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  static async getUserSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('automation_sessions')
      .select(`
        *,
        accounts (
          name,
          email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Automation Logs Operations
  static async createLog(
    userId: string,
    sessionId: string | null,
    level: string,
    message: string,
    source?: string,
    metadata = {}
  ) {
    const { data, error } = await supabase
      .from('automation_logs')
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          level,
          message,
          source,
          metadata
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSessionLogs(sessionId: string, limit = 100) {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getUserLogs(userId: string, limit = 100) {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Screenshots Operations
  static async createScreenshot(
    userId: string,
    sessionId: string,
    filePath: string,
    fileSize?: number
  ) {
    const { data, error } = await supabase
      .from('screenshots')
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          file_path: filePath,
          file_size: fileSize
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSessionScreenshots(sessionId: string) {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getLatestScreenshot(sessionId: string) {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
