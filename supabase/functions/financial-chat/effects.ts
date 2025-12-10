// effects.ts
// Executes suggestion actions in both demo and real modes
// Returns human-readable descriptions of what was changed

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { demoProfiles } from './demoProfiles.ts';
import type { DemoProfile } from './types.ts';
import type { SuggestionActionType } from './suggestionParser.ts';

export interface ApplySuggestionEffectArgs {
  supabase: SupabaseClient;
  decision: {
    decision?: 'approved' | 'denied' | 'know_more';
    suggestionTitle?: string;
  };
  contextType: string;
  contextData: any;
  userId: string | null;
  isDemo: boolean;
  demoProfileId?: string;
  actionType?: SuggestionActionType;
  demoProfileState?: DemoProfile;
}

// Re-export ParsedDecision type for convenience
export type ParsedDecision = {
  isDecision: boolean;
  suggestionTitle?: string;
  decision?: 'approved' | 'denied' | 'know_more';
};

export interface SuggestionEffectResult {
  updatedContextDescription: string; // human-readable summary of what changed
  updatedDemoProfile?: DemoProfile;
}

function cloneDemoProfile(profile: DemoProfile | undefined): DemoProfile | null {
  return profile ? JSON.parse(JSON.stringify(profile)) as DemoProfile : null;
}

function recalculateNetWorth(profile: DemoProfile) {
  const assetsTotal = profile.linkedAccounts
    .filter((a) => a.account_type !== "loan")
    .reduce((sum, a) => sum + a.total_amount, 0);
  const liabilitiesTotal = profile.linkedAccounts
    .filter((a) => a.account_type === "loan")
    .reduce((sum, a) => sum + a.total_amount, 0);
  const cashTotal = profile.linkedAccounts
    .filter((a) => a.account_type === "bank")
    .reduce((sum, a) => sum + a.total_amount, 0);

  profile.netWorthSummary.cashTotal = cashTotal;
  profile.netWorthSummary.assetsTotal = assetsTotal;
  profile.netWorthSummary.liabilitiesTotal = liabilitiesTotal;
  profile.netWorthSummary.netWorth = assetsTotal - liabilitiesTotal;
}

/**
 * Applies the effect of an approved suggestion
 */
export async function applySuggestionEffect(
  args: ApplySuggestionEffectArgs
): Promise<SuggestionEffectResult> {
  // Only process approved decisions
  if (args.decision.decision !== 'approved') {
    return { updatedContextDescription: "" };
  }

  // Infer action type from title if not provided
  let actionType = args.actionType;
  if (!actionType && args.decision.suggestionTitle) {
    const titleLower = args.decision.suggestionTitle.toLowerCase();
    if (titleLower.includes("complete emergency fund") || titleLower.includes("emergency fund target") || titleLower.includes("increase emergency fund")) {
      actionType = "COMPLETE_EMERGENCY_FUND";
    } else if (titleLower.includes("down payment allocation") || titleLower.includes("align down payment") || titleLower.includes("rebalance")) {
      actionType = "REALLOCATE_DOWN_PAYMENT";
    } else if (titleLower.includes("sofi loan") || (titleLower.includes("accelerate") && titleLower.includes("loan")) || (titleLower.includes("pay down") && titleLower.includes("high interest"))) {
      actionType = "ACCELERATE_SOFI_LOAN";
    } else {
      actionType = "NO_ACTION";
    }
  }

  // Dispatch to per-action handlers
  switch (actionType) {
    case "COMPLETE_EMERGENCY_FUND":
      return await handleCompleteEmergencyFundGoal(args);
    case "REALLOCATE_DOWN_PAYMENT":
      return await handleReallocateDownPayment(args);
    case "ACCELERATE_SOFI_LOAN":
      return await handleAccelerateSofiLoan(args);
    default:
      return { updatedContextDescription: "" };
  }
}

/**
 * Handles completing the emergency fund goal
 */
