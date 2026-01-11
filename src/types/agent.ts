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

export interface Account {
  id: string;
  name: string;
  email: string;
  notebookUrl: string;
  priority: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  cookieFilePath?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationSession {
  id: string;
  accountId: string;
  status: AgentStatus;
  startedAt?: Date;
  endedAt?: Date;
  runtimeSeconds: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface GPUStatus {
  used: number;
  limit: number;
  quotaResetAt?: Date;
}
