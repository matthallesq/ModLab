-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create business_models table
CREATE TABLE IF NOT EXISTS public.business_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  canvas_data JSONB DEFAULT '{}'::jsonb
);

-- Create experiments table
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  test_description TEXT,
  success_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'backlog',
  results TEXT,
  business_model_id UUID REFERENCES public.business_models(id) ON DELETE SET NULL
);

-- Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  hypothesis TEXT,
  observation TEXT,
  insight TEXT NOT NULL,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL
);

-- Enable row-level security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for business_models
DROP POLICY IF EXISTS "Users can view their own business models" ON public.business_models;
CREATE POLICY "Users can view their own business models"
  ON public.business_models FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = business_models.project_id));

DROP POLICY IF EXISTS "Users can insert their own business models" ON public.business_models;
CREATE POLICY "Users can insert their own business models"
  ON public.business_models FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = business_models.project_id));

DROP POLICY IF EXISTS "Users can update their own business models" ON public.business_models;
CREATE POLICY "Users can update their own business models"
  ON public.business_models FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = business_models.project_id));

DROP POLICY IF EXISTS "Users can delete their own business models" ON public.business_models;
CREATE POLICY "Users can delete their own business models"
  ON public.business_models FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = business_models.project_id));

-- Create policies for experiments
DROP POLICY IF EXISTS "Users can view their own experiments" ON public.experiments;
CREATE POLICY "Users can view their own experiments"
  ON public.experiments FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = experiments.project_id));

DROP POLICY IF EXISTS "Users can insert their own experiments" ON public.experiments;
CREATE POLICY "Users can insert their own experiments"
  ON public.experiments FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = experiments.project_id));

DROP POLICY IF EXISTS "Users can update their own experiments" ON public.experiments;
CREATE POLICY "Users can update their own experiments"
  ON public.experiments FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = experiments.project_id));

DROP POLICY IF EXISTS "Users can delete their own experiments" ON public.experiments;
CREATE POLICY "Users can delete their own experiments"
  ON public.experiments FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = experiments.project_id));

-- Create policies for insights
DROP POLICY IF EXISTS "Users can view their own insights" ON public.insights;
CREATE POLICY "Users can view their own insights"
  ON public.insights FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = insights.project_id));

DROP POLICY IF EXISTS "Users can insert their own insights" ON public.insights;
CREATE POLICY "Users can insert their own insights"
  ON public.insights FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = insights.project_id));

DROP POLICY IF EXISTS "Users can update their own insights" ON public.insights;
CREATE POLICY "Users can update their own insights"
  ON public.insights FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = insights.project_id));

DROP POLICY IF EXISTS "Users can delete their own insights" ON public.insights;
CREATE POLICY "Users can delete their own insights"
  ON public.insights FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM public.projects WHERE id = insights.project_id));

-- Insert sample data only after users table is created and sample user exists
-- These inserts depend on the user with ID '00000000-0000-0000-0000-000000000001' existing
INSERT INTO public.projects (id, name, description, user_id, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Sample Project 1', 'A demonstration project', '00000000-0000-0000-0000-000000000001', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_models (id, name, description, project_id, canvas_data)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Initial Business Model', 'First draft of our business model', '00000000-0000-0000-0000-000000000001', '{"customerSegments": ["Small Businesses", "Startups"], "valuePropositions": ["Time Saving", "Cost Reduction"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.experiments (id, name, hypothesis, test_description, success_criteria, project_id, status, business_model_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Pricing Test', 'Higher pricing will increase perceived value without reducing conversion', 'A/B test with two pricing tiers', '10% increase in revenue with less than 5% drop in conversion', '00000000-0000-0000-0000-000000000001', 'backlog', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.insights (id, title, hypothesis, observation, insight, next_steps, project_id, experiment_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Pricing Strategy Insight', 'Higher pricing increases perceived value', 'Customers spent more time evaluating the higher-priced option', 'Price anchoring significantly affects purchase decisions', 'Test with three-tier pricing model', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.business_models;
alter publication supabase_realtime add table public.experiments;
alter publication supabase_realtime add table public.insights;