/**
 * ⚠️ WARNING: This file contains Paddle Classic API code
 *
 * This implementation uses Paddle Classic (v1) API which is deprecated.
 * Classic Paddle uses:
 * - vendor_id and vendor_auth_code authentication
 * - Classic API endpoints (e.g., /subscription/users)
 * - SHA-1 HMAC webhook signatures
 *
 * For new projects, consider migrating to Paddle Billing (v2) API which uses:
 * - Bearer token authentication
 * - RESTful endpoints (e.g., /subscriptions)
 * - HMAC-SHA256 webhook signatures with ts:body format
 * - Better error handling and modern API design
 *
 * This code is Workers-compatible (uses fetch and Web Crypto API).
 */

import {
	PADDLE_VENDOR_ID,
	PADDLE_VENDOR_AUTH_CODE,
	PADDLE_PUBLIC_KEY,
	PADDLE_WEBHOOK_SECRET
} from '$env/static/private';
import { PUBLIC_PADDLE_ENVIRONMENT } from '$env/static/public';

// Classic Paddle API URLs (deprecated but still functional)
const PADDLE_API_URL =
	PUBLIC_PADDLE_ENVIRONMENT === 'production'
		? 'https://api.paddle.com'
		: 'https://sandbox-api.paddle.com';

const PADDLE_CHECKOUT_URL =
	PUBLIC_PADDLE_ENVIRONMENT === 'production'
		? 'https://checkout.paddle.com'
		: 'https://sandbox-checkout.paddle.com';

class PaddleService {
	constructor() {
		this.vendorId = PADDLE_VENDOR_ID;
		this.vendorAuthCode = PADDLE_VENDOR_AUTH_CODE;
		this.publicKey = PADDLE_PUBLIC_KEY;
		this.webhookSecret = PADDLE_WEBHOOK_SECRET;
	}

	/**
	 * Helper function to make Paddle API requests using fetch
	 */
	async paddleFetch(endpoint, options = {}) {
		try {
			const response = await fetch(`${PADDLE_API_URL}${endpoint}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.vendorAuthCode}`,
					'Content-Type': 'application/json',
					...options.headers
				},
				body: options.body ? JSON.stringify(options.body) : undefined,
				...options
			});

