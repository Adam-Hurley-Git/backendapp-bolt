import { json } from '@sveltejs/kit';

/**
 * GET /api/auth/session
 * Get the current session
 */
export async function GET({ locals }) {
	try {
		const session = await locals.getSession();

		if (!session) {
			return json({ session: null, user: null });
		}

		return json({
			session,
			user: session.user
		});
	} catch (error) {
		console.error('Session error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
