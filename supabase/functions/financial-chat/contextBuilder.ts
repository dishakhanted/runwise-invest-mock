/**
 * Context Builder for Financial Chat Edge Function
 * Centralizes context building for all contextTypes
 * Supports both Supabase (auth) and demo mode data sources
 */

import type {
  UserProfile,
  LinkedAccount,
  Goal,
  NetWorthSummary,
  DemoProfile,
  ContextType,
} from './types.ts';

/**
 * Unified user context structure used across all prompt types
 */
export interface UserContext {
  userProfile: UserProfile | null;
  linkedAccounts: LinkedAccount[];
  goals: Goal[];
  netWorthSummary: NetWorthSummary;
  contextData?: Record<string, unknown>;
}

/**
 * Extracts the authenticated user ID from the request
 * Throws if no valid user is found
 */
export async function getUserIdFromRequest(
  supabase: any,
  authHeader: string | null
): Promise<string> {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new Error('Invalid authorization token');
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('[getUserIdFromRequest] Auth error:', error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }

  if (!user || !user.id) {
    console.warn('[getUserIdFromRequest] No valid user found in JWT');
    throw new Error('No valid user found');
  }

  return user.id;
}

/**
 * Validates that a query result belongs to the expected user
 * Logs warning and throws if data doesn't match user
 */
function validateUserOwnership(data: any[], userId: string, tableName: string): void {
  if (!data || data.length === 0) return;
  
  for (const row of data) {
    if (row.user_id && row.user_id !== userId) {
      console.error(`[SECURITY] Data from ${tableName} does not belong to user ${userId}`);
      throw new Error(`Security violation: Attempted to access data not owned by user`);
    }
  }
}

/**
 * Builds context from Supabase for authenticated users
 * All queries are scoped to the authenticated user
 */
export async function fetchUserContextFromSupabase(
  supabase: any,
  userId: string
): Promise<UserContext> {
  console.log('[fetchUserContextFromSupabase] Fetching data for user:', userId);

  // Fetch all data in parallel, always filtering by user_id
  const [profileResult, goalsResult, accountsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('linked_accounts')
      .select('*')
      .eq('user_id', userId),
  ]);

  // Log any query errors
  if (profileResult.error) {
    console.error('[fetchUserContextFromSupabase] Profile query error:', profileResult.error);
  }
  if (goalsResult.error) {
    console.error('[fetchUserContextFromSupabase] Goals query error:', goalsResult.error);
  }
  if (accountsResult.error) {
    console.error('[fetchUserContextFromSupabase] Accounts query error:', accountsResult.error);
  }

  const profile = profileResult.data;
  const goalsData = goalsResult.data || [];
  const accountsData = accountsResult.data || [];

  // Validate ownership of returned data
  if (goalsData.length > 0) {
    validateUserOwnership(goalsData, userId, 'goals');
  }
  if (accountsData.length > 0) {
    validateUserOwnership(accountsData, userId, 'linked_accounts');
  }

  const goals: Goal[] = goalsData.map((g: any) => ({
    id: g.id,
    name: g.name,
    target_amount: g.target_amount,
    current_amount: g.current_amount,
    target_age: g.target_age,
    description: g.description,
    saving_account: g.saving_account,
    investment_account: g.investment_account,
    allocation_savings: g.allocation_savings,
    allocation_stocks: g.allocation_stocks,
    allocation_bonds: g.allocation_bonds,
  }));

  const linkedAccounts: LinkedAccount[] = accountsData.map((a: any) => ({
    id: a.id,
    account_type: a.account_type,
    provider_name: a.provider_name,
    last_four_digits: a.last_four_digits,
    total_amount: a.total_amount,
    interest_rate: a.interest_rate,
    allocation_savings: a.allocation_savings,
    allocation_stocks: a.allocation_stocks,
    allocation_bonds: a.allocation_bonds,
  }));

  // Calculate net worth summary from accounts
  let cashTotal = 0;
  let investmentsTotal = 0;
  let liabilitiesTotal = 0;

  linkedAccounts.forEach((account) => {
    if (account.account_type === 'bank') {
      cashTotal += account.total_amount;
    } else if (account.account_type === 'investment') {
      investmentsTotal += account.total_amount;
    } else if (account.account_type === 'loan') {
      liabilitiesTotal += account.total_amount;
    }
  });

  const assetsTotal = cashTotal + investmentsTotal;
  const netWorth = assetsTotal - liabilitiesTotal;

  const userProfile: UserProfile | null = profile ? {
    legal_first_name: profile.legal_first_name,
    legal_last_name: profile.legal_last_name,
    preferred_first_name: profile.preferred_first_name,
    email: profile.email,
    date_of_birth: profile.date_of_birth,
    income: profile.income,
    employment_type: profile.employment_type,
    goals: profile.goals,
    risk_inferred: profile.risk_inferred,
    city: profile.city,
    state: profile.state,
    phone: profile.phone,
    address: profile.address,
    zip_code: profile.zip_code,
  } : null;

  return {
    userProfile,
    linkedAccounts,
    goals,
    netWorthSummary: {
      netWorth,
      assetsTotal,
      liabilitiesTotal,
      cashTotal,
      investmentsTotal,
    },
  };
}

