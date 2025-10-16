import { json } from '@sveltejs/kit';

/**
 * POST /api/auth/logout
 * Logout the current user
 */
export async function POST({ locals }) {
	try {
		const { error } = await locals.supabase.auth.signOut();

		if (error) {
			console.error('Logout error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		return json({ success: true, message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
