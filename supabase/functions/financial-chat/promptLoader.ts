// Prompt loader for edge functions
// Uses import-based loading from TypeScript prompt files

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

// Import all prompts
import { PROMPT as onboardingPrompt } from './prompts/onboarding.ts';
import { PROMPT as networthPrompt } from './prompts/networth.ts';
import { PROMPT as assetsPrompt } from './prompts/assets.ts';
import { PROMPT as liabilitiesPrompt } from './prompts/liabilities.ts';
import { PROMPT as goalsPrompt } from './prompts/goals.ts';
import { PROMPT as centerChatPrompt } from './prompts/center-chat.ts';
import { PROMPT as marketInsightsPrompt } from './prompts/market-insights.ts';
import { PROMPT as whatIfPrompt } from './prompts/what-if.ts';
import { PROMPT as finshortsPrompt } from './prompts/finshorts.ts';
import { PROMPT as alternateInvestmentsPrompt } from './prompts/alternate-investments.ts';
import { PROMPT as explorePrompt } from './prompts/explore.ts';
import { PROMPT as taxLossHarvestingPrompt } from './prompts/tax-loss-harvesting.ts';
import { PROMPT as decisionHandlingPrompt } from './prompts/decision-handling.ts';
import { PROMPT as goalUpdatePrompt } from './prompts/goal-update.ts';
import { PROMPT as suggestionsPrompt } from './prompts/suggestions.ts';

// Prompt mapping
const promptMap: Record<PromptType, string> = {
  'onboarding': onboardingPrompt,
  'networth': networthPrompt,
  'assets': assetsPrompt,
  'liabilities': liabilitiesPrompt,
  'goals': goalsPrompt,
  'center-chat': centerChatPrompt,
  'market-insights': marketInsightsPrompt,
  'what-if': whatIfPrompt,
  'finshorts': finshortsPrompt,
  'alternate-investments': alternateInvestmentsPrompt,
  'explore': explorePrompt,
  'tax-loss-harvesting': taxLossHarvestingPrompt,
  'decision-handling': decisionHandlingPrompt,
  'goal-update': goalUpdatePrompt,
  'suggestions': suggestionsPrompt,
};

/**
 * Loads a prompt from the prompts directory using import-based loading
 */
export async function loadPrompt(promptType: PromptType): Promise<string> {
  const prompt = promptMap[promptType];
  
  if (!prompt || prompt.trim().length === 0) {
    console.error(`[promptLoader] Prompt ${promptType} is missing or empty`);
    throw new Error(`Prompt missing or invalid for type: ${promptType}`);
  }
  
  console.log(`[promptLoader] Successfully loaded ${promptType} (${prompt.length} chars)`);
  return prompt;
}

/**
 * Determines the prompt type based on context
 */
export function getPromptTypeFromContext(contextType?: string): PromptType {
  // Map context types to prompt TypeScript files
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
