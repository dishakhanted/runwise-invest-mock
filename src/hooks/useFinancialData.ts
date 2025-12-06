/**
 * Hook for fetching financial data - works with both auth and demo modes
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { getDemoProfile } from '@/demo/demoProfiles';
import type { LinkedAccount, Goal, NetWorthSummary, UserProfile } from '@/domain/types';

// Re-export types for consumers
export type { LinkedAccount, Goal, NetWorthSummary, UserProfile };

interface UseFinancialDataResult {
  linkedAccounts: LinkedAccount[];
  goals: Goal[];
  netWorthSummary: NetWorthSummary;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFinancialData = (): UseFinancialDataResult => {
  const { mode, demoProfileId, isLoading: sessionLoading } = useSession();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateNetWorthSummary = (accounts: LinkedAccount[]): NetWorthSummary => {
    const bankAccounts = accounts.filter(acc => acc.account_type === 'bank');
    const investmentAccounts = accounts.filter(acc => acc.account_type === 'investment');
    const loanAccounts = accounts.filter(acc => acc.account_type === 'loan');

    const cashTotal = bankAccounts.reduce((sum, acc) => sum + Number(acc.total_amount), 0);
    const investmentsTotal = investmentAccounts.reduce((sum, acc) => sum + Number(acc.total_amount), 0);
    const assetsTotal = cashTotal + investmentsTotal;
    const liabilitiesTotal = loanAccounts.reduce((sum, acc) => sum + Number(acc.total_amount), 0);
    const netWorth = assetsTotal - liabilitiesTotal;

    return {
      netWorth,
      assetsTotal,
      liabilitiesTotal,
      cashTotal,
      investmentsTotal,
    };
  };

  const loadDemoData = useCallback(() => {
    if (!demoProfileId) {
      setError('No demo profile selected');
      setIsLoading(false);
      return;
    }

    const profile = getDemoProfile(demoProfileId);
    if (!profile) {
      setError('Demo profile not found');
      setIsLoading(false);
      return;
    }

    setLinkedAccounts(profile.linkedAccounts);
    setGoals(profile.goals.map(g => ({
      ...g,
      target_amount: g.target_amount,
      current_amount: g.current_amount,
    })));
    setUserProfile(profile.profile);
    setError(null);
    setIsLoading(false);
  }, [demoProfileId]);

  const loadAuthData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      // Load linked accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;
      setLinkedAccounts((accountsData || []).map(acc => ({
        id: acc.id,
        account_type: acc.account_type as LinkedAccount['account_type'],
        provider_name: acc.provider_name,
        last_four_digits: acc.last_four_digits,
        total_amount: Number(acc.total_amount),
        interest_rate: Number(acc.interest_rate),
        allocation_savings: acc.allocation_savings,
        allocation_stocks: acc.allocation_stocks,
        allocation_bonds: acc.allocation_bonds,
      })));

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals((goalsData || []).map(g => ({
        id: g.id,
        name: g.name,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        target_age: g.target_age || undefined,
        description: g.description || undefined,
        saving_account: g.saving_account || undefined,
        investment_account: g.investment_account || undefined,
        allocation_savings: g.allocation_savings,
        allocation_stocks: g.allocation_stocks,
        allocation_bonds: g.allocation_bonds,
      })));

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setUserProfile(profileData || null);

      setError(null);
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    if (mode === 'demo') {
      loadDemoData();
    } else if (mode === 'auth') {
      await loadAuthData();
    } else {
      setIsLoading(false);
    }
  }, [mode, loadDemoData, loadAuthData]);

  useEffect(() => {
    if (sessionLoading) return;
    refetch();
  }, [mode, demoProfileId, sessionLoading, refetch]);

  const netWorthSummary = calculateNetWorthSummary(linkedAccounts);

  return {
    linkedAccounts,
    goals,
    netWorthSummary,
    userProfile,
    isLoading: isLoading || sessionLoading,
    error,
    refetch,
  };
};
