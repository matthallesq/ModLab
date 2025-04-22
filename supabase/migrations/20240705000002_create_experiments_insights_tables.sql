-- Create experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  hypothesis TEXT,
  test_description TEXT,
  success_criteria TEXT,
  results TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Create experiment_team_members table (for experiment assignees)
CREATE TABLE IF NOT EXISTS experiment_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT,
  hypothesis TEXT,
  observation TEXT,
  insight_text TEXT NOT NULL,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL
);

-- Create insight_team_members table (for insight assignees)
CREATE TABLE IF NOT EXISTS insight_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timeline_events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entity_id UUID,
  entity_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Experiments policies
DROP POLICY IF EXISTS "Users can view their own experiments" ON experiments;
CREATE POLICY "Users can view their own experiments"
  ON experiments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = experiments.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own experiments" ON experiments;
CREATE POLICY "Users can insert their own experiments"
  ON experiments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = experiments.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own experiments" ON experiments;
CREATE POLICY "Users can update their own experiments"
  ON experiments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = experiments.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own experiments" ON experiments;
CREATE POLICY "Users can delete their own experiments"
  ON experiments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = experiments.project_id
    AND projects.user_id = auth.uid()
  ));

-- Experiment team members policies
DROP POLICY IF EXISTS "Project owners can view experiment team members" ON experiment_team_members;
CREATE POLICY "Project owners can view experiment team members"
  ON experiment_team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiments
    JOIN projects ON projects.id = experiments.project_id
    WHERE experiments.id = experiment_team_members.experiment_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Project owners can insert experiment team members" ON experiment_team_members;
CREATE POLICY "Project owners can insert experiment team members"
  ON experiment_team_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiments
    JOIN projects ON projects.id = experiments.project_id
    WHERE experiments.id = experiment_team_members.experiment_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Project owners can delete experiment team members" ON experiment_team_members;
CREATE POLICY "Project owners can delete experiment team members"
  ON experiment_team_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM experiments
    JOIN projects ON projects.id = experiments.project_id
    WHERE experiments.id = experiment_team_members.experiment_id
    AND projects.user_id = auth.uid()
  ));

-- Insights policies
DROP POLICY IF EXISTS "Users can view their own insights" ON insights;
CREATE POLICY "Users can view their own insights"
  ON insights FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = insights.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own insights" ON insights;
CREATE POLICY "Users can insert their own insights"
  ON insights FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = insights.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own insights" ON insights;
CREATE POLICY "Users can update their own insights"
  ON insights FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = insights.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own insights" ON insights;
CREATE POLICY "Users can delete their own insights"
  ON insights FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = insights.project_id
    AND projects.user_id = auth.uid()
  ));

-- Insight team members policies
DROP POLICY IF EXISTS "Project owners can view insight team members" ON insight_team_members;
CREATE POLICY "Project owners can view insight team members"
  ON insight_team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM insights
    JOIN projects ON projects.id = insights.project_id
    WHERE insights.id = insight_team_members.insight_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Project owners can insert insight team members" ON insight_team_members;
CREATE POLICY "Project owners can insert insight team members"
  ON insight_team_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM insights
    JOIN projects ON projects.id = insights.project_id
    WHERE insights.id = insight_team_members.insight_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Project owners can delete insight team members" ON insight_team_members;
CREATE POLICY "Project owners can delete insight team members"
  ON insight_team_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM insights
    JOIN projects ON projects.id = insights.project_id
    WHERE insights.id = insight_team_members.insight_id
    AND projects.user_id = auth.uid()
  ));

-- Timeline events policies
DROP POLICY IF EXISTS "Users can view their own timeline events" ON timeline_events;
CREATE POLICY "Users can view their own timeline events"
  ON timeline_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = timeline_events.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own timeline events" ON timeline_events;
CREATE POLICY "Users can insert their own timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = timeline_events.project_id
    AND projects.user_id = auth.uid()
  ));

-- Enable realtime
alter publication supabase_realtime add table experiments;
alter publication supabase_realtime add table experiment_team_members;
alter publication supabase_realtime add table insights;
alter publication supabase_realtime add table insight_team_members;
alter publication supabase_realtime add table timeline_events;
