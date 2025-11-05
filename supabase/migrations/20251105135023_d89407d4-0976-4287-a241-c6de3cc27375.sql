-- Add description field to goals table for storing goal insights
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS description TEXT;