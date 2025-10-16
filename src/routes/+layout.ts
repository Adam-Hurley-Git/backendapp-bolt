// Configure SSR and prerendering for the entire app
// These settings are required for Cloudflare Pages with dynamic routes and webhooks

export const prerender = false; // Disable prerendering - we have dynamic routes and auth
export const ssr = true;         // Enable server-side rendering
export const csr = true;         // Enable client-side rendering
