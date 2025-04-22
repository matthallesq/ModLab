-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  model_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  archived BOOLEAN DEFAULT FALSE
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_team_members table (for project assignees)
CREATE TABLE IF NOT EXISTS project_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to projects table
ALTER TABLE projects ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Teams policies
DROP POLICY IF EXISTS "Users can view their own teams" ON teams;
CREATE POLICY "Users can view their own teams"
  ON teams FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own teams" ON teams;
CREATE POLICY "Users can insert their own teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own teams" ON teams;
CREATE POLICY "Users can update their own teams"
  ON teams FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own teams" ON teams;
CREATE POLICY "Users can delete their own teams"
  ON teams FOR DELETE
  USING (auth.uid() = owner_id);

-- Team members policies
DROP POLICY IF EXISTS "Team owners can view team members" ON team_members;
CREATE POLICY "Team owners can view team members"
  ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Team owners can insert team members" ON team_members;
CREATE POLICY "Team owners can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Team owners can update team members" ON team_members;
CREATE POLICY "Team owners can update team members"
  ON team_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Team owners can delete team members" ON team_members;
CREATE POLICY "Team owners can delete team members"
  ON team_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  ));

-- Project team members policies
DROP POLICY IF EXISTS "Project owners can view project team members" ON project_team_members;
CREATE POLICY "Project owners can view project team members"
  ON project_team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_team_members.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Project owners can insert project team members" ON project_team_members;
CREATE POLICY "Project owners can insert project team members"
  ON project_team_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_team_members.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Project owners can delete project team members" ON project_team_members;
CREATE POLICY "Project owners can delete project team members"
  ON project_team_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_team_members.project_id
    AND projects.user_id = auth.uid()
  ));

-- Enable realtime
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table project_team_members;
