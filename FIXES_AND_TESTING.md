# Data Persistence Fixes - Onboarding & Consent Tracking

## Issues Fixed

### 1. **Onboarding Data Not Saving**
**Root Causes:**
- API routes were not checking for database errors
- Missing error responses made it appear successful even when failing
- `supabaseAdmin` was not properly exposed in the `db` helper

**Fixes Applied:**
- ✅ Exposed `supabaseAdmin` in `lib/supabase.js` for direct use in API routes
- ✅ Added proper error checking and error responses to `/api/onboarding/progress`
- ✅ Added proper error checking to `/api/onboarding/complete`
- ✅ Added `.select()` after inserts to verify data was saved
- ✅ Added console logging for successful operations

### 2. **Consent Data Not Saving**
**Root Causes:**
- Using wrong Supabase client (`createServerComponentClient` instead of service role)
- Missing error handling and logging
- No feedback to frontend about save status

**Fixes Applied:**
- ✅ Changed to use `auth.getCurrentSession()` and `db.supabaseAdmin`
- ✅ Added comprehensive error handling with detailed error messages
- ✅ Added console logging on both success and failure
- ✅ Added better error responses with stack traces in development

### 3. **Frontend Error Handling**
**Issues:**
- Frontend was silently failing without showing errors
- No logging of API responses

**Fixes Applied:**
- ✅ Added error response parsing in all onboarding pages
- ✅ Added console logging for successful API calls
- ✅ Added error logging with detailed messages
- ✅ Payment page now shows detailed error messages

## Files Modified

### Backend API Routes:
1. `lib/supabase.js` - Exposed `supabaseAdmin` in db helper
2. `app/api/onboarding/progress/route.js` - Added error handling
3. `app/api/onboarding/complete/route.js` - Added error handling
4. `app/api/user/save-consent/route.js` - Fixed authentication and error handling

### Frontend Pages:
5. `app/onboarding/personalize/page.js` - Added error logging
6. `app/onboarding/demo/page.js` - Added error logging
7. `app/onboarding/complete/page.js` - Added error logging
8. `app/payment/page.js` - Added error logging and better error messages

## Testing Steps

### Prerequisites
1. Ensure database migrations are run:
   ```sql
   -- Run in Supabase SQL Editor:
   -- 1. supabase/migrations/add_onboarding_tables.sql
   -- 2. supabase/migrations/add_consent_tracking.sql
   ```

2. Check environment variables:
   ```bash
   # Required in .env.local:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Test 1: Onboarding Flow Data Persistence

1. **Navigate to onboarding:**
   - Go to `http://localhost:3000/onboarding`
   - Open browser Developer Tools (F12) and go to Console tab

2. **Test Personalize Step:**
   - Select a pain point
   - (Optional) Add a feature suggestion
   - Click "Continue"
   - ✅ Check console for: "Progress saved successfully"
   - ❌ If error, check console for: "Onboarding progress API error"

3. **Test Demo Step:**
   - Go through all 3 feature demos
   - Click "I'm Ready!" or "Skip demo"
   - ✅ Check console for: "Demo progress saved successfully"
   - ❌ If error, check console for: "Demo progress API error"

4. **Test Complete Step:**
   - On the complete page
   - ✅ Check console for: "Onboarding completed successfully"
   - ❌ If error, check console for: "Complete onboarding API error"

5. **Verify in Database:**
   ```sql
   -- Check onboarding_progress table
   SELECT * FROM onboarding_progress
   WHERE user_id = 'your-user-id'
   ORDER BY created_at DESC;

   -- Should see 3 rows:
   -- 1. step_completed = 'personalize' with pain_point_selected
   -- 2. step_completed = 'demo' with features_used array
   -- 3. step_completed = 'complete'

   -- Check profiles table
   SELECT
     email,
     onboarding_completed,
     pain_point
   FROM profiles
   WHERE id = 'your-user-id';

   -- Should show:
   -- onboarding_completed = true
   -- pain_point = the selected pain point
   ```

### Test 2: Consent Data Persistence

1. **Navigate to payment page:**
   - Go to `http://localhost:3000/payment`
   - Ensure you're logged in
   - Open browser Developer Tools Console

2. **Test Consent Checkboxes:**
   - Check all required checkboxes:
     - ✓ Terms of Service
     - ✓ Privacy Policy
     - ✓ Refund Policy
     - ✓ Recurring Payment Subscription
   - (Optional) Check "Immediate Access"
   - Verify "Start Free Trial" button is enabled

3. **Submit Consent:**
   - Click "Start Free Trial"
   - ✅ Check console for: "Consent saved successfully"
   - ❌ If error, check console for: "Consent API error" with details

