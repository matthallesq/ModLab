-- Create users table that matches auth.users structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  billing_address JSONB,
  payment_method JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  token_identifier TEXT NOT NULL DEFAULT 'default_token',
  email TEXT,
  subscription_tier TEXT DEFAULT 'Startup',
  subscription_status TEXT DEFAULT 'active'
);

-- Enable row-level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own user data" ON public.users;
CREATE POLICY "Users can view their own user data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own user data" ON public.users;
CREATE POLICY "Users can update their own user data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Insert sample user
-- Note: This assumes the auth.users table already has this ID or will be created
-- If using in development, you may need to manually create this auth user first
INSERT INTO public.users (id, full_name, email, token_identifier, subscription_tier, subscription_status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com', 'test_token', 'Professional', 'active')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime
alter publication supabase_realtime add table public.users;