-- Add suggestion_responses column to summary_cache table
-- This enables caching of approve/deny/know_more responses for suggestions
-- Format: JSONB object keyed by suggestion_id -> action_type -> response_text

ALTER TABLE public.summary_cache
  ADD COLUMN IF NOT EXISTS suggestion_responses JSONB;

-- Add index for faster queries when checking for cached responses
CREATE INDEX IF NOT EXISTS idx_summary_cache_suggestion_responses 
  ON public.summary_cache (view_mode, data_hash)
  WHERE suggestion_responses IS NOT NULL;

