import { useState, useCallback } from "react";
import { 
  aiService, 
  type ScreenshotAnalysis, 
  type AutomationDecision, 
  type ErrorAnalysis,
  type DecisionContext,
  type SessionData,
  type LogEntry
} from "@/services/ai";

export function useAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ScreenshotAnalysis | null>(null);
  const [lastDecision, setLastDecision] = useState<AutomationDecision | null>(null);
  const [lastErrorAnalysis, setLastErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  const [statusReport, setStatusReport] = useState<string | null>(null);

  const analyzeScreenshot = useCallback(
    async (imageUrl: string, context?: Record<string, unknown>) => {
      setIsAnalyzing(true);
      try {
        const result = await aiService.analyzeScreenshot(imageUrl, context);
        if (result.success && result.analysis) {
          setLastAnalysis(result.analysis);
        }
        return result;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const makeDecision = useCallback(async (context: DecisionContext) => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.makeAutomationDecision(context);
      if (result.success) {
        setLastDecision(result.decision);
      }
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeError = useCallback(
    async (errorMessage: string, context?: Record<string, unknown>) => {
      setIsAnalyzing(true);
      try {
        const result = await aiService.analyzeError(errorMessage, context);
        if (result.success) {
          setLastErrorAnalysis(result.analysis);
        }
        return result;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const generateReport = useCallback(
    async (sessionData: SessionData, recentLogs: LogEntry[]) => {
      setIsAnalyzing(true);
      try {
        const report = await aiService.generateStatusReport(sessionData, recentLogs);
        setStatusReport(report);
        return report;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  return {
    isAnalyzing,
    lastAnalysis,
    lastDecision,
    lastErrorAnalysis,
    statusReport,
    analyzeScreenshot,
    makeDecision,
    analyzeError,
    generateReport
  };
}