4. **Verify in Database:**
   ```sql
   -- Check consent data in profiles table
   SELECT
     email,
     terms_consent_accepted,
     terms_consent_timestamp,
     privacy_consent_accepted,
     privacy_consent_timestamp,
     refund_policy_consent_accepted,
     refund_policy_consent_timestamp,
     immediate_access_consent_accepted,
     immediate_access_consent_timestamp,
     recurring_payment_consent_accepted,
     recurring_payment_consent_timestamp,
     trial_started_at
   FROM profiles
   WHERE id = 'your-user-id';

   -- Should show all consent fields with:
   -- - Boolean values (true for checked boxes)
   -- - Timestamps for when consent was given
   -- - trial_started_at with the timestamp of button click
   ```

## Troubleshooting Common Issues

### Issue: "Unauthorized" Error

**Symptoms:**
- API returns 401 status
- Console shows "Unauthorized" error

**Solution:**
```bash
# Check if user is logged in
# In browser console:
await auth.getCurrentSession()

# If null, user needs to log in first
# Go to /auth/login
```

### Issue: "Column does not exist" Error

**Symptoms:**
- API returns 500 error
- Console shows column name error

**Solution:**
```sql
-- Run the migration that adds the column
-- Check which migration is missing:

-- For onboarding columns:
\d profiles
-- Look for: onboarding_completed, pain_point

-- For consent columns:
\d profiles
-- Look for: terms_consent_accepted, terms_consent_timestamp, etc.

-- If missing, run the appropriate migration file
```

### Issue: Data Saved but Not Showing in Database

**Symptoms:**
- Console shows "saved successfully"
- Database query returns no rows

**Solution:**
```sql
-- Check Row Level Security policies
-- Users can only see their own data

-- Option 1: Query as the user (in app)
-- Option 2: Query as admin (in SQL editor with service role)

-- Check if data exists at all:
SELECT COUNT(*) FROM onboarding_progress;
SELECT COUNT(*) FROM profiles
WHERE onboarding_completed = true;

-- If count > 0 but your query returns nothing,
-- you're querying as wrong user
```

### Issue: Supabase Service Role Key Missing

**Symptoms:**
- Operations fail with permission errors
- `supabaseAdmin` uses anon key instead

**Solution:**
```bash
# Add to .env.local:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Get from: Supabase Dashboard → Settings → API
# Restart dev server after adding
```

## Verification Queries

### Complete Data Check for a User

```sql
-- Replace 'user-email@example.com' with actual user email

-- 1. Profile data
SELECT
  email,
  onboarding_completed,
  pain_point,
  terms_consent_accepted,
  privacy_consent_accepted,
  refund_policy_consent_accepted,
  recurring_payment_consent_accepted,
  trial_started_at,
  created_at
FROM profiles
WHERE email = 'user-email@example.com';

-- 2. Onboarding progress
SELECT
  step_completed,
  pain_point_selected,
  features_used,
  completed_at
FROM onboarding_progress
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'user-email@example.com'
)
ORDER BY created_at ASC;

-- 3. Full consent details
SELECT
  email,
  terms_consent_timestamp,
  privacy_consent_timestamp,
  refund_policy_consent_timestamp,
  immediate_access_consent_timestamp,
  recurring_payment_consent_timestamp,
  trial_started_at
FROM profiles
WHERE email = 'user-email@example.com';
```

## Expected Console Output

### Successful Onboarding Flow:

```
// Personalize page:
Progress saved successfully: {success: true, message: "Progress saved", data: [...]}

// Demo page:
Demo progress saved successfully: {success: true, message: "Progress saved", data: [...]}

// Complete page:
Onboarding completed successfully: {success: true, message: "Onboarding completed", data: {...}}
```

### Successful Consent Submission:

```
// Payment page:
Consent saved successfully: {success: true, message: "Consent data saved successfully", data: [...]}
```

### Error Output:

```
// If API error:
Onboarding progress API error: {error: "...", details: "...", stack: "..."}

// Or:
Consent API error: {error: "Internal server error", details: "Column 'terms_consent_accepted' does not exist"}
```

## Next Steps After Testing

1. **If all tests pass:**
   - ✅ Data is being saved correctly
   - ✅ Proceed with external payment integration
   - ✅ Set up production environment

2. **If tests fail:**
   - ❌ Check console for specific error messages
   - ❌ Verify database migrations were run
   - ❌ Check environment variables
   - ❌ Review RLS policies in Supabase
   - ❌ Check server logs in terminal running `npm run dev`

## Support

If issues persist:
1. Check server terminal output (where `npm run dev` is running)
2. Check Supabase logs in Dashboard → Logs
3. Verify API routes are accessible: check Network tab in DevTools
4. Test API routes directly with curl or Postman

## Summary of Changes

**Before:**
- Silent failures - data appeared to save but didn't
- No error visibility
- Wrong authentication method
- Missing error handling

**After:**
- ✅ Proper error handling and reporting
- ✅ Detailed logging on success and failure
- ✅ Correct authentication using service role
- ✅ Verified database operations with `.select()`
- ✅ Developer-friendly error messages

**Result:**
- All onboarding data is saved to database
- All consent data is saved with timestamps
- Errors are visible and actionable
- Easy to debug and troubleshoot
