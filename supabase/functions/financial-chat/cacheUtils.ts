/**
 * Cache utilities for storing and retrieving AI summaries
 * Enables instant dashboard loading with cached summaries
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface FinancialDataSnapshot {
  netWorth: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  cashTotal: number;
  investmentsTotal: number;
}

export interface AISuggestion {
  id: string;
  title: string;
  body: string;
  contextType?: string;
  actionType?: string;
}

interface CachedSummary {
  summary_text: string;
  financial_data: FinancialDataSnapshot;
  suggestions?: AISuggestion[];
  suggestion_responses?: Record<string, Record<string, string>>;
  created_at: string;
  expires_at: string;
}

/**
 * Generate a hash from financial data snapshot
 * Used as part of cache key to detect data changes
 */
export function hashFinancialData(data: FinancialDataSnapshot): string {
  const dataString = JSON.stringify({
    netWorth: Math.round(data.netWorth * 100) / 100,
    assetsTotal: Math.round(data.assetsTotal * 100) / 100,
    liabilitiesTotal: Math.round(data.liabilitiesTotal * 100) / 100,
    cashTotal: Math.round(data.cashTotal * 100) / 100,
    investmentsTotal: Math.round(data.investmentsTotal * 100) / 100,
  });
  
  // Simple hash function (for demo purposes)
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached suggestions (for initial chat dialog load)
 */
export async function getCachedSuggestions(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null,
  viewMode: 'net-worth' | 'assets' | 'liabilities',
  financialData: FinancialDataSnapshot
): Promise<{ summary: string; suggestions: AISuggestion[] } | null> {
  const cached = await getCachedSummary(supabase, userId, demoProfileId, viewMode, financialData);
  
  if (cached && cached.suggestions && Array.isArray(cached.suggestions) && cached.suggestions.length > 0) {
    return {
      summary: cached.summary_text,
      suggestions: cached.suggestions,
    };
  }
  
  return null;
}

/**
 * Get cached suggestion response (approve/deny/know_more)
 */
export async function getCachedSuggestionResponse(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null,
  viewMode: 'net-worth' | 'assets' | 'liabilities',
  financialData: FinancialDataSnapshot,
  suggestionId: string,
  actionType: 'approved' | 'denied' | 'know_more'
): Promise<string | null> {
  const cached = await getCachedSummary(supabase, userId, demoProfileId, viewMode, financialData);
  
  if (cached?.suggestion_responses && typeof cached.suggestion_responses === 'object') {
    const responses = cached.suggestion_responses as Record<string, Record<string, string>>;
    if (responses[suggestionId] && responses[suggestionId][actionType]) {
      return responses[suggestionId][actionType];
    }
  }
  
  return null;
}

/**
 * Cache a suggestion response (approve/deny/know_more)
 */
export async function setCachedSuggestionResponse(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null,
  viewMode: 'net-worth' | 'assets' | 'liabilities',
  financialData: FinancialDataSnapshot,
  suggestionId: string,
  actionType: 'approved' | 'denied' | 'know_more',
  responseText: string
): Promise<boolean> {
  const dataHash = hashFinancialData(financialData);
  
  // Get existing cache entry
  let query = supabase
    .from('summary_cache')
    .select('suggestion_responses')
    .eq('view_mode', viewMode)
    .eq('data_hash', dataHash)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (userId) {
    query = query.eq('user_id', userId).is('demo_profile_id', null);
  } else if (demoProfileId) {
    query = query.eq('demo_profile_id', demoProfileId).is('user_id', null);
  } else {
    return false;
  }
  
  const { data: existing, error: fetchError } = await query.maybeSingle();
  
  if (fetchError) {
    console.error('[cache] Error fetching cache entry for suggestion response:', fetchError);
    return false;
  }
  
  if (!existing) {
    // No cache entry exists - can't cache suggestion response without summary
    return false;
  }
  
  // Update suggestion_responses JSONB
  const currentResponses = (existing.suggestion_responses as Record<string, Record<string, string>>) || {};
  if (!currentResponses[suggestionId]) {
    currentResponses[suggestionId] = {};
  }
  currentResponses[suggestionId][actionType] = responseText;
  
  // Update cache entry
  let updateQuery = supabase
    .from('summary_cache')
    .update({ suggestion_responses: currentResponses })
    .eq('view_mode', viewMode)
    .eq('data_hash', dataHash);
  
  if (userId) {
    updateQuery = updateQuery.eq('user_id', userId).is('demo_profile_id', null);
  } else {
    updateQuery = updateQuery.eq('demo_profile_id', demoProfileId).is('user_id', null);
  }
  
  const { error: updateError } = await updateQuery;
  
  if (updateError) {
    console.error('[cache] Error caching suggestion response:', updateError);
    return false;
  }
  
  return true;
}

/**
 * Get cached summary if available and not expired
 */
export async function getCachedSummary(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null,
  viewMode: 'net-worth' | 'assets' | 'liabilities',
  financialData: FinancialDataSnapshot
): Promise<CachedSummary | null> {
  const dataHash = hashFinancialData(financialData);
  
  // Build query based on auth vs demo mode
  let query = supabase
    .from('summary_cache')
    .select('summary_text, financial_data, suggestions, suggestion_responses, created_at, expires_at')
    .eq('view_mode', viewMode)
    .eq('data_hash', dataHash)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (userId) {
    query = query.eq('user_id', userId).is('demo_profile_id', null);
  } else if (demoProfileId) {
    query = query.eq('demo_profile_id', demoProfileId).is('user_id', null);
  } else {
    return null; // No user or demo profile
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[cache] Error fetching cached summary:', {
      error: error.message,
      code: error.code,
      details: error.details,
      viewMode,
      has_user_id: !!userId,
      has_demo_profile_id: !!demoProfileId,
      data_hash: dataHash,
    });
    return null;
  }

  if (data) {
    console.log('[cache] Cache hit', {
      view_mode: viewMode,
      has_user_id: !!userId,
      has_demo_profile_id: !!demoProfileId,
      cached_at: data.created_at,
      expires_at: data.expires_at,
    });
  } else {
    console.log('[cache] Cache miss', {
      view_mode: viewMode,
      has_user_id: !!userId,
      has_demo_profile_id: !!demoProfileId,
      data_hash: dataHash,
    });
  }

  return data;
}

