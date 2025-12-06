/**
 * Demo Profiles for Edge Function
 * Contains realistic sample data for each demo persona
 * This is a mirror of the frontend demoProfiles for use in the edge function
 */

export interface DemoProfile {
  id: string;
  name: string;
  profile: {
    legal_first_name: string;
    legal_last_name: string;
    preferred_first_name: string;
    income: string;
    employment_type: string;
    goals: string;
    risk_inferred: string;
    date_of_birth: string;
    city: string;
    state: string;
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
    description?: string;
    saving_account?: string;
    investment_account?: string;
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

export const demoProfiles: Record<string, DemoProfile> = {
  'young-professional': {
    id: 'young-professional',
    name: 'Alex Chen',
    profile: {
      legal_first_name: 'Alex',
      legal_last_name: 'Chen',
      preferred_first_name: 'Alex',
      income: '$125,000/year',
      employment_type: 'full-time',
      goals: 'Buy a house, Build emergency fund, Max 401k',
      risk_inferred: 'medium',
      date_of_birth: '1996-03-15',
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
      {
        id: 'demo-bank-2',
        account_type: 'bank',
        provider_name: 'Marcus by Goldman Sachs',
        last_four_digits: '7892',
        total_amount: 15000,
        interest_rate: 5.05,
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
      {
        id: 'demo-investment-1',
        account_type: 'investment',
        provider_name: 'Fidelity 401k',
        last_four_digits: '3345',
        total_amount: 67500,
        interest_rate: 8.5,
        allocation_savings: 0,
        allocation_stocks: 80,
        allocation_bonds: 20,
      },
      {
        id: 'demo-investment-2',
        account_type: 'investment',
        provider_name: 'Robinhood',
        last_four_digits: '9901',
        total_amount: 12300,
        interest_rate: 12.3,
        allocation_savings: 0,
        allocation_stocks: 95,
        allocation_bonds: 5,
      },
      {
        id: 'demo-loan-1',
        account_type: 'loan',
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
        description: 'Save for a 20% down payment on a home in the Bay Area',
        saving_account: 'Marcus HYSA',
        investment_account: 'Robinhood',
        allocation_savings: 60,
        allocation_stocks: 30,
        allocation_bonds: 10,
      },
      {
        id: 'demo-goal-2',
        name: 'Emergency Fund',
        target_amount: 30000,
        current_amount: 28500,
        target_age: 29,
        description: '6 months of expenses for emergency situations',
        saving_account: 'Chase Savings',
        investment_account: 'None',
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
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
      preferred_first_name: 'Sarah',
      income: '$165,000/year',
      employment_type: 'full-time',
      goals: 'Kids college fund, Retirement savings, Family vacation fund',
      risk_inferred: 'medium',
      date_of_birth: '1986-07-22',
      city: 'Austin',
      state: 'TX',
    },
    linkedAccounts: [
      {
        id: 'demo-bank-3',
        account_type: 'bank',
        provider_name: 'Bank of America',
        last_four_digits: '8834',
        total_amount: 45000,
        interest_rate: 3.75,
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
      {
        id: 'demo-bank-4',
        account_type: 'bank',
        provider_name: 'Ally Bank',
        last_four_digits: '1122',
        total_amount: 22000,
        interest_rate: 4.85,
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
      {
        id: 'demo-investment-3',
        account_type: 'investment',
        provider_name: 'Vanguard 401k',
        last_four_digits: '5567',
        total_amount: 245000,
        interest_rate: 7.2,
        allocation_savings: 0,
        allocation_stocks: 70,
        allocation_bonds: 30,
      },
      {
        id: 'demo-investment-4',
        account_type: 'investment',
        provider_name: '529 College Savings',
        last_four_digits: '7789',
        total_amount: 68000,
        interest_rate: 6.8,
        allocation_savings: 10,
        allocation_stocks: 60,
        allocation_bonds: 30,
      },
      {
        id: 'demo-loan-2',
        account_type: 'loan',
        provider_name: 'Mortgage - Wells Fargo',
        last_four_digits: '4456',
        total_amount: 285000,
        interest_rate: 6.25,
        allocation_savings: 0,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
      {
        id: 'demo-loan-3',
        account_type: 'loan',
        provider_name: 'Auto Loan - Capital One',
        last_four_digits: '3321',
        total_amount: 18500,
        interest_rate: 4.99,
        allocation_savings: 0,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
    ],
    goals: [
      {
        id: 'demo-goal-3',
        name: 'College Fund - Emma',
        target_amount: 120000,
        current_amount: 68000,
        target_age: 46,
        description: 'Save for daughter Emma\'s college education',
        saving_account: 'Ally HYSA',
        investment_account: '529 Plan',
        allocation_savings: 10,
        allocation_stocks: 60,
        allocation_bonds: 30,
      },
      {
        id: 'demo-goal-4',
        name: 'Early Retirement',
        target_amount: 1500000,
        current_amount: 245000,
        target_age: 55,
        description: 'Retire early at 55 with comfortable savings',
        saving_account: 'None',
        investment_account: 'Vanguard 401k',
        allocation_savings: 0,
        allocation_stocks: 70,
        allocation_bonds: 30,
      },
      {
        id: 'demo-goal-5',
        name: 'Family Vacation Fund',
        target_amount: 15000,
        current_amount: 8500,
        target_age: 39,
        description: 'Annual family vacation fund',
        saving_account: 'Bank of America',
        investment_account: 'None',
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
    ],
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
      goals: 'Secure retirement, Healthcare fund, Travel fund',
      risk_inferred: 'low',
      date_of_birth: '1966-11-08',
      city: 'Denver',
      state: 'CO',
    },
    linkedAccounts: [
      {
        id: 'demo-bank-5',
        account_type: 'bank',
        provider_name: 'Wells Fargo',
        last_four_digits: '6677',
        total_amount: 125000,
        interest_rate: 4.5,
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
      {
        id: 'demo-bank-6',
        account_type: 'bank',
        provider_name: 'Discover HYSA',
        last_four_digits: '9988',
        total_amount: 75000,
        interest_rate: 5.15,
        allocation_savings: 100,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
      {
        id: 'demo-investment-5',
        account_type: 'investment',
        provider_name: 'Fidelity 401k',
        last_four_digits: '2233',
        total_amount: 890000,
        interest_rate: 5.8,
        allocation_savings: 0,
        allocation_stocks: 40,
        allocation_bonds: 60,
      },
      {
        id: 'demo-investment-6',
        account_type: 'investment',
        provider_name: 'Schwab Brokerage',
        last_four_digits: '4455',
        total_amount: 320000,
        interest_rate: 6.2,
        allocation_savings: 5,
        allocation_stocks: 45,
        allocation_bonds: 50,
      },
      {
        id: 'demo-loan-4',
        account_type: 'loan',
        provider_name: 'Mortgage - Chase',
        last_four_digits: '7788',
        total_amount: 85000,
        interest_rate: 3.25,
        allocation_savings: 0,
        allocation_stocks: 0,
        allocation_bonds: 0,
      },
    ],
    goals: [
      {
        id: 'demo-goal-6',
        name: 'Retirement Nest Egg',
        target_amount: 2000000,
        current_amount: 1210000,
        target_age: 65,
        description: 'Primary retirement fund for comfortable living',
        saving_account: 'Wells Fargo',
        investment_account: 'Fidelity 401k',
        allocation_savings: 10,
        allocation_stocks: 40,
        allocation_bonds: 50,
      },
      {
        id: 'demo-goal-7',
        name: 'Healthcare Reserve',
        target_amount: 150000,
        current_amount: 125000,
        target_age: 65,
        description: 'HSA and additional healthcare savings',
        saving_account: 'Discover HYSA',
        investment_account: 'None',
        allocation_savings: 80,
        allocation_stocks: 10,
        allocation_bonds: 10,
      },
      {
        id: 'demo-goal-8',
        name: 'Travel & Leisure',
        target_amount: 100000,
        current_amount: 75000,
        target_age: 66,
        description: 'Post-retirement travel and experiences fund',
        saving_account: 'Discover HYSA',
        investment_account: 'Schwab Brokerage',
        allocation_savings: 40,
        allocation_stocks: 30,
        allocation_bonds: 30,
      },
    ],
    netWorthSummary: {
      netWorth: 1325000,
      assetsTotal: 1410000,
      liabilitiesTotal: 85000,
      cashTotal: 200000,
      investmentsTotal: 1210000,
    },
  },
};

export const getDemoProfile = (profileId: string): DemoProfile | null => {
  return demoProfiles[profileId] || null;
};

/**
 * Builds context info string from demo profile data
 */
export function buildDemoContextInfo(profile: DemoProfile, contextType: string): string {
  let contextInfo = `\n\n## User Financial Profile (Demo: ${profile.name})\n`;
  
  contextInfo += `Name: ${profile.profile.preferred_first_name} ${profile.profile.legal_last_name}\n`;
  contextInfo += `Income: ${profile.profile.income}\n`;
  contextInfo += `Employment: ${profile.profile.employment_type}\n`;
  contextInfo += `Risk Profile: ${profile.profile.risk_inferred}\n`;
  contextInfo += `Location: ${profile.profile.city}, ${profile.profile.state}\n\n`;
  
  // Net worth summary
  contextInfo += `## Net Worth Summary\n`;
  contextInfo += `Net Worth: $${profile.netWorthSummary.netWorth.toLocaleString()}\n`;
  contextInfo += `Total Assets: $${profile.netWorthSummary.assetsTotal.toLocaleString()}\n`;
  contextInfo += `Total Liabilities: $${profile.netWorthSummary.liabilitiesTotal.toLocaleString()}\n`;
  contextInfo += `Cash: $${profile.netWorthSummary.cashTotal.toLocaleString()}\n`;
  contextInfo += `Investments: $${profile.netWorthSummary.investmentsTotal.toLocaleString()}\n\n`;
  
  // Goals
  if (profile.goals.length > 0) {
    contextInfo += `## Active Goals (${profile.goals.length})\n`;
    profile.goals.forEach((goal, idx) => {
      const progress = goal.target_amount > 0 
        ? ((goal.current_amount / goal.target_amount) * 100).toFixed(1) 
        : 0;
      contextInfo += `${idx + 1}. ${goal.name}\n`;
      contextInfo += `   - Target: $${goal.target_amount.toLocaleString()}\n`;
      contextInfo += `   - Current: $${goal.current_amount.toLocaleString()} (${progress}% complete)\n`;
      contextInfo += `   - Allocation: ${goal.allocation_savings}% savings, ${goal.allocation_stocks}% stocks, ${goal.allocation_bonds}% bonds\n`;
      if (goal.description) contextInfo += `   - Details: ${goal.description}\n`;
    });
    contextInfo += '\n';
  }
  
  // Linked accounts
  if (profile.linkedAccounts.length > 0) {
    contextInfo += `## Linked Financial Accounts (${profile.linkedAccounts.length})\n`;
    
    const bankAccounts = profile.linkedAccounts.filter(a => a.account_type === 'bank');
    const investmentAccounts = profile.linkedAccounts.filter(a => a.account_type === 'investment');
    const loanAccounts = profile.linkedAccounts.filter(a => a.account_type === 'loan');
    
    if (bankAccounts.length > 0) {
      contextInfo += `\n### Bank Accounts\n`;
      bankAccounts.forEach((account) => {
        contextInfo += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% APY\n`;
      });
    }
    
    if (investmentAccounts.length > 0) {
      contextInfo += `\n### Investment Accounts\n`;
      investmentAccounts.forEach((account) => {
        contextInfo += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% return\n`;
      });
    }
    
    if (loanAccounts.length > 0) {
      contextInfo += `\n### Loans/Liabilities\n`;
      loanAccounts.forEach((account) => {
        contextInfo += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% APR\n`;
      });
    }
  }
  
  return contextInfo;
}
