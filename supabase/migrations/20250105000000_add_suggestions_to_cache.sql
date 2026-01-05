-- Add suggestions column to summary_cache table
-- This enables caching of initial suggestions for instant chat dialog loading

ALTER TABLE public.summary_cache
  ADD COLUMN IF NOT EXISTS suggestions JSONB;

-- Add index for faster queries when checking for suggestions
CREATE INDEX IF NOT EXISTS idx_summary_cache_suggestions 
  ON public.summary_cache (view_mode, data_hash)
  WHERE suggestions IS NOT NULL;

