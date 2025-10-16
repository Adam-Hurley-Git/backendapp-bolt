import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { paddle } from '$lib/server/paddle';

/**
 * POST /api/subscription/cancel
 * Cancel the current user's subscription
 */
export async function POST({ locals }) {
	try {
		const session = await locals.getSession();

		if (!session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		// Get user's subscription
		const subscription = await db.getSubscription(userId);

		if (!subscription) {
			return json({ error: 'No active subscription found' }, { status: 404 });
		}

		if (!subscription.paddle_subscription_id) {
			return json({ error: 'No Paddle subscription ID found' }, { status: 400 });
		}

		// Cancel subscription in Paddle
		await paddle.cancelSubscription(subscription.paddle_subscription_id);

		// Update subscription in database
		await db.updateSubscription(subscription.id, {
			status: 'cancelled',
			cancel_at: new Date().toISOString()
		});

		// Update profile
		await db.updateProfile(userId, {
			subscription_status: 'cancelled'
		});

		return json({
			success: true,
			message: 'Subscription cancelled successfully'
		});
	} catch (error) {
		console.error('Subscription cancellation error:', error);
		return json({ error: 'Failed to cancel subscription' }, { status: 500 });
	}
}
