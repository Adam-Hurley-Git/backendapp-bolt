# Quick Fix Reference - Data Persistence Issues

## 🔧 What Was Fixed

### The Problem
- ✗ Onboarding data not saving to database
- ✗ Consent data not saving to database
- ✗ No error messages visible
- ✗ Silent failures

### The Solution
- ✓ Fixed API error handling
- ✓ Fixed database operations
- ✓ Added error logging
- ✓ Added success confirmation

## 🚀 Quick Start

### 1. Run Migrations (if not done)
```sql
-- In Supabase SQL Editor, execute both files:
-- 1. supabase/migrations/add_onboarding_tables.sql
-- 2. supabase/migrations/add_consent_tracking.sql
```

### 2. Start Server
```bash
npm run dev
# Server runs on: http://localhost:3001
```

### 3. Test
- Go to http://localhost:3001/onboarding
- Open Console (F12)
- Complete flow
- Look for: "Progress saved successfully"

## 📋 What Changed

### Backend APIs (now with error handling):
- ✓ `/api/onboarding/progress` - Saves onboarding steps
- ✓ `/api/onboarding/complete` - Marks onboarding done
- ✓ `/api/user/save-consent` - Saves consent choices

### Frontend Pages (now with logging):
- ✓ `/onboarding/personalize` - Pain point selection
- ✓ `/onboarding/demo` - Feature demos
- ✓ `/onboarding/complete` - Completion
- ✓ `/payment` - Consent checkboxes

## 🔍 How to Verify Data is Saving

### Method 1: Browser Console
Open Console (F12) and look for:
```
✓ Progress saved successfully: {...}
✓ Consent saved successfully: {...}
```

### Method 2: Database Query
```sql
-- Quick check for your user
SELECT
  email,
  onboarding_completed,
  pain_point,
  recurring_payment_consent_accepted,
  trial_started_at
FROM profiles
WHERE email = 'your-email@example.com';

-- Check onboarding steps
SELECT step_completed, completed_at
FROM onboarding_progress
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'your-email@example.com'
);
```

## ⚠️ Troubleshooting

### If you see "Unauthorized" error:
```bash
# Log in first
Go to http://localhost:3001/auth/login
```

### If you see "Column does not exist":
```sql
-- Run the migrations in Supabase SQL Editor
```

### If you see no errors but data doesn't save:
```bash
# Check environment variables in .env.local:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # ← This one is critical!

# Restart server after adding
```

### If console shows success but database is empty:
```sql
-- Check RLS policies
-- Try querying with service role in Supabase SQL Editor
```

## 📊 Expected Results

### Onboarding Complete:
```
profiles table:
  onboarding_completed: true
  pain_point: "visualClarity" (or other selection)

onboarding_progress table:
  3 rows with steps: "personalize", "demo", "complete"
```

### Consent Submitted:
```
profiles table:
  terms_consent_accepted: true
  terms_consent_timestamp: "2025-10-14T..."
  privacy_consent_accepted: true
  privacy_consent_timestamp: "2025-10-14T..."
  refund_policy_consent_accepted: true
  refund_policy_consent_timestamp: "2025-10-14T..."
  recurring_payment_consent_accepted: true
  recurring_payment_consent_timestamp: "2025-10-14T..."
  trial_started_at: "2025-10-14T..."
```

## 📁 Files Modified (8 total)

**Backend (4):**
1. `lib/supabase.js`
2. `app/api/onboarding/progress/route.js`
3. `app/api/onboarding/complete/route.js`
4. `app/api/user/save-consent/route.js`

**Frontend (4):**
5. `app/onboarding/personalize/page.js`
6. `app/onboarding/demo/page.js`
7. `app/onboarding/complete/page.js`
8. `app/payment/page.js`

## ✅ Success Checklist

- [ ] Migrations run in Supabase
- [ ] Environment variables set
- [ ] Server running (`npm run dev`)
- [ ] Can log in successfully
- [ ] Onboarding flow saves data (check console)
- [ ] Consent form saves data (check console)
- [ ] Data visible in database queries
- [ ] No errors in console

## 🆘 Still Having Issues?

1. Check server terminal output (where `npm run dev` runs)
2. Check browser console for detailed errors
3. Check Network tab in DevTools for API responses
4. Review `FIXES_AND_TESTING.md` for comprehensive guide

## 📖 More Documentation

- `DATA_PERSISTENCE_FIX_SUMMARY.md` - Full summary
- `FIXES_AND_TESTING.md` - Complete testing guide
- `CONSENT_TRACKING_IMPLEMENTATION.md` - Consent feature docs
- `ONBOARDING_SETUP.md` - Onboarding feature docs

---

**Status:** ✅ Ready to test
**Server:** http://localhost:3001
**Action:** Test onboarding + payment flows
