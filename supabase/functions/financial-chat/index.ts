/**
 * Financial Chat Edge Function
 * Uses LangChain for all AI interactions via Lovable AI Gateway
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  getLLM,
  resolvePromptType,
  loadPromptFromFile,
  invokeChat,
  type PromptType,
} from './langchainClient.ts';

// Import static prompts as fallback
import {
  DECISION_HANDLING_PROMPT,
  GOAL_UPDATE_PROMPT
} from './prompts.ts';

type ParsedDecision = {
  isDecision: boolean;
  suggestionTitle?: string;
  decision?: 'approved' | 'denied' | 'know_more';
};

const parseDecisionFromMessage = (content: string): ParsedDecision => {
  const trimmed = content.trim();

  // Pattern: I approve the suggestion: "Increase Education Loan Payment"
  const approvalRegex = /^I approve the suggestion:\s*[""](.+?)[""]/i;
  const denialRegex = /^I deny the suggestion:\s*[""](.+?)[""]/i;
  const knowMoreRegex = /^I want to know more about the suggestion:\s*[""](.+?)[""]/i;

  let match = trimmed.match(approvalRegex);
  if (match && match[1]) {
    return {
      isDecision: true,
      suggestionTitle: match[1].trim(),
      decision: 'approved',
    };
  }

  match = trimmed.match(denialRegex);
  if (match && match[1]) {
    return {
      isDecision: true,
      suggestionTitle: match[1].trim(),
      decision: 'denied',
    };
  }

  match = trimmed.match(knowMoreRegex);
  if (match && match[1]) {
    return {
      isDecision: true,
      suggestionTitle: match[1].trim(),
      decision: 'know_more',
    };
  }

  return { isDecision: false };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Builds context information string based on context type and data
 */
function buildContextInfo(contextType: string | undefined, contextData: any): string {
  let contextInfo = "";
  
  if (contextType === 'dashboard' || contextType === 'net_worth') {
    contextInfo = `\n\n## User Financial Data\n`;
    contextInfo += `Net Worth: $${contextData?.netWorth?.toLocaleString() || 0}\n`;
    contextInfo += `Total Assets: $${contextData?.assetsTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Total Liabilities: $${contextData?.liabilitiesTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Cash: $${contextData?.cashTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Investments: $${contextData?.investmentsTotal?.toLocaleString() || 0}`;
  } else if (contextType === 'assets' && contextData) {
    contextInfo = `\n\n## User Assets Data\n`;
    contextInfo += `Total Assets: $${contextData.assetsTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Cash: $${contextData.cashTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Investments: $${contextData.investmentsTotal?.toLocaleString() || 0}`;
  } else if (contextType === 'liabilities' && contextData) {
    contextInfo = `\n\n## User Liabilities Data\n`;
    contextInfo += `Total Liabilities: $${contextData.liabilitiesTotal?.toLocaleString() || 0}`;
  } else if (contextType === 'goal' && contextData) {
    contextInfo = `\n\n## User Goal Data\n`;
    contextInfo += `Goal Name: "${contextData.name}"\n`;
    contextInfo += `Target Amount: $${contextData.targetAmount?.toLocaleString() || 0}\n`;
    contextInfo += `Current Amount: $${contextData.currentAmount?.toLocaleString() || 0}\n`;
    contextInfo += `Progress: ${((contextData.currentAmount / contextData.targetAmount) * 100).toFixed(1)}%\n`;
    contextInfo += `Allocation: ${contextData.allocation?.savings || 0}% savings, ${contextData.allocation?.stocks || 0}% stocks, ${contextData.allocation?.bonds || 0}% bonds\n`;
    if (contextData.description) {
      contextInfo += `\nGoal Details: ${contextData.description}`;
    }
  } else if (contextData && !['market-insights', 'finshorts', 'what-if', 'tax-loss-harvesting', 'explore'].includes(contextType || '')) {
    contextInfo = `\n\n## Additional Context\n${JSON.stringify(contextData, null, 2)}`;
  }
  
  return contextInfo;
}

/**
 * Fetches user financial data for alternate investments context
 */
