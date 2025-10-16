# 🚨 URGENT: Fix Cloudflare Pages Deployment

Your deployment is failing because **environment variables are not set** in Cloudflare Pages.

## The Real Problem

The error message:
```
"PUBLIC_SUPABASE_URL" is not exported by "virtual:env/static/public"
```

**Means:** Cloudflare Pages cannot find these environment variables during the build.

**Why:** Environment variables MUST be set in the Cloudflare dashboard BEFORE building.

---

## ✅ Step-by-Step Fix

### Step 1: Go to Cloudflare Pages Dashboard

1. Open: https://dash.cloudflare.com
2. Click **Workers & Pages** in the left sidebar
3. Find and click your project: **calendar-extension-backend3**
4. Click **Settings** tab
5. Scroll to **Environment variables** section

### Step 2: Add Required Environment Variables

Click **Add variable** and add each of these:

#### ⚠️ CRITICAL - Required for Build to Succeed:

```
Variable name: PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production and Preview (select both)
Type: Plaintext
```

```
Variable name: PUBLIC_SUPABASE_ANON_KEY
Value: (paste your Supabase anon key)
Environment: Production and Preview
Type: Plaintext
```

```
Variable name: PUBLIC_PADDLE_VENDOR_ID
Value: your_vendor_id_or_placeholder
Environment: Production and Preview
Type: Plaintext
```

```
Variable name: PUBLIC_PADDLE_ENVIRONMENT
Value: sandbox
Environment: Production and Preview
Type: Plaintext
```

#### Additional Required Variables (for runtime):

```
Variable name: SUPABASE_SERVICE_ROLE_KEY
Value: (paste your Supabase service role key)
Environment: Production and Preview
Type: Secret (encrypt this one!)
```

```
Variable name: JWT_SECRET
Value: (generate a random secret)
Environment: Production and Preview
Type: Secret
```

```
Variable name: ADMIN_EMAIL
Value: your_admin_email@example.com
Environment: Production and Preview
Type: Plaintext
```

#### Optional Paddle Variables (if you use Paddle):

```
PADDLE_VENDOR_ID (Secret)
PADDLE_VENDOR_AUTH_CODE (Secret)
PADDLE_PUBLIC_KEY (Secret)
PADDLE_WEBHOOK_SECRET (Secret)
```

### Step 3: Save and Deploy

1. Click **Save** after adding all variables
2. Go to **Deployments** tab
3. Click **Retry deployment** on the failed deployment
4. OR push a new commit to trigger rebuild

### Step 4: Verify Success

Once deployment completes:
- Build should succeed (no more PUBLIC_SUPABASE_URL error)
- Site will be live at `https://calendar-extension-backend3.pages.dev`

---

## 🔍 Why Did This Happen?

1. **Cloudflare built from commit 965cc30** (old commit without fixes)
2. **The latest fixes are in commits 7de1217 and 08dbdae** (already pushed to GitHub)
3. **BUT** even with the code fixes, **environment variables MUST be set in Cloudflare dashboard**

The code is correct. You just need to add the environment variables.

---

## 📋 Quick Checklist

- [ ] Logged into Cloudflare dashboard
- [ ] Navigated to Workers & Pages > calendar-extension-backend3 > Settings
- [ ] Added `PUBLIC_SUPABASE_URL` (Production + Preview)
- [ ] Added `PUBLIC_SUPABASE_ANON_KEY` (Production + Preview)
- [ ] Added `PUBLIC_PADDLE_VENDOR_ID` (Production + Preview)
- [ ] Added `PUBLIC_PADDLE_ENVIRONMENT` (Production + Preview)
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` as Secret (Production + Preview)
- [ ] Added `JWT_SECRET` as Secret (Production + Preview)
- [ ] Added `ADMIN_EMAIL` (Production + Preview)
- [ ] Saved all variables
- [ ] Retriggered deployment
- [ ] Deployment succeeded ✅

---

## 🆘 Getting Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → Use for `PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 🎯 Expected Result

After adding environment variables and retriggering:

✅ Build completes successfully
✅ No "PUBLIC_SUPABASE_URL is not exported" error
✅ Site deploys to Cloudflare Pages
✅ App is accessible at `*.pages.dev` URL

---

## Still Having Issues?

If you still get errors after adding variables:

1. Double-check variable names are EXACT (case-sensitive)
2. Ensure you selected BOTH "Production" AND "Preview" environments
3. Make sure PUBLIC_ variables are type "Plaintext" not "Secret"
4. Try manually triggering a new deployment
5. Check the build log for any other missing variables
