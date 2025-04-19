-- Create projects table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Now run the subscription tables migration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('startup', 'professional', 'unlimited')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_limits table to store tier-specific limits
CREATE TABLE IF NOT EXISTS subscription_limits (
  tier TEXT PRIMARY KEY CHECK (tier IN ('startup', 'professional', 'unlimited')),
  max_projects INTEGER NOT NULL,
  max_experiments_per_project INTEGER NOT NULL,
  team_members_allowed BOOLEAN NOT NULL,
  advanced_analytics BOOLEAN NOT NULL,
  priority_support BOOLEAN NOT NULL
);

-- Insert default subscription limits
INSERT INTO subscription_limits (tier, max_projects, max_experiments_per_project, team_members_allowed, advanced_analytics, priority_support)
VALUES 
  ('startup', 3, 10, false, false, false),
  ('professional', 10, 50, true, true, false),
  ('unlimited', 999999, 999999, true, true, true)
ON CONFLICT (tier) DO NOTHING;

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending')),
  payment_method TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view subscription limits" ON subscription_limits;
CREATE POLICY "Users can view subscription limits"
  ON subscription_limits FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;
CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
