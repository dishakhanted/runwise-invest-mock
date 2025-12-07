// Prompt loader for edge functions
// Reads markdown prompts and returns content

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
 * Loads a prompt from the prompts directory
 */
export async function loadPrompt(promptType: PromptType): Promise<string> {
  try {
    const path = new URL(`./prompts/${promptType}.md`, import.meta.url).pathname;
    console.log(`[promptLoader] Loading prompt: ${promptType}.md from ${path}`);
    
    const content = await Deno.readTextFile(path);
    
    if (!content || content.trim().length === 0) {
      console.error(`[promptLoader] Prompt file ${promptType}.md is empty`);
      throw new Error(`Prompt file missing or invalid for type: ${promptType}`);
    }
    
    console.log(`[promptLoader] Successfully loaded ${promptType}.md (${content.length} chars)`);
    return content;
  } catch (error) {
    console.error(`[promptLoader] Error loading prompt ${promptType}:`, error);
    throw new Error(`Prompt file missing or invalid for type: ${promptType} - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Determines the prompt type based on context
 */
export function getPromptTypeFromContext(contextType?: string): PromptType {
  // Map context types to prompt .md files
  const mapping: Record<string, PromptType> = {
    'onboarding': 'onboarding',
    'dashboard': 'networth',
    'net-worth': 'networth',
    'net_worth': 'networth',  // Support underscore variant
    'networth': 'networth',
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
    'decision-handling': 'decision-handling',
    'goal-update': 'goal-update',
    'suggestions': 'suggestions',
  };

  return mapping[contextType || ''] || 'center-chat';
}
