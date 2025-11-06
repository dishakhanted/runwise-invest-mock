-- Enable realtime for goals table
ALTER TABLE public.goals REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;