async function handleCompleteEmergencyFundGoal(
  args: ApplySuggestionEffectArgs
): Promise<SuggestionEffectResult> {
  if (args.isDemo && args.demoProfileId) {
    // DEMO MODE: Mutate in-memory demo profile
    const sourceProfile = args.demoProfileState ?? demoProfiles[args.demoProfileId];
    const demoProfile = cloneDemoProfile(sourceProfile);
    if (!demoProfile) {
      return { updatedContextDescription: "Demo profile not found." };
    }

    const emergencyGoal = demoProfile.goals.find(g => 
      g.name.toLowerCase().includes("emergency") || g.id === args.contextData?.id || g.id === args.contextData?.goalId
    );

    if (!emergencyGoal) {
      return { updatedContextDescription: "Emergency fund goal not found in demo profile." };
    }

    const chaseAccount = demoProfile.linkedAccounts.find(a => 
      a.provider_name === "Chase" && a.account_type === "bank"
    );
    const marcusAccount = demoProfile.linkedAccounts.find(a => 
      a.provider_name === "Marcus by Goldman Sachs" && a.account_type === "bank"
    );

    const needed = Math.max(0, emergencyGoal.target_amount - emergencyGoal.current_amount);
    const transferAmount = needed;

    if (chaseAccount) {
      const fromChase = Math.min(transferAmount, chaseAccount.total_amount);
      chaseAccount.total_amount = Math.max(0, chaseAccount.total_amount - fromChase);
      if (marcusAccount) {
        marcusAccount.total_amount += transferAmount;
      }
    } else if (marcusAccount) {
      marcusAccount.total_amount += transferAmount;
    }

    emergencyGoal.current_amount = emergencyGoal.target_amount;

    recalculateNetWorth(demoProfile);

    return {
      updatedContextDescription: `In this demo, I've simulated moving $${transferAmount.toLocaleString()} to fully fund your $${emergencyGoal.target_amount.toLocaleString()} emergency fund. Your demo dashboard now shows a fully funded emergency fund.`,
      updatedDemoProfile: demoProfile,
    };
  } else {
    // REAL MODE: Update Supabase
    if (!args.userId) {
      return { updatedContextDescription: "" };
    }

    const goalId = args.contextData?.id || args.contextData?.goalId;
    if (!goalId) {
      return { updatedContextDescription: "" };
    }

    // Update goal status to completed
    const { error: goalError } = await args.supabase
      .from("goals")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .eq("user_id", args.userId);

    if (goalError) {
      console.error("[effects] Error updating goal:", goalError);
      return {
        updatedContextDescription: "I've logged your approval, but encountered an issue updating the goal status. Please check your goals manually.",
      };
    }

    // In real mode, we can't actually move money, so we schedule it
    // For now, just update the goal and return a message
    return {
      updatedContextDescription: `I've updated your emergency fund goal to completed status in your GrowWise plan. To complete the transfer, please move the remaining funds from your checking account to your emergency fund savings account through your bank's portal.`,
    };
  }
}

/**
 * Handles reallocating down payment goal allocation
 */
async function handleReallocateDownPayment(
  args: ApplySuggestionEffectArgs
): Promise<SuggestionEffectResult> {
  if (args.isDemo && args.demoProfileId) {
    // DEMO MODE
    const sourceProfile = args.demoProfileState ?? demoProfiles[args.demoProfileId];
    const demoProfile = cloneDemoProfile(sourceProfile);
    if (!demoProfile) {
      return { updatedContextDescription: "Demo profile not found." };
    }

    const downPaymentGoal = demoProfile.goals.find(g => 
      g.name.toLowerCase().includes("down payment") || g.id === args.contextData?.id || g.id === args.contextData?.goalId
    );

    if (!downPaymentGoal) {
      return { updatedContextDescription: "Down payment goal not found in demo profile." };
    }

    downPaymentGoal.allocation_stocks = 30;
    downPaymentGoal.allocation_bonds = 10;
    downPaymentGoal.allocation_savings = 60;
    recalculateNetWorth(demoProfile);

    return {
      updatedContextDescription: `In this demo, I've updated your down-payment goal allocation to 30% stocks, 10% bonds, and 60% savings. Your demo dashboard now reflects this new allocation target.`,
      updatedDemoProfile: demoProfile,
    };
  } else {
    // REAL MODE
    if (!args.userId) {
      return { updatedContextDescription: "" };
    }

    const goalId = args.contextData?.id || args.contextData?.goalId;
    if (!goalId) {
      return { updatedContextDescription: "" };
    }

    const { error } = await args.supabase
      .from("goals")
      .update({
        stocks_pct: 0.3,
        bonds_pct: 0.1,
        savings_pct: 0.6,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .eq("user_id", args.userId);

    if (error) {
      console.error("[effects] Error updating goal allocation:", error);
      return {
        updatedContextDescription: "I've logged your approval, but encountered an issue updating the allocation. Please check your goals manually.",
      };
    }

    return {
      updatedContextDescription: `I've updated your down-payment goal allocation to 30% stocks, 10% bonds, and 60% savings in your GrowWise plan. Please adjust your actual investment accounts to match this target allocation.`,
    };
  }
}

/**
 * Handles accelerating SoFi loan repayment
 */
async function handleAccelerateSofiLoan(
  args: ApplySuggestionEffectArgs
): Promise<SuggestionEffectResult> {
  if (args.isDemo && args.demoProfileId) {
    // DEMO MODE
    const sourceProfile = args.demoProfileState ?? demoProfiles[args.demoProfileId];
    const demoProfile = cloneDemoProfile(sourceProfile);
    if (!demoProfile) {
      return { updatedContextDescription: "Demo profile not found." };
    }

    const sofiLoan = demoProfile.linkedAccounts.find(a => 
      a.provider_name === "SoFi" && a.account_type === "loan"
    );

    if (!sofiLoan) {
      return { updatedContextDescription: "SoFi loan not found in demo profile." };
    }

    const extraPayment = 500;
    sofiLoan.total_amount = Math.max(0, sofiLoan.total_amount - extraPayment);

    recalculateNetWorth(demoProfile);

    return {
      updatedContextDescription: `In this demo, I've simulated applying an extra $${extraPayment.toLocaleString()} payment to your SoFi loan. Your demo dashboard now shows a loan balance of $${sofiLoan.total_amount.toLocaleString()}.`,
      updatedDemoProfile: demoProfile,
    };
  } else {
    // REAL MODE: We can't actually make loan payments, so just log it
    return {
      updatedContextDescription: `I've logged your approval to accelerate your SoFi loan repayment. To apply the extra payment, please log into your SoFi account and make an additional payment of $500 or more through their portal.`,
    };
  }
}

