-- Add target_age column to goals table
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS target_age integer;