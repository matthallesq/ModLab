-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_projects INTEGER NOT NULL,
  max_experiments_per_project INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method_id TEXT,
  customer_id TEXT
);

-- Create subscription_invoices table
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'no_payment_required')),
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, price, max_projects, max_experiments_per_project, features)
VALUES 
  ('Startup', 29.00, 3, 10, '{"basic_canvas": true, "basic_insights": true, "team_collaboration": false, "priority_support": false}'::jsonb),
  ('Professional', 79.00, 10, 50, '{"advanced_canvas": true, "advanced_insights": true, "team_collaboration": true, "priority_support": false}'::jsonb),
  ('Unlimited', 199.00, 999999, 999999, '{"all_canvas": true, "comprehensive_insights": true, "advanced_team_collaboration": true, "priority_support": true}'::jsonb);

-- Add subscription_tier_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subscription_tier_id UUID REFERENCES subscription_tiers(id);

-- Enable realtime for subscription tables
alter publication supabase_realtime add table subscription_tiers;
alter publication supabase_realtime add table user_subscriptions;
alter publication supabase_realtime add table subscription_invoices;
