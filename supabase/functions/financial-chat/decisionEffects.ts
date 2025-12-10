// decisionEffects.ts
// Centralized place for all suggestion decision side-effects
// Handles both database mutations (real mode) and in-memory demo profile mutations (demo mode)

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getDemoProfile, demoProfiles } from './demoProfiles.ts';
import type { DemoProfile } from './types.ts';

export type SuggestionEffectResult = {
  appliedActions: string[];   // things we actually changed in DB or demo profile
  pendingActions: string[];   // things the user must do manually
};

export async function applySuggestionEffects(params: {
  supabase: SupabaseClient;
  decision: "approved" | "denied" | "know_more";
  suggestionTitle?: string;
  contextType: string;
  contextData: any;
  userId: string | null;
  isDemo: boolean;
  demoProfileId?: string;
}): Promise<SuggestionEffectResult> {
  const {
    supabase,
    decision,
    suggestionTitle,
    contextType,
    contextData,
    userId,
    isDemo,
    demoProfileId,
  } = params;

  const result: SuggestionEffectResult = {
    appliedActions: [],
    pendingActions: [],
  };

  // Only process approved decisions
  if (decision !== "approved") {
    return result;
  }

  const title = (suggestionTitle || "").toLowerCase();

  // DEMO MODE: Apply mutations to in-memory demo profile
  if (isDemo && demoProfileId) {
    const demoProfile = getDemoProfile(demoProfileId);
    if (!demoProfile) {
      result.pendingActions.push("Demo profile not found. Please refresh and try again.");
      return result;
    }

    // Complete emergency fund target
    if (
      (contextType === "net_worth" || contextType === "networth" || contextType === "dashboard") &&
      (title.includes("complete emergency fund") || title.includes("emergency fund target") || title.includes("increase emergency fund"))
    ) {
      const emergencyGoal = demoProfile.goals.find(g => 
        g.name.toLowerCase().includes("emergency") || g.id === contextData?.id || g.id === contextData?.goalId
      );
      
      if (emergencyGoal) {
        // Transfer money from Chase to Marcus to complete the fund
        const chaseAccount = demoProfile.linkedAccounts.find(a => 
          a.provider_name === "Chase" && a.account_type === "bank"
        );
        const marcusAccount = demoProfile.linkedAccounts.find(a => 
          a.provider_name === "Marcus by Goldman Sachs" && a.account_type === "bank"
        );
        
        if (chaseAccount && marcusAccount) {
          // Calculate how much is needed to reach the target
          const needed = emergencyGoal.target_amount - emergencyGoal.current_amount;
          const actualTransfer = Math.min(needed, 1500, chaseAccount.total_amount); // Transfer up to needed amount, max $1,500, or available balance
          
          chaseAccount.total_amount -= actualTransfer;
          marcusAccount.total_amount += actualTransfer;
          emergencyGoal.current_amount += actualTransfer;
          
          // Update net worth summary
          demoProfile.netWorthSummary.cashTotal = demoProfile.linkedAccounts
            .filter(a => a.account_type === "bank")
            .reduce((sum, a) => sum + a.total_amount, 0);
          demoProfile.netWorthSummary.assetsTotal = demoProfile.netWorthSummary.cashTotal + demoProfile.netWorthSummary.investmentsTotal;
          demoProfile.netWorthSummary.netWorth = demoProfile.netWorthSummary.assetsTotal - demoProfile.netWorthSummary.liabilitiesTotal;
          
          if (emergencyGoal.current_amount >= emergencyGoal.target_amount) {
            result.appliedActions.push(
              `Completed your emergency fund goal by transferring $${actualTransfer.toLocaleString()} from Chase to Marcus. Your emergency fund is now fully funded at $${emergencyGoal.target_amount.toLocaleString()}.`,
            );
          } else {
            result.appliedActions.push(
              `Transferred $${actualTransfer.toLocaleString()} from Chase to Marcus. Your emergency fund is now at $${emergencyGoal.current_amount.toLocaleString()} of $${emergencyGoal.target_amount.toLocaleString()}.`,
            );
          }
        } else {
          emergencyGoal.current_amount = emergencyGoal.target_amount;
          result.appliedActions.push(
            `Marked your emergency fund goal as completed. Target: $${emergencyGoal.target_amount.toLocaleString()}.`,
          );
        }
      }
    }

    // Accelerate loan repayment (update loan balance)
    if (
      (contextType === "net_worth" || contextType === "networth" || contextType === "dashboard" || contextType === "liabilities") &&
      (title.includes("sofi loan") || title.includes("accelerate") || title.includes("pay down") || title.includes("high interest debt"))
    ) {
      const sofiLoan = demoProfile.linkedAccounts.find(a => 
        a.provider_name === "SoFi" && a.account_type === "loan"
      );
      
      if (sofiLoan) {
        // Simulate paying down $500 extra
        const extraPayment = 500;
        sofiLoan.total_amount = Math.max(0, sofiLoan.total_amount - extraPayment);
        
        // Update net worth summary
        demoProfile.netWorthSummary.liabilitiesTotal = demoProfile.linkedAccounts
          .filter(a => a.account_type === "loan")
          .reduce((sum, a) => sum + a.total_amount, 0);
        demoProfile.netWorthSummary.netWorth = demoProfile.netWorthSummary.assetsTotal - demoProfile.netWorthSummary.liabilitiesTotal;
        
        result.appliedActions.push(
          `Applied an extra $${extraPayment.toLocaleString()} payment to your SoFi loan. New balance: $${sofiLoan.total_amount.toLocaleString()}.`,
        );
      } else {
        result.pendingActions.push(
          "Increase your monthly payment on your high-interest loan through your lender's portal to reduce interest over time.",
        );
      }
    }

    // Align down-payment allocation
    if (
      (contextType === "net_worth" || contextType === "networth" || contextType === "dashboard") &&
      (title.includes("down payment allocation") || title.includes("allocation") || title.includes("rebalance"))
    ) {
      const downPaymentGoal = demoProfile.goals.find(g => 
        g.name.toLowerCase().includes("down payment") || g.id === contextData?.id || g.id === contextData?.goalId
      );
      
      if (downPaymentGoal) {
        downPaymentGoal.allocation_stocks = 30;
        downPaymentGoal.allocation_bonds = 10;
        downPaymentGoal.allocation_savings = 60;
        
        result.appliedActions.push(
          "Updated the target allocation for your down-payment goal to 30% stocks, 10% bonds, and 60% savings in your GrowWise plan.",
        );
      }
    }

    // Rebalance brokerage allocation (assets context)
    if (
      contextType === "assets" &&
      (title.includes("rebalance") || title.includes("allocation") || title.includes("diversification"))
    ) {
      const robinhoodAccount = demoProfile.linkedAccounts.find(a => 
        a.provider_name === "Robinhood" && a.account_type === "investment"
      );
      
      if (robinhoodAccount) {
        // Adjust allocation to be more balanced
        robinhoodAccount.allocation_stocks = 80;
        robinhoodAccount.allocation_bonds = 20;
        
        result.appliedActions.push(
          "Updated your Robinhood account target allocation to 80% stocks and 20% bonds for better diversification.",
        );
      }
    }

    // Increase monthly contribution (goals context)
    if (
      (contextType === "goal" || contextType === "goals") &&
      (title.includes("increase monthly") || title.includes("boost contribution") || title.includes("monthly contribution"))
    ) {
      const goal = demoProfile.goals.find(g => 
        g.id === contextData?.id || g.id === contextData?.goalId
      );
      
      if (goal) {
        // Simulate increasing current amount by a monthly contribution
        const monthlyIncrease = 200;
        goal.current_amount += monthlyIncrease;
        
        // Update net worth if goal is linked to an account
        if (goal.investment_account) {
          const investmentAccount = demoProfile.linkedAccounts.find(a => 
            a.provider_name.includes(goal.investment_account || "")
          );
          if (investmentAccount) {
            investmentAccount.total_amount += monthlyIncrease;
            demoProfile.netWorthSummary.investmentsTotal = demoProfile.linkedAccounts
              .filter(a => a.account_type === "investment")
              .reduce((sum, a) => sum + a.total_amount, 0);
            demoProfile.netWorthSummary.assetsTotal = demoProfile.netWorthSummary.cashTotal + demoProfile.netWorthSummary.investmentsTotal;
            demoProfile.netWorthSummary.netWorth = demoProfile.netWorthSummary.assetsTotal - demoProfile.netWorthSummary.liabilitiesTotal;
          }
        }
        
        result.appliedActions.push(
          `Increased your monthly contribution by $${monthlyIncrease.toLocaleString()}. Your ${goal.name} goal progress is now $${goal.current_amount.toLocaleString()} of $${goal.target_amount.toLocaleString()}.`,
        );
      }
    }

    // For suggestions that can't be auto-executed
    if (result.appliedActions.length === 0) {
      if (title.includes("refinance") || title.includes("consolidate") || title.includes("advisor") || title.includes("tax")) {
        result.appliedActions.push(
          "Got it, I've logged this as a next step.",
        );
        result.pendingActions.push(
          "Contact your lender or a financial advisor to explore refinancing options that could lower your interest rate.",
        );
      } else {
        result.pendingActions.push(
          "This suggestion requires manual action. Please review the recommendation and take the necessary steps in your actual accounts.",
        );
      }
    }

    return result;
  }

  // REAL MODE: Only store decisions, no DB mutations (keep current behavior)
  if (!userId) {
    return result;
  }

  // REAL MODE: Store decision in DB but don't mutate accounts
  // Example 1: Complete emergency fund target
  if (
    (contextType === "net_worth" || contextType === "networth" || contextType === "dashboard") &&
    (title.includes("complete emergency fund") || title.includes("emergency fund target"))
  ) {
    // Example: mark the emergency-fund goal as completed
    const goalId = contextData?.id || contextData?.goalId; // whatever you already pass as contextData for this card
    if (goalId) {
      const { error } = await supabase
        .from("goals")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId)
        .eq("user_id", userId);

      if (!error) {
        result.appliedActions.push(
          "Marked your emergency-fund goal as completed in your GrowWise plan.",
        );
      } else {
        result.pendingActions.push(
          "We couldn't update the emergency-fund goal in the database due to a technical issue. You may need to retry or edit it manually later.",
        );
      }
    }

    // Actual money movement is manual:
    result.pendingActions.push(
      "Move $1,500 from your Chase account to your Marcus account to reach the $30,000 emergency-fund target.",
    );
  }

  // Example 2: Accelerate loan repayment (plan only, no DB update)
  if (
    (contextType === "net_worth" || contextType === "networth" || contextType === "dashboard" || contextType === "liabilities") &&
    (title.includes("sofi loan") || title.includes("accelerate") || title.includes("pay down") || title.includes("high interest debt"))
  ) {
    result.pendingActions.push(
      "Increase your monthly payment on the $18,500 SoFi loan through your lender's portal to reduce interest over time.",
    );
  }

  // Example 3: Align down-payment allocation (update allocation fields)
  if (
    (contextType === "net_worth" || contextType === "networth" || contextType === "dashboard") &&
    (title.includes("down payment allocation") || title.includes("allocation") || title.includes("rebalance"))
  ) {
    const goalId = contextData?.id || contextData?.goalId;
    if (goalId) {
      const { error } = await supabase
        .from("goals")
        .update({
          stocks_pct: 0.3,
          bonds_pct: 0.1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId)
        .eq("user_id", userId);

      if (!error) {
        result.appliedActions.push(
          "Updated the target allocation for your down-payment goal to 30% stocks and 10% bonds inside GrowWise.",
        );
      }
    }

    result.pendingActions.push(
      "Adjust your actual investment accounts to match this 30% stocks / 10% bonds target for the down-payment savings.",
    );
  }

  // Assets context: Rebalance brokerage allocation
  if (
    contextType === "assets" &&
    (title.includes("rebalance") || title.includes("allocation") || title.includes("diversification"))
  ) {
    const accountId = contextData?.id || contextData?.accountId;
    if (accountId) {
      // Update target allocation if stored in accounts or goals
      // This is a placeholder - adjust based on your actual schema
      result.pendingActions.push(
        "Review and adjust your brokerage account allocation to match the recommended diversification strategy.",
      );
    }
  }

  // Liabilities context: Refinance loan (typically no DB mutation, just guidance)
  if (
    contextType === "liabilities" &&
    (title.includes("refinance") || title.includes("consolidate"))
  ) {
    result.pendingActions.push(
      "Contact your lender or a financial advisor to explore refinancing options that could lower your interest rate.",
    );
  }

  // Increase monthly contribution
  if (
    (contextType === "goal" || contextType === "goals") &&
    (title.includes("increase monthly") || title.includes("boost contribution") || title.includes("monthly contribution"))
  ) {
    const goalId = contextData?.id || contextData?.goalId;
    if (goalId) {
      // Extract amount from suggestion if possible, or use a default
      // This would ideally parse the suggestion body for the amount
      result.pendingActions.push(
        "Update your automatic monthly contribution amount in your investment account settings.",
      );
    }
  }

  return result;
}

