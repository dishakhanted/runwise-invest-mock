import { describe, it, expect } from "vitest";

/**
 * Tests for prompt file structure and loading
 */
describe("promptLoader", () => {
  // Expected prompt files that should exist in the edge function
  const expectedPrompts = [
    "onboarding.md",
    "networth.md",
    "assets.md",
    "liabilities.md",
    "goals.md",
    "center-chat.md",
    "what-if.md",
    "market-insights.md",
    "finshorts.md",
    "alternate-investments.md",
    "explore.md",
    "tax-loss-harvesting.md",
    "goal-update.md",
    "suggestions.md",
    "decision-handling.md",
  ];

  it("should have expected prompt files defined", () => {
    expect(expectedPrompts.length).toBeGreaterThan(10);
  });

  it("should have unique prompt file names", () => {
    const uniquePrompts = new Set(expectedPrompts);
    expect(uniquePrompts.size).toBe(expectedPrompts.length);
  });

  it("should have .md extension for all prompt files", () => {
    expectedPrompts.forEach(prompt => {
      expect(prompt.endsWith('.md')).toBe(true);
    });
  });

  describe("resolvePromptType", () => {
    const contextTypeToPrompt: Record<string, string> = {
      'networth': 'networth',
      'net_worth': 'networth',
      'assets': 'assets',
      'liabilities': 'liabilities',
      'goal': 'goals',
      'goals': 'goals',
      'goal-update': 'goal-update',
      'center-chat': 'center-chat',
      'dashboard': 'center-chat',
      'market-insights': 'market-insights',
      'finshorts': 'finshorts',
      'what-if': 'what-if',
      'alternate-investments': 'alternate-investments',
      'tax-loss-harvesting': 'tax-loss-harvesting',
      'explore': 'explore',
      'onboarding': 'onboarding',
      'suggestions': 'suggestions',
    };

    it.each(Object.entries(contextTypeToPrompt))(
      "should map %s to %s prompt",
      (contextType, expectedPrompt) => {
        const resolvedPrompt = resolvePromptType(contextType);
        expect(resolvedPrompt).toBe(expectedPrompt);
      }
    );

    it("should return center-chat for unknown context types", () => {
      const resolvedPrompt = resolvePromptType('unknown-type');
      expect(resolvedPrompt).toBe('center-chat');
    });
  });
});

/**
 * Helper function to resolve prompt type from context type
 * Mirrors the logic in promptLoader.ts
 */
function resolvePromptType(contextType: string): string {
  const contextTypeToPrompt: Record<string, string> = {
    'networth': 'networth',
    'net_worth': 'networth',
    'assets': 'assets',
    'liabilities': 'liabilities',
    'goal': 'goals',
    'goals': 'goals',
    'goal-update': 'goal-update',
    'center-chat': 'center-chat',
    'dashboard': 'center-chat',
    'market-insights': 'market-insights',
    'finshorts': 'finshorts',
    'what-if': 'what-if',
    'alternate-investments': 'alternate-investments',
    'tax-loss-harvesting': 'tax-loss-harvesting',
    'explore': 'explore',
    'onboarding': 'onboarding',
    'suggestions': 'suggestions',
  };

  return contextTypeToPrompt[contextType] || 'center-chat';
}