/**
 * Builds context from demo profile data (no Supabase queries)
 */
function buildUserContextFromDemo(demoProfile: DemoProfile): UserContext {
  return {
    userProfile: demoProfile.profile,
    linkedAccounts: demoProfile.linkedAccounts,
    goals: demoProfile.goals,
    netWorthSummary: demoProfile.netWorthSummary,
  };
}

/**
 * Formats user context into a string for the AI prompt
 */
function formatContextToString(
  context: UserContext,
  contextType: ContextType | string,
  contextData?: Record<string, unknown>,
  demoName?: string
): string {
  let contextInfo = '';

  // Header
  if (demoName) {
    contextInfo = `\n\n## User Financial Profile (Demo: ${demoName})\n`;
  } else {
    contextInfo = `\n\n## User Financial Profile\n`;
  }

  // User profile info
  if (context.userProfile) {
    const p = context.userProfile;
    const name = p.preferred_first_name || p.legal_first_name || 'User';
    const lastName = p.legal_last_name || '';
    if (name || lastName) contextInfo += `Name: ${name} ${lastName}\n`;
    if (p.income) contextInfo += `Income: ${p.income}\n`;
    if (p.employment_type) contextInfo += `Employment: ${p.employment_type}\n`;
    if (p.risk_inferred) contextInfo += `Risk Profile: ${p.risk_inferred}\n`;
    if (p.city && p.state) contextInfo += `Location: ${p.city}, ${p.state}\n`;
    contextInfo += '\n';
  }

  // Context-specific formatting
  if (contextType === 'networth' || contextType === 'net_worth' || contextType === 'dashboard' || contextType === 'center-chat') {
    contextInfo += formatNetWorthContext(context);
    contextInfo += formatGoalsContext(context);
    contextInfo += formatAccountsContext(context);
  } else if (contextType === 'assets') {
    contextInfo += formatAssetsContext(context);
  } else if (contextType === 'liabilities') {
    contextInfo += formatLiabilitiesContext(context);
  } else if (contextType === 'goal' || contextType === 'goals' || contextType === 'goal-update') {
    contextInfo += formatGoalDetailContext(context, contextData);
  } else if (contextType === 'alternate-investments') {
    contextInfo += formatAlternateInvestmentsContext(context);
  } else if (contextType === 'market-insights' || contextType === 'finshorts' || 
             contextType === 'what-if' || contextType === 'tax-loss-harvesting' || 
             contextType === 'explore') {
    contextInfo += formatNetWorthContext(context);
    contextInfo += formatGoalsContext(context);
    contextInfo += formatAccountsContext(context);
  } else if (contextType === 'suggestions') {
    contextInfo += formatSuggestionsContext(context);
  } else if (contextType === 'onboarding') {
    if (context.userProfile) {
      contextInfo += `User is completing onboarding.\n`;
    }
  } else {
    contextInfo += formatNetWorthContext(context);
    contextInfo += formatGoalsContext(context);
  }

  return contextInfo;
}

function formatNetWorthContext(context: UserContext): string {
  const nw = context.netWorthSummary;
  let info = `## Net Worth Summary\n`;
  info += `Net Worth: $${nw.netWorth.toLocaleString()}\n`;
  info += `Total Assets: $${nw.assetsTotal.toLocaleString()}\n`;
  info += `Total Liabilities: $${nw.liabilitiesTotal.toLocaleString()}\n`;
  info += `Cash: $${nw.cashTotal.toLocaleString()}\n`;
  info += `Investments: $${nw.investmentsTotal.toLocaleString()}\n\n`;
  return info;
}

