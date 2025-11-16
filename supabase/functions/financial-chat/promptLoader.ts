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
  | 'alternate-investments';

/**
 * Loads a prompt from the prompts directory
 */
export async function loadPrompt(promptType: PromptType): Promise<string> {
  try {
    const path = new URL(`./prompts/${promptType}.md`, import.meta.url).pathname;
    const content = await Deno.readTextFile(path);
    return content;
  } catch (error) {
    console.error(`Error loading prompt ${promptType}:`, error);
    return `# ${promptType} Chatbot\n\nYou are a helpful financial assistant.`;
  }
}

/**
 * Determines the prompt type based on context
 */
export function getPromptTypeFromContext(contextType?: string): PromptType {
  switch (contextType) {
    case 'onboarding':
      return 'onboarding';
    case 'dashboard':
      return 'networth';
    case 'assets':
      return 'assets';
    case 'liabilities':
      return 'liabilities';
    case 'goal':
      return 'goals';
    case 'market-insights':
      return 'market-insights';
    case 'what-if':
      return 'what-if';
    case 'finshorts':
      return 'finshorts';
    case 'alternate-investments':
      return 'alternate-investments';
    default:
      return 'center-chat';
  }
}
