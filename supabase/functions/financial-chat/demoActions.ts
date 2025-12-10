// demoActions.ts
// Handles demo mode money transfers and balance updates in Supabase
// Writes to linked_accounts and goals tables for demo users
// Uses service role to bypass RLS and handle demo user_id format

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getDemoProfile } from './demoProfiles.ts';
import type { SuggestionActionType } from './suggestionParser.ts';

export interface ApplyDemoActionParams {
  supabaseClient: SupabaseClient;
  userId: string; // e.g., "demo:young-professional" 
  suggestion: {
    title: string;
    body: string;
    actionType?: SuggestionActionType;
  };
  contextData?: any; // May contain goalId, accountId, etc.
  demoProfileId: string; // e.g., "young-professional"
}

/**
 * Gets a consistent UUID for demo users
 * Since DB requires UUID that references auth.users, we need to handle this carefully.
 * 
 * Options:
 * 1. Use a fixed UUID for all demo users (requires one auth.users entry)
 * 2. Use deterministic UUIDs per profile (requires multiple auth.users entries)
 * 3. Use raw SQL to temporarily disable FK constraint (not recommended)
 * 
 * For now, we'll use a fixed demo UUID that should exist in auth.users.
 * In production, you'd create a demo user in auth.users with this UUID.
 * 
 * Alternative: If the schema allows TEXT user_id without FK, we can use "demo:profile-id" directly.
 * But since the migration shows REFERENCES auth.users(id), we need a valid UUID.
 */
