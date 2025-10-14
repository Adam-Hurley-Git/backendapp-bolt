# Consent Tracking Implementation

## Overview
This implementation adds consent tracking for the payment page, storing user consent choices and timestamps in the database when they start their free trial.

## Changes Made

### 1. Frontend Changes (app/payment/page.js)

#### New Checkbox Added
- **Recurring Payment Subscription Checkbox**: Users must now agree to recurring payment subscriptions after the trial period ends.

#### State Management
- Added `recurringPaymentAccepted` state variable
- Updated `handleAcceptAll()` to include the new checkbox
- Updated `handleIndividualCheckbox()` to handle the recurring payment checkbox
- Updated validation logic to require recurring payment consent

#### API Integration
- Modified `handlePayment()` to be async
- Added API call to `/api/user/save-consent` before redirecting to payment
- Captures timestamp when "Start Free Trial" button is clicked
- Saves all consent choices with timestamps to the database

#### UI Updates
- Added new checkbox in the consent section with clear language about recurring payments
- Updated button disable logic to include recurring payment consent
- Updated validation message to show when required consents are missing

### 2. Database Changes

#### Migration File: `supabase/migrations/add_consent_tracking.sql`

New columns added to `profiles` table:
- `terms_consent_accepted` (BOOLEAN) - Whether user accepted Terms of Service
- `terms_consent_timestamp` (TIMESTAMP) - When terms were accepted
- `privacy_consent_accepted` (BOOLEAN) - Whether user accepted Privacy Policy
- `privacy_consent_timestamp` (TIMESTAMP) - When privacy policy was accepted
- `refund_policy_consent_accepted` (BOOLEAN) - Whether user accepted Refund Policy
- `refund_policy_consent_timestamp` (TIMESTAMP) - When refund policy was accepted
- `immediate_access_consent_accepted` (BOOLEAN) - Whether user accepted immediate access
- `immediate_access_consent_timestamp` (TIMESTAMP) - When immediate access was accepted
- `recurring_payment_consent_accepted` (BOOLEAN) - Whether user accepted recurring payments
- `recurring_payment_consent_timestamp` (TIMESTAMP) - When recurring payment was accepted
- `trial_started_at` (TIMESTAMP) - When user clicked "Start Free Trial" button

**Indexes Created:**
- `idx_profiles_trial_started` - For querying by trial start date
- `idx_profiles_recurring_consent` - For querying by recurring payment consent

### 3. Backend API

#### New Endpoint: `/api/user/save-consent`

**Method:** POST

**Authentication:** Required (uses Supabase session)

**Request Body:**
```json
{
  "termsAccepted": true,
  "privacyAccepted": true,
  "refundPolicyAccepted": true,
  "immediateAccessAccepted": false,
  "recurringPaymentAccepted": true,
  "consentTimestamp": "2025-10-14T12:34:56.789Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consent data saved successfully",
  "data": { /* updated profile data */ }
}
```

**Validation:**
- Checks for authenticated user session
- Validates all required consents (terms, privacy, refund, recurring payment)
- Returns 401 if not authenticated
- Returns 400 if missing required fields
- Returns 500 if database error

**Security:**
- Uses Supabase Row Level Security (RLS)
- Users can only update their own profile
- All timestamps are stored in UTC

## Installation Steps

### 1. Run Database Migration

Open your Supabase SQL Editor and execute:

```sql
-- Copy and paste the contents of:
supabase/migrations/add_consent_tracking.sql
```

### 2. Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the payment page: `http://localhost:3000/payment`

3. Test the flow:
   - Verify all checkboxes are present (5 total)
   - Verify "Accept All" checkbox toggles all checkboxes
   - Verify "Start Free Trial" button is disabled until all required consents are checked
   - Check that clicking "Start Free Trial" saves data before redirecting

4. Verify database:
   ```sql
   SELECT
     id,
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
   WHERE email = 'your-test-email@example.com';
   ```

## Consent Checkboxes

### Required (must be checked to proceed):
1. **Terms of Service** - Agreement to terms
2. **Privacy Policy** - Agreement to privacy policy
3. **Refund Policy** - Agreement to refund policy
4. **Recurring Payment Subscription** - Agreement to automatic renewal after trial

### Optional:
5. **Immediate Access** - Request immediate access (loses 14-day withdrawal right)

## Data Flow

1. User lands on payment page (`/payment`)
2. User checks consent checkboxes
3. User clicks "Start Free Trial" button
4. Frontend captures current timestamp
5. Frontend calls `/api/user/save-consent` with all consent data
6. Backend validates authentication and required fields
7. Backend saves consent data to `profiles` table
8. Frontend redirects to external payment site
9. All consent choices and timestamps are permanently stored

## Compliance Notes

- All timestamps are stored in ISO 8601 format (UTC)
- Consent can be audited at any time via the database
- Each consent type has its own boolean and timestamp for granular tracking
- Trial start time is captured when user initiates the trial
- Data is protected by Supabase Row Level Security

## Files Modified/Created

### Modified:
- `app/payment/page.js` - Added recurring payment checkbox and consent tracking

### Created:
- `supabase/migrations/add_consent_tracking.sql` - Database migration
- `app/api/user/save-consent/route.js` - API endpoint for saving consent
- `CONSENT_TRACKING_IMPLEMENTATION.md` - This documentation file

## Future Enhancements

Consider adding:
1. Consent withdrawal functionality
2. Consent history log (audit trail)
3. Email confirmation of consents
4. Admin dashboard to view consent status
5. Export functionality for compliance reporting
6. Consent version tracking (if terms/policies change)

## Troubleshooting

### Issue: Button stays disabled after checking all boxes
- Check browser console for JavaScript errors
- Verify all state variables are updating correctly

### Issue: API returns 401 Unauthorized
- Check that user is properly authenticated
- Verify Supabase session is valid

### Issue: Data not saving to database
- Verify migration has been run
- Check Supabase logs for errors
- Verify RLS policies allow user to update their own profile

### Issue: Timestamps are incorrect
- Timestamps are stored in UTC, convert to local timezone for display
- Verify browser and server clocks are synchronized

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs
3. Verify network requests in browser dev tools
4. Review this documentation

---

**Implementation Date:** October 14, 2025
**Status:** Ready for testing