function formatGoalsContext(context: UserContext): string {
  if (context.goals.length === 0) return '';
  
  let info = `## Active Goals (${context.goals.length})\n`;
  context.goals.forEach((goal, idx) => {
    const progress = goal.target_amount > 0
      ? ((goal.current_amount / goal.target_amount) * 100).toFixed(1)
      : 0;
    info += `${idx + 1}. ${goal.name}\n`;
    info += `   - Target: $${goal.target_amount.toLocaleString()}\n`;
    info += `   - Current: $${goal.current_amount.toLocaleString()} (${progress}% complete)\n`;
    info += `   - Allocation: ${goal.allocation_savings}% savings, ${goal.allocation_stocks}% stocks, ${goal.allocation_bonds}% bonds\n`;
    if (goal.description) info += `   - Details: ${goal.description}\n`;
  });
  info += '\n';
  return info;
}

function formatAccountsContext(context: UserContext): string {
  if (context.linkedAccounts.length === 0) return '';
  
  let info = `## Linked Financial Accounts (${context.linkedAccounts.length})\n`;
  
  const bankAccounts = context.linkedAccounts.filter(a => a.account_type === 'bank');
  const investmentAccounts = context.linkedAccounts.filter(a => a.account_type === 'investment');
  const loanAccounts = context.linkedAccounts.filter(a => a.account_type === 'loan');
  
  if (bankAccounts.length > 0) {
    info += `\n### Bank Accounts\n`;
    bankAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% APY\n`;
    });
  }
  
  if (investmentAccounts.length > 0) {
    info += `\n### Investment Accounts\n`;
    investmentAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% return\n`;
      info += `  Allocation: ${account.allocation_savings}% savings, ${account.allocation_stocks}% stocks, ${account.allocation_bonds}% bonds\n`;
    });
  }
  
  if (loanAccounts.length > 0) {
    info += `\n### Loans/Liabilities\n`;
    loanAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% APR\n`;
    });
  }
  
  return info + '\n';
}

function formatAssetsContext(context: UserContext): string {
  const nw = context.netWorthSummary;
  let info = `## User Assets Data\n`;
  info += `Total Assets: $${nw.assetsTotal.toLocaleString()}\n`;
  info += `Cash: $${nw.cashTotal.toLocaleString()}\n`;
  info += `Investments: $${nw.investmentsTotal.toLocaleString()}\n\n`;
  
  const assetAccounts = context.linkedAccounts.filter(a => a.account_type !== 'loan');
  if (assetAccounts.length > 0) {
    info += `### Asset Accounts\n`;
    assetAccounts.forEach((account) => {
      info += `- ${account.provider_name} (${account.account_type}): $${account.total_amount.toLocaleString()}\n`;
    });
    info += '\n';
  }
  
  return info;
}

function formatLiabilitiesContext(context: UserContext): string {
  const nw = context.netWorthSummary;
  let info = `## User Liabilities Data\n`;
  info += `Total Liabilities: $${nw.liabilitiesTotal.toLocaleString()}\n\n`;
  
  const loanAccounts = context.linkedAccounts.filter(a => a.account_type === 'loan');
  if (loanAccounts.length > 0) {
    info += `### Loan Details\n`;
    loanAccounts.forEach((account) => {
      info += `- ${account.provider_name} (***${account.last_four_digits}): $${account.total_amount.toLocaleString()} @ ${account.interest_rate}% APR\n`;
    });
    info += '\n';
  }
  
  return info;
}

function formatGoalDetailContext(context: UserContext, contextData?: Record<string, unknown>): string {
  let info = '';
  
  if (contextData?.name) {
    info += `## User Goal Data\n`;
    info += `Goal Name: "${contextData.name}"\n`;
    info += `Target Amount: $${(contextData.targetAmount as number)?.toLocaleString() || 0}\n`;
    info += `Current Amount: $${(contextData.currentAmount as number)?.toLocaleString() || 0}\n`;
    const progress = (contextData.targetAmount as number) > 0
      ? (((contextData.currentAmount as number) / (contextData.targetAmount as number)) * 100).toFixed(1)
      : 0;
    info += `Progress: ${progress}%\n`;
    
    const allocation = contextData.allocation as { savings?: number; stocks?: number; bonds?: number } | undefined;
    if (allocation) {
      info += `Allocation: ${allocation.savings || 0}% savings, ${allocation.stocks || 0}% stocks, ${allocation.bonds || 0}% bonds\n`;
    }
    if (contextData.description) {
      info += `\nGoal Details: ${contextData.description}\n`;
    }
    info += '\n';
  }
  
  info += formatGoalsContext(context);
  info += formatNetWorthContext(context);
  
  return info;
}

function formatAlternateInvestmentsContext(context: UserContext): string {
  let info = '';
  
  if (context.userProfile) {
    info += `Income: ${context.userProfile.income || 'Not specified'}\n`;
    info += `Employment Type: ${context.userProfile.employment_type || 'Not specified'}\n`;
    info += `Financial Goals: ${context.userProfile.goals || 'Not specified'}\n`;
    info += `Risk Profile: ${context.userProfile.risk_inferred || 'Not specified'}\n\n`;
  }
  
  info += formatGoalsContext(context);
  info += formatAccountsContext(context);
  
  info += `## Portfolio Summary\n`;
  info += `Total Assets: $${context.netWorthSummary.assetsTotal.toLocaleString()}\n`;
  info += `Total Liabilities: $${context.netWorthSummary.liabilitiesTotal.toLocaleString()}\n`;
  info += `Net Worth: $${context.netWorthSummary.netWorth.toLocaleString()}\n`;
  
  return info;
}

function formatSuggestionsContext(context: UserContext): string {
  let info = formatNetWorthContext(context);
  info += formatGoalsContext(context);
  info += formatAccountsContext(context);
  return info;
}

// ==========================================
// PUBLIC API: Context Builders
// ==========================================

/**
 * Unified context builder for authenticated users
 * Requires a valid userId extracted from JWT
 */
export async function buildContextForUser(
  supabase: any,
  userId: string,
  contextType: ContextType | string,
  contextData?: Record<string, unknown>
): Promise<string> {
  const context = await fetchUserContextFromSupabase(supabase, userId);
  return formatContextToString(context, contextType, contextData);
}

/**
 * Builds context from demo profile (no database access)
 */
export function buildContextForDemo(
  demoProfile: DemoProfile,
  contextType: ContextType | string,
  contextData?: Record<string, unknown>
): string {
  const context = buildUserContextFromDemo(demoProfile);
  return formatContextToString(context, contextType, contextData, demoProfile.name);
}

/**
 * Simple fallback context builder from raw contextData
 */
export function buildSimpleContextFromData(contextType: string, contextData?: Record<string, unknown>): string {
  if (!contextData) return '';
  
  let contextInfo = "";
  
  if (contextType === 'dashboard' || contextType === 'net_worth' || contextType === 'networth') {
    contextInfo = `\n\n## User Financial Data\n`;
    contextInfo += `Net Worth: $${(contextData.netWorth as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Total Assets: $${(contextData.assetsTotal as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Total Liabilities: $${(contextData.liabilitiesTotal as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Cash: $${(contextData.cashTotal as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Investments: $${(contextData.investmentsTotal as number)?.toLocaleString() || 0}`;
  } else if (contextType === 'assets') {
    contextInfo = `\n\n## User Assets Data\n`;
    contextInfo += `Total Assets: $${(contextData.assetsTotal as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Cash: $${(contextData.cashTotal as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Investments: $${(contextData.investmentsTotal as number)?.toLocaleString() || 0}`;
  } else if (contextType === 'liabilities') {
    contextInfo = `\n\n## User Liabilities Data\n`;
    contextInfo += `Total Liabilities: $${(contextData.liabilitiesTotal as number)?.toLocaleString() || 0}`;
  } else if (contextType === 'goal') {
    contextInfo = `\n\n## User Goal Data\n`;
    contextInfo += `Goal Name: "${contextData.name}"\n`;
    contextInfo += `Target Amount: $${(contextData.targetAmount as number)?.toLocaleString() || 0}\n`;
    contextInfo += `Current Amount: $${(contextData.currentAmount as number)?.toLocaleString() || 0}\n`;
    const progress = (contextData.targetAmount as number) > 0
      ? (((contextData.currentAmount as number) / (contextData.targetAmount as number)) * 100).toFixed(1)
      : 0;
    contextInfo += `Progress: ${progress}%\n`;
    const allocation = contextData.allocation as { savings?: number; stocks?: number; bonds?: number } | undefined;
    if (allocation) {
      contextInfo += `Allocation: ${allocation.savings || 0}% savings, ${allocation.stocks || 0}% stocks, ${allocation.bonds || 0}% bonds\n`;
    }
    if (contextData.description) {
      contextInfo += `\nGoal Details: ${contextData.description}`;
    }
  } else if (!['market-insights', 'finshorts', 'what-if', 'tax-loss-harvesting', 'explore'].includes(contextType)) {
    contextInfo = `\n\n## Additional Context\n${JSON.stringify(contextData, null, 2)}`;
  }
  
  return contextInfo;
}
