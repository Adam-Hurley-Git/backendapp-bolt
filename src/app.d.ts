// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: import('@supabase/supabase-js').SupabaseClient;
			getSession(): Promise<import('@supabase/supabase-js').Session | null>;
		}
		interface PageData {
			session: import('@supabase/supabase-js').Session | null;
		}
		interface Platform {
			env: {
				PUBLIC_SUPABASE_URL: string;
				PUBLIC_SUPABASE_ANON_KEY: string;
				SUPABASE_SERVICE_ROLE_KEY: string;
				PADDLE_VENDOR_ID: string;
				PADDLE_VENDOR_AUTH_CODE: string;
				PADDLE_PUBLIC_KEY: string;
				PADDLE_WEBHOOK_SECRET: string;
				JWT_SECRET: string;
				ADMIN_EMAIL: string;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
