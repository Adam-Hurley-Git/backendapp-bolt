import { json, text } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { paddle } from '$lib/server/paddle';

/**
 * POST /api/webhooks/paddle
 * Handle Paddle webhook events
 */
export async function POST({ request }) {
	try {
		// Get raw body for signature verification
		const rawBody = await request.text();
		const signature = request.headers.get('paddle-signature');

		// Verify webhook signature
		if (!paddle.verifyWebhookSignature(rawBody, signature)) {
			console.error('Invalid webhook signature');
			return json({ error: 'Invalid signature' }, { status: 401 });
		}

		const event = JSON.parse(rawBody);

		// Log webhook event
		await db.createWebhookEvent({
			event_type: event.alert_name || event.event_type,
			payload: event,
			processed: false
		});

		// Handle different event types
		switch (event.alert_name || event.event_type) {
			case 'subscription_created':
				await handleSubscriptionCreated(event);
				break;

			case 'subscription_updated':
				await handleSubscriptionUpdated(event);
				break;

			case 'subscription_cancelled':
				await handleSubscriptionCancelled(event);
				break;

			case 'subscription_payment_succeeded':
				await handlePaymentSucceeded(event);
				break;

			case 'subscription_payment_failed':
				await handlePaymentFailed(event);
				break;

			default:
				console.log('Unhandled webhook event:', event.alert_name || event.event_type);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Webhook processing error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(event) {
	try {
		const passthrough = JSON.parse(event.passthrough || '{}');
		const userId = passthrough.userId;

		if (!userId) {
			console.error('No userId in passthrough:', passthrough);
			return;
		}

		// Create subscription record
		await db.createSubscription({
			user_id: userId,
			paddle_subscription_id: event.subscription_id,
			paddle_plan_id: event.subscription_plan_id,
			status: event.status,
			next_payment_date: event.next_bill_date,
			cancel_url: event.cancel_url,
			update_url: event.update_url
		});

		// Update profile
		await db.updateProfile(userId, {
			subscription_status: 'active',
			paddle_customer_id: event.user_id
		});
	} catch (error) {
		console.error('Error handling subscription_created:', error);
		throw error;
	}
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(event) {
	try {
		const subscription = await db.getSubscriptionByPaddleId(event.subscription_id);

		if (!subscription) {
			console.error('Subscription not found:', event.subscription_id);
			return;
		}

		// Update subscription
		await db.updateSubscription(subscription.id, {
			status: event.status,
			paddle_plan_id: event.subscription_plan_id,
			next_payment_date: event.next_bill_date
		});

		// Update profile if status changed
		if (event.status) {
			await db.updateProfile(subscription.user_id, {
				subscription_status: event.status
			});
		}
	} catch (error) {
		console.error('Error handling subscription_updated:', error);
		throw error;
	}
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(event) {
	try {
		const subscription = await db.getSubscriptionByPaddleId(event.subscription_id);

		if (!subscription) {
			console.error('Subscription not found:', event.subscription_id);
			return;
		}

		// Update subscription
		await db.updateSubscription(subscription.id, {
			status: 'cancelled',
			cancel_at: event.cancellation_effective_date || new Date().toISOString()
		});

		// Update profile
		await db.updateProfile(subscription.user_id, {
			subscription_status: 'cancelled'
		});
	} catch (error) {
		console.error('Error handling subscription_cancelled:', error);
		throw error;
	}
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(event) {
	try {
		const subscription = await db.getSubscriptionByPaddleId(event.subscription_id);

		if (!subscription) {
			console.error('Subscription not found:', event.subscription_id);
			return;
		}

		// Create payment attempt record
		await db.createPaymentAttempt({
			user_id: subscription.user_id,
			subscription_id: subscription.id,
			paddle_payment_id: event.order_id || event.payment_id,
			amount: event.sale_gross || event.balance_gross,
			currency: event.currency,
			status: 'succeeded',
			payment_date: event.event_time || new Date().toISOString()
		});

		// Update subscription next payment date
		if (event.next_bill_date) {
			await db.updateSubscription(subscription.id, {
				next_payment_date: event.next_bill_date,
				status: 'active'
			});
		}

		// Ensure profile is active
		await db.updateProfile(subscription.user_id, {
			subscription_status: 'active'
		});
	} catch (error) {
		console.error('Error handling payment_succeeded:', error);
		throw error;
	}
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(event) {
	try {
		const subscription = await db.getSubscriptionByPaddleId(event.subscription_id);

		if (!subscription) {
			console.error('Subscription not found:', event.subscription_id);
			return;
		}

		// Create payment attempt record
		await db.createPaymentAttempt({
			user_id: subscription.user_id,
			subscription_id: subscription.id,
			paddle_payment_id: event.order_id || event.payment_id,
			amount: event.amount || 0,
			currency: event.currency || 'USD',
			status: 'failed',
			payment_date: event.event_time || new Date().toISOString(),
			error_message: event.payment_failure_reason || 'Payment failed'
		});

		// Update subscription status if needed
		if (event.status) {
			await db.updateSubscription(subscription.id, {
				status: event.status
			});

			await db.updateProfile(subscription.user_id, {
				subscription_status: event.status
			});
		}
	} catch (error) {
		console.error('Error handling payment_failed:', error);
		throw error;
	}
}
