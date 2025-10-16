/*
  # Initial Database Schema for Calendar Extension Backend

  ## Overview
  This migration creates the complete database schema for a SaaS Calendar Extension with subscription management, license keys, and comprehensive tracking.

  ## New Tables
  
  ### 1. `profiles` - User Profiles
  - `id` (uuid, FK to auth.users) - User ID from Supabase auth
  - `email` (text) - User email
  - `name` (text) - User's full name
  - `license_key` (text, unique) - Unique license key for the extension
  - `is_admin` (boolean) - Admin flag
  - `trial_ends_at` (timestamptz) - Trial expiration date
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `subscriptions` - Paddle Subscriptions
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - User reference
  - `paddle_subscription_id` (text, unique) - Paddle subscription ID
  - `plan_id` (text) - Paddle plan/price ID
  - `status` (text) - Subscription status (active, paused, cancelled, etc.)
  - `next_bill_date` (timestamptz) - Next billing date
  - `cancel_url` (text) - Paddle cancellation URL
  - `update_url` (text) - Paddle update URL
  - `created_at` (timestamptz) - Subscription creation date
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `payment_attempts` - Payment History
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - User reference
  - `subscription_id` (uuid, FK to subscriptions) - Subscription reference
  - `paddle_payment_id` (text) - Paddle payment ID
  - `amount` (numeric) - Payment amount
  - `currency` (text) - Payment currency
  - `status` (text) - Payment status (success, failed, pending)
  - `created_at` (timestamptz) - Payment attempt timestamp

  ### 4. `webhook_events` - Webhook Event Log
  - `id` (uuid) - Primary key
  - `event_type` (text) - Webhook event type
  - `payload` (jsonb) - Complete webhook payload
  - `processed` (boolean) - Processing status
  - `processed_at` (timestamptz) - Processing timestamp
  - `created_at` (timestamptz) - Event receipt timestamp

  ### 5. `admin_actions` - Admin Audit Log
  - `id` (uuid) - Primary key
  - `admin_id` (uuid, FK to profiles) - Admin user ID
  - `action_type` (text) - Action type (update_user, grant_license, etc.)
  - `target_user_id` (uuid, FK to profiles) - Target user ID
  - `description` (text) - Action description
  - `metadata` (jsonb) - Additional action metadata
  - `created_at` (timestamptz) - Action timestamp

  ### 6. `onboarding_progress` - User Onboarding Tracking
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - User reference
  - `step_completed` (text) - Onboarding step name
  - `pain_point_selected` (text) - User's selected pain point
  - `features_used` (jsonb) - Array of features viewed/used
  - `completed_at` (timestamptz) - Step completion timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### 7. `feature_usage` - Feature Usage Analytics
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - User reference
  - `feature_name` (text) - Feature identifier
  - `action_type` (text) - Action taken (viewed, clicked, used)
  - `metadata` (jsonb) - Additional usage metadata
  - `created_at` (timestamptz) - Usage timestamp

  ### 8. `paywall_interactions` - Paywall Analytics
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - User reference
  - `interaction_type` (text) - Interaction type (viewed, dismissed, clicked_upgrade)
  - `plan_selected` (text) - Selected plan (if any)
  - `metadata` (jsonb) - Additional interaction metadata
  - `created_at` (timestamptz) - Interaction timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Admin-only policies for admin operations
  - Service role required for webhook processing

  ## Indexes
  - Foreign key indexes for performance
  - Unique indexes on license keys and Paddle IDs
  - Timestamps for sorting and filtering
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  license_key text UNIQUE,
  is_admin boolean DEFAULT false,
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_license_key_idx ON profiles(license_key);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  paddle_subscription_id text UNIQUE,
  plan_id text,
  status text DEFAULT 'inactive',
  next_bill_date timestamptz,
  cancel_url text,
  update_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_paddle_id_idx ON subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- PAYMENT ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  paddle_payment_id text,
  amount numeric(10, 2),
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS payment_attempts_user_id_idx ON payment_attempts(user_id);
CREATE INDEX IF NOT EXISTS payment_attempts_subscription_id_idx ON payment_attempts(subscription_id);
CREATE INDEX IF NOT EXISTS payment_attempts_status_idx ON payment_attempts(status);

-- Enable RLS
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_attempts
CREATE POLICY "Users can view own payment attempts"
  ON payment_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment attempts"
  ON payment_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment attempts"
  ON payment_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- WEBHOOK EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS webhook_events_event_type_idx ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS webhook_events_processed_idx ON webhook_events(processed);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_events (admin-only)
CREATE POLICY "Admins can view all webhook events"
  ON webhook_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- ADMIN ACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS admin_actions_admin_id_idx ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS admin_actions_target_user_id_idx ON admin_actions(target_user_id);

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_actions (admin-only)
CREATE POLICY "Admins can view all admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = admin_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- ONBOARDING PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_completed text NOT NULL,
  pain_point_selected text,
  features_used jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS onboarding_progress_user_id_idx ON onboarding_progress(user_id);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view own onboarding progress"
  ON onboarding_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
  ON onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding progress"
  ON onboarding_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- FEATURE USAGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  action_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS feature_usage_user_id_idx ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS feature_usage_feature_name_idx ON feature_usage(feature_name);

-- Enable RLS
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_usage
CREATE POLICY "Users can view own feature usage"
  ON feature_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage"
  ON feature_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feature usage"
  ON feature_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- PAYWALL INTERACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS paywall_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  plan_selected text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS paywall_interactions_user_id_idx ON paywall_interactions(user_id);
CREATE INDEX IF NOT EXISTS paywall_interactions_type_idx ON paywall_interactions(interaction_type);

-- Enable RLS
ALTER TABLE paywall_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paywall_interactions
CREATE POLICY "Users can view own paywall interactions"
  ON paywall_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paywall interactions"
  ON paywall_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all paywall interactions"
  ON paywall_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
