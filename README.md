# Chrome Extension Backend

A comprehensive backend solution for Chrome extensions with Supabase and Paddle integration, featuring user authentication, subscription management, and admin dashboard.

## Features

### User Features
- 🔐 **Authentication**: Google OAuth & email/password via Supabase
- 💳 **Payment Processing**: Secure payments through Paddle
- 📊 **User Dashboard**: Subscription status, billing info, license keys
- 🔑 **License Management**: Automatic license key generation
- 📱 **Responsive Design**: Beautiful UI with Tailwind CSS

### Admin Features
- 👥 **User Management**: View all users, subscriptions, and details
- 📈 **Analytics**: Revenue tracking, user metrics, failed payments
- 🛠️ **Paddle Integration**: Direct access to Paddle management
- 📋 **Audit Trail**: Track all admin actions
- 🔍 **Search & Filter**: Advanced user filtering and search

### Technical Features
- 🔄 **Webhook Integration**: Real-time payment sync with Paddle
- 🛡️ **Row Level Security**: Secure data access with Supabase RLS
- 🔑 **License Key System**: Automatic generation and validation
- 📧 **Email Integration**: Automated user communications
- 🚀 **Next.js 14**: Modern React framework with App Router

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Paddle account
- Google OAuth credentials

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd chrome-extension-backend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Paddle
   PADDLE_VENDOR_ID=your_paddle_vendor_id
   PADDLE_VENDOR_AUTH_CODE=your_paddle_vendor_auth_code
   PADDLE_PUBLIC_KEY=your_paddle_public_key
   PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret

   # Application
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   JWT_SECRET=your_jwt_secret
   ```

3. **Database setup**
   ```bash
   # Run the schema in your Supabase SQL editor
   # File: supabase/schema.sql
   ```

4. **Configure Paddle plans**

   Update `lib/paddle.js` with your actual Paddle plan IDs:
   ```javascript
   export const PADDLE_PLANS = {
     BASIC_MONTHLY: {
       id: 'your_actual_plan_id',
       // ... other config
     }
   }
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── billing/           # Billing management
│   ├── dashboard/         # User dashboard
│   └── pricing/           # Pricing & signup
├── components/            # Reusable React components
├── lib/                   # Core utilities
│   ├── auth.js           # Authentication helpers
│   ├── paddle.js         # Paddle integration
│   └── supabase.js       # Database helpers
├── middleware.js          # Route protection
├── supabase/             # Database schema
└── utils/                # Utility functions
```

## API Endpoints

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/subscription` - Get user subscription
- `GET /api/user/payments` - Get payment history

### Payment Endpoints
- `POST /api/payments/create-attempt` - Create payment attempt
- `POST /api/paddle/manage-subscription` - Get management URL

### Admin Endpoints
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/stats` - Get dashboard statistics
- `POST /api/admin/paddle-management` - Admin Paddle access

### Webhooks
- `POST /api/webhooks/paddle` - Paddle webhook handler

## Database Schema

### Core Tables
- **profiles**: User profile information
- **subscriptions**: Subscription data with Paddle sync
- **payment_attempts**: Track payment flows
- **webhook_events**: Paddle webhook event log
- **admin_actions**: Admin activity audit trail

### Key Features
- Row Level Security (RLS) on all tables
- Automatic user creation triggers
- License key generation functions
- Timestamp tracking with auto-updates

## Paddle Integration

### Supported Events
- `subscription_created` - New subscription setup
- `subscription_updated` - Plan changes, status updates
- `subscription_cancelled` - Cancellation handling
- `subscription_payment_succeeded` - Payment processing
- `subscription_payment_failed` - Failed payment handling
- `subscription_payment_refunded` - Refund processing

### Webhook Configuration
Set your Paddle webhook URL to:
```
https://yourdomain.com/api/webhooks/paddle
```

## Deployment to Cloudflare Pages

This application is optimized for deployment on **Cloudflare Pages with Workers** using `@opennextjs/cloudflare`.

### Prerequisites for Deployment
- Cloudflare account
- GitHub repository
- Node.js 20.11.0 or later

### Quick Deploy Steps

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Next.js app ready for Cloudflare"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

#### 2. Connect to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **Create application** > **Pages**
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build && npx @opennextjs/cloudflare`
   - **Build output directory**: `.open-next/assets`

#### 3. Set Environment Variables
In Cloudflare Dashboard > Settings > Environment Variables, add:
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PADDLE_VENDOR_ID=your_vendor_id
PADDLE_VENDOR_AUTH_CODE=your_auth_code
PADDLE_PUBLIC_KEY=your_public_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret
NEXTAUTH_URL=https://your-app.pages.dev
NEXTAUTH_SECRET=your_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@yourdomain.com
```

Set variables for both **Production** and **Preview** environments.

#### 4. Configure Compatibility Settings
1. Go to **Settings** > **Functions**
2. Ensure **nodejs_compat** is enabled (configured in `wrangler.toml`)
3. Compatibility date should be `2025-03-25` or later

#### 5. Deploy
Click **Save and Deploy**. Your app will be live at `https://your-app.pages.dev`

### Local Development with Cloudflare Workers

Test your app with Cloudflare Workers locally:
```bash
npm run preview:worker
```

This builds and runs your app on `http://localhost:8771` using Wrangler.

### Deployment via CLI

Deploy directly using Wrangler:
```bash
npm run deploy
```

Or specifically for Pages:
```bash
npm run pages:deploy
```

### Important Cloudflare Configuration

This app uses:
- **@opennextjs/cloudflare** for Next.js compatibility
- **nodejs_compat** flag for Node.js runtime
- **Standalone output mode** for optimal performance
- **Compatibility date**: 2025-03-25 or later

See `wrangler.toml` for full configuration.

## Security Considerations

- ✅ All API endpoints have authentication
- ✅ Row Level Security enabled on database
- ✅ Webhook signature verification
- ✅ Input validation on all forms
- ✅ Admin role verification for admin endpoints
- ✅ Secure license key generation

## Chrome Extension Integration

### Using the License System
```javascript
// In your Chrome extension
const licenseKey = 'XXXX-XXXX-XXXX-XXXX'; // From user dashboard

// Validate license with your backend
const response = await fetch('https://yourdomain.com/api/validate-license', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ licenseKey })
});

const { valid, subscription } = await response.json();
```

## Support & Customization

This backend is designed to be easily customizable for your specific Chrome extension needs. Key areas for customization:

1. **Plan Configuration**: Update `PADDLE_PLANS` in `lib/paddle.js`
2. **UI Branding**: Modify colors and styling in `tailwind.config.js`
3. **License Validation**: Extend the license system in `utils/licenseGenerator.js`
4. **Admin Features**: Add custom admin functionality in `app/admin/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

## Getting Help

- Check the GitHub issues for common problems
- Review the Supabase and Paddle documentation
- Ensure all environment variables are correctly set
- Verify webhook endpoints are accessible

For additional support, please create an issue in the repository.