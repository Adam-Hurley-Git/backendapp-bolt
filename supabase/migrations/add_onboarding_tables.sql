-- Add onboarding tracking table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  step_completed VARCHAR(50),
  pain_point_selected VARCHAR(100),
  features_used JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add feature usage tracking table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name VARCHAR(50),
  action_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add paywall interaction tracking table
CREATE TABLE IF NOT EXISTS paywall_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50), -- 'viewed', 'dismissed', 'upgraded', 'downgraded'
  plan_selected VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to profiles table for onboarding
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pain_point VARCHAR(100);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON feature_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_paywall_interactions_user_id ON paywall_interactions(user_id);

-- Enable Row Level Security
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE paywall_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view their own onboarding progress"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for feature_usage
CREATE POLICY "Users can view their own feature usage"
  ON feature_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature usage"
  ON feature_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for paywall_interactions
CREATE POLICY "Users can view their own paywall interactions"
  ON paywall_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own paywall interactions"
  ON paywall_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comment on tables for documentation
COMMENT ON TABLE onboarding_progress IS 'Tracks user progress through the onboarding flow';
COMMENT ON TABLE feature_usage IS 'Tracks feature usage for analytics and personalization';
COMMENT ON TABLE paywall_interactions IS 'Tracks when users interact with paywalls for conversion analysis';
