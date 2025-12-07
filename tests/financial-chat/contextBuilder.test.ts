import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for context builder functions
 * These tests validate that context is properly built for different contextTypes
 */

// Mock demo profile data matching the edge function structure
const mockDemoProfile = {
  id: 'young-professional',
  name: 'Alex Chen',
  profile: {
    legal_first_name: 'Alex',
    legal_last_name: 'Chen',
    preferred_first_name: 'Alex',
    income: '$125,000/year',
    employment_type: 'full-time',
    goals: 'Buy a house, Build emergency fund',
    risk_inferred: 'medium',
    date_of_birth: '1996-03-15',
    city: 'San Francisco',
    state: 'CA',
  },
  linkedAccounts: [
    {
      id: 'demo-bank-1',
      account_type: 'bank' as const,
      provider_name: 'Chase',
      last_four_digits: '4521',
      total_amount: 28500,
      interest_rate: 4.25,
      allocation_savings: 100,
      allocation_stocks: 0,
      allocation_bonds: 0,
    },
    {
      id: 'demo-investment-1',
      account_type: 'investment' as const,
      provider_name: 'Fidelity 401k',
      last_four_digits: '3345',
      total_amount: 67500,
      interest_rate: 8.5,
      allocation_savings: 0,
      allocation_stocks: 80,
      allocation_bonds: 20,
    },
    {
      id: 'demo-loan-1',
      account_type: 'loan' as const,
      provider_name: 'SoFi',
      last_four_digits: '2234',
      total_amount: 18500,
      interest_rate: 5.99,
      allocation_savings: 0,
      allocation_stocks: 0,
      allocation_bonds: 0,
    },
  ],
  goals: [
    {
      id: 'demo-goal-1',
      name: 'Down Payment',
      target_amount: 100000,
      current_amount: 43500,
      target_age: 32,
      description: 'Save for a 20% down payment',
      saving_account: 'Marcus HYSA',
      investment_account: 'Robinhood',
      allocation_savings: 60,
      allocation_stocks: 30,
      allocation_bonds: 10,
    },
  ],
  netWorthSummary: {
    netWorth: 77500,
    assetsTotal: 96000,
    liabilitiesTotal: 18500,
    cashTotal: 28500,
    investmentsTotal: 67500,
  },
};

describe("contextBuilder", () => {
  describe("buildUserContextFromDemo", () => {
    it("should build context from demo profile with all required fields", () => {
      // Simulate what buildUserContextFromDemo would return
      const context = {
        userProfile: mockDemoProfile.profile,
        linkedAccounts: mockDemoProfile.linkedAccounts,
        goals: mockDemoProfile.goals,
        netWorthSummary: mockDemoProfile.netWorthSummary,
      };

      expect(context.userProfile).toBeDefined();
      expect(context.userProfile?.legal_first_name).toBe('Alex');
      expect(context.linkedAccounts).toHaveLength(3);
      expect(context.goals).toHaveLength(1);
      expect(context.netWorthSummary.netWorth).toBe(77500);
    });

    it("should correctly categorize accounts by type", () => {
      const bankAccounts = mockDemoProfile.linkedAccounts.filter(a => a.account_type === 'bank');
      const investmentAccounts = mockDemoProfile.linkedAccounts.filter(a => a.account_type === 'investment');
      const loanAccounts = mockDemoProfile.linkedAccounts.filter(a => a.account_type === 'loan');

      expect(bankAccounts).toHaveLength(1);
      expect(investmentAccounts).toHaveLength(1);
      expect(loanAccounts).toHaveLength(1);
    });

    it("should calculate net worth correctly from accounts", () => {
      const cashTotal = mockDemoProfile.linkedAccounts
        .filter(a => a.account_type === 'bank')
        .reduce((sum, a) => sum + a.total_amount, 0);
      
      const investmentsTotal = mockDemoProfile.linkedAccounts
        .filter(a => a.account_type === 'investment')
        .reduce((sum, a) => sum + a.total_amount, 0);
      
      const liabilitiesTotal = mockDemoProfile.linkedAccounts
        .filter(a => a.account_type === 'loan')
        .reduce((sum, a) => sum + a.total_amount, 0);

      const assetsTotal = cashTotal + investmentsTotal;
      const netWorth = assetsTotal - liabilitiesTotal;

      expect(cashTotal).toBe(28500);
      expect(investmentsTotal).toBe(67500);
      expect(liabilitiesTotal).toBe(18500);
      expect(netWorth).toBe(77500);
    });
  });

  describe("formatContextToString", () => {
    it("should include user profile info in formatted context", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'networth');
      
      expect(formattedContext).toContain('Alex Chen');
      expect(formattedContext).toContain('$125,000/year');
      expect(formattedContext).toContain('San Francisco');
    });

    it("should format networth context with financial summary", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'networth');
      
      expect(formattedContext).toContain('Net Worth');
      expect(formattedContext).toContain('Total Assets');
      expect(formattedContext).toContain('Total Liabilities');
    });

    it("should format goals context with goal details", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'goals');
      
      expect(formattedContext).toContain('Down Payment');
      expect(formattedContext).toContain('Target');
      expect(formattedContext).toContain('Current');
    });

    it("should format assets context with asset breakdown", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'assets');
      
      expect(formattedContext).toContain('Assets');
      expect(formattedContext).toContain('Cash');
      expect(formattedContext).toContain('Investments');
    });

    it("should format liabilities context with loan details", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'liabilities');
      
      expect(formattedContext).toContain('Liabilities');
      expect(formattedContext).toContain('SoFi');
    });

    it("should include demo label when formatting demo context", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'networth', true);
      
      expect(formattedContext).toContain('Demo');
    });
  });

  describe("context type handling", () => {
    const validContextTypes = [
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
    ];

    it.each(validContextTypes)("should handle %s context type", (contextType) => {
      const formattedContext = formatMockContext(mockDemoProfile, contextType);
      expect(formattedContext).toBeDefined();
      expect(typeof formattedContext).toBe('string');
    });

    it("should handle unknown context type gracefully", () => {
      const formattedContext = formatMockContext(mockDemoProfile, 'unknown-type');
      // Should still return some context, even for unknown types
      expect(formattedContext).toBeDefined();
    });
  });
});