			if (!response.ok) {
				const errorText = await response.text().catch(() => '');
				throw new Error(`Paddle API error ${response.status}: ${errorText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Paddle API request failed:', error.message);
			throw error;
		}
	}

	// Create a checkout session
	async createCheckout(checkoutData) {
		try {
			const data = await this.paddleFetch('/checkout/session', {
				body: {
					vendor_id: this.vendorId,
					...checkoutData
				}
			});

			return data;
		} catch (error) {
			console.error('Paddle checkout creation failed:', error.message);
			throw new Error('Failed to create checkout session');
		}
	}

	// Get subscription details
	async getSubscription(subscriptionId) {
		try {
			const data = await this.paddleFetch('/subscription/users', {
				body: {
					vendor_id: this.vendorId,
					vendor_auth_code: this.vendorAuthCode,
					subscription_id: subscriptionId
				}
			});

			return data;
		} catch (error) {
			console.error('Failed to get subscription:', error.message);
			throw new Error('Failed to retrieve subscription');
		}
	}

	// Cancel subscription
	async cancelSubscription(subscriptionId) {
		try {
			const data = await this.paddleFetch('/subscription/users_cancel', {
				body: {
					vendor_id: this.vendorId,
					vendor_auth_code: this.vendorAuthCode,
					subscription_id: subscriptionId
				}
			});

			return data;
		} catch (error) {
			console.error('Failed to cancel subscription:', error.message);
			throw new Error('Failed to cancel subscription');
		}
	}

	// Update subscription
	async updateSubscription(subscriptionId, updates) {
		try {
			const data = await this.paddleFetch('/subscription/users/update', {
				body: {
					vendor_id: this.vendorId,
					vendor_auth_code: this.vendorAuthCode,
					subscription_id: subscriptionId,
					...updates
				}
			});

			return data;
		} catch (error) {
			console.error('Failed to update subscription:', error.message);
			throw new Error('Failed to update subscription');
		}
	}

	// Get payment history
	async getPayments(subscriptionId) {
		try {
			const data = await this.paddleFetch('/subscription/payments', {
				body: {
					vendor_id: this.vendorId,
					vendor_auth_code: this.vendorAuthCode,
					subscription_id: subscriptionId
				}
			});

			return data;
		} catch (error) {
			console.error('Failed to get payments:', error.message);
			throw new Error('Failed to retrieve payments');
		}
	}

	// Get all products
	async getProducts() {
		try {
			const data = await this.paddleFetch('/product/get_products', {
				body: {
					vendor_id: this.vendorId,
					vendor_auth_code: this.vendorAuthCode
				}
			});

			return data;
		} catch (error) {
			console.error('Failed to get products:', error.message);
			throw new Error('Failed to retrieve products');
		}
	}

	// Get product plans
	async getProductPlans(productId) {
		try {
			const data = await this.paddleFetch('/subscription/plans', {
				body: {
					vendor_id: this.vendorId,
					vendor_auth_code: this.vendorAuthCode,
					product_id: productId
				}
			});

			return data;
		} catch (error) {
			console.error('Failed to get product plans:', error.message);
			throw new Error('Failed to retrieve product plans');
		}
	}

	/**
	 * Verify webhook signature using Web Crypto API (Cloudflare Workers compatible)
	 * This uses SHA-1 HMAC as per Paddle Classic webhook verification
	 */
	async verifyWebhookSignature(body, signature) {
		try {
			const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

			// Convert webhook secret to bytes
			const encoder = new TextEncoder();
			const secretBytes = encoder.encode(this.webhookSecret);
			const messageBytes = encoder.encode(bodyString);

			// Import the secret as a key for HMAC
			const key = await crypto.subtle.importKey(
				'raw',
				secretBytes,
				{ name: 'HMAC', hash: 'SHA-1' },
				false,
				['sign']
			);

			// Sign the message
			const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageBytes);

			// Convert to hex string
			const hashArray = Array.from(new Uint8Array(signatureBuffer));
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

			// Constant-time comparison to prevent timing attacks
			return this.constantTimeEqual(hashHex, signature);
		} catch (error) {
			console.error('Webhook signature verification failed:', error);
			return false;
		}
	}

	/**
	 * Constant-time string comparison to prevent timing attacks
	 */
	constantTimeEqual(a, b) {
		if (a.length !== b.length) return false;
		let result = 0;
		for (let i = 0; i < a.length; i++) {
			result |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return result === 0;
	}

	// Generate checkout URL for frontend
	generateCheckoutUrl(planId, userEmail, metadata = {}) {
		const params = new URLSearchParams({
			vendor: this.vendorId,
			product: planId,
			email: userEmail,
			passthrough: JSON.stringify(metadata)
		});

		return `${PADDLE_CHECKOUT_URL}/checkout.html?${params.toString()}`;
	}

	// Generate subscription management URL
	generateManagementUrl(subscriptionId) {
		return `${PADDLE_CHECKOUT_URL}/subscription/${subscriptionId}/manage`;
	}
}

export const paddle = new PaddleService();

// Predefined plans (you'll need to update these with your actual Paddle plan IDs)
export const PADDLE_PLANS = {
	BASIC_MONTHLY: {
		id: 'your_basic_monthly_plan_id',
		name: 'Basic Monthly',
		price: 9.99,
		currency: 'USD',
		billing_cycle: 'monthly',
		features: ['Feature 1', 'Feature 2', 'Feature 3']
	},
	BASIC_YEARLY: {
		id: 'your_basic_yearly_plan_id',
		name: 'Basic Yearly',
		price: 99.99,
		currency: 'USD',
		billing_cycle: 'yearly',
		features: ['Feature 1', 'Feature 2', 'Feature 3', '2 months free']
	},
	PREMIUM_MONTHLY: {
		id: 'your_premium_monthly_plan_id',
		name: 'Premium Monthly',
		price: 19.99,
		currency: 'USD',
		billing_cycle: 'monthly',
		features: ['All Basic features', 'Premium Feature 1', 'Premium Feature 2', 'Priority Support']
	},
	PREMIUM_YEARLY: {
		id: 'your_premium_yearly_plan_id',
		name: 'Premium Yearly',
		price: 199.99,
		currency: 'USD',
		billing_cycle: 'yearly',
		features: [
			'All Basic features',
			'Premium Feature 1',
			'Premium Feature 2',
			'Priority Support',
			'2 months free'
		]
	}
};
