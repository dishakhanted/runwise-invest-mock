import { describe, it, expect } from "vitest";

/**
 * Tests for demo profiles data structure and validation
 */

// Demo profile structure matching edge function
const demoProfiles: Record<string, DemoProfile> = {
  'young-professional': {
    id: 'young-professional',
    name: 'Alex Chen',
    profile: {
      legal_first_name: 'Alex',
      legal_last_name: 'Chen',
      income: '$125,000/year',
      employment_type: 'full-time',
      risk_inferred: 'medium',
      city: 'San Francisco',
      state: 'CA',
    },
    linkedAccounts: [
      {
        id: 'demo-bank-1',
        account_type: 'bank',
        provider_name: 'Chase',
        last_four_digits: '4521',
        total_amount: 28500,
        interest_rate: 4.25,
        allocation_savings: 100,
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
        allocation_savings: 60,
        allocation_stocks: 30,
        allocation_bonds: 10,
      },
    ],
    netWorthSummary: {
      netWorth: 104800,
      assetsTotal: 123300,
      liabilitiesTotal: 18500,
      cashTotal: 43500,
      investmentsTotal: 79800,
    },
  },
  'family-focused': {
    id: 'family-focused',
    name: 'Sarah Johnson',
    profile: {
      legal_first_name: 'Sarah',
      legal_last_name: 'Johnson',
      income: '$165,000/year',
      employment_type: 'full-time',
      risk_inferred: 'medium',
      city: 'Austin',
      state: 'TX',
    },
    linkedAccounts: [],
    goals: [],
    netWorthSummary: {
      netWorth: 76500,
      assetsTotal: 380000,
      liabilitiesTotal: 303500,
      cashTotal: 67000,
      investmentsTotal: 313000,
    },
  },
  'near-retirement': {
    id: 'near-retirement',
    name: 'Robert Martinez',
    profile: {
      legal_first_name: 'Robert',
      legal_last_name: 'Martinez',
      preferred_first_name: 'Bob',
      income: '$210,000/year',
      employment_type: 'full-time',
      risk_inferred: 'low',
      city: 'Denver',
      state: 'CO',
    },
    linkedAccounts: [],
    goals: [],
    netWorthSummary: {
      netWorth: 1325000,
      assetsTotal: 1410000,
      liabilitiesTotal: 85000,
      cashTotal: 200000,
      investmentsTotal: 1210000,
    },
  },
};

interface DemoProfile {
  id: string;
  name: string;
  profile: {
    legal_first_name?: string;
    legal_last_name?: string;
    preferred_first_name?: string;
    income?: string;
    employment_type?: string;
    risk_inferred?: string;
    city?: string;
    state?: string;
  };
  linkedAccounts: Array<{
    id: string;
    account_type: string;
    provider_name: string;
    last_four_digits: string;
    total_amount: number;
    interest_rate: number;
    allocation_savings: number;
    allocation_stocks: number;
    allocation_bonds: number;
  }>;
  goals: Array<{
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_age?: number;
    allocation_savings: number;
    allocation_stocks: number;
    allocation_bonds: number;
  }>;
  netWorthSummary: {
    netWorth: number;
    assetsTotal: number;
    liabilitiesTotal: number;
    cashTotal: number;
    investmentsTotal: number;
  };
}

function getDemoProfile(profileId: string): DemoProfile | null {
  return demoProfiles[profileId] || null;
}

