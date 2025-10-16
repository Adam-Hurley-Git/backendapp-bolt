import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';

/**
 * GET /api/license/info
 * Get license information for the current user
 */
export async function GET({ locals }) {
	try {
		const session = await locals.getSession();

		if (!session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		// Get user profile
		const profile = await db.getProfile(userId);

		if (!profile) {
			return json({ error: 'Profile not found' }, { status: 404 });
		}

		return json({
			licenseKey: profile.license_key,
			subscriptionStatus: profile.subscription_status,
			trialEndsAt: profile.trial_ends_at,
			email: profile.email
		});
	} catch (error) {
		console.error('License info error:', error);
		return json({ error: 'Failed to get license info' }, { status: 500 });
	}
}
