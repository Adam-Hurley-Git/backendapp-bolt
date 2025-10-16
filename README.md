# Calendar Extension Backend - SvelteKit

Backend API for the Calendar Extension Chrome extension, built with SvelteKit and deployed on Cloudflare Pages.

## Features

- **Authentication**: User registration, login, and session management with Supabase Auth
- **Subscription Management**: Integration with Paddle for payment processing
- **License Key System**: Automatic license key generation and verification
- **Webhook Handling**: Process Paddle webhook events for subscription updates
- **Admin Dashboard**: User management and admin operations
- **Database**: PostgreSQL via Supabase with RLS (Row Level Security)

## Tech Stack

- **Framework**: SvelteKit 2.x
- **Deployment**: Cloudflare Pages
- **Database**: Supabase (PostgreSQL)
- **Payments**: Paddle
- **Styling**: Tailwind CSS
- **Language**: JavaScript

## Project Structure

```
src/
├── app.d.ts                    # TypeScript declarations
├── app.html                    # HTML template
├── app.css                     # Global styles
├── hooks.server.js             # Server hooks (auth, security)
├── lib/
│   ├── server/
│   │   ├── auth.js            # Auth helpers & middleware
│   │   ├── paddle.js          # Paddle payment service
│   │   └── supabase.js        # Supabase client & DB helpers
│   └── utils/
│       └── licenseGenerator.js # License key generation
└── routes/
    ├── +layout.server.js      # Root layout with session
    ├── +layout.svelte         # Root layout component
    ├── +page.svelte           # Home page
    └── api/
        ├── auth/
        │   ├── register/+server.js
        │   ├── login/+server.js
        │   ├── logout/+server.js
        │   └── session/+server.js
        ├── subscription/
        │   ├── status/+server.js
        │   ├── create/+server.js
        │   ├── cancel/+server.js
        │   └── update/+server.js
        ├── license/
        │   ├── verify/+server.js
        │   └── info/+server.js
        ├── webhooks/
        │   └── paddle/+server.js
        └── admin/
            └── users/
                ├── +server.js
                └── [userId]/+server.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/session` - Get current session

### Subscription Management
- `GET /api/subscription/status` - Get user's subscription status
- `POST /api/subscription/create` - Create Paddle checkout session
- `POST /api/subscription/cancel` - Cancel user's subscription
- `POST /api/subscription/update` - Update subscription plan

### License Verification
- `POST /api/license/verify` - Verify license key (used by Chrome extension)
- `GET /api/license/info` - Get license info for authenticated user

### Webhooks
- `POST /api/webhooks/paddle` - Handle Paddle webhook events

### Admin (requires admin email)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[userId]` - Get user details
- `PATCH /api/admin/users/[userId]` - Update user

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paddle Configuration
PADDLE_VENDOR_ID=your_paddle_vendor_id
PADDLE_VENDOR_AUTH_CODE=your_paddle_vendor_auth_code
PADDLE_PUBLIC_KEY=your_paddle_public_key
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret

# Application Configuration
JWT_SECRET=your_jwt_secret_key

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com

# Environment
NODE_ENV=development
```

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or pnpm
- Supabase account
- Paddle account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. Run the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000` (or next available port).

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run preview:worker` - Preview with Cloudflare Pages locally
- `npm run deploy` - Build and deploy to Cloudflare Pages
- `npm run check` - Check SvelteKit project
- `npm run lint` - Lint code with ESLint

### Database Schema

The application uses the following Supabase tables:
- `profiles` - User profiles with license keys
- `subscriptions` - Paddle subscription data
- `payment_attempts` - Payment history
- `webhook_events` - Webhook event log
- `admin_actions` - Admin action audit log
- `onboarding_progress` - User onboarding tracking
- `feature_usage` - Feature usage analytics
- `paywall_interactions` - Paywall interaction tracking

## Deployment

### Cloudflare Pages

1. Build the project:
```bash
npm run build
```

2. Deploy to Cloudflare Pages:
```bash
npm run deploy
```

Or use the Cloudflare Pages dashboard:
- Build command: `npm run build`
- Build output directory: `.svelte-kit/cloudflare`

### Environment Variables in Production

Add all environment variables in the Cloudflare Pages dashboard under:
Settings → Environment Variables

Make sure to add:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PADDLE_VENDOR_ID`
- `PADDLE_VENDOR_AUTH_CODE`
- `PADDLE_PUBLIC_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `NODE_ENV=production`

### Webhook Configuration

Configure Paddle webhooks to point to:
```
https://your-domain.pages.dev/api/webhooks/paddle
```

## Testing

### Test License Verification

```bash
curl -X POST http://localhost:3000/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "XXXX-XXXX-XXXX-XXXX"}'
```

### Test Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## Support

For issues or questions, please contact the development team.

## License

MIT