async function fetchAlternateInvestmentsContext(
  supabase: any,
  authHeader: string | null
): Promise<string> {
  if (!authHeader) return '';
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) return '';
  
  let contextInfo = `\n\n## User Financial Profile\n`;
  
  // Get user profile (income)
  const { data: profile } = await supabase
    .from('profiles')
    .select('income, employment_type, goals, risk_inferred')
    .eq('user_id', user.id)
    .single();
  
  if (profile) {
    contextInfo += `Income: ${profile.income || 'Not specified'}\n`;
    contextInfo += `Employment Type: ${profile.employment_type || 'Not specified'}\n`;
    contextInfo += `Financial Goals: ${profile.goals || 'Not specified'}\n`;
    contextInfo += `Risk Profile: ${profile.risk_inferred || 'Not specified'}\n\n`;
  }
  
  // Get user goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id);
  
  if (goals && goals.length > 0) {
    contextInfo += `## Active Goals (${goals.length})\n`;
    goals.forEach((goal: any, idx: number) => {
      const progress = goal.target_amount > 0 ? ((goal.current_amount / goal.target_amount) * 100).toFixed(1) : 0;
      contextInfo += `${idx + 1}. ${goal.name}\n`;
      contextInfo += `   - Target: $${goal.target_amount?.toLocaleString() || 0}\n`;
      contextInfo += `   - Current: $${goal.current_amount?.toLocaleString() || 0} (${progress}% complete)\n`;
      contextInfo += `   - Allocation: ${goal.allocation_savings}% savings, ${goal.allocation_stocks}% stocks, ${goal.allocation_bonds}% bonds\n`;
      if (goal.description) contextInfo += `   - Details: ${goal.description}\n`;
    });
    contextInfo += '\n';
  }
  
  // Get linked accounts (bank financials)
  const { data: accounts } = await supabase
    .from('linked_accounts')
    .select('*')
    .eq('user_id', user.id);
  
  if (accounts && accounts.length > 0) {
    contextInfo += `## Linked Financial Accounts (${accounts.length})\n`;
    let totalAssets = 0;
    let totalLiabilities = 0;
    
    accounts.forEach((account: any, idx: number) => {
      contextInfo += `${idx + 1}. ${account.provider_name} (${account.account_type}) - ***${account.last_four_digits}\n`;
      contextInfo += `   - Balance: $${account.total_amount?.toLocaleString() || 0}\n`;
      contextInfo += `   - Interest Rate: ${account.interest_rate}%\n`;
      
      // Categorize as asset or liability
      if (account.account_type.toLowerCase().includes('loan') || 
          account.account_type.toLowerCase().includes('credit') ||
          account.account_type.toLowerCase().includes('debt')) {
        totalLiabilities += account.total_amount || 0;
      } else {
        totalAssets += account.total_amount || 0;
      }
    });
    
    contextInfo += `\n**Portfolio Summary:**\n`;
    contextInfo += `Total Assets: $${totalAssets.toLocaleString()}\n`;
    contextInfo += `Total Liabilities: $${totalLiabilities.toLocaleString()}\n`;
    contextInfo += `Net Worth: $${(totalAssets - totalLiabilities).toLocaleString()}\n`;
  }
  
  return contextInfo;
}

/**
 * Handles suggestion decisions (approve/deny/know more)
 */
