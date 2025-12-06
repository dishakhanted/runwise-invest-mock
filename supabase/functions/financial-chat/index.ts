/**
 * Financial Chat Edge Function
 * Uses LangChain for all AI interactions via Lovable AI Gateway
 * All database queries are scoped to the authenticated user
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  resolvePromptType,
  loadPromptFromFile,
  invokeChat,
} from './langchainClient.ts';
import { getDemoProfile } from './demoProfiles.ts';
import { 
  getUserIdFromRequest, 
  buildContextForUser, 
  buildContextForDemo,
  buildSimpleContextFromData 
} from './contextBuilder.ts';

// Import static prompts as fallback
import { DECISION_HANDLING_PROMPT } from './prompts.ts';

type ParsedDecision = {
  isDecision: boolean;
  suggestionTitle?: string;
  decision?: 'approved' | 'denied' | 'know_more';
};

const parseDecisionFromMessage = (content: string): ParsedDecision => {
  const trimmed = content.trim();

  const approvalRegex = /^I approve the suggestion:\s*[""](.+?)[""]/i;
  const denialRegex = /^I deny the suggestion:\s*[""](.+?)[""]/i;
  const knowMoreRegex = /^I want to know more about the suggestion:\s*[""](.+?)[""]/i;

  let match = trimmed.match(approvalRegex);
  if (match && match[1]) {
    return { isDecision: true, suggestionTitle: match[1].trim(), decision: 'approved' };
  }

  match = trimmed.match(denialRegex);
  if (match && match[1]) {
    return { isDecision: true, suggestionTitle: match[1].trim(), decision: 'denied' };
  }

  match = trimmed.match(knowMoreRegex);
  if (match && match[1]) {
    return { isDecision: true, suggestionTitle: match[1].trim(), decision: 'know_more' };
  }

  return { isDecision: false };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Creates a Supabase client with service role for database operations
 */
function createSupabaseClient() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
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
  // Store decision in DB for goal context (only for authenticated users, never in demo mode)
  if (!isDemo && userId && contextData?.id && contextType === "goal") {
    console.log('[handleSuggestionDecision] Storing decision for user:', userId);
    
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
      console.error("Error inserting goal_recommendation:", insertError);
    } else {
      console.log(`Stored ${decision.decision} decision for suggestion: ${decision.suggestionTitle}`);
    }
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

  console.log('[handleSuggestionDecision] Invoking LangChain for decision:', decision.decision);

  try {
    const response = await invokeChat(systemPrompt, messages);
    return response;
  } catch (error) {
    console.error("LangChain error for suggestion response:", error);
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
  // Demo mode doesn't support goal updates (no database mutations)
  if (isDemo) {
    console.log('[handleGoalUpdate] Skipping - demo mode');
    return { updated: false, message: '' };
  }

  // Require authenticated user for database mutations
  if (!userId) {
    console.warn('[handleGoalUpdate] No userId - cannot update goal');
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
    return { updated: false, message: '' };
  }

  console.log('[handleGoalUpdate] Updating goal for user:', userId);
  
  // Fetch profile with user_id filter
  const { data: profile } = await supabase
    .from('profiles')
    .select('date_of_birth')
    .eq('user_id', userId)
    .maybeSingle();
  
  let newTargetAge = null;
  if (profile?.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    const currentAge = today.getFullYear() - birthDate.getFullYear();
    newTargetAge = currentAge + 8;
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
    console.error("Error updating goal:", error);
    return { updated: false, message: '' };
  }
  
  const goalUpdateSummary = `✅ Goal Updated Successfully!\n\n` +
    `Your goal has been updated to $${newTargetAmount.toLocaleString()}. ` +
    `It will now take you 8 years to reach your goal. ` +
    `Do you want to increase the allocation to reach the goal earlier?`;
  
  return { updated: true, message: goalUpdateSummary };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, contextType, contextData, demo } = await req.json();
    const isDemo = demo?.demoProfileId ? true : false;
    const demoProfileId = demo?.demoProfileId;
    
    console.log('[financial-chat] Request received:', { 
      messagesLength: messages?.length, 
      conversationId, 
      contextType,
      isDemo,
      demoProfileId
    });

    const supabase = createSupabaseClient();
    const authHeader = req.headers.get('Authorization');

    // Extract user ID from JWT (null for demo mode or unauthenticated)
    let userId: string | null = null;
    
    if (!isDemo && authHeader) {
      try {
        userId = await getUserIdFromRequest(supabase, authHeader);
        console.log('[financial-chat] Authenticated user:', userId);
      } catch (authError) {
        console.warn('[financial-chat] Auth extraction failed:', authError);
        // Continue without userId - will use contextData fallback
      }
    }

    // Check if this is a suggestion decision
    const lastMessage = messages[messages.length - 1];
    const lastContent: string = lastMessage?.content ?? "";
    const isSuggestionContext = 
      contextType === "goal" || 
      contextType === "dashboard" ||
      contextType === "net_worth" || 
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
      const confirmationMessage = await handleSuggestionDecision(
        supabase,
        decision,
        contextType,
        contextData,
        messages,
        userId,
        isDemo,
        demoProfileId
      );

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
        userId,
        isDemo
      );
      
      if (goalUpdateResult.updated) {
        return new Response(
          JSON.stringify({ message: goalUpdateResult.message, goalUpdated: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Load prompt from markdown file
    const promptType = resolvePromptType(contextType);
    console.log('[financial-chat] Loading prompt:', promptType);
    
    let promptContent: string;
    try {
      promptContent = await loadPromptFromFile(promptType);
    } catch (error) {
      console.error("Error loading prompt file:", error);
      promptContent = "You are GrowWise AI, a helpful financial assistant. Provide clear, concise, and helpful responses.";
    }
    
    // Build context using the unified context builder
    let contextInfo = "";
    
    if (isDemo && demoProfileId) {
      // Demo mode: use in-memory demo profile data only
      const demoProfile = getDemoProfile(demoProfileId);
      if (demoProfile) {
        contextInfo = buildContextForDemo(demoProfile, contextType, contextData);
        console.log('[financial-chat] Using demo profile:', demoProfile.name);
      }
    } else if (userId) {
      // Auth mode: fetch from database, scoped to authenticated user
      contextInfo = await buildContextForUser(supabase, userId, contextType, contextData);
      console.log('[financial-chat] Built context for user:', userId);
    } else {
      // Fallback: use provided contextData only (no database access without auth)
      console.warn('[financial-chat] No userId available, using contextData fallback');
      contextInfo = buildSimpleContextFromData(contextType, contextData);
    }

    const systemPrompt = `${promptContent}${contextInfo}`;

    console.log('[financial-chat] Invoking LangChain with prompt type:', promptType);
    console.log('[financial-chat] System prompt preview:', systemPrompt.slice(0, 150));

    try {
      const response = await invokeChat(systemPrompt, messages);
      console.log('[financial-chat] LangChain response received successfully');

      return new Response(
        JSON.stringify({ message: response }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (llmError: any) {
      console.error("LangChain LLM error:", llmError);
      
      if (llmError.message?.includes('429') || llmError.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (llmError.message?.includes('402') || llmError.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw llmError;
    }

  } catch (error) {
    console.error("[financial-chat] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
