# Cloudflare Pages Deployment Guide

## Prerequisites

- A Cloudflare account
- A GitHub repository with your SvelteKit app
- Supabase project credentials
- Paddle payment credentials (optional)

## Step 1: Set Environment Variables in Cloudflare Pages Dashboard

**CRITICAL:** You must set these environment variables in Cloudflare Pages BEFORE the first build.

1. Go to the Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Select your Pages project (or create a new one)
4. Go to **Settings** > **Environment Variables**
5. Add the following variables:

### Required Public Variables
These variables are accessible in the browser and required for the build to succeed:

```
PUBLIC_SUPABASE_URL = https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
PUBLIC_PADDLE_VENDOR_ID = your_paddle_vendor_id
PUBLIC_PADDLE_ENVIRONMENT = sandbox
```

### Required Private Variables
These variables are server-side only:

```
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
PADDLE_VENDOR_ID = your_paddle_vendor_id
PADDLE_VENDOR_AUTH_CODE = your_paddle_vendor_auth_code
PADDLE_PUBLIC_KEY = your_paddle_public_key
PADDLE_WEBHOOK_SECRET = your_paddle_webhook_secret
JWT_SECRET = your_jwt_secret_key_here
ADMIN_EMAIL = admin@yourdomain.com
```

**Note:** Add these variables to BOTH "Production" and "Preview" environments.

## Step 2: Configure Build Settings

In your Cloudflare Pages project settings:

1. **Framework preset:** SvelteKit
2. **Build command:** `npm run build`
3. **Build output directory:** `.svelte-kit/cloudflare`
4. **Root directory:** `/` (or leave empty)
5. **Node version:** 18 or higher (set via environment variable `NODE_VERSION=18`)

## Step 3: Deploy

### Option A: Deploy from Git (Recommended)

1. Connect your GitHub repository to Cloudflare Pages
2. Select the repository and branch
3. Configure build settings as above
4. Click **Save and Deploy**

Cloudflare Pages will automatically:
- Install dependencies
- Build your SvelteKit app
- Deploy to `https://your-project.pages.dev`

### Option B: Deploy via CLI

```bash
# Build locally
npm run build

# Deploy using Wrangler
npm run deploy
# or
wrangler pages deploy .svelte-kit/cloudflare
```

## Step 4: Verify Deployment

After deployment completes:

1. Visit your `*.pages.dev` URL
2. Check that the app loads without errors
3. Test authentication (Supabase)
4. Test payment flow (Paddle) if applicable

## Troubleshooting

### Build fails with "PUBLIC_SUPABASE_URL is not exported"

**Cause:** Environment variables not set in Cloudflare Pages dashboard.

**Solution:**
1. Go to your Pages project > Settings > Environment Variables
2. Add all required PUBLIC_ variables listed above
3. Retry deployment

### Build succeeds but app doesn't work

**Cause:** Private environment variables not set.

**Solution:**
1. Ensure all private variables are set in Cloudflare Pages dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy

### Paddle integration doesn't work

**Cause:** Paddle credentials are optional and may not be configured.

**Solution:**
- The app will work without Paddle, but payment features will be disabled
- To enable Paddle, add all PADDLE_* environment variables

## Environment Variables Reference

### Public Variables (Browser-Accessible)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key | `eyJhbGc...` |
| `PUBLIC_PADDLE_VENDOR_ID` | ⚠️ Optional | Paddle vendor ID | `12345` |
| `PUBLIC_PADDLE_ENVIRONMENT` | ⚠️ Optional | Paddle environment | `sandbox` or `production` |

### Private Variables (Server-Only)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key |
| `PADDLE_VENDOR_ID` | ⚠️ Optional | Paddle vendor ID (server) |
| `PADDLE_VENDOR_AUTH_CODE` | ⚠️ Optional | Paddle authentication code |
| `PADDLE_PUBLIC_KEY` | ⚠️ Optional | Paddle public key |
| `PADDLE_WEBHOOK_SECRET` | ⚠️ Optional | Paddle webhook secret |
| `JWT_SECRET` | ✅ Yes | JWT signing secret |
| `ADMIN_EMAIL` | ✅ Yes | Admin user email |

## Local Development

For local development, create a `.dev.vars` file:

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your actual credentials
# This file is git-ignored for security
```

Then run:

```bash
npm run dev
```

## Custom Domain Setup

1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (automatic)

## Additional Resources

- [SvelteKit on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Paddle Documentation](https://developer.paddle.com/)
