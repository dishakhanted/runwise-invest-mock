import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  ONBOARDING_PROMPT,
  NETWORTH_PROMPT,
  ASSETS_PROMPT,
  LIABILITIES_PROMPT,
  GOALS_PROMPT,
  CENTER_CHAT_PROMPT,
  MARKET_INSIGHTS_PROMPT,
  WHAT_IF_PROMPT,
  FINSHORTS_PROMPT,
  ALTERNATE_INVESTMENTS_PROMPT,
  EXPLORE_PROMPT,
  TAX_LOSS_HARVESTING_PROMPT,
  SUGGESTIONS_PROMPT
} from './prompts.ts';

export type PromptType = 
  | 'onboarding'
  | 'networth'
  | 'assets'
  | 'liabilities'
  | 'goals'
  | 'center-chat'
  | 'market-insights'
  | 'what-if'
  | 'finshorts'
  | 'alternate-investments'
  | 'explore'
  | 'tax-loss-harvesting'
  | 'suggestions';

function loadPrompt(promptType: PromptType): string {
  const prompts: Record<PromptType, string> = {
    'onboarding': ONBOARDING_PROMPT,
    'networth': NETWORTH_PROMPT,
    'assets': ASSETS_PROMPT,
    'liabilities': LIABILITIES_PROMPT,
    'goals': GOALS_PROMPT,
    'center-chat': CENTER_CHAT_PROMPT,
    'market-insights': MARKET_INSIGHTS_PROMPT,
    'what-if': WHAT_IF_PROMPT,
    'finshorts': FINSHORTS_PROMPT,
    'alternate-investments': ALTERNATE_INVESTMENTS_PROMPT,
    'explore': EXPLORE_PROMPT,
    'tax-loss-harvesting': TAX_LOSS_HARVESTING_PROMPT,
    'suggestions': SUGGESTIONS_PROMPT,
  };
  
  return prompts[promptType] || CENTER_CHAT_PROMPT;
}

