-- Sample data for experiments
-- This assumes the projects and experiments tables already exist

-- Insert sample experiment data
-- We're using the sample project created in the previous migration

-- First check if the projects table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    -- Only proceed if the projects table exists
    IF EXISTS (SELECT FROM public.projects WHERE id = '00000000-0000-0000-0000-000000000001') THEN
      -- Insert sample experiments for project 1
      INSERT INTO public.experiments (name, hypothesis, test_description, success_criteria, status, project_id)
      VALUES 
        ('Customer Segment Validation', 'We believe that small business owners are willing to pay for our automated accounting service.', 'To verify this we will conduct interviews with 20 small business owners and present our pricing model.', 'We are right if at least 60% express willingness to pay our proposed price.', 'backlog', '00000000-0000-0000-0000-000000000001'),
        
        ('Freemium Conversion Rate', 'We believe that offering a limited free tier will increase conversion to paid plans.', 'To verify this we will launch a freemium version and track user behavior.', 'We are right if the freemium path leads to at least 15% more paid customers over 3 months.', 'running', '00000000-0000-0000-0000-000000000001'),
        
        ('Mobile App Engagement', 'We believe that adding gamification elements will increase daily active usage.', 'To verify this we will add achievement badges and a point system to the mobile app.', 'We are right if daily active usage increases by at least 25% and average session length by 10%.', 'completed', '00000000-0000-0000-0000-000000000001'),
        
        ('Pricing Tier Structure', 'We believe that a three-tier pricing model will maximize revenue.', 'To verify this we will A/B test our current two-tier model against a new three-tier model.', 'We are right if the three-tier model generates at least 20% more revenue with no significant drop in conversion.', 'backlog', '00000000-0000-0000-0000-000000000001')
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
END $$;