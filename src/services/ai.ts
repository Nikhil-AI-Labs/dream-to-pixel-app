import { supabase } from "@/integrations/supabase/client";

export interface ScreenshotAnalysis {
  status: string;
  progress: number;
  errors: string[];
  metrics: Record<string, unknown>;
  recommendations: string[];
}

export interface AutomationDecision {
  action: "CONTINUE" | "RESTART_CELL" | "SWITCH_ACCOUNT" | "PAUSE" | "STOP" | "CHECK_STATUS";
  reason: string;
  confidence: number;
}

export interface ErrorAnalysis {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cause: string;
  solutions: string[];
  autoRetry: boolean;
}

export interface DecisionContext {
  status: string;
  runtime: number;
  gpuQuota: number;
  lastError: string | null;
  accountCount: number;
  recentLogs: string[];
}

export interface SessionData {
  status: string;
  runtime_seconds: number;
  accounts?: { name: string };
}

export interface LogEntry {
  level: string;
  message: string;
}

export class AIService {
  // Analyze screenshot for training progress
  async analyzeScreenshot(
    imageUrl: string,
    context: Record<string, unknown> = {}
  ): Promise<{ success: boolean; analysis: ScreenshotAnalysis | null; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-service", {
        body: {
          action: "analyze_screenshot",
          imageUrl,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Screenshot analysis failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        analysis: null
      };
    }
  }

  // Generate automation decisions
  async makeAutomationDecision(
    context: DecisionContext
  ): Promise<{ success: boolean; decision: AutomationDecision; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-service", {
        body: {
          action: "make_decision",
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Automation decision failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        decision: { action: "CONTINUE", reason: "Fallback decision", confidence: 0.5 }
      };
    }
  }

  // Analyze error messages and suggest fixes
  async analyzeError(
    errorMessage: string,
    context: Record<string, unknown> = {}
  ): Promise<{ success: boolean; analysis: ErrorAnalysis; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-service", {
        body: {
          action: "analyze_error",
          errorMessage,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analysis failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        analysis: {
          severity: "MEDIUM",
          cause: "Unknown error",
          solutions: ["Review error details", "Try manual intervention"],
          autoRetry: false
        }
      };
    }
  }

  // Generate natural language status reports
  async generateStatusReport(
    sessionData: SessionData,
    recentLogs: LogEntry[]
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-service", {
        body: {
          action: "generate_report",
          sessionData,
          recentLogs
        }
      });

      if (error) throw error;
      return data.report;
    } catch (error) {
      console.error("Report generation failed:", error);
      const hasErrors = recentLogs?.some((log) => log.level === "ERROR");
      return `Session ${sessionData.status?.toLowerCase() || "unknown"} for ${Math.round(
        sessionData.runtime_seconds / 60
      )} minutes. ${hasErrors ? "Some errors detected." : "Running normally."}`;
    }
  }
}

export const aiService = new AIService();