function getPromptTypeFromContext(contextType?: string): PromptType {
  const mapping: Record<string, PromptType> = {
    'onboarding': 'onboarding',
    'dashboard': 'networth',
    'net-worth': 'networth',
    'assets': 'assets',
    'liabilities': 'liabilities',
    'goal': 'goals',
    'goals': 'goals',
    'center-chat': 'center-chat',
    'what-if': 'what-if',
    'market-insights': 'market-insights',
    'alternative-investments': 'alternate-investments',
    'alternate-investments': 'alternate-investments',
    'finshorts': 'finshorts',
    'explore': 'explore',
    'tax-loss-harvesting': 'tax-loss-harvesting',
  };

  return mapping[contextType || ''] || 'center-chat';
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, contextType, contextData } = await req.json();
    console.log('Received request:', { messagesLength: messages?.length, conversationId, contextType });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if this is a suggestion decision (approve/deny/know more)
    const lastMessage = messages[messages.length - 1];
    const lastContent: string = lastMessage?.content ?? "";
    const isGoalContext = contextType === "goal";

    let decision: ParsedDecision | null = null;
    if (isGoalContext && lastMessage?.role === "user") {
      const parsed = parseDecisionFromMessage(lastContent);
      if (parsed.isDecision) {
        decision = parsed;
      }
    }

    // If this is a decision for a goal, store it and call AI with suggestions prompt
    if (decision && isGoalContext) {
      // Get auth user from the request
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        const goalId = contextData?.id;

        if (user && goalId) {
          // Insert a row into goal_recommendations
          const { error: insertError } = await supabase
            .from("goal_recommendations")
            .insert({
              user_id: user.id,
              goal_id: goalId,
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

      // Use the suggestions prompt to generate appropriate response
      const suggestionsPrompt = loadPrompt('suggestions');
      
      // Build goal context
      let contextInfo = `\n\n## User Goal Data\n`;
      contextInfo += `Goal Name: "${contextData.name}"\n`;
      contextInfo += `Target Amount: $${contextData.targetAmount?.toLocaleString() || 0}\n`;
      contextInfo += `Current Amount: $${contextData.currentAmount?.toLocaleString() || 0}\n`;
      contextInfo += `Progress: ${((contextData.currentAmount / contextData.targetAmount) * 100).toFixed(1)}%\n`;
      contextInfo += `Allocation: ${contextData.allocation?.savings || 0}% savings, ${contextData.allocation?.stocks || 0}% stocks, ${contextData.allocation?.bonds || 0}% bonds\n`;
      if (contextData.description) {
        contextInfo += `\nGoal Details: ${contextData.description}`;
      }

      // Add decision-specific instructions
      let decisionContext = `\n\n## User Action\n`;
      if (decision.decision === 'approved') {
        decisionContext += `The user APPROVED the suggestion: "${decision.suggestionTitle}"\n`;
        decisionContext += `IMPORTANT: Follow the APPROVE rules. Provide 2-3 specific next steps. DO NOT generate any new suggestions.`;
      } else if (decision.decision === 'denied') {
        decisionContext += `The user DENIED the suggestion: "${decision.suggestionTitle}"\n`;
        decisionContext += `IMPORTANT: Follow the DENY rules. Accept gracefully, ask ONE clarifying question, offer ONE alternative. DO NOT generate multiple new suggestions.`;
      } else if (decision.decision === 'know_more') {
        decisionContext += `The user wants to KNOW MORE about the suggestion: "${decision.suggestionTitle}"\n`;
        decisionContext += `IMPORTANT: Follow the KNOW MORE rules. Expand on the recommendation, explain benefits and impact. End with "Would you like to proceed with this?"`;
      }

      const systemPrompt = `${suggestionsPrompt}${contextInfo}${decisionContext}`;

      // Format messages for Lovable AI
      const aiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      console.log('Calling AI for suggestion response with decision:', decision.decision);

      // Call Lovable AI Gateway
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI gateway error for suggestion response:", aiResponse.status);
        // Fallback to simple message
        let fallbackMessage = '';
        if (decision.decision === 'approved') {
          fallbackMessage = `Great! I've noted your approval. This will help you reach your goal faster.`;
        } else if (decision.decision === 'denied') {
          fallbackMessage = `Understood. Let me know if you'd like to explore other options.`;
        } else {
          fallbackMessage = `Let me provide more details about this suggestion.`;
        }
        
        return new Response(
          JSON.stringify({ message: fallbackMessage }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      const aiData = await aiResponse.json();
      const confirmationMessage = aiData.choices?.[0]?.message?.content || "I've noted your decision.";

      return new Response(
        JSON.stringify({
          message: confirmationMessage,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if this is a goal update request
    let goalUpdateDetected = false;
    let goalUpdateSummary = '';
    
    if (contextType === 'goal' && contextData?.id) {
      const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      
      // Detect goal update intent
      const updateKeywords = ['increase', 'change', 'update', 'modify', 'raise', 'set'];
      const targetKeywords = ['target', 'goal', 'amount'];
      
      if (updateKeywords.some(kw => lastUserMessage.includes(kw))) {
        // Extract number (looking for amounts like 125000, $125,000, etc.)
        const numberMatch = lastUserMessage.match(/\$?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/);
        
        if (numberMatch && targetKeywords.some(kw => lastUserMessage.includes(kw))) {
          const newTargetAmount = parseFloat(numberMatch[1].replace(/,/g, ''));
          
          // Calculate new target age based on 8 years
          const authHeader = req.headers.get('Authorization');
          const token = authHeader?.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          
          if (user && newTargetAmount > 0) {
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
            
            if (!error) {
              goalUpdateDetected = true;
              goalUpdateSummary = `✅ Goal Updated Successfully!\n\n` +
                `Your goal has been updated to $${newTargetAmount.toLocaleString()}. ` +
                `It will now take you 8 years to reach your goal. ` +
                `Do you want to increase the allocation to reach the goal earlier?`;
            }
          }
        }
      }
    }
    
    // If goal was updated, return the summary directly
    if (goalUpdateDetected) {
      return new Response(
        JSON.stringify({ message: goalUpdateSummary, goalUpdated: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Load the appropriate prompt from markdown file
    const promptType = getPromptTypeFromContext(contextType);
    console.log('Loading prompt type:', promptType, 'for context:', contextType);
    
    const promptContent = loadPrompt(promptType);
    console.log('Prompt loaded successfully, length:', promptContent.length);
    
    // Build context-specific information
    let contextInfo = "";
    if (contextType === 'dashboard' && contextData) {
      contextInfo = `\n\n## User Financial Data\n`;
      contextInfo += `Net Worth: $${contextData.netWorth?.toLocaleString() || 0}\n`;
      contextInfo += `Assets: $${contextData.assetsTotal?.toLocaleString() || 0}\n`;
      contextInfo += `Liabilities: $${contextData.liabilitiesTotal?.toLocaleString() || 0}\n`;
      contextInfo += `Cash: $${contextData.cashTotal?.toLocaleString() || 0}\n`;
      contextInfo += `Investments: $${contextData.investmentsTotal?.toLocaleString() || 0}`;
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
    } else if (contextData) {
      contextInfo = `\n\n## Additional Context\n${JSON.stringify(contextData, null, 2)}`;
    }

    // Build the system prompt with context
    const systemPrompt = `${promptContent}${contextInfo}`;

    // Format messages for Lovable AI
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log('Calling Lovable AI with prompt type:', promptType);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    console.log('Lovable AI response generated successfully');

    return new Response(
      JSON.stringify({ message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in financial-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