async function handleSuggestionDecision(
  supabase: any,
  decision: ParsedDecision,
  contextType: string,
  contextData: any,
  messages: Array<{ role: string; content: string }>,
  authHeader: string | null
): Promise<string> {
  // Store decision in DB for goal context
  if (authHeader && contextData?.id && contextType === "goal") {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (user) {
      const lastContent = messages[messages.length - 1]?.content ?? "";
      const { error: insertError } = await supabase
        .from("goal_recommendations")
        .insert({
          user_id: user.id,
          goal_id: contextData.id,
          suggestion_title: decision.suggestionTitle,
          suggestion_note: lastContent,
          decision: decision.decision,
        });

      if (insertError) {
        console.error("Error inserting goal_recommendation:", insertError);
      } else {
        console.log(`Stored ${decision.decision} decision for suggestion: ${decision.suggestionTitle}`);
      }
    }
  }

  // Build context info for decision handling
  let contextInfo = `\n\n## User Data\n`;
  
  if (contextType === "goal") {
    contextInfo += `Goal Name: "${contextData.name}"\n`;
    contextInfo += `Target Amount: $${contextData.targetAmount?.toLocaleString() || 0}\n`;
    contextInfo += `Current Amount: $${contextData.currentAmount?.toLocaleString() || 0}\n`;
    contextInfo += `Progress: ${((contextData.currentAmount / contextData.targetAmount) * 100).toFixed(1)}%\n`;
    contextInfo += `Allocation: ${contextData.allocation?.savings || 0}% savings, ${contextData.allocation?.stocks || 0}% stocks, ${contextData.allocation?.bonds || 0}% bonds\n`;
    if (contextData.description) {
      contextInfo += `\nGoal Details: ${contextData.description}`;
    }
  } else if (contextType === "dashboard" || contextType === "net_worth") {
    contextInfo += `Net Worth: $${contextData.netWorth?.toLocaleString() || 0}\n`;
    contextInfo += `Total Assets: $${contextData.assetsTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Total Liabilities: $${contextData.liabilitiesTotal?.toLocaleString() || 0}\n`;
  } else if (contextType === "assets") {
    contextInfo += `Total Assets: $${contextData.assetsTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Cash: $${contextData.cashTotal?.toLocaleString() || 0}\n`;
    contextInfo += `Investments: $${contextData.investmentsTotal?.toLocaleString() || 0}\n`;
  } else if (contextType === "liabilities") {
    contextInfo += `Total Liabilities: $${contextData.liabilitiesTotal?.toLocaleString() || 0}\n`;
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
    // Fallback to simple message
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
 */
async function handleGoalUpdate(
  supabase: any,
  contextData: any,
  messages: Array<{ role: string; content: string }>,
  authHeader: string | null
): Promise<{ updated: boolean; message: string }> {
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  // Detect goal update intent
  const updateKeywords = ['increase', 'change', 'update', 'modify', 'raise', 'set'];
  const targetKeywords = ['target', 'goal', 'amount'];
  
  if (!updateKeywords.some(kw => lastUserMessage.includes(kw))) {
    return { updated: false, message: '' };
  }
  
  // Extract number (looking for amounts like 125000, $125,000, etc.)
  const numberMatch = lastUserMessage.match(/\$?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/);
  
  if (!numberMatch || !targetKeywords.some(kw => lastUserMessage.includes(kw))) {
    return { updated: false, message: '' };
  }
  
  const newTargetAmount = parseFloat(numberMatch[1].replace(/,/g, ''));
  
  if (!authHeader || newTargetAmount <= 0) {
    return { updated: false, message: '' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) {
    return { updated: false, message: '' };
  }
  
  // Get current user's profile for age calculation
  const { data: profile } = await supabase
    .from('profiles')
    .select('date_of_birth')
    .eq('user_id', user.id)
    .single();
  
  let newTargetAge = null;
  if (profile?.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    const currentAge = today.getFullYear() - birthDate.getFullYear();
    newTargetAge = currentAge + 8; // 8 years from now
  }
  
  // Update the goal
  const { error } = await supabase
    .from('goals')
    .update({
      target_amount: newTargetAmount,
      ...(newTargetAge && { target_age: newTargetAge }),
      updated_at: new Date().toISOString()
    })
    .eq('id', contextData.id)
    .eq('user_id', user.id);
  
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
    const { messages, conversationId, contextType, contextData } = await req.json();
    console.log('[financial-chat] Request received:', { 
      messagesLength: messages?.length, 
      conversationId, 
      contextType 
    });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const authHeader = req.headers.get('Authorization');

    // Check if this is a suggestion decision (approve/deny/know more)
    const lastMessage = messages[messages.length - 1];
    const lastContent: string = lastMessage?.content ?? "";
    const isSuggestionContext = 
      contextType === "goal" || 
      contextType === "dashboard" ||
      contextType === "net_worth" || 
      contextType === "assets" || 
      contextType === "liabilities";

    // Parse decision from message
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
        authHeader
      );

      return new Response(
        JSON.stringify({ message: confirmationMessage }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check for goal update requests
    if (contextType === 'goal' && contextData?.id) {
      const goalUpdateResult = await handleGoalUpdate(
        supabase,
        contextData,
        messages,
        authHeader
      );
      
      if (goalUpdateResult.updated) {
        return new Response(
          JSON.stringify({ message: goalUpdateResult.message, goalUpdated: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Resolve prompt type and load prompt from markdown file
    const promptType = resolvePromptType(contextType);
    console.log('[financial-chat] Loading prompt:', promptType);
    
    let promptContent: string;
    try {
      promptContent = await loadPromptFromFile(promptType);
    } catch (error) {
      console.error("Error loading prompt file:", error);
      // Use a basic fallback prompt
      promptContent = "You are GrowWise AI, a helpful financial assistant. Provide clear, concise, and helpful responses.";
    }
    
    // Build context-specific information
    let contextInfo = "";
    if (contextType === 'alternate-investments') {
      contextInfo = await fetchAlternateInvestmentsContext(supabase, authHeader);
    } else {
      contextInfo = buildContextInfo(contextType, contextData);
    }

    // Combine prompt with context
    const systemPrompt = `${promptContent}${contextInfo}`;

    console.log('[financial-chat] Invoking LangChain with prompt type:', promptType);
    console.log('[financial-chat] System prompt preview:', systemPrompt.slice(0, 150));

    // Invoke LangChain chat
    try {
      const response = await invokeChat(systemPrompt, messages);
      
      console.log('[financial-chat] LangChain response received successfully');

      return new Response(
        JSON.stringify({ message: response }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (llmError: any) {
      console.error("LangChain LLM error:", llmError);
      
      // Handle rate limits
      if (llmError.message?.includes('429') || llmError.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Handle payment required
      if (llmError.message?.includes('402') || llmError.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw llmError;
    }

  } catch (error) {
    console.error("[financial-chat] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
