-- Update conversations.context_type check constraint to include Explore contexts
BEGIN;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_context_type_check;
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_context_type_check
  CHECK (context_type IN (
    'dashboard',
    'goal',
    'general',
    'onboarding',
    'net_worth',
    'assets',
    'liabilities',
    'explore',
    'market-insights',
    'finshorts',
    'what-if',
    'alternate-investments',
    'tax-loss-harvesting'
  ));
COMMIT;