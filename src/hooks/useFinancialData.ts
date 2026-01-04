import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { logger } from '@/lib/logger';
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
  const { isAuthenticated, isLoading: sessionLoading, demoMode } = useSession();
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

    const summary = {
      netWorth,
      assetsTotal,
      liabilitiesTotal,
      cashTotal,
      investmentsTotal,
    };

    logger.financial('Calculated net worth summary', {
      netWorth,
      assetsTotal,
      liabilitiesTotal,
      cashTotal,
      investmentsTotal,
      accountCount: accounts.length,
      bankCount: bankAccounts.length,
      investmentCount: investmentAccounts.length,
      loanCount: loanAccounts.length,
    });

    return summary;
  };

  const loadDemoData = useCallback(async () => {
    logger.financial('Loading demo profile data', { demoMode });
    
    if (!demoMode) {
      logger.warn('No demo mode profile ID provided');
      setError('No demo profile selected');
      setIsLoading(false);
      return;
    }

    try {
      const demoProfile = getDemoProfile(demoMode);
      
      if (!demoProfile) {
        logger.error('Demo profile not found', { demoMode });
        setError(`Demo profile not found: ${demoMode}`);
        setIsLoading(false);
        return;
      }

      logger.financial('Demo profile loaded', {
        profileId: demoMode,
        profileName: demoProfile.name,
        accountCount: demoProfile.linkedAccounts.length,
        goalCount: demoProfile.goals.length,
      });

      // Convert demo profile linked accounts to LinkedAccount format
      setLinkedAccounts(demoProfile.linkedAccounts.map(acc => ({
        id: acc.id,
        account_type: acc.account_type,
        provider_name: acc.provider_name,
        last_four_digits: acc.last_four_digits,
        total_amount: acc.total_amount,
        interest_rate: acc.interest_rate,
        allocation_savings: acc.allocation_savings,
        allocation_stocks: acc.allocation_stocks,
        allocation_bonds: acc.allocation_bonds,
      })));

      // Convert demo profile goals to Goal format
      setGoals(demoProfile.goals.map(g => ({
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
      })));

      // Convert demo profile to UserProfile format
      setUserProfile({
        legal_first_name: demoProfile.profile.legal_first_name,
        legal_last_name: demoProfile.profile.legal_last_name,
        preferred_first_name: demoProfile.profile.preferred_first_name,
        email: demoProfile.profile.email,
        date_of_birth: demoProfile.profile.date_of_birth,
        income: demoProfile.profile.income,
        employment_type: demoProfile.profile.employment_type,
        goals: demoProfile.profile.goals,
        risk_inferred: demoProfile.profile.risk_inferred,
        city: demoProfile.profile.city,
        state: demoProfile.profile.state,
      });

      setError(null);
      logger.financial('Demo data loaded successfully', { profileId: demoMode });
    } catch (err) {
      logger.error('Error loading demo data', {
        error: err instanceof Error ? err.message : 'Unknown error',
      }, err instanceof Error ? err : undefined);
      setError('Failed to load demo data');
    } finally {
      setIsLoading(false);
    }
  }, [demoMode]);

  const loadAuthData = useCallback(async () => {
    logger.financial('Loading authenticated user data');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        logger.error('Error getting user', { error: userError.message }, userError as Error);
        throw userError;
      }
      
      if (!user) {
        logger.warn('No authenticated user found');
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      logger.financial('Fetching linked accounts', { userId: user.id });

      // Load linked accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) {
        logger.error('Error loading linked accounts', { error: accountsError.message }, accountsError as Error);
        throw accountsError;
      }
      
      logger.financial('Linked accounts loaded', {
        userId: user.id,
        accountCount: accountsData?.length || 0,
      });

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

      logger.financial('Fetching goals', { userId: user.id });

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) {
        logger.error('Error loading goals', { error: goalsError.message }, goalsError as Error);
        throw goalsError;
      }
      
      logger.financial('Goals loaded', {
        userId: user.id,
        goalCount: goalsData?.length || 0,
      });

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

      logger.financial('Fetching user profile', { userId: user.id });

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Error loading profile', { error: profileError.message }, profileError as Error);
        throw profileError;
      }
      
      logger.financial('User profile loaded', {
        userId: user.id,
        hasProfile: !!profileData,
      });

      setUserProfile(profileData || null);

      setError(null);
      logger.financial('Auth data loaded successfully', { userId: user.id });
    } catch (err) {
      logger.error('Error loading financial data', {
        error: err instanceof Error ? err.message : 'Unknown error',
      }, err instanceof Error ? err : undefined);
      setError('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    logger.financial('Refetching financial data', { demoMode, isAuthenticated });
    setIsLoading(true);
    if (demoMode) {
      await loadDemoData();
    } else if (isAuthenticated) {
      await loadAuthData();
    } else {
      logger.debug('No authenticated session or demo mode, skipping data load');
      setIsLoading(false);
    }
  }, [demoMode, isAuthenticated, loadDemoData, loadAuthData]);

  useEffect(() => {
    if (sessionLoading) {
      logger.debug('Session still loading, skipping financial data fetch');
      return;
    }
    logger.financial('Session ready, fetching financial data');
    refetch();
  }, [sessionLoading, refetch]);

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
