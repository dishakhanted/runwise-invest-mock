/**
 * LangChain Client for Financial Chat Edge Function
 * Provides LLM and prompt template utilities for AI interactions
 */

import { ChatOpenAI } from "https://esm.sh/@langchain/openai@0.3.17?deps=@langchain/core@0.3.32,langsmith@0.2.15";
import { HumanMessage, SystemMessage, AIMessage, type BaseMessage } from "https://esm.sh/@langchain/core@0.3.32/messages?deps=langsmith@0.2.15";

// Lovable AI Gateway configuration
const LOVABLE_AI_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MODEL = "google/gemini-2.5-flash";
const DEFAULT_TEMPERATURE = 0.2;

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
  | 'decision-handling'
  | 'goal-update'
  | 'suggestions';

/**
 * Gets a configured LangChain ChatOpenAI instance pointing to Lovable AI Gateway
 */
export function getLLM(options?: { 
  model?: string; 
  temperature?: number;
  streaming?: boolean;
}): ChatOpenAI {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: options?.model || DEFAULT_MODEL,
    temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
    streaming: options?.streaming ?? false,
    configuration: {
      baseURL: LOVABLE_AI_BASE_URL,
    },
  });
}

/**
 * Prompt file mapping for context types
 */
const PROMPT_FILE_MAPPING: Record<string, PromptType> = {
  'onboarding': 'onboarding',
  'dashboard': 'networth',
  'net_worth': 'networth',
  'net-worth': 'networth',
  'assets': 'assets',
  'liabilities': 'liabilities',
  'goal': 'goals',
  'goals': 'goals',
  'center-chat': 'center-chat',
  'market-insights': 'market-insights',
  'what-if': 'what-if',
  'finshorts': 'finshorts',
  'alternate-investments': 'alternate-investments',
  'alternative-investments': 'alternate-investments',
  'explore': 'explore',
  'tax-loss-harvesting': 'tax-loss-harvesting',
  'decision-handling': 'decision-handling',
  'goal-update': 'goal-update',
  'suggestions': 'suggestions',
};

/**
 * Resolves a context type to its corresponding prompt type
 */
export function resolvePromptType(contextType?: string): PromptType {
  const promptType = PROMPT_FILE_MAPPING[contextType || ''] || 'center-chat';
  console.log(`[resolvePromptType] contextType: "${contextType}" → promptType: "${promptType}"`);
  return promptType;
}

/**
 * Loads a prompt from the prompts directory
 */
export async function loadPromptFromFile(promptType: PromptType): Promise<string> {
  try {
    const path = new URL(`./prompts/${promptType}.md`, import.meta.url).pathname;
    const content = await Deno.readTextFile(path);
    
    if (!content || content.trim().length === 0) {
      console.error(`Prompt file ${promptType}.md is empty`);
      throw new Error(`Prompt file missing or invalid for type: ${promptType}`);
    }
    
    console.log(`[loadPromptFromFile] Loaded ${promptType}.md (${content.length} chars)`);
    return content;
  } catch (error) {
    console.error(`Error loading prompt ${promptType}:`, error);
    // Fallback to center-chat if specific prompt not found
    if (promptType !== 'center-chat') {
      console.log(`Falling back to center-chat prompt`);
      return loadPromptFromFile('center-chat');
    }
    throw new Error(`Prompt file missing or invalid for type: ${promptType}`);
  }
}

/**
 * Converts messages array to LangChain message objects
 */
function convertToLangChainMessages(
  messages: Array<{ role: string; content: string }>
): BaseMessage[] {
  return messages.map(msg => {
    if (msg.role === 'user') {
      return new HumanMessage({ content: msg.content });
    } else {
      return new AIMessage({ content: msg.content });
    }
  });
}

/**
 * Invokes a chat chain with messages and returns the response
 */
export async function invokeChat(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const llm = getLLM(options);
  
  // Build messages array with system prompt
  const langChainMessages: BaseMessage[] = [
    new SystemMessage({ content: systemPrompt }),
    ...convertToLangChainMessages(messages),
  ];

  console.log(`[invokeChat] Invoking LLM with ${langChainMessages.length} messages`);
  
  const response = await llm.invoke(langChainMessages);
  
  // Extract content from response
  const content = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);
  
  console.log(`[invokeChat] Response received (${content.length} chars)`);
  
  return content;
}
