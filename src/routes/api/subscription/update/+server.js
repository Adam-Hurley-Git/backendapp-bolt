import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { paddle } from '$lib/server/paddle';

/**
 * POST /api/subscription/update
 * Update the current user's subscription plan
 */
export async function POST({ request, locals }) {
	try {
		const session = await locals.getSession();

		if (!session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { newPlanId } = await request.json();

		if (!newPlanId) {
			return json({ error: 'New plan ID is required' }, { status: 400 });
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

		// Update subscription in Paddle
		const result = await paddle.updateSubscription(subscription.paddle_subscription_id, {
			plan_id: newPlanId,
			prorate: true
		});

		return json({
			success: true,
			message: 'Subscription updated successfully',
			result
		});
	} catch (error) {
		console.error('Subscription update error:', error);
		return json({ error: 'Failed to update subscription' }, { status: 500 });
	}
}
