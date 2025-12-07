/**
 * Financial Chat Edge Function
 * Uses Google Gemini API for all AI interactions
 * All database queries are scoped to the authenticated user
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { callChatModel, type ChatMessage } from './openaiClient.ts';
import { getPromptTypeFromContext, loadPrompt } from './promptLoader.ts';
import { getDemoProfile } from './demoProfiles.ts';
import { 
  getUserIdFromRequest, 
  buildContextForUser, 
  buildContextForDemo,
  buildSimpleContextFromData 
} from './contextBuilder.ts';

// Import static prompts as fallback
import { DECISION_HANDLING_PROMPT } from './prompts.ts';

// ============= Structured Logging Helpers =============

interface RequestLog {
  requestId: string;
  contextType: string;
  userId: string;
  isDemo: boolean;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: 'started' | 'success' | 'error';
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function logRequest(log: RequestLog): void {
  const logEntry = {
    ...log,
    timestamp: new Date().toISOString(),
  };
  
  if (log.status === 'error') {
    console.error('[financial-chat]', JSON.stringify(logEntry));
  } else {
    console.log('[financial-chat]', JSON.stringify(logEntry));
  }
}

function logDebug(message: string, context?: Record<string, unknown>): void {
  const logEntry = {
    level: 'debug',
    message,
    context: context || {},
    timestamp: new Date().toISOString(),
  };
  console.log('[financial-chat] [DEBUG]', JSON.stringify(logEntry));
}

function logInfo(message: string, context?: Record<string, unknown>): void {
  const logEntry = {
    level: 'info',
    message,
    context: context || {},
    timestamp: new Date().toISOString(),
  };
  console.log('[financial-chat] [INFO]', JSON.stringify(logEntry));
}

function logWarn(message: string, context?: Record<string, unknown>): void {
  const logEntry = {
    level: 'warn',
    message,
    context: context || {},
    timestamp: new Date().toISOString(),
  };
  console.warn('[financial-chat] [WARN]', JSON.stringify(logEntry));
}

function createErrorResponse(
  error: Error | unknown, 
  requestId: string, 
  corsHeaders: Record<string, string>
): Response {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Log structured error
  console.error('[financial-chat] Error details:', JSON.stringify({
    requestId,
    error: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  }));
  
  // Return safe error message to frontend
  return new Response(
    JSON.stringify({ 
      error: 'Something went wrong. Please try again.',
      requestId,
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// ============= Types =============

type ParsedDecision = {
  isDecision: boolean;
  suggestionTitle?: string;
  decision?: 'approved' | 'denied' | 'know_more';
};

const parseDecisionFromMessage = (content: string): ParsedDecision => {
  const trimmed = content.trim();
  logDebug('Parsing decision from message', { messageLength: trimmed.length });

  // Match frontend patterns: "I approve the suggestion:", "I decline the suggestion:", "I want to know more about the suggestion:"
  const approvalRegex = /^I approve the suggestion:\s*[""](.+?)[""]/i;
  const denialRegex = /^I (?:deny|decline) the suggestion:\s*[""](.+?)[""]/i; // Support both "deny" and "decline"
  const knowMoreRegex = /^I want to know more about the suggestion:\s*[""](.+?)[""]/i;

  let match = trimmed.match(approvalRegex);
  if (match && match[1]) {
    const decision = { isDecision: true, suggestionTitle: match[1].trim(), decision: 'approved' as const };
    logDebug('Decision parsed: approval', { suggestionTitle: decision.suggestionTitle });
    return decision;
  }

  match = trimmed.match(denialRegex);
  if (match && match[1]) {
    const decision = { isDecision: true, suggestionTitle: match[1].trim(), decision: 'denied' as const };
    logDebug('Decision parsed: denial', { suggestionTitle: decision.suggestionTitle });
    return decision;
  }

  match = trimmed.match(knowMoreRegex);
  if (match && match[1]) {
    const decision = { isDecision: true, suggestionTitle: match[1].trim(), decision: 'know_more' as const };
    logDebug('Decision parsed: know more', { suggestionTitle: decision.suggestionTitle });
    return decision;
  }

  logDebug('No decision pattern matched');
  return { isDecision: false };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Creates a Supabase client with service role for database operations
 */
