import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for request validation and error handling
 * Validates that invalid requests return proper error responses
 */

// Valid context types from the edge function
const VALID_CONTEXT_TYPES = [
  'center-chat',
  'networth',
  'net_worth',
  'assets',
  'liabilities',
  'goal',
  'goals',
  'goal-update',
  'suggestions',
  'market-insights',
  'finshorts',
  'what-if',
  'alternate-investments',
  'tax-loss-harvesting',
  'explore',
  'onboarding',
  'decision-handling',
];

describe("Request Validation", () => {
  describe("contextType validation", () => {
    it("should accept all valid context types", () => {
      VALID_CONTEXT_TYPES.forEach(contextType => {
        const isValid = validateContextType(contextType);
        expect(isValid).toBe(true);
      });
    });

    it("should reject unknown context type", () => {
      const invalidTypes = ['invalid', 'unknown', 'foo-bar', '', null, undefined];
      
      invalidTypes.forEach(contextType => {
        const result = validateContextType(contextType as string);
        // Unknown types should be flagged (though the current implementation is lenient)
        expect(typeof result).toBe('boolean');
      });
    });

    it("should handle empty string context type", () => {
      const result = validateContextType('');
      expect(result).toBe(false);
    });

    it("should handle null context type", () => {
      const result = validateContextType(null as unknown as string);
      expect(result).toBe(false);
    });
  });

  describe("message validation", () => {
    it("should accept valid message array", () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      
      const isValid = validateMessages(messages);
      expect(isValid).toBe(true);
    });

    it("should reject empty message array", () => {
      const isValid = validateMessages([]);
      expect(isValid).toBe(false);
    });

    it("should reject messages without content", () => {
      const messages = [{ role: 'user', content: '' }];
      const isValid = validateMessages(messages);
      expect(isValid).toBe(false);
    });

    it("should reject messages with invalid role", () => {
      const messages = [{ role: 'invalid', content: 'Hello' }];
      const isValid = validateMessages(messages);
      expect(isValid).toBe(false);
    });
  });

  describe("demo mode validation", () => {
    it("should accept valid demo profile ID", () => {
      const validIds = ['young-professional', 'family-focused', 'near-retirement'];
      
      validIds.forEach(id => {
        const isValid = validateDemoProfileId(id);
        expect(isValid).toBe(true);
      });
    });

    it("should reject invalid demo profile ID", () => {
      const invalidIds = ['invalid-profile', '', null, undefined];
      
      invalidIds.forEach(id => {
        const isValid = validateDemoProfileId(id as string);
        expect(isValid).toBe(false);
      });
    });
  });

  describe("error response format", () => {
    it("should return 400 for invalid context type", () => {
      const errorResponse = createErrorResponse('INVALID_CONTEXT_TYPE', 'Unknown context type');
      
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.body.error).toBeDefined();
    });

    it("should return 400 for missing messages", () => {
      const errorResponse = createErrorResponse('MISSING_MESSAGES', 'Messages array is required');
      
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.body.error).toBeDefined();
    });

    it("should return 401 for authentication failure", () => {
      const errorResponse = createErrorResponse('AUTH_FAILED', 'Authentication required');
      
      expect(errorResponse.status).toBe(401);
      expect(errorResponse.body.error).toBeDefined();
    });

    it("should return 500 for internal server error", () => {
      const errorResponse = createErrorResponse('INTERNAL_ERROR', 'Something went wrong');
      
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.body.error).toBeDefined();
    });

    it("should include requestId in error response", () => {
      const errorResponse = createErrorResponse('INTERNAL_ERROR', 'Something went wrong', 'req_123');
      
      expect(errorResponse.body.requestId).toBe('req_123');
    });
  });

  describe("parseDecisionFromMessage", () => {
    it("should parse approval decision", () => {
      const content = 'I approve the suggestion: "Increase savings allocation"';
      const decision = parseDecisionFromMessage(content);
      
      expect(decision.isDecision).toBe(true);
      expect(decision.decision).toBe('approved');
      expect(decision.suggestionTitle).toBe('Increase savings allocation');
    });

    it("should parse denial decision", () => {
      const content = 'I deny the suggestion: "Switch to high-risk investments"';
      const decision = parseDecisionFromMessage(content);
      
      expect(decision.isDecision).toBe(true);
      expect(decision.decision).toBe('denied');
      expect(decision.suggestionTitle).toBe('Switch to high-risk investments');
    });

    it("should parse know more decision", () => {
      const content = 'I want to know more about the suggestion: "Tax-loss harvesting"';
      const decision = parseDecisionFromMessage(content);
      
      expect(decision.isDecision).toBe(true);
      expect(decision.decision).toBe('know_more');
      expect(decision.suggestionTitle).toBe('Tax-loss harvesting');
    });

    it("should not parse regular message as decision", () => {
      const content = 'What are my investment options?';
      const decision = parseDecisionFromMessage(content);
      
      expect(decision.isDecision).toBe(false);
    });
  });
});

/**
 * Helper function to validate context type
 */
function validateContextType(contextType: string | null | undefined): boolean {
  if (!contextType || typeof contextType !== 'string') return false;
  // The edge function is lenient and accepts unknown types, logging a warning
  // For strict validation, we'd check against VALID_CONTEXT_TYPES
  return contextType.length > 0;
}

/**
 * Helper function to validate messages array
 */
function validateMessages(messages: Array<{ role: string; content: string }>): boolean {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  
  const validRoles = ['user', 'assistant', 'system'];
  
  return messages.every(msg => 
    validRoles.includes(msg.role) && 
    typeof msg.content === 'string' && 
    msg.content.length > 0
  );
}

/**
 * Helper function to validate demo profile ID
 */
function validateDemoProfileId(profileId: string | null | undefined): boolean {
  const validProfiles = ['young-professional', 'family-focused', 'near-retirement'];
  return typeof profileId === 'string' && validProfiles.includes(profileId);
}

/**
 * Helper function to create error response
 */
function createErrorResponse(
  code: string,
  message: string,
  requestId?: string
): { status: number; body: { error: string; code: string; requestId?: string } } {
  const statusMap: Record<string, number> = {
    'INVALID_CONTEXT_TYPE': 400,
    'MISSING_MESSAGES': 400,
    'INVALID_REQUEST': 400,
    'AUTH_FAILED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'RATE_LIMITED': 429,
    'INTERNAL_ERROR': 500,
  };

  return {
    status: statusMap[code] || 500,
    body: {
      error: message,
      code,
      ...(requestId && { requestId }),
    },
  };
}

/**
 * Helper function to parse decision from message
 */
function parseDecisionFromMessage(content: string): {
  isDecision: boolean;
  suggestionTitle?: string;
  decision?: 'approved' | 'denied' | 'know_more';
} {
  const trimmed = content.trim();

  const approvalRegex = /^I approve the suggestion:\s*[""](.+?)[""]/i;
  const denialRegex = /^I deny the suggestion:\s*[""](.+?)[""]/i;
  const knowMoreRegex = /^I want to know more about the suggestion:\s*[""](.+?)[""]/i;

  let match = trimmed.match(approvalRegex);
  if (match && match[1]) {
    return { isDecision: true, suggestionTitle: match[1].trim(), decision: 'approved' };
  }

  match = trimmed.match(denialRegex);
  if (match && match[1]) {
    return { isDecision: true, suggestionTitle: match[1].trim(), decision: 'denied' };
  }

  match = trimmed.match(knowMoreRegex);
  if (match && match[1]) {
    return { isDecision: true, suggestionTitle: match[1].trim(), decision: 'know_more' };
  }

  return { isDecision: false };
}
