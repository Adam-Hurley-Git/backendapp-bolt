import { json } from '@sveltejs/kit';

/**
 * POST /api/auth/login
 * Login user with email and password
 */
export async function POST({ request, locals }) {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Sign in with Supabase
		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			console.error('Login error:', error);
			return json({ error: error.message }, { status: 401 });
		}

		return json({
			success: true,
			user: data.user,
			session: data.session
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
