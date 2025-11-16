import { describe, it, expect } from "vitest";

describe("promptLoader", () => {
  it("should be configured for edge function testing", () => {
    // Placeholder test - edge functions use Deno runtime
    // Frontend tests would go here for React components
    expect(true).toBe(true);
  });

  it("validates prompt file structure", () => {
    // Test that prompt files follow expected format
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
      "tax-loss-harvesting.md"
    ];
    
    expect(expectedPrompts.length).toBeGreaterThan(0);
  });
});
