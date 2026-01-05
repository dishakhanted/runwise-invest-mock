-- Create summary_cache table for storing pre-computed AI summaries
-- This enables instant dashboard loading with cached summaries
CREATE TABLE IF NOT EXISTS public.summary_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  demo_profile_id TEXT, -- For demo mode (e.g., 'young-professional')
  -- cache_key removed - using indexes instead
  view_mode TEXT NOT NULL CHECK (view_mode IN ('net-worth', 'assets', 'liabilities')),
  summary_text TEXT NOT NULL,
  data_hash TEXT NOT NULL, -- Hash of financial data snapshot
  financial_data JSONB NOT NULL, -- Snapshot of financial data used for summary
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- TTL for cache invalidation
  CONSTRAINT summary_cache_user_or_demo CHECK (
    (user_id IS NOT NULL AND demo_profile_id IS NULL) OR
    (user_id IS NULL AND demo_profile_id IS NOT NULL)
  )
);

-- Create unique index on cache key
-- For authenticated users: (user_id, view_mode, data_hash)
-- For demo profiles: (demo_profile_id, view_mode, data_hash)
-- Using partial indexes to handle both cases
CREATE UNIQUE INDEX IF NOT EXISTS idx_summary_cache_user_key 
  ON public.summary_cache (user_id, view_mode, data_hash)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_summary_cache_demo_key 
  ON public.summary_cache (demo_profile_id, view_mode, data_hash)
  WHERE demo_profile_id IS NOT NULL;

-- Create index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_summary_cache_expires_at 
  ON public.summary_cache (expires_at);

-- Enable Row Level Security
ALTER TABLE public.summary_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can view their own cached summaries"
  ON public.summary_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cached summaries"
  ON public.summary_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cached summaries"
  ON public.summary_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cached summaries"
  ON public.summary_cache
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: Demo mode summaries are accessible without auth (handled in edge function)

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.summary_cache
  WHERE expires_at < now();
END;
$$;