describe("Demo Profiles", () => {
  describe("getDemoProfile", () => {
    it("should return young-professional profile", () => {
      const profile = getDemoProfile('young-professional');
      
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('young-professional');
      expect(profile?.name).toBe('Alex Chen');
      expect(profile?.profile.legal_first_name).toBe('Alex');
    });

    it("should return family-focused profile", () => {
      const profile = getDemoProfile('family-focused');
      
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('family-focused');
      expect(profile?.name).toBe('Sarah Johnson');
    });

    it("should return near-retirement profile", () => {
      const profile = getDemoProfile('near-retirement');
      
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('near-retirement');
      expect(profile?.name).toBe('Robert Martinez');
      expect(profile?.profile.preferred_first_name).toBe('Bob');
    });

    it("should return null for invalid profile ID", () => {
      const profile = getDemoProfile('invalid-profile');
      expect(profile).toBeNull();
    });

    it("should return null for empty profile ID", () => {
      const profile = getDemoProfile('');
      expect(profile).toBeNull();
    });
  });

  describe("Profile Structure", () => {
    const profileIds = ['young-professional', 'family-focused', 'near-retirement'];

    it.each(profileIds)("%s profile should have required fields", (profileId) => {
      const profile = getDemoProfile(profileId);
      
      expect(profile).not.toBeNull();
      expect(profile?.id).toBeDefined();
      expect(profile?.name).toBeDefined();
      expect(profile?.profile).toBeDefined();
      expect(profile?.linkedAccounts).toBeDefined();
      expect(profile?.goals).toBeDefined();
      expect(profile?.netWorthSummary).toBeDefined();
    });

    it.each(profileIds)("%s profile should have valid net worth summary", (profileId) => {
      const profile = getDemoProfile(profileId);
      const nw = profile?.netWorthSummary;
      
      expect(nw).toBeDefined();
      expect(typeof nw?.netWorth).toBe('number');
      expect(typeof nw?.assetsTotal).toBe('number');
      expect(typeof nw?.liabilitiesTotal).toBe('number');
      expect(typeof nw?.cashTotal).toBe('number');
      expect(typeof nw?.investmentsTotal).toBe('number');
      
      // Net worth should equal assets - liabilities
      expect(nw?.netWorth).toBe((nw?.assetsTotal ?? 0) - (nw?.liabilitiesTotal ?? 0));
    });
  });

  describe("Linked Account Validation", () => {
    it("young-professional should have valid linked accounts", () => {
      const profile = getDemoProfile('young-professional');
      const accounts = profile?.linkedAccounts ?? [];
      
      expect(accounts.length).toBeGreaterThan(0);
      
      accounts.forEach(account => {
        expect(account.id).toBeDefined();
        expect(['bank', 'investment', 'loan']).toContain(account.account_type);
        expect(account.provider_name).toBeDefined();
        expect(account.last_four_digits).toHaveLength(4);
        expect(typeof account.total_amount).toBe('number');
        expect(account.total_amount).toBeGreaterThanOrEqual(0);
      });
    });

    it("allocation percentages should sum to 100 or be all zeros", () => {
      const profile = getDemoProfile('young-professional');
      const accounts = profile?.linkedAccounts ?? [];
      
      accounts.forEach(account => {
        const sum = account.allocation_savings + account.allocation_stocks + account.allocation_bonds;
        // Sum should be 100% for asset accounts, 0% for loans
        expect(sum === 100 || sum === 0).toBe(true);
      });
    });
  });

  describe("Goal Validation", () => {
    it("young-professional should have valid goals", () => {
      const profile = getDemoProfile('young-professional');
      const goals = profile?.goals ?? [];
      
      expect(goals.length).toBeGreaterThan(0);
      
      goals.forEach(goal => {
        expect(goal.id).toBeDefined();
        expect(goal.name).toBeDefined();
        expect(typeof goal.target_amount).toBe('number');
        expect(goal.target_amount).toBeGreaterThan(0);
        expect(typeof goal.current_amount).toBe('number');
        expect(goal.current_amount).toBeGreaterThanOrEqual(0);
        expect(goal.current_amount).toBeLessThanOrEqual(goal.target_amount);
      });
    });

    it("goal allocation percentages should sum to 100", () => {
      const profile = getDemoProfile('young-professional');
      const goals = profile?.goals ?? [];
      
      goals.forEach(goal => {
        const sum = goal.allocation_savings + goal.allocation_stocks + goal.allocation_bonds;
        expect(sum).toBe(100);
      });
    });
  });

  describe("Risk Profile Validation", () => {
    it("young-professional should have medium risk", () => {
      const profile = getDemoProfile('young-professional');
      expect(profile?.profile.risk_inferred).toBe('medium');
    });

    it("near-retirement should have low risk", () => {
      const profile = getDemoProfile('near-retirement');
      expect(profile?.profile.risk_inferred).toBe('low');
    });

    it("all profiles should have valid risk levels", () => {
      const validRiskLevels = ['low', 'medium', 'high'];
      
      Object.values(demoProfiles).forEach(profile => {
        expect(validRiskLevels).toContain(profile.profile.risk_inferred);
      });
    });
  });
});
