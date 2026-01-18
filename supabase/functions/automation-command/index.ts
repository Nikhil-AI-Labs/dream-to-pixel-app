import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationRequest {
  userId: string;
  sessionId: string;
  accountId: string;
  command: string;
  payload?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, sessionId, accountId, command, payload }: AutomationRequest = await req.json();

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (accountError || !account) {
      throw new Error("Account not found");
    }

    // Log the command
    await supabase.from("automation_logs").insert([
      {
        session_id: sessionId,
        user_id: userId,
        level: "ACTIONS",
        message: `Executing command: ${command}`,
        source: "AUTOMATION_COMMAND",
        metadata: { command, payload }
      }
    ]);

    // Execute command based on type
    let result: Record<string, unknown>;

    switch (command) {
      case "START_SESSION":
        // Update session status
        await supabase
          .from("automation_sessions")
          .update({ status: "RUNNING", started_at: new Date().toISOString() })
          .eq("id", sessionId);
        
        result = { action: "session_started", sessionId };
        break;

      case "STOP_SESSION":
        await supabase
          .from("automation_sessions")
          .update({ 
            status: "STOPPED", 
            ended_at: new Date().toISOString() 
          })
          .eq("id", sessionId);
        
        result = { action: "session_stopped", sessionId };
        break;

      case "PAUSE_SESSION":
        await supabase
          .from("automation_sessions")
          .update({ status: "PAUSED" })
          .eq("id", sessionId);
        
        result = { action: "session_paused", sessionId };
        break;

      case "RESUME_SESSION":
        await supabase
          .from("automation_sessions")
          .update({ status: "RUNNING" })
          .eq("id", sessionId);
        
        result = { action: "session_resumed", sessionId };
        break;

      case "SWITCH_ACCOUNT":
        const newAccountId = payload?.newAccountId as string;
        if (!newAccountId) {
          throw new Error("newAccountId is required for SWITCH_ACCOUNT");
        }

        await supabase
          .from("automation_sessions")
          .update({ 
            account_id: newAccountId,
            metadata: {
              previousAccountId: accountId,
              switchReason: payload?.reason || "manual",
              switchedAt: new Date().toISOString()
            }
          })
          .eq("id", sessionId);

        // Update account statuses
        await supabase
          .from("accounts")
          .update({ status: "INACTIVE" })
          .eq("id", accountId);

        await supabase
          .from("accounts")
          .update({ status: "ACTIVE", last_login: new Date().toISOString() })
          .eq("id", newAccountId);

        result = { action: "account_switched", previousAccountId: accountId, newAccountId };
        break;

      case "CHECK_STATUS":
        const { data: sessionData } = await supabase
          .from("automation_sessions")
          .select(`
            *,
            accounts (name, email, status)
          `)
          .eq("id", sessionId)
          .single();

        result = { action: "status_checked", session: sessionData };
        break;

      case "CAPTURE_SCREENSHOT":
        // This would be handled by a browser automation service
        // For now, we'll log the request
        result = { 
          action: "screenshot_requested", 
          message: "Screenshot capture queued",
          timestamp: new Date().toISOString()
        };
        break;

      case "RUN_CELLS":
        result = { 
          action: "run_cells_requested", 
          notebookUrl: account.notebook_url,
          message: "Cell execution queued"
        };
        break;

      case "HANDLE_ERROR":
        const errorDetails = payload?.error as string;
        
        // Call AI service to analyze error
        const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-service`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "analyze_error",
            errorMessage: errorDetails,
            context: { sessionId, accountId, accountName: account.name }
          })
        });

        const aiResult = await aiResponse.json();
        
        await supabase.from("automation_logs").insert([
          {
            session_id: sessionId,
            user_id: userId,
            level: "VISION",
            message: `Error analysis: ${aiResult.analysis?.cause || "Unknown"}`,
            source: "AI_SERVICE",
            metadata: aiResult.analysis
          }
        ]);

        result = { action: "error_handled", analysis: aiResult.analysis };
        break;

      case "GET_AI_DECISION":
        const decisionContext = {
          status: payload?.status || "RUNNING",
          runtime: payload?.runtime || 0,
          gpuQuota: payload?.gpuQuota || 50,
          lastError: payload?.lastError || null,
          accountCount: payload?.accountCount || 1,
          recentLogs: payload?.recentLogs || []
        };

        const decisionResponse = await fetch(`${supabaseUrl}/functions/v1/ai-service`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "make_decision",
            context: decisionContext
          })
        });

        const decisionResult = await decisionResponse.json();
        
        await supabase.from("automation_logs").insert([
          {
            session_id: sessionId,
            user_id: userId,
            level: "VISION",
            message: `AI Decision: ${decisionResult.decision?.action} - ${decisionResult.decision?.reason}`,
            source: "AI_SERVICE",
            metadata: decisionResult.decision
          }
        ]);

        result = { action: "decision_made", decision: decisionResult.decision };
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    // Log successful execution
    await supabase.from("automation_logs").insert([
      {
        session_id: sessionId,
        user_id: userId,
        level: "ACTIONS",
        message: `Command completed: ${command}`,
        source: "AUTOMATION_COMMAND",
        metadata: { command, result }
      }
    ]);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Automation command error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
