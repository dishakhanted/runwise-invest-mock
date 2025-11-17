-- Update the check constraint on conversations table to allow new context types
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_context_type_check;

ALTER TABLE public.conversations ADD CONSTRAINT conversations_context_type_check 
CHECK (context_type IN ('onboarding', 'dashboard', 'net_worth', 'assets', 'liabilities', 'goal', 'what_if', 'explore', 'center_chat', 'decision', 'general'));