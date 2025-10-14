# Onboarding System - Setup Guide

## Quick Setup (3 Steps)

### 1. Run Database Migration

Open your Supabase SQL Editor and execute:

```sql
-- Copy and paste the contents of this file:
supabase/migrations/add_onboarding_tables.sql
```

This creates:
- `onboarding_progress` table
- `feature_usage` table
- `paywall_interactions` table
- Adds `onboarding_completed` and `pain_point` columns to `profiles`

### 2. Start Your Dev Server

```bash
npm run dev
```

### 3. Test the Flow

Navigate to: `http://localhost:3000/onboarding`

## What's Included

### Pages Created

1. **`/onboarding`** - Welcome screen
2. **`/onboarding/personalize`** - Pain point selection
3. **`/onboarding/demo`** - Interactive feature demos
4. **`/onboarding/complete`** - Success screen
5. **`/paywall`** - Premium upgrade page

### API Endpoints

- **POST `/api/onboarding/progress`** - Save onboarding progress
- **POST `/api/onboarding/complete`** - Mark onboarding complete
- **GET `/api/user/stats`** - Get user statistics

### Database Tables

**onboarding_progress**
- Tracks which steps user completed
- Stores pain point selection
- Records features viewed

**feature_usage**
- Tracks feature interactions
- Used for analytics
- Helps personalize experience

**paywall_interactions**
- Tracks paywall views
- Records plan selections
- Helps optimize conversion

## User Journey

```
Sign Up → /onboarding (Welcome)
              ↓
    Select Pain Point
              ↓
    View Feature Demos (3 features)
              ↓
    Success! → /dashboard
              ↓
    (When ready to upgrade)
              ↓
    /paywall → /pricing
```

## Onboarding Flow Details

### Step 1: Welcome (`/onboarding`)
- Shows product benefits
- Clear value proposition
- CTA to start

### Step 2: Personalize (`/onboarding/personalize`)
- User selects their main challenge:
  1. Calendar looks overwhelming
  2. I miss important tasks
  3. Can't find focus time
  4. Everything looks the same
- Saves to database for personalization

### Step 3: Demo (`/onboarding/demo`)
- Shows 3 features interactively:
  1. Day Coloring
  2. Task Coloring
  3. Time Blocking
- Visual examples with animations
- Progress dots show completion

### Step 4: Complete (`/onboarding/complete`)
- Celebrates success
- Shows next steps
- Links to dashboard and Google Calendar

### Step 5: Paywall (`/paywall`)
- Show when user needs premium
- Two pricing plans:
  - Monthly: $4.99/month
  - Yearly: $39.99/year (save 33%)
- Benefits breakdown
- Social proof with testimonials

## Customization

### Change Pain Points

Edit: `app/onboarding/personalize/page.js`

```javascript
const painPoints = [
  {
    id: 'your-id',
    title: 'Your Pain Point',
    description: 'Description',
    icon: <YourIcon />
  }
]
```

### Update Pricing

Edit: `app/paywall/page.js`

Search for `$4.99` and `$39.99` and update values.

### Modify Features in Demo

Edit: `app/onboarding/demo/page.js`

```javascript
const features = [
  {
    id: 'featureId',
    title: 'Feature Name',
    subtitle: 'Short tagline',
    description: 'Longer description',
    benefit: '⚡ Main benefit',
    icon: <YourIcon />
  }
]
```

## Tracking Feature Usage

From your Chrome extension, track when users use features:

```javascript
// Example: When user colors a day
await fetch('https://your-backend.com/api/tracking/feature', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    feature: 'dayColoring',
    action: 'applied'
  })
})
```

This data appears in the stats API and can be shown on the paywall.

## Important Notes

### No Trial Management
- This onboarding does NOT manage trials
- No trial start/end dates
- No automatic trial expiration
- You handle subscription logic separately

### What's Tracked
- Onboarding progress (which steps completed)
- Pain point selection
- Features viewed during demo
- Feature usage (when you send tracking data)
- Paywall interactions

### What's NOT Included
- Trial management
- Subscription checks
- Payment processing (connect your Paddle separately)
- Email automation (add if needed)

## Database Schema

### Tables

```sql
-- Onboarding progress
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  step_completed VARCHAR(50),
  pain_point_selected VARCHAR(100),
  features_used JSONB,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Feature usage tracking
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  feature_name VARCHAR(50),
  action_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP
);

-- Paywall interactions
CREATE TABLE paywall_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  interaction_type VARCHAR(50),
  plan_selected VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP
);

-- New profile columns
ALTER TABLE profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN pain_point VARCHAR(100);
```

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only see/insert their own data
- Admin access requires service role key

## Testing

### Test Onboarding
1. Create test account or login
2. Go to `/onboarding`
3. Complete all steps
4. Check database for saved progress

### Test Paywall
1. Navigate to `/paywall`
2. Select a plan
3. Click upgrade (should go to `/pricing`)

### Verify Database
```sql
-- Check onboarding progress
SELECT * FROM onboarding_progress WHERE user_id = 'your-user-id';

-- Check if onboarding marked complete
SELECT onboarding_completed, pain_point FROM profiles WHERE id = 'your-user-id';
```

## Files Created

```
app/
├── onboarding/
│   ├── page.js
│   ├── personalize/page.js
│   ├── demo/page.js
│   └── complete/page.js
├── paywall/page.js
└── api/
    ├── onboarding/
    │   ├── progress/route.js
    │   └── complete/route.js
    └── user/stats/route.js

supabase/
└── migrations/
    └── add_onboarding_tables.sql

lib/
└── supabase.js (updated with helper functions)
```

## Next Steps

1. ✅ Run database migration
2. ⬜ Test complete onboarding flow
3. ⬜ Customize copy and branding
4. ⬜ Add feature tracking from Chrome extension
5. ⬜ Connect paywall to your Paddle integration
6. ⬜ Add redirect to onboarding after signup (optional)

## Support

Check for errors in:
- Browser console
- Supabase logs
- Network tab (API calls)

All API endpoints return JSON with error details if something fails.

---

**Ready to use!** Start at `/onboarding` and complete the flow.
