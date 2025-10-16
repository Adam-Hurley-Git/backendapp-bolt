import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { validateLicenseKeyFormat } from '$lib/utils/licenseGenerator';

/**
 * POST /api/license/verify
 * Verify a license key and return subscription status
 * This endpoint is called by the Chrome extension
 */
export async function POST({ request }) {
	try {
		const { licenseKey } = await request.json();

		// Validate input
		if (!licenseKey) {
			return json({ error: 'License key is required' }, { status: 400 });
		}

		// Validate license key format
		if (!validateLicenseKeyFormat(licenseKey)) {
			return json(
				{
					valid: false,
					error: 'Invalid license key format'
				},
				{ status: 400 }
			);
		}

		// Find user by license key
		const { data: profiles, error } = await db.supabaseAdmin
			.from('profiles')
			.select('*, subscriptions(*)')
			.eq('license_key', licenseKey)
			.single();

		if (error || !profiles) {
			return json(
				{
					valid: false,
					error: 'License key not found'
				},
				{ status: 404 }
			);
		}

		const profile = profiles;
		const subscription = profile.subscriptions?.[0] || null;

		// Check if subscription is active
		const isActive =
			profile.subscription_status === 'active' ||
			profile.subscription_status === 'trialing' ||
			(profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

		return json({
			valid: isActive,
			userId: profile.id,
			email: profile.email,
			subscriptionStatus: profile.subscription_status,
			trialEndsAt: profile.trial_ends_at,
			subscription: subscription
				? {
						status: subscription.status,
						nextPaymentDate: subscription.next_payment_date,
						planId: subscription.paddle_plan_id
					}
				: null,
			features: getFeaturesBySubscriptionStatus(profile.subscription_status)
		});
	} catch (error) {
		console.error('License verification error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * Helper function to determine available features based on subscription status
 */
function getFeaturesBySubscriptionStatus(status) {
	const freeFeatures = ['basic_calendar', 'basic_colors'];

	const premiumFeatures = [
		'basic_calendar',
		'basic_colors',
		'advanced_colors',
		'custom_themes',
		'event_templates',
		'sync_settings',
		'priority_support'
	];

	switch (status) {
		case 'active':
		case 'trialing':
			return premiumFeatures;
		case 'free':
		case 'cancelled':
		case 'expired':
		default:
			return freeFeatures;
	}
}