function getDemoUserId(demoProfileId: string): string {
  // Use a fixed UUID for all demo users
  // This UUID should exist in auth.users table for demo mode to work
  // Format: deterministic UUID based on "demo" namespace
  // For production, create an auth.users entry with this UUID or use profile-specific UUIDs
  
  // Simple deterministic UUID generation from demo profile ID
  // This creates a consistent UUID for each demo profile
  let hash = 0;
  const str = `demo:${demoProfileId}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Create UUID v4-like format with deterministic last 12 hex chars
  const hex = Math.abs(hash).toString(16).padStart(12, '0').substring(0, 12);
  return `00000000-0000-4000-8000-${hex}`;
}

export interface DemoActionResult {
  fromName: string;
  toName: string;
  updatedNetWorth: number;
  transferAmount: number;
}

/**
 * Applies a demo action (money transfer) to Supabase tables
 * Updates linked_accounts and goals tables for demo users
 */
export async function applyDemoAction(
  params: ApplyDemoActionParams
): Promise<DemoActionResult> {
  const { supabaseClient, userId, suggestion, contextData, demoProfileId } = params;

  // Get the in-memory demo profile to understand the structure
  const demoProfile = getDemoProfile(demoProfileId);
  if (!demoProfile) {
    throw new Error(`Demo profile not found: ${demoProfileId}`);
  }

  const actionType = suggestion.actionType;
  const titleLower = suggestion.title.toLowerCase();

  // Determine if this is a transfer action
  const isTransferAction = 
    actionType === "COMPLETE_EMERGENCY_FUND" ||
    titleLower.includes("move") ||
    titleLower.includes("transfer") ||
    titleLower.includes("complete emergency fund") ||
    titleLower.includes("emergency fund target");

  if (!isTransferAction) {
    throw new Error(`Action type ${actionType} is not a transfer action`);
  }

  // For COMPLETE_EMERGENCY_FUND: Transfer from Chase to Marcus, update emergency goal
  if (actionType === "COMPLETE_EMERGENCY_FUND" || titleLower.includes("emergency fund")) {
    return await handleEmergencyFundTransfer(
      supabaseClient,
      userId,
      demoProfile,
      contextData,
      demoProfileId
    );
  }

  // Generic transfer action (move money from account to account or goal)
  // Extract amount from suggestion body if possible
  const amountMatch = suggestion.body.match(/\$([\d,]+)/);
  const transferAmount = amountMatch 
    ? parseFloat(amountMatch[1].replace(/,/g, ''))
    : 1500; // Default to $1,500 if not found

  // For now, default to emergency fund transfer logic
  return await handleEmergencyFundTransfer(
    supabaseClient,
    userId,
    demoProfile,
    contextData,
    demoProfileId,
    transferAmount
  );
}

/**
 * Handles emergency fund transfer: Chase -> Marcus, update emergency goal
 */
async function handleEmergencyFundTransfer(
  supabase: SupabaseClient,
  userId: string,
  demoProfile: any,
  contextData: any,
  demoProfileId: string,
  customAmount?: number
): Promise<DemoActionResult> {
  // Find accounts in demo profile
  const chaseAccount = demoProfile.linkedAccounts.find((a: any) => 
    a.provider_name === "Chase" && a.account_type === "bank"
  );
  const marcusAccount = demoProfile.linkedAccounts.find((a: any) => 
    a.provider_name === "Marcus by Goldman Sachs" && a.account_type === "bank"
  );
  const emergencyGoal = demoProfile.goals.find((g: any) => 
    g.name.toLowerCase().includes("emergency")
  );

  if (!chaseAccount || !marcusAccount || !emergencyGoal) {
    throw new Error("Required accounts or goal not found in demo profile");
  }

  // Calculate transfer amount
  const needed = emergencyGoal.target_amount - emergencyGoal.current_amount;
  const transferAmount = customAmount || Math.min(needed, 1500, chaseAccount.total_amount);

  // Convert demo user_id to UUID format for database
  // Note: The foreign key constraint requires the UUID to exist in auth.users
  // For demo mode, we'll use a deterministic UUID and handle FK errors gracefully
  // In production, you'd want to ensure demo users have corresponding auth.users entries
  const demoUserId = getDemoUserId(demoProfileId);

  // Update Chase account balance (decrease)
  const { data: chaseAccounts, error: chaseError } = await supabase
    .from("linked_accounts")
    .select("*")
    .eq("user_id", demoUserId)
    .eq("provider_name", "Chase")
    .eq("account_type", "bank")
    .limit(1);

  if (chaseError) {
    console.error("[demoActions] Error fetching Chase account:", chaseError);
    // If FK constraint error, we can't proceed - return error
    if (chaseError.message?.includes("foreign key") || chaseError.message?.includes("violates foreign key")) {
      throw new Error(`Demo user ${demoUserId} not found in auth.users. Please create a demo user entry first.`);
    }
    throw new Error(`Failed to fetch Chase account: ${chaseError.message}`);
  }

  let chaseAccountId: string | null = null;
  if (chaseAccounts && chaseAccounts.length > 0) {
    chaseAccountId = chaseAccounts[0].id;
    const newChaseBalance = Math.max(0, parseFloat(chaseAccounts[0].total_amount) - transferAmount);
    
    const { error: updateChaseError } = await supabase
      .from("linked_accounts")
      .update({ total_amount: newChaseBalance })
      .eq("id", chaseAccountId);

    if (updateChaseError) {
      console.error("[demoActions] Error updating Chase account:", updateChaseError);
      throw new Error(`Failed to update Chase account: ${updateChaseError.message}`);
    }
  } else {
    // Create Chase account if it doesn't exist
    // This may fail due to FK constraint if demo user doesn't exist in auth.users
    const { data: newChase, error: createError } = await supabase
      .from("linked_accounts")
      .insert({
        user_id: demoUserId,
        account_type: "bank",
        provider_name: "Chase",
        last_four_digits: chaseAccount.last_four_digits,
        total_amount: Math.max(0, chaseAccount.total_amount - transferAmount),
        interest_rate: chaseAccount.interest_rate,
      })
      .select()
      .single();

    if (createError) {
      console.error("[demoActions] Error creating Chase account:", createError);
      if (createError.message?.includes("foreign key") || createError.message?.includes("violates foreign key")) {
        throw new Error(`Demo user ${demoUserId} not found in auth.users. Please create a demo user entry in auth.users table first.`);
      }
      throw new Error(`Failed to create Chase account: ${createError.message}`);
    }
    chaseAccountId = newChase.id;
  }

  // Update Marcus account balance (increase)
  const { data: marcusAccounts, error: marcusError } = await supabase
    .from("linked_accounts")
    .select("*")
    .eq("user_id", demoUserId)
    .eq("provider_name", "Marcus by Goldman Sachs")
    .eq("account_type", "bank")
    .limit(1);

  if (marcusError) {
    console.error("[demoActions] Error fetching Marcus account:", marcusError);
    throw new Error(`Failed to fetch Marcus account: ${marcusError.message}`);
  }

  if (marcusAccounts && marcusAccounts.length > 0) {
    const newMarcusBalance = parseFloat(marcusAccounts[0].total_amount) + transferAmount;
    
    const { error: updateMarcusError } = await supabase
      .from("linked_accounts")
      .update({ total_amount: newMarcusBalance })
      .eq("id", marcusAccounts[0].id);

    if (updateMarcusError) {
      console.error("[demoActions] Error updating Marcus account:", updateMarcusError);
      throw new Error(`Failed to update Marcus account: ${updateMarcusError.message}`);
    }
  } else {
    // Create Marcus account if it doesn't exist
    const { error: createError } = await supabase
      .from("linked_accounts")
      .insert({
        user_id: demoUserId,
        account_type: "bank",
        provider_name: "Marcus by Goldman Sachs",
        last_four_digits: marcusAccount.last_four_digits,
        total_amount: marcusAccount.total_amount + transferAmount,
        interest_rate: marcusAccount.interest_rate,
      });

    if (createError) {
      console.error("[demoActions] Error creating Marcus account:", createError);
      if (createError.message?.includes("foreign key") || createError.message?.includes("violates foreign key")) {
        throw new Error(`Demo user ${demoUserId} not found in auth.users. Please create a demo user entry in auth.users table first.`);
      }
      throw new Error(`Failed to create Marcus account: ${createError.message}`);
    }
  }

  // Update emergency fund goal
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", demoUserId)
    .ilike("name", "%emergency%")
    .limit(1);

  if (goalsError) {
    console.error("[demoActions] Error fetching emergency goal:", goalsError);
    throw new Error(`Failed to fetch emergency goal: ${goalsError.message}`);
  }

  if (goals && goals.length > 0) {
    const goal = goals[0];
    const newCurrentAmount = Math.min(
      parseFloat(goal.current_amount) + transferAmount,
      parseFloat(goal.target_amount)
    );

    const { error: updateGoalError } = await supabase
      .from("goals")
      .update({
        current_amount: newCurrentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id);

    if (updateGoalError) {
      console.error("[demoActions] Error updating emergency goal:", updateGoalError);
      throw new Error(`Failed to update emergency goal: ${updateGoalError.message}`);
    }
  } else {
    // Create emergency goal if it doesn't exist
    const { error: createError } = await supabase
      .from("goals")
      .insert({
        user_id: demoUserId,
        name: emergencyGoal.name,
        target_amount: emergencyGoal.target_amount,
        current_amount: Math.min(transferAmount, emergencyGoal.target_amount),
        allocation_savings: emergencyGoal.allocation_savings,
        allocation_stocks: emergencyGoal.allocation_stocks,
        allocation_bonds: emergencyGoal.allocation_bonds,
      });

    if (createError) {
      console.error("[demoActions] Error creating emergency goal:", createError);
      if (createError.message?.includes("foreign key") || createError.message?.includes("violates foreign key")) {
        throw new Error(`Demo user ${demoUserId} not found in auth.users. Please create a demo user entry in auth.users table first.`);
      }
      throw new Error(`Failed to create emergency goal: ${createError.message}`);
    }
  }

  // Calculate updated net worth
  const { data: allAccounts, error: accountsError } = await supabase
    .from("linked_accounts")
    .select("total_amount, account_type")
    .eq("user_id", demoUserId);

  if (accountsError) {
    console.error("[demoActions] Error fetching accounts for net worth:", accountsError);
    // Continue with calculation using demo profile data
  }

  const accounts = allAccounts || [];
  const assetsTotal = accounts
    .filter((a: any) => a.account_type !== "loan")
    .reduce((sum: number, a: any) => sum + parseFloat(a.total_amount || 0), 0);
  const liabilitiesTotal = accounts
    .filter((a: any) => a.account_type === "loan")
    .reduce((sum: number, a: any) => sum + parseFloat(a.total_amount || 0), 0);
  const updatedNetWorth = assetsTotal - liabilitiesTotal;

  return {
    fromName: "Chase",
    toName: "Marcus by Goldman Sachs",
    updatedNetWorth,
    transferAmount,
  };
}

