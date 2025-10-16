import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * Supabase authentication hook
 * Creates a Supabase client for each request and handles session management
 */
async function supabaseAuth({ event, resolve }) {
	// Get env vars from Cloudflare Pages (available at runtime, not build time)
	const PUBLIC_SUPABASE_URL = env.PUBLIC_SUPABASE_URL;
	const PUBLIC_SUPABASE_ANON_KEY = env.PUBLIC_SUPABASE_ANON_KEY;

	// Skip if env vars not available
	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
		console.warn('Supabase environment variables not configured');
		return resolve(event);
	}

	// Create a Supabase client specific to this request
	event.locals.supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => {
					return event.cookies.getAll();
				},
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	/**
	 * Helper function to get the current session
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
}

/**
 * Security headers hook
 * Adds security headers to all responses
 * Optimized for Cloudflare Pages deployment
 */
async function securityHeaders({ event, resolve }) {
	const response = await resolve(event);

	// Security headers (recommended for production)
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-XSS-Protection', '1; mode=block');

	// Permissions Policy (restrict browser features)
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	// Content Security Policy (CSP) - adjust if using Paddle
	// Allow Paddle's scripts, frames, and connect endpoints for sandbox/production
	// You may need to adjust this based on your Paddle environment
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com https://sandbox-cdn.paddle.com",
		"frame-src 'self' https://checkout.paddle.com https://sandbox-checkout.paddle.com",
		"connect-src 'self' https://api.paddle.com https://sandbox-api.paddle.com https://*.supabase.co",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https:",
		"font-src 'self' data:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'"
	].join('; ');

	// Only apply CSP to HTML responses
	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('text/html')) {
		response.headers.set('Content-Security-Policy', cspDirectives);
	}

	return response;
}

// Combine all hooks using sequence
export const handle = sequence(supabaseAuth, securityHeaders);
