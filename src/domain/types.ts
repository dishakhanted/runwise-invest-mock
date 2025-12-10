/**
 * Core financial domain types used across the application
 * These types are the single source of truth for financial data structures
 */

// Account types
export type AccountType = 'bank' | 'investment' | 'loan';

// Risk profile levels
export type RiskLevel = 'low' | 'medium' | 'high';

// Employment types
export type EmploymentType = 'full-time' | 'part-time' | 'self-employed' | 'unemployed' | 'retired';

/**
 * User profile information
 */
export interface UserProfile {
  legal_first_name?: string;
  legal_last_name?: string;
  preferred_first_name?: string;
  email?: string;
  date_of_birth?: string;
  income?: string;
  employment_type?: string;
  goals?: string;
  risk_inferred?: string;
  city?: string;
  state?: string;
  phone?: string;
  address?: string;
  zip_code?: string;
}

/**
 * Allocation percentages for savings, stocks, and bonds
 */
export interface Allocation {
  savings: number;
  stocks: number;
  bonds: number;
}

/**
 * Linked financial account (bank, investment, or loan)
 */
export interface LinkedAccount {
  id: string;
  account_type: AccountType;
  provider_name: string;
  last_four_digits: string;
  total_amount: number;
  interest_rate: number;
  allocation_savings: number;
  allocation_stocks: number;
  allocation_bonds: number;
}

/**
 * Investment position within an account
 */
export interface Position {
  id: string;
  account_id: string;
  symbol: string;
  name: string;
  quantity: number;
  cost_basis: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
}

/**
 * Liability (loan, credit, etc.)
 */
export interface Liability {
  id: string;
  type: 'mortgage' | 'auto' | 'student' | 'personal' | 'credit_card' | 'other';
  provider_name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment?: number;
  due_date?: string;
}

/**
 * Financial goal with target and progress
 */
export interface Goal {
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
}

/**
 * Net worth summary with breakdown
 */
export interface NetWorthSummary {
  netWorth: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  cashTotal: number;
  investmentsTotal: number;
}

/**
 * Complete financial context for AI prompts
 */
export interface FinancialContext {
  userProfile: UserProfile | null;
  linkedAccounts: LinkedAccount[];
  goals: Goal[];
  netWorthSummary: NetWorthSummary;
}

/**
 * Demo profile structure for demo mode
 */
export interface DemoProfile {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  profile: UserProfile & { email?: string };
  linkedAccounts: LinkedAccount[];
  goals: Goal[];
  netWorthSummary: NetWorthSummary;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Financial chat request payload
 */
export interface FinancialChatRequest {
  messages: ChatMessage[];
  contextType: string;
  contextData?: Record<string, unknown>;
  demo?: {
    demoProfileId: string;
    state?: DemoProfile;
  };
}

/**
 * Context types for AI chat
 */
export type ContextType = 
  | 'center-chat'
  | 'networth'
  | 'net_worth'
  | 'assets'
  | 'liabilities'
  | 'goal'
  | 'goals'
  | 'goal-update'
  | 'suggestions'
  | 'market-insights'
  | 'finshorts'
  | 'what-if'
  | 'alternate-investments'
  | 'tax-loss-harvesting'
  | 'explore'
  | 'onboarding'
  | 'decision-handling';