function createSupabaseClient() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  logDebug('Creating Supabase client', {
    hasUrl: !!SUPABASE_URL,
    hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
  });
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    logWarn('Missing Supabase configuration', {
      hasUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
    });
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Handles suggestion decisions (approve/deny/know more)
 * All database operations are scoped to the authenticated user
 */
async function handleSuggestionDecision(
  supabase: any,
  decision: ParsedDecision,
  contextType: string,
  contextData: any,
  messages: Array<{ role: string; content: string }>,
  userId: string | null,
  isDemo: boolean,
  demoProfileId?: string
): Promise<string> {
  logInfo('Handling suggestion decision', {
    decision: decision.decision,
    suggestionTitle: decision.suggestionTitle,
    contextType,
    isDemo,
    userId: userId || undefined,
  });

  // Store decision in DB for goal context (only for authenticated users, never in demo mode)
  if (!isDemo && userId && contextData?.id && contextType === "goal") {
    logDebug('Storing decision in database', {
      userId,
      goalId: contextData.id,
      suggestionTitle: decision.suggestionTitle,
      decision: decision.decision,
    });
    
    const { error: insertError } = await supabase
      .from("goal_recommendations")
      .insert({
        user_id: userId,
        goal_id: contextData.id,
        suggestion_title: decision.suggestionTitle,
        suggestion_note: messages[messages.length - 1]?.content ?? "",
        decision: decision.decision,
      });

    if (insertError) {
      logWarn('Error inserting goal_recommendation', {
        error: insertError.message,
        userId,
        goalId: contextData.id,
      });
    } else {
      logInfo('Decision stored successfully', {
        decision: decision.decision,
        suggestionTitle: decision.suggestionTitle,
        userId,
      });
    }
  } else {
    logDebug('Skipping decision storage', {
      reason: isDemo ? 'demo_mode' : !userId ? 'no_user' : contextType !== 'goal' ? 'not_goal_context' : 'no_goal_id',
    });
  }

  // Build context info for decision handling
  let contextInfo = '';
  
  if (isDemo && demoProfileId) {
    // Demo mode: use in-memory data only, no database access
    const demoProfile = getDemoProfile(demoProfileId);
    if (demoProfile) {
      contextInfo = buildContextForDemo(demoProfile, contextType, contextData);
    }
  } else if (userId) {
    // Auth mode: fetch from database scoped to user
    contextInfo = await buildContextForUser(supabase, userId, contextType, contextData);
  } else {
    // Fallback to simple context data
    contextInfo = buildSimpleContextFromData(contextType, contextData);
  }

  // Add decision-specific context
  let decisionContext = `\n\n## User Action\n`;
  if (decision.decision === 'approved') {
    decisionContext += `The user APPROVED the suggestion: "${decision.suggestionTitle}"`;
  } else if (decision.decision === 'denied') {
    decisionContext += `The user DENIED the suggestion: "${decision.suggestionTitle}"`;
  } else if (decision.decision === 'know_more') {
    decisionContext += `The user wants to KNOW MORE about the suggestion: "${decision.suggestionTitle}"`;
  }

  const systemPrompt = `${DECISION_HANDLING_PROMPT}${contextInfo}${decisionContext}`;

  logDebug('Invoking Gemini for decision response', {
    decision: decision.decision,
    promptLength: systemPrompt.length,
    messageCount: messages.length,
  });

  try {
    // Convert messages to ChatMessage format
    const chatMessages: ChatMessage[] = messages.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await callChatModel({
      systemPrompt,
      messages: chatMessages,
      promptType: 'decision-handling', // Pass promptType for logging
    });
    
    logInfo('Decision response received', {
      decision: decision.decision,
      responseLength: response.length,
    });
    return response;
  } catch (error) {
    logWarn('Gemini error for suggestion response', {
      error: error instanceof Error ? error.message : 'Unknown error',
      decision: decision.decision,
    });
    if (decision.decision === 'approved') {
      return `Great! I've noted your approval. This will help you reach your goal faster.`;
    } else if (decision.decision === 'denied') {
      return `Understood. Let me know if you'd like to explore other options.`;
    } else {
      return `Let me provide more details about this suggestion.`;
    }
  }
}

