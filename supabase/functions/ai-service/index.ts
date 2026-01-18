import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  action: "analyze_screenshot" | "make_decision" | "analyze_error" | "generate_report";
  context?: Record<string, unknown>;
  imageUrl?: string;
  errorMessage?: string;
  sessionData?: Record<string, unknown>;
  recentLogs?: Array<{ level: string; message: string }>;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";

async function callOpenRouter(messages: Array<{ role: string; content: string }>) {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": Deno.env.get("SUPABASE_URL") || "https://forger.app",
      "X-Title": "Forger Automation"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter API error:", response.status, errorText);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function analyzeScreenshot(imageUrl: string, context: Record<string, unknown> = {}) {
  const systemPrompt = `You are an AI assistant that analyzes Google Colab notebook descriptions to understand training progress and execution status. Analyze the provided context and provide insights about:
1. Current execution status (running, idle, error, completed)
2. Training progress indicators (loss values, metrics, progress estimates)
3. Any visible errors or warnings
4. Recommended actions

Always respond with a valid JSON object containing: {"status": "string", "progress": number, "errors": [], "metrics": {}, "recommendations": []}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Analyze this Colab session. Context: ${JSON.stringify(context)}. Image URL: ${imageUrl}` }
  ];

  try {
    const result = await callOpenRouter(messages);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        success: true,
        analysis: JSON.parse(jsonMatch[0])
      };
    }
    return {
      success: true,
      analysis: {
        status: "unknown",
        progress: 0,
        errors: [],
        metrics: {},
        recommendations: ["Unable to parse analysis"]
      }
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Screenshot analysis failed:", error);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
}

async function makeAutomationDecision(context: Record<string, unknown>) {
  const systemPrompt = `You are an intelligent automation agent for Google Colab notebooks. Based on the current context, decide what action to take next.

Available actions:
- CONTINUE: Keep current execution
- RESTART_CELL: Restart the current cell
- SWITCH_ACCOUNT: Switch to next account
- PAUSE: Pause automation
- STOP: Stop automation completely
- CHECK_STATUS: Verify current state

Always respond with a valid JSON object: {"action": "ACTION_NAME", "reason": "explanation", "confidence": 0.0-1.0}`;

  const userPrompt = `Context:
- Current status: ${context.status || "unknown"}
- Runtime duration: ${context.runtime || 0} minutes
- GPU quota used: ${context.gpuQuota || 0}%
- Last error: ${context.lastError || "none"}
- Available accounts: ${context.accountCount || 0}
- Recent logs: ${(context.recentLogs as string[])?.slice(-3).join(", ") || "none"}

What action should be taken?`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    const result = await callOpenRouter(messages);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        success: true,
        decision: JSON.parse(jsonMatch[0])
      };
    }
    return {
      success: true,
      decision: { action: "CONTINUE", reason: "Default decision", confidence: 0.5 }
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Automation decision failed:", error);
    return {
      success: false,
      error: error.message,
      decision: { action: "CONTINUE", reason: "Fallback decision", confidence: 0.5 }
    };
  }
}

async function analyzeError(errorMessage: string, context: Record<string, unknown> = {}) {
  const systemPrompt = `You are an expert at debugging Google Colab and Python errors. Analyze errors and provide solutions.

Always respond with a valid JSON object: {"severity": "LOW|MEDIUM|HIGH|CRITICAL", "cause": "explanation", "solutions": ["solution1", "solution2"], "autoRetry": boolean}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Analyze this error: ${errorMessage}\nContext: ${JSON.stringify(context)}` }
  ];

  try {
    const result = await callOpenRouter(messages);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        success: true,
        analysis: JSON.parse(jsonMatch[0])
      };
    }
    return {
      success: true,
      analysis: {
        severity: "MEDIUM",
        cause: "Unknown error",
        solutions: ["Review error details", "Check Colab status"],
        autoRetry: false
      }
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      success: false,
      error: error.message,
      analysis: {
        severity: "MEDIUM",
        cause: "Unknown error",
        solutions: ["Review error details", "Try manual intervention"],
        autoRetry: false
      }
    };
  }
}

async function generateStatusReport(sessionData: Record<string, unknown>, recentLogs: Array<{ level: string; message: string }>) {
  const context = {
    status: sessionData.status,
    runtime: sessionData.runtime_seconds,
    account: (sessionData.accounts as Record<string, unknown>)?.name,
    logCount: recentLogs?.length || 0,
    hasErrors: recentLogs?.some((log) => log.level === "ERROR")
  };

  const systemPrompt = "You create concise, clear status reports for automation sessions. Keep responses to 2-3 sentences.";
  
  const userPrompt = `Generate a status report for this Colab automation session:
Session: ${JSON.stringify(context)}
Recent activity: ${recentLogs?.slice(-5).map((l) => `${l.level}: ${l.message}`).join("; ")}

Create a brief, user-friendly summary of current status and any notable events.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    const result = await callOpenRouter(messages);
    return result || `Session ${sessionData.status?.toString().toLowerCase()} for ${Math.round(Number(sessionData.runtime_seconds) / 60)} minutes.`;
  } catch (error) {
    return `Session ${sessionData.status?.toString().toLowerCase() || "unknown"} for ${Math.round(Number(sessionData.runtime_seconds) / 60)} minutes. ${context.hasErrors ? "Some errors detected." : "Running normally."}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, context, imageUrl, errorMessage, sessionData, recentLogs }: AIRequest = await req.json();

    let result;

    switch (action) {
      case "analyze_screenshot":
        if (!imageUrl) {
          throw new Error("imageUrl is required for screenshot analysis");
        }
        result = await analyzeScreenshot(imageUrl, context);
        break;

      case "make_decision":
        if (!context) {
          throw new Error("context is required for decision making");
        }
        result = await makeAutomationDecision(context);
        break;

      case "analyze_error":
        if (!errorMessage) {
          throw new Error("errorMessage is required for error analysis");
        }
        result = await analyzeError(errorMessage, context);
        break;

      case "generate_report":
        if (!sessionData) {
          throw new Error("sessionData is required for report generation");
        }
        result = { report: await generateStatusReport(sessionData, recentLogs || []) };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("AI service error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
