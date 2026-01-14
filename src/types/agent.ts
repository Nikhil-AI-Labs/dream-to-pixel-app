export type AgentStatus = 'IDLE' | 'RUNNING' | 'SWITCHING_ACCOUNTS' | 'ERROR' | 'PAUSED';

export type LogLevel = 'ACTIONS' | 'VISION' | 'ALERTS' | 'ERROR' | 'INFO';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

// Database-aligned Account interface (snake_case from Supabase)
export interface Account {
  id: string;
  user_id: string;
  name: string;
  email: string;
  notebook_url: string;
  priority: number;
  status: string;
  cookie_file_path: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Helper type for forms (camelCase for UI)
export interface AccountFormData {
  name: string;
  email: string;
  notebookUrl: string;
  priority: number;
  cookieFile?: File | null;
}

export interface AutomationSession {
  id: string;
  user_id: string;
  account_id: string | null;
  status: AgentStatus | string;
  started_at: string | null;
  ended_at: string | null;
  runtime_seconds: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GPUStatus {
  used: number;
  limit: number;
  quotaResetAt?: Date;
}