/**
 * Handles goal update requests
 * All database operations are scoped to the authenticated user
 */
async function handleGoalUpdate(
  supabase: any,
  contextData: any,
  messages: Array<{ role: string; content: string }>,
  userId: string | null,
  isDemo: boolean
): Promise<{ updated: boolean; message: string }> {
  logDebug('Checking for goal update', {
    isDemo,
    hasUserId: !!userId,
    hasContextData: !!contextData,
    goalId: contextData?.id,
  });

  // Demo mode doesn't support goal updates (no database mutations)
  if (isDemo) {
    logDebug('Skipping goal update - demo mode');
    return { updated: false, message: '' };
  }

  // Require authenticated user for database mutations
  if (!userId) {
    logWarn('Cannot update goal - no userId');
    return { updated: false, message: '' };
  }

  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  const updateKeywords = ['increase', 'change', 'update', 'modify', 'raise', 'set'];
  const targetKeywords = ['target', 'goal', 'amount'];
  
  if (!updateKeywords.some(kw => lastUserMessage.includes(kw))) {
    return { updated: false, message: '' };
  }
  
  const numberMatch = lastUserMessage.match(/\$?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/);
  
  if (!numberMatch || !targetKeywords.some(kw => lastUserMessage.includes(kw))) {
    return { updated: false, message: '' };
  }
  
  const newTargetAmount = parseFloat(numberMatch[1].replace(/,/g, ''));

  if (newTargetAmount <= 0) {
    logDebug('Invalid target amount', { newTargetAmount });
    return { updated: false, message: '' };
  }

  logInfo('Updating goal', {
    userId,
    goalId: contextData.id,
    newTargetAmount,
  });
  
  // Fetch profile with user_id filter
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('date_of_birth')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (profileError) {
    logWarn('Error fetching profile for goal update', {
      error: profileError.message,
      userId,
    });
  }
  
  let newTargetAge = null;
  if (profile?.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    const currentAge = today.getFullYear() - birthDate.getFullYear();
    newTargetAge = currentAge + 8;
    logDebug('Calculated target age', { currentAge, newTargetAge });
  }
  
  // Update goal with BOTH id and user_id filters for security
  const { error } = await supabase
    .from('goals')
    .update({
      target_amount: newTargetAmount,
      ...(newTargetAge && { target_age: newTargetAge }),
      updated_at: new Date().toISOString()
    })
    .eq('id', contextData.id)
    .eq('user_id', userId);  // Critical: always scope to user
  
  if (error) {
    logWarn('Error updating goal', {
      error: error.message,
      userId,
      goalId: contextData.id,
    });
    return { updated: false, message: '' };
  }
  
  logInfo('Goal updated successfully', {
    userId,
    goalId: contextData.id,
    newTargetAmount,
    newTargetAge,
  });
  
  const goalUpdateSummary = `✅ Goal Updated Successfully!\n\n` +
    `Your goal has been updated to $${newTargetAmount.toLocaleString()}. ` +
    `It will now take you 8 years to reach your goal. ` +
    `Do you want to increase the allocation to reach the goal earlier?`;
  
  return { updated: true, message: goalUpdateSummary };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    logDebug('OPTIONS request received');
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = generateRequestId();
  const startTime = Date.now();
  let contextType = 'unknown';
  let userId = 'anonymous';
  let isDemo = false;

  logInfo('Request received', {
    requestId,
    method: req.method,
    url: req.url,
  });

  try {
    const { messages, conversationId, contextType: reqContextType, contextData, demo } = await req.json();
    contextType = reqContextType || 'unknown';
    isDemo = demo?.demoProfileId ? true : false;
    const demoProfileId = demo?.demoProfileId;
    
    logDebug('Request parsed', {
      requestId,
      contextType,
      isDemo,
      demoProfileId: demoProfileId || undefined,
      messageCount: messages?.length || 0,
      hasConversationId: !!conversationId,
      hasContextData: !!contextData,
    });
    
    // Log request start
    logRequest({
      requestId,
      contextType,
      userId: isDemo ? `demo:${demoProfileId}` : 'pending',
      isDemo,
      startTime,
      status: 'started',
    });

    const supabase = createSupabaseClient();
    const authHeader = req.headers.get('Authorization');

    logDebug('Extracting user authentication', {
      requestId,
      isDemo,
      hasAuthHeader: !!authHeader,
    });

    // Extract user ID from JWT (null for demo mode or unauthenticated)
    let authenticatedUserId: string | null = null;
    
    if (!isDemo && authHeader) {
      try {
        authenticatedUserId = await getUserIdFromRequest(supabase, authHeader);
        userId = authenticatedUserId;
        logInfo('User authenticated', {
          requestId,
          userId,
        });
      } catch (authError) {
        logWarn('Auth extraction failed', {
          requestId,
          error: authError instanceof Error ? authError.message : 'Unknown error',
        });
        // Continue without userId - will use contextData fallback
      }
    } else if (isDemo) {
      userId = `demo:${demoProfileId}`;
      logDebug('Using demo profile', {
        requestId,
        demoProfileId,
      });
    }

    // Check if this is a suggestion decision
    // Net worth, assets, liabilities, goals, and dashboard contexts support suggestion actions
    const lastMessage = messages[messages.length - 1];
    const lastContent: string = lastMessage?.content ?? "";
    const isSuggestionContext = 
      contextType === "goal" || 
      contextType === "dashboard" ||
      contextType === "net_worth" ||  // Net worth chat supports approve/deny/know more
      contextType === "networth" ||
      contextType === "assets" || 
      contextType === "liabilities";

    let decision: ParsedDecision | null = null;
    if (isSuggestionContext && lastMessage?.role === "user") {
      const parsed = parseDecisionFromMessage(lastContent);
      if (parsed.isDecision) {
        decision = parsed;
      }
    }

    // Handle suggestion decisions
    if (decision && isSuggestionContext) {
      logInfo('Handling suggestion decision', {
        requestId,
        decision: decision.decision,
        suggestionTitle: decision.suggestionTitle,
        contextType,
      });
      
      const confirmationMessage = await handleSuggestionDecision(
        supabase,
        decision,
        contextType,
        contextData,
        messages,
        authenticatedUserId,
        isDemo,
        demoProfileId
      );

      const endTime = Date.now();
      logRequest({
        requestId,
        contextType,
        userId,
        isDemo,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        status: 'success',
      });

      return new Response(
        JSON.stringify({ message: confirmationMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle goal update requests (auth mode only)
    if (contextType === 'goal' && contextData?.id) {
      const goalUpdateResult = await handleGoalUpdate(
        supabase,
        contextData,
        messages,
        authenticatedUserId,
        isDemo
      );
      
      if (goalUpdateResult.updated) {
        const endTime = Date.now();
        logRequest({
          requestId,
          contextType,
          userId,
          isDemo,
          startTime,
          endTime,
          durationMs: endTime - startTime,
          status: 'success',
        });

        return new Response(
          JSON.stringify({ message: goalUpdateResult.message, goalUpdated: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Load prompt from markdown file
    const promptType = getPromptTypeFromContext(contextType);
    logDebug('Loading prompt', {
      requestId,
      contextType,
      promptType,
    });
    
    let promptContent: string;
    try {
      promptContent = await loadPrompt(promptType);
      logInfo('Prompt loaded successfully', {
        requestId,
        contextType,
        promptType,
        promptLength: promptContent.length,
      });
    } catch (error) {
      // Log error but throw instead of falling back to generic prompt
      // This ensures we catch prompt loading issues early
      logWarn('Error loading prompt file', {
        requestId,
        contextType,
        promptType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Re-throw to surface the issue - don't silently fall back to generic prompt
      throw new Error(`Failed to load prompt for type '${promptType}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Build context using the unified context builder
    let contextInfo = "";
    
    if (isDemo && demoProfileId) {
      // Demo mode: use in-memory demo profile data only
      logDebug('Building context from demo profile', {
        requestId,
        demoProfileId,
        contextType,
      });
      const demoProfile = getDemoProfile(demoProfileId);
      if (demoProfile) {
        contextInfo = buildContextForDemo(demoProfile, contextType, contextData);
        logInfo('Using demo profile', {
          requestId,
          demoProfileName: demoProfile.name,
          contextLength: contextInfo.length,
        });
      } else {
        logWarn('Demo profile not found', {
          requestId,
          demoProfileId,
        });
      }
    } else if (authenticatedUserId) {
      // Auth mode: fetch from database, scoped to authenticated user
      logDebug('Building context from database', {
        requestId,
        userId: authenticatedUserId,
        contextType,
      });
      contextInfo = await buildContextForUser(supabase, authenticatedUserId, contextType, contextData);
      logInfo('Built context for user', {
        requestId,
        userId: authenticatedUserId,
        contextLength: contextInfo.length,
      });
    } else {
      // Fallback: use provided contextData only (no database access without auth)
      logWarn('No userId available, using contextData fallback', {
        requestId,
        contextType,
      });
      contextInfo = buildSimpleContextFromData(contextType, contextData);
    }

    const systemPrompt = `${promptContent}${contextInfo}`;

    // Enhanced logging with breakdown of systemPrompt components
    logInfo('Invoking Gemini', {
      requestId,
      contextType,
      promptType,
      promptContentLength: promptContent.length,
      contextInfoLength: contextInfo.length,
      systemPromptLength: systemPrompt.length,
      messageCount: messages.length,
    });

    try {
      // Convert messages to ChatMessage format
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      const response = await callChatModel({
        systemPrompt,
        messages: chatMessages,
        promptType, // Pass promptType for logging
      });
      
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      logRequest({
        requestId,
        contextType,
        userId,
        isDemo,
        startTime,
        endTime,
        durationMs,
        status: 'success',
      });

      logInfo('Gemini response received', {
        requestId,
        responseLength: response.length,
        durationMs,
      });

      return new Response(
        JSON.stringify({ message: response }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (llmError: any) {
      console.error(`[financial-chat] [${requestId}] Gemini API error:`, llmError);
      
      if (llmError.message?.includes('429') || llmError.status === 429) {
        const endTime = Date.now();
        logRequest({
          requestId,
          contextType,
          userId,
          isDemo,
          startTime,
          endTime,
          durationMs: endTime - startTime,
          status: 'error',
          error: { message: 'Rate limit exceeded', code: '429' },
        });

        return new Response(
          JSON.stringify({ error: "We're experiencing high demand. Please try again in a moment.", requestId }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (llmError.message?.includes('402') || llmError.status === 402) {
        const endTime = Date.now();
        logRequest({
          requestId,
          contextType,
          userId,
          isDemo,
          startTime,
          endTime,
          durationMs: endTime - startTime,
          status: 'error',
          error: { message: 'Payment required', code: '402' },
        });

        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later.", requestId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw llmError;
    }

  } catch (error) {
    const endTime = Date.now();
    logRequest({
      requestId,
      contextType,
      userId,
      isDemo,
      startTime,
      endTime,
      durationMs: endTime - startTime,
      status: 'error',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return createErrorResponse(error, requestId, corsHeaders);
  }
});
