// Prompt loader utility to fetch prompt content from MD files

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
  | 'tax-loss-harvesting';

export async function loadPrompt(promptType: PromptType): Promise<string> {
  try {
    const response = await fetch(`/src/prompts/${promptType}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt: ${promptType}`);
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Error loading prompt ${promptType}:`, error);
    return '';
  }
}

export function createFullPrompt(basePrompt: string, userContext: string): string {
  return `${basePrompt}\n\n## User Context\n${userContext}`;
}
