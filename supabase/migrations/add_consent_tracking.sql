-- Add consent tracking columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS terms_consent_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_consent_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_policy_consent_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_policy_consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS immediate_access_consent_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS immediate_access_consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recurring_payment_consent_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_payment_consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for consent tracking
CREATE INDEX IF NOT EXISTS idx_profiles_trial_started ON profiles(trial_started_at);
CREATE INDEX IF NOT EXISTS idx_profiles_recurring_consent ON profiles(recurring_payment_consent_accepted);

-- Comment on columns for documentation
COMMENT ON COLUMN profiles.terms_consent_accepted IS 'Whether user accepted Terms of Service';
COMMENT ON COLUMN profiles.terms_consent_timestamp IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN profiles.privacy_consent_accepted IS 'Whether user accepted Privacy Policy';
COMMENT ON COLUMN profiles.privacy_consent_timestamp IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN profiles.refund_policy_consent_accepted IS 'Whether user accepted Refund Policy';
COMMENT ON COLUMN profiles.refund_policy_consent_timestamp IS 'Timestamp when user accepted Refund Policy';
COMMENT ON COLUMN profiles.immediate_access_consent_accepted IS 'Whether user accepted immediate access terms';
COMMENT ON COLUMN profiles.immediate_access_consent_timestamp IS 'Timestamp when user accepted immediate access terms';
COMMENT ON COLUMN profiles.recurring_payment_consent_accepted IS 'Whether user accepted recurring payment subscription';
COMMENT ON COLUMN profiles.recurring_payment_consent_timestamp IS 'Timestamp when user accepted recurring payment subscription';
COMMENT ON COLUMN profiles.trial_started_at IS 'Timestamp when user started their free trial';