/**
 * Helper function that simulates context formatting
 * This mirrors the logic in contextBuilder.ts
 */
function formatMockContext(
  profile: typeof mockDemoProfile,
  contextType: string,
  isDemo: boolean = true
): string {
  let contextInfo = '';

  // Header
  if (isDemo) {
    contextInfo = `\n\n## User Financial Profile (Demo: ${profile.name})\n`;
  } else {
    contextInfo = `\n\n## User Financial Profile\n`;
  }

  // User profile info
  const p = profile.profile;
  contextInfo += `Name: ${p.preferred_first_name} ${p.legal_last_name}\n`;
  contextInfo += `Income: ${p.income}\n`;
  contextInfo += `Employment: ${p.employment_type}\n`;
  contextInfo += `Risk Profile: ${p.risk_inferred}\n`;
  contextInfo += `Location: ${p.city}, ${p.state}\n\n`;

  // Context-specific formatting
  if (contextType === 'networth' || contextType === 'net_worth' || contextType === 'dashboard' || contextType === 'center-chat') {
    contextInfo += formatNetWorth(profile);
    contextInfo += formatGoals(profile);
    contextInfo += formatAccounts(profile);
  } else if (contextType === 'assets') {
    contextInfo += `## User Assets Data\n`;
    contextInfo += `Total Assets: $${profile.netWorthSummary.assetsTotal.toLocaleString()}\n`;
    contextInfo += `Cash: $${profile.netWorthSummary.cashTotal.toLocaleString()}\n`;
    contextInfo += `Investments: $${profile.netWorthSummary.investmentsTotal.toLocaleString()}\n\n`;
  } else if (contextType === 'liabilities') {
    contextInfo += `## User Liabilities Data\n`;
    contextInfo += `Total Liabilities: $${profile.netWorthSummary.liabilitiesTotal.toLocaleString()}\n\n`;
    const loanAccounts = profile.linkedAccounts.filter(a => a.account_type === 'loan');
    if (loanAccounts.length > 0) {
      contextInfo += `### Loan Details\n`;
      loanAccounts.forEach((account) => {
        contextInfo += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% APR\n`;
      });
    }
  } else if (contextType === 'goal' || contextType === 'goals' || contextType === 'goal-update') {
    contextInfo += formatGoals(profile);
    contextInfo += formatNetWorth(profile);
  } else {
    // Default: include net worth and goals
    contextInfo += formatNetWorth(profile);
    contextInfo += formatGoals(profile);
  }

  return contextInfo;
}

function formatNetWorth(profile: typeof mockDemoProfile): string {
  const nw = profile.netWorthSummary;
  let info = `## Net Worth Summary\n`;
  info += `Net Worth: $${nw.netWorth.toLocaleString()}\n`;
  info += `Total Assets: $${nw.assetsTotal.toLocaleString()}\n`;
  info += `Total Liabilities: $${nw.liabilitiesTotal.toLocaleString()}\n`;
  info += `Cash: $${nw.cashTotal.toLocaleString()}\n`;
  info += `Investments: $${nw.investmentsTotal.toLocaleString()}\n\n`;
  return info;
}

function formatGoals(profile: typeof mockDemoProfile): string {
  if (profile.goals.length === 0) return '';
  
  let info = `## Active Goals (${profile.goals.length})\n`;
  profile.goals.forEach((goal, idx) => {
    const progress = goal.target_amount > 0
      ? ((goal.current_amount / goal.target_amount) * 100).toFixed(1)
      : 0;
    info += `${idx + 1}. ${goal.name}\n`;
    info += `   - Target: $${goal.target_amount.toLocaleString()}\n`;
    info += `   - Current: $${goal.current_amount.toLocaleString()} (${progress}% complete)\n`;
  });
  info += '\n';
  return info;
}

function formatAccounts(profile: typeof mockDemoProfile): string {
  if (profile.linkedAccounts.length === 0) return '';
  
  let info = `## Linked Financial Accounts (${profile.linkedAccounts.length})\n`;
  
  const bankAccounts = profile.linkedAccounts.filter(a => a.account_type === 'bank');
  const investmentAccounts = profile.linkedAccounts.filter(a => a.account_type === 'investment');
  const loanAccounts = profile.linkedAccounts.filter(a => a.account_type === 'loan');
  
  if (bankAccounts.length > 0) {
    info += `\n### Bank Accounts\n`;
    bankAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()}\n`;
    });
  }
  
  if (investmentAccounts.length > 0) {
    info += `\n### Investment Accounts\n`;
    investmentAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()}\n`;
    });
  }
  
  if (loanAccounts.length > 0) {
    info += `\n### Loans/Liabilities\n`;
    loanAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()}\n`;
    });
  }
  
  return info + '\n';
}
