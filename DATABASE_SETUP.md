# Database Setup Instructions

## Overview

Your application uses **Supabase** for the database. Bolt.new has built-in support for Supabase databases.

## Current Status

✅ Supabase credentials are already configured in the code
✅ Application works WITHOUT database (graceful fallbacks)
⚠️ Database tables need to be created for full functionality

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- PostgreSQL database
- Authentication
- Real-time subscriptions
- RESTful API
- Row Level Security (RLS)

**Yes, Bolt uses Supabase!** Your database instance is already provisioned at:
- URL: `https://mopgxvxiiuxhwmhwvkmb.supabase.co`

## Database Tables Needed

Your application requires these tables:

### 1. profiles
Stores user profile information
- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text)
- `avatar_url` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. subscriptions
Tracks user subscriptions
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `status` (text)
- `plan` (text)
- `paddle_subscription_id` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 3. onboarding_progress
Tracks user onboarding steps
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `step_completed` (text)
- `pain_point_selected` (text, nullable)
- `features_used` (jsonb, nullable)
- `completed_at` (timestamptz)
- `created_at` (timestamptz)

### 4. feature_usage
Analytics for feature usage
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `feature_name` (text)
- `action_type` (text)
- `metadata` (jsonb, nullable)
- `created_at` (timestamptz)

### 5. paywall_interactions
Tracks paywall engagement
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `interaction_type` (text)
- `plan_selected` (text, nullable)
- `metadata` (jsonb, nullable)
- `created_at` (timestamptz)

## How to Set Up the Database

### Option 1: Use Bolt's MCP Tools (Recommended)

I can create the database tables for you using Bolt's built-in Supabase tools. Just ask me:

```
"Create the database tables for my application"
```

### Option 2: Manual Setup via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Find your project: `mopgxvxiiuxhwmhwvkmb`
3. Navigate to SQL Editor
4. Run the migration file located at:
   `/supabase/migrations/20251016190048_create_initial_schema.sql`

## Row Level Security (RLS)

All tables MUST have Row Level Security enabled with proper policies:

- **profiles**: Users can only read/update their own profile
- **subscriptions**: Users can only read their own subscriptions
- **onboarding_progress**: Users can only read/write their own progress
- **feature_usage**: Users can insert their own usage data
- **paywall_interactions**: Users can insert their own interactions

## Authentication Setup

Your Supabase instance should have:
- ✅ Email/Password authentication enabled
- ⚠️ Email confirmation disabled (for easier testing)
- ⚠️ Google OAuth configured (if you want social login)

## Current Application Behavior

**Without Database Tables:**
- ✅ Home page loads and displays correctly
- ✅ No crashes or errors
- ⚠️ Login/signup will fail gracefully
- ⚠️ Dashboard will show empty state
- ⚠️ Profile operations will be logged but not persisted

**With Database Tables:**
- ✅ Full authentication flow
- ✅ User profiles persist
- ✅ Subscription tracking works
- ✅ Analytics captured
- ✅ Onboarding progress saved

## Next Steps

1. **To create the tables**: Ask me to "Create the database tables"
2. **To test without DB**: The app already works! Just limited functionality
3. **For Paddle payments**: You'll need to configure Paddle separately (keep as-is for now)

## Environment Variables

The database credentials are hardcoded for simplicity:
- `SUPABASE_URL`: https://mopgxvxiiuxhwmhwvkmb.supabase.co
- `SUPABASE_ANON_KEY`: (already configured)

When you publish via Bolt, these credentials will work automatically.

## Troubleshooting

**Issue**: "Database not available" errors
**Solution**: This is normal without tables. The app handles it gracefully.

**Issue**: Login not working
**Solution**: Database tables need to be created first.

**Issue**: Blank pages
**Solution**: Already fixed! Pages now display regardless of database status.

## Ready to Set Up Database?

Just say: **"Create the database tables now"** and I'll set everything up for you!