/**
 * Get cached summary even if expired (for fallback when AI fails)
 */
export async function getCachedSummaryExpired(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null,
  viewMode: 'net-worth' | 'assets' | 'liabilities',
  financialData: FinancialDataSnapshot
): Promise<CachedSummary | null> {
  const dataHash = hashFinancialData(financialData);
  
  // Build query based on auth vs demo mode (without expiration check)
  let query = supabase
    .from('summary_cache')
    .select('summary_text, financial_data, suggestions, suggestion_responses, created_at, expires_at')
    .eq('view_mode', viewMode)
    .eq('data_hash', dataHash)
    .order('created_at', { ascending: false })
    .limit(1);

  if (userId) {
    query = query.eq('user_id', userId).is('demo_profile_id', null);
  } else if (demoProfileId) {
    query = query.eq('demo_profile_id', demoProfileId).is('user_id', null);
  } else {
    return null; // No user or demo profile
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[cache] Error fetching expired cached summary:', {
      error: error.message,
      code: error.code,
      viewMode,
    });
    return null;
  }

  if (data) {
    console.log('[cache] Found expired cache as fallback', {
      view_mode: viewMode,
      cached_at: data.created_at,
      expires_at: data.expires_at,
      is_expired: new Date(data.expires_at) < new Date(),
    });
  }

  return data;
}

/**
 * Store summary in cache (with optional suggestions)
 */
export async function setCachedSummary(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null,
  viewMode: 'net-worth' | 'assets' | 'liabilities',
  financialData: FinancialDataSnapshot,
  summaryText: string,
  ttlHours: number = 24,
  suggestions?: AISuggestion[]
): Promise<boolean> {
  const dataHash = hashFinancialData(financialData);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  const cacheEntry: any = {
    view_mode: viewMode,
    data_hash: dataHash,
    summary_text: summaryText,
    financial_data: financialData,
    expires_at: expiresAt.toISOString(),
  };
  
  // Add suggestions if provided
  if (suggestions && suggestions.length > 0) {
    cacheEntry.suggestions = suggestions;
  }

  if (userId) {
    cacheEntry.user_id = userId;
  } else if (demoProfileId) {
    cacheEntry.demo_profile_id = demoProfileId;
  } else {
    return false; // No user or demo profile
  }

  // Check if cache entry exists first (upsert doesn't work with partial unique indexes)
  let query = supabase
    .from('summary_cache')
    .select('id')
    .eq('view_mode', viewMode)
    .eq('data_hash', dataHash);
  
  if (userId) {
    query = query.eq('user_id', userId).is('demo_profile_id', null);
  } else {
    query = query.eq('demo_profile_id', demoProfileId).is('user_id', null);
  }
  
  const { data: existing, error: fetchError } = await query.maybeSingle();
  
  if (fetchError) {
    console.error('[cache] Error checking for existing cache:', fetchError);
    return false;
  }
  
  if (existing) {
    // Update existing entry
    let updateQuery = supabase
      .from('summary_cache')
      .update(cacheEntry)
      .eq('id', existing.id);
    
    const { error: updateError } = await updateQuery;
    
    if (updateError) {
      console.error('[cache] Error updating cached summary:', {
        error: updateError.message,
        code: updateError.code,
        cacheEntry: {
          view_mode: cacheEntry.view_mode,
          has_user_id: !!cacheEntry.user_id,
          has_demo_profile_id: !!cacheEntry.demo_profile_id,
          data_hash: cacheEntry.data_hash,
        },
      });
      return false;
    }
  } else {
    // Insert new entry
    const { error: insertError } = await supabase
      .from('summary_cache')
      .insert(cacheEntry);
    
    if (insertError) {
      console.error('[cache] Error inserting cached summary:', {
        error: insertError.message,
        code: insertError.code,
        cacheEntry: {
          view_mode: cacheEntry.view_mode,
          has_user_id: !!cacheEntry.user_id,
          has_demo_profile_id: !!cacheEntry.demo_profile_id,
          data_hash: cacheEntry.data_hash,
        },
      });
      return false;
    }
  }

  console.log('[cache] Summary cached successfully', {
    view_mode: cacheEntry.view_mode,
    has_user_id: !!cacheEntry.user_id,
    has_demo_profile_id: !!cacheEntry.demo_profile_id,
    expires_at: cacheEntry.expires_at,
  });

  return true;
}

/**
 * Invalidate cache for a user/demo profile
 * Called when financial data changes
 */
export async function invalidateCache(
  supabase: any,
  userId: string | null,
  demoProfileId: string | null
): Promise<void> {
  const query = supabase
    .from('summary_cache')
    .delete();

  if (userId) {
    await query.eq('user_id', userId).is('demo_profile_id', null);
  } else if (demoProfileId) {
    await query.eq('demo_profile_id', demoProfileId).is('user_id', null);
  }
}

