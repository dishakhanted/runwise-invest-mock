import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { ChatOpenAI } from "https://esm.sh/@langchain/openai@0.3.16";
import { PromptTemplate } from "https://esm.sh/@langchain/core@0.3.20/prompts";
import { loadPrompt, getPromptTypeFromContext } from './promptLoader.ts';

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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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

    // Load the appropriate prompt from MD file based on context
    const promptType = getPromptTypeFromContext(contextType);
    console.log('Loading prompt type:', promptType, 'for context:', contextType);
    
    const promptContent = await loadPrompt(promptType);
    
    if (!promptContent) {
      throw new Error(`Prompt file missing or invalid for type: ${promptType}`);
    }
    
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

    // Create LangChain prompt template - markdown prompt is the root of truth
    const promptTemplate = PromptTemplate.fromTemplate(`${promptContent}
${contextInfo}

## Conversation History
{conversationHistory}

## Current User Message
{currentMessage}`);

    // Format conversation history
    const conversationHistory = messages
      .slice(0, -1)
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const currentMessage = messages[messages.length - 1]?.content || '';

    console.log('Using LangChain with prompt type:', promptType);

    // Initialize LangChain LLM
    const llm = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    try {
      // Format the prompt with the conversation data
      const formattedPrompt = await promptTemplate.format({
        conversationHistory,
        currentMessage,
      });

      // Invoke the LLM
      const response = await llm.invoke(formattedPrompt);
      const message = response.content || "I apologize, but I couldn't generate a response.";

      console.log('LangChain response generated successfully');

      return new Response(
        JSON.stringify({ message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (llmError) {
      console.error("LangChain LLM error:", llmError);
      throw new Error(`Failed to generate response: ${llmError instanceof Error ? llmError.message : "Unknown error"}`);
    }

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
