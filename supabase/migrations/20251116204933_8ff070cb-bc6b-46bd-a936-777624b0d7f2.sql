-- Add risk_inferred column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS risk_inferred text;

-- Add comment to clarify the goals column usage
COMMENT ON COLUMN public.profiles.goals IS 'Stores references to goal IDs from the goals table';