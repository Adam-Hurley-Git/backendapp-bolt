import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { generateLicenseKey } from '$lib/utils/licenseGenerator';

/**
 * POST /api/auth/register
 * Register a new user and create their profile
 */
export async function POST({ request, locals }) {
	try {
		const { email, password, name } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Create auth user
		const { data: authData, error: authError } = await locals.supabase.auth.signUp({
			email,
			password
		});

		if (authError) {
			console.error('Auth signup error:', authError);
			return json({ error: authError.message }, { status: 400 });
		}

		if (!authData.user) {
			return json({ error: 'Failed to create user' }, { status: 500 });
		}

		// Generate license key
		const licenseKey = generateLicenseKey();

		// Create profile
		try {
			const profile = await db.createProfile({
				id: authData.user.id,
				email: authData.user.email,
				name: name || null,
				license_key: licenseKey,
				subscription_status: 'free',
				trial_ends_at: null,
				created_at: new Date().toISOString()
			});

			return json(
				{
					success: true,
					user: authData.user,
					profile,
					session: authData.session
				},
				{ status: 201 }
			);
		} catch (profileError) {
			console.error('Profile creation error:', profileError);
			// If profile creation fails, we should probably delete the auth user
			// but Supabase doesn't easily allow that, so we'll just log the error
			return json({ error: 'Failed to create user profile' }, { status: 500 });
		}
	} catch (error) {
		console.error('Registration error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
