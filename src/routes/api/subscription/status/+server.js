import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';

/**
 * GET /api/subscription/status
 * Get the current user's subscription status
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

		// Get subscription
		const subscription = await db.getSubscription(userId);

		return json({
			profile,
			subscription,
			isActive:
				profile.subscription_status === 'active' ||
				profile.subscription_status === 'trialing' ||
				(profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date())
		});
	} catch (error) {
		console.error('Subscription status error:', error);
		return json({ error: 'Failed to get subscription status' }, { status: 500 });
	}
}
