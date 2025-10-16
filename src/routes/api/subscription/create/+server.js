import { json } from '@sveltejs/kit';
import { paddle } from '$lib/server/paddle';

/**
 * POST /api/subscription/create
 * Create a Paddle checkout session
 */
export async function POST({ request, locals, url }) {
	try {
		const session = await locals.getSession();

		if (!session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { planId, successUrl, cancelUrl } = await request.json();

		if (!planId) {
			return json({ error: 'Plan ID is required' }, { status: 400 });
		}

		const userId = session.user.id;
		const userEmail = session.user.email;

		// Create checkout session
		// Use url.origin instead of request.headers.get('origin') for Cloudflare Workers compatibility
		const checkoutData = {
			product_id: planId,
			customer_email: userEmail,
			passthrough: JSON.stringify({ userId }),
			success_url: successUrl || `${url.origin}/subscription/success`,
			cancel_url: cancelUrl || `${url.origin}/subscription/cancel`
		};

		const checkout = await paddle.createCheckout(checkoutData);

		return json({
			success: true,
			checkoutUrl: checkout.url,
			checkoutId: checkout.id
		});
	} catch (error) {
		console.error('Checkout creation error:', error);
		return json({ error: 'Failed to create checkout session' }, { status: 500 });
	}
}
