/**
 * Zod schemas for financial domain types
 * These schemas provide runtime validation for the core types
 */

import { z } from 'zod';

// Account types
export const zAccountType = z.enum(['bank', 'investment', 'loan']);

// Risk profile levels
export const zRiskLevel = z.enum(['low', 'medium', 'high']);

// Employment types
export const zEmploymentType = z.enum(['full-time', 'part-time', 'self-employed', 'unemployed', 'retired']);

/**
 * User profile schema
 */
export const zUserProfile = z.object({
  legal_first_name: z.string().optional(),
  legal_last_name: z.string().optional(),
  preferred_first_name: z.string().optional(),
  email: z.string().email().optional(),
  date_of_birth: z.string().optional(),
  income: z.string().optional(),
  employment_type: z.string().optional(),
  goals: z.string().optional(),
  risk_inferred: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  zip_code: z.string().optional(),
});

/**
 * Allocation percentages schema
 */
export const zAllocation = z.object({
  savings: z.number().min(0).max(100),
  stocks: z.number().min(0).max(100),
  bonds: z.number().min(0).max(100),
}).refine(data => data.savings + data.stocks + data.bonds === 100, {
  message: 'Allocation percentages must sum to 100',
});

/**
 * Linked account schema
 */
export const zLinkedAccount = z.object({
  id: z.string(),
  account_type: zAccountType,
  provider_name: z.string(),
  last_four_digits: z.string().length(4),
  total_amount: z.number(),
  interest_rate: z.number(),
  allocation_savings: z.number().min(0).max(100),
  allocation_stocks: z.number().min(0).max(100),
  allocation_bonds: z.number().min(0).max(100),
});

/**
 * Position schema
 */
export const zPosition = z.object({
  id: z.string(),
  account_id: z.string(),
  symbol: z.string(),
  name: z.string(),
  quantity: z.number(),
  cost_basis: z.number(),
  current_value: z.number(),
  gain_loss: z.number(),
  gain_loss_percent: z.number(),
});

/**
 * Liability schema
 */
export const zLiability = z.object({
  id: z.string(),
  type: z.enum(['mortgage', 'auto', 'student', 'personal', 'credit_card', 'other']),
  provider_name: z.string(),
  principal_amount: z.number(),
  current_balance: z.number(),
  interest_rate: z.number(),
  monthly_payment: z.number().optional(),
  due_date: z.string().optional(),
});

/**
 * Goal schema
 */
export const zGoal = z.object({
  id: z.string(),
  name: z.string(),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0),
  target_age: z.number().positive().optional(),
  description: z.string().optional(),
  saving_account: z.string().optional(),
  investment_account: z.string().optional(),
  allocation_savings: z.number().min(0).max(100),
  allocation_stocks: z.number().min(0).max(100),
  allocation_bonds: z.number().min(0).max(100),
});

/**
 * Net worth summary schema
 */
export const zNetWorthSummary = z.object({
  netWorth: z.number(),
  assetsTotal: z.number(),
  liabilitiesTotal: z.number(),
  cashTotal: z.number(),
  investmentsTotal: z.number(),
});

/**
 * Financial context schema
 */
export const zFinancialContext = z.object({
  userProfile: zUserProfile.nullable(),
  linkedAccounts: z.array(zLinkedAccount),
  goals: z.array(zGoal),
  netWorthSummary: zNetWorthSummary,
});

/**
 * Chat message schema
 */
export const zChatMessage = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

/**
 * Demo profile schema
 */
export const zDemoProfile = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  description: z.string().optional(),
  profile: zUserProfile.extend({ email: z.string().email().optional() }),
  linkedAccounts: z.array(zLinkedAccount),
  goals: z.array(zGoal),
  netWorthSummary: zNetWorthSummary,
});

/**
 * Financial chat request schema
 */
export const zFinancialChatRequest = z.object({
  messages: z.array(zChatMessage),
  contextType: z.string(),
  contextData: z.record(z.string(), z.unknown()).optional(),
  demo: z.object({
    demoProfileId: z.string(),
  }).optional(),
});

/**
 * Context type schema
 */
export const zContextType = z.enum([
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
] as const);

// Type exports from schemas (for use when you want Zod-inferred types)
export type ZUserProfile = z.infer<typeof zUserProfile>;
export type ZLinkedAccount = z.infer<typeof zLinkedAccount>;
export type ZGoal = z.infer<typeof zGoal>;
export type ZNetWorthSummary = z.infer<typeof zNetWorthSummary>;
export type ZFinancialContext = z.infer<typeof zFinancialContext>;
export type ZDemoProfile = z.infer<typeof zDemoProfile>;
export type ZChatMessage = z.infer<typeof zChatMessage>;
export type ZFinancialChatRequest = z.infer<typeof zFinancialChatRequest>;
