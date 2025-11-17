-- Create goal_recommendations table
CREATE TABLE public.goal_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  suggestion_title TEXT NOT NULL,
  suggestion_note TEXT,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'denied', 'know_more')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goal recommendations"
ON public.goal_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal recommendations"
ON public.goal_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal recommendations"
ON public.goal_recommendations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal recommendations"
ON public.goal_recommendations
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_goal_recommendations_user_id ON public.goal_recommendations(user_id);
CREATE INDEX idx_goal_recommendations_goal_id ON public.goal_recommendations(goal_id);