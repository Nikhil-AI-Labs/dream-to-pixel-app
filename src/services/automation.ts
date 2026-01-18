import { supabase } from "@/integrations/supabase/client";
import { DatabaseService } from "./database";
import { aiService, type DecisionContext, type AutomationDecision } from "./ai";
import { realtimeService } from "./realtime";
import type { Json } from "@/integrations/supabase/types";

export type AutomationStatus = "IDLE" | "RUNNING" | "PAUSED" | "STOPPED" | "ERROR" | "SWITCHING_ACCOUNTS";

interface Account {
  id: string;
  user_id: string;
  name: string;
  email: string;
  notebook_url: string;
  priority: number | null;
  status: string | null;
  cookie_file_path: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AutomationSession {
  id: string;
  user_id: string;
  account_id: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  runtime_seconds: number | null;
  error_message: string | null;
  metadata: Json | null;
  created_at: string;
}

interface AutomationConfig {
  headlessMode?: boolean;
  retryAttempts?: number;
  timeoutDuration?: number;
  screenshotInterval?: number;
}

interface UserSettings {
  automation_config?: AutomationConfig | Json;
}

export class AutomationEngine {
  private userId: string;
  private currentSession: AutomationSession | null = null;
  private isRunning = false;
  private accounts: Account[] = [];
  private currentAccountIndex = 0;
  private settings: UserSettings | null = null;
  private errorCount = 0;
  private maxErrors = 5;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private onStatusChange?: (status: AutomationStatus) => void;
  private onSessionUpdate?: (session: AutomationSession) => void;

  constructor(userId: string) {
    this.userId = userId;
  }

  setStatusChangeCallback(callback: (status: AutomationStatus) => void) {
    this.onStatusChange = callback;
  }

  setSessionUpdateCallback(callback: (session: AutomationSession) => void) {
    this.onSessionUpdate = callback;
  }

  async initialize(): Promise<void> {
    // Load user settings
    const dbSettings = await DatabaseService.getUserSettings(this.userId);
    this.settings = dbSettings as unknown as UserSettings;

    // Load accounts
    const dbAccounts = await DatabaseService.getUserAccounts(this.userId);
    this.accounts = dbAccounts as Account[];

    // Setup command response listener
    realtimeService.subscribeToCommandResponses(
      this.userId,
      this.handleCommandResponse.bind(this)
    );
  }

  private getAutomationConfig(): AutomationConfig {
    const config = this.settings?.automation_config;
    if (typeof config === "object" && config !== null && !Array.isArray(config)) {
      return config as AutomationConfig;
    }
    return {
      headlessMode: true,
      retryAttempts: 3,
      timeoutDuration: 30000,
      screenshotInterval: 5000
    };
  }

  async startAutomation(accountId?: string): Promise<AutomationSession> {
    if (this.isRunning) {
      throw new Error("Automation is already running");
    }

    // Find starting account
    const startAccount = accountId
      ? this.accounts.find((acc) => acc.id === accountId)
      : this.accounts[0];

    if (!startAccount) {
      throw new Error("No accounts available for automation");
    }

    // Create new session
    const session = await DatabaseService.createAutomationSession(
      this.userId,
      startAccount.id,
      { startedBy: "user", automationType: "full" }
    );

    this.currentSession = session as AutomationSession;
    this.isRunning = true;
    this.errorCount = 0;
    this.currentAccountIndex = this.accounts.findIndex((acc) => acc.id === startAccount.id);

    this.onStatusChange?.("RUNNING");
    this.onSessionUpdate?.(this.currentSession);

    // Start automation sequence
    await this.executeCommand("START_SESSION");
    
    // Start monitoring
    this.startMonitoring();

    return this.currentSession;
  }

  async stopAutomation(): Promise<void> {
    if (!this.isRunning || !this.currentSession) {
      return;
    }

    this.isRunning = false;
    this.stopMonitoring();

    // Update session status
    await DatabaseService.updateAutomationSession(this.currentSession.id, {
      status: "STOPPED",
      ended_at: new Date().toISOString(),
      runtime_seconds: this.calculateRuntime()
    });

    await this.logAction("ACTIONS", "Automation stopped by user");

    this.onStatusChange?.("STOPPED");
  }

  async pauseAutomation(): Promise<void> {
    if (!this.isRunning || !this.currentSession) {
      return;
    }

    this.stopMonitoring();

    await DatabaseService.updateAutomationSession(this.currentSession.id, {
      status: "PAUSED"
    });

    await this.logAction("ACTIONS", "Automation paused");

    this.onStatusChange?.("PAUSED");
  }

  async resumeAutomation(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    await DatabaseService.updateAutomationSession(this.currentSession.id, {
      status: "RUNNING"
    });

    await this.logAction("ACTIONS", "Automation resumed");

    this.onStatusChange?.("RUNNING");
    
    this.startMonitoring();
  }

  async forceAccountSwitch(): Promise<void> {
    if (!this.isRunning || !this.currentSession) {
      return;
    }

    this.onStatusChange?.("SWITCHING_ACCOUNTS");
    await this.switchToNextAccount("user_request");
  }

  private startMonitoring(): void {
    const config = this.getAutomationConfig();
    const interval = config.screenshotInterval || 5000;

    this.monitorInterval = setInterval(async () => {
      if (!this.isRunning) {
        this.stopMonitoring();
        return;
      }

      try {
        await this.executeMonitoringCycle();
      } catch (error) {
        await this.handleError(error as Error);
      }
    }, interval);
  }

  private stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  private async executeMonitoringCycle(): Promise<void> {
    // Get current status
    await this.executeCommand("CHECK_STATUS");

    // Build context for AI decision
    const context: DecisionContext = {
      status: this.currentSession?.status || "RUNNING",
      runtime: Math.round(this.calculateRuntime() / 60),
      gpuQuota: await this.estimateGPUQuota(),
      lastError: this.getLastError(),
      accountCount: this.accounts.length,
      recentLogs: await this.getRecentLogMessages(5)
    };

    // Get AI decision
    const decisionResult = await aiService.makeAutomationDecision(context);

    if (decisionResult.success) {
      await this.handleAIDecision(decisionResult.decision);
    }
  }

  private async handleAIDecision(decision: AutomationDecision): Promise<void> {
    await this.logAction("VISION", `AI Decision: ${decision.action} - ${decision.reason}`);

    switch (decision.action) {
      case "CONTINUE":
        // Do nothing, keep monitoring
        break;

      case "RESTART_CELL":
        await this.executeCommand("RUN_CELLS");
        break;

      case "SWITCH_ACCOUNT":
        await this.switchToNextAccount("ai_recommendation");
        break;

      case "PAUSE":
        await this.pauseAutomation();
        break;

      case "STOP":
        await this.stopAutomation();
        break;

      case "CHECK_STATUS":
        await this.executeCommand("CHECK_STATUS");
        break;
    }
  }

  private async switchToNextAccount(reason: string): Promise<void> {
    if (this.accounts.length <= 1) {
      await this.logAction("ALERTS", "No other accounts available for switching");
      return;
    }

    this.currentAccountIndex = (this.currentAccountIndex + 1) % this.accounts.length;
    const nextAccount = this.accounts[this.currentAccountIndex];

    await this.logAction("ACTIONS", `Switching to account: ${nextAccount.name} (${reason})`);

    await this.executeCommand("SWITCH_ACCOUNT", {
      newAccountId: nextAccount.id,
      reason
    });

    this.onStatusChange?.("RUNNING");
  }

  private async executeCommand(
    command: string,
    payload: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase.functions.invoke("automation-command", {
        body: {
          userId: this.userId,
          sessionId: this.currentSession?.id,
          accountId: this.accounts[this.currentAccountIndex]?.id,
          command,
          payload
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.result || {};
    } catch (error) {
      await this.logAction("ERROR", `Command ${command} failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private async handleError(error: Error): Promise<void> {
    this.errorCount++;

    await this.logAction("ERROR", error.message);

    // Use AI to analyze error
    const analysis = await aiService.analyzeError(error.message, {
      sessionId: this.currentSession?.id,
      accountName: this.accounts[this.currentAccountIndex]?.name
    });

    if (analysis.success) {
      await this.logAction("VISION", `Error analysis: ${analysis.analysis.cause}`);

      if (analysis.analysis.autoRetry && this.errorCount < this.maxErrors) {
        await this.logAction("ACTIONS", "Attempting automatic recovery");

        for (const solution of analysis.analysis.solutions.slice(0, 2)) {
          await this.logAction("ACTIONS", `Applying solution: ${solution}`);

          if (solution.toLowerCase().includes("switch account")) {
            await this.switchToNextAccount("error_recovery");
            return;
          }

          if (solution.toLowerCase().includes("restart")) {
            await this.executeCommand("RUN_CELLS");
            return;
          }
        }
      }
    }

    if (this.errorCount >= this.maxErrors) {
      await this.logAction("ALERTS", "Maximum error count reached - stopping automation");
      this.onStatusChange?.("ERROR");
      await this.stopAutomation();
    }
  }

  private async logAction(
    level: string,
    message: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    await supabase.from("automation_logs").insert([
      {
        session_id: this.currentSession?.id,
        user_id: this.userId,
        level,
        message,
        source: "AUTOMATION_ENGINE",
        metadata: metadata as Json
      }
    ]);
  }

  private calculateRuntime(): number {
    if (!this.currentSession?.started_at) return 0;

    const startTime = new Date(this.currentSession.started_at);
    const currentTime = new Date();
    return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  }

  private async getRecentLogMessages(count: number): Promise<string[]> {
    const { data } = await supabase
      .from("automation_logs")
      .select("message")
      .eq("session_id", this.currentSession?.id || "")
      .order("created_at", { ascending: false })
      .limit(count);

    return data?.map((log) => log.message) || [];
  }

  private getLastError(): string | null {
    return null; // Simplified for now
  }

  private async estimateGPUQuota(): Promise<number> {
    // This would be implemented based on actual quota detection
    return 50;
  }

  private handleCommandResponse(payload: unknown): void {
    console.log("Command response:", payload);
  }

  getCurrentSession(): AutomationSession | null {
    return this.currentSession;
  }

  isAutomationRunning(): boolean {
    return this.isRunning;
  }
}

// Factory function to create automation engine instances
export function createAutomationEngine(userId: string): AutomationEngine {
  return new AutomationEngine(userId);
}
