import axios from 'axios'
import crypto from 'crypto'

const PADDLE_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com'

const PADDLE_CHECKOUT_URL = process.env.NODE_ENV === 'production'
  ? 'https://checkout.paddle.com'
  : 'https://sandbox-checkout.paddle.com'

class PaddleService {
  constructor() {
    this.vendorId = process.env.PADDLE_VENDOR_ID
    this.vendorAuthCode = process.env.PADDLE_VENDOR_AUTH_CODE
    this.publicKey = process.env.PADDLE_PUBLIC_KEY
    this.webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
  }

  // Create a checkout session
  async createCheckout(checkoutData) {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/checkout/session`, {
        vendor_id: this.vendorId,
        ...checkoutData
      }, {
        headers: {
          'Authorization': `Bearer ${this.vendorAuthCode}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('Paddle checkout creation failed:', error.response?.data || error.message)
      throw new Error('Failed to create checkout session')
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/subscription/users`, {
        vendor_id: this.vendorId,
        vendor_auth_code: this.vendorAuthCode,
        subscription_id: subscriptionId
      })

      return response.data
    } catch (error) {
      console.error('Failed to get subscription:', error.response?.data || error.message)
      throw new Error('Failed to retrieve subscription')
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/subscription/users_cancel`, {
        vendor_id: this.vendorId,
        vendor_auth_code: this.vendorAuthCode,
        subscription_id: subscriptionId
      })

      return response.data
    } catch (error) {
      console.error('Failed to cancel subscription:', error.response?.data || error.message)
      throw new Error('Failed to cancel subscription')
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/subscription/users/update`, {
        vendor_id: this.vendorId,
        vendor_auth_code: this.vendorAuthCode,
        subscription_id: subscriptionId,
        ...updates
      })

      return response.data
    } catch (error) {
      console.error('Failed to update subscription:', error.response?.data || error.message)
      throw new Error('Failed to update subscription')
    }
  }

  // Get payment history
  async getPayments(subscriptionId) {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/subscription/payments`, {
        vendor_id: this.vendorId,
        vendor_auth_code: this.vendorAuthCode,
        subscription_id: subscriptionId
      })

      return response.data
    } catch (error) {
      console.error('Failed to get payments:', error.response?.data || error.message)
      throw new Error('Failed to retrieve payments')
    }
  }

  // Get all products
  async getProducts() {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/product/get_products`, {
        vendor_id: this.vendorId,
        vendor_auth_code: this.vendorAuthCode
      })

      return response.data
    } catch (error) {
      console.error('Failed to get products:', error.response?.data || error.message)
      throw new Error('Failed to retrieve products')
    }
  }

  // Get product plans
  async getProductPlans(productId) {
    try {
      const response = await axios.post(`${PADDLE_API_URL}/subscription/plans`, {
        vendor_id: this.vendorId,
        vendor_auth_code: this.vendorAuthCode,
        product_id: productId
      })

      return response.data
    } catch (error) {
      console.error('Failed to get product plans:', error.response?.data || error.message)
      throw new Error('Failed to retrieve product plans')
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body, signature) {
    try {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body)

      // Paddle uses PHP serialization, so we need to handle it differently
      const hash = crypto
        .createHash('sha1')
        .update(bodyString + this.webhookSecret)
        .digest('hex')

      return hash === signature
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }

  // Generate checkout URL for frontend
  generateCheckoutUrl(planId, userEmail, metadata = {}) {
    const params = new URLSearchParams({
      vendor: this.vendorId,
      product: planId,
      email: userEmail,
      passthrough: JSON.stringify(metadata),
      success_url: `${process.env.NEXTAUTH_URL}/billing/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing/cancel`
    })

    return `${PADDLE_CHECKOUT_URL}/checkout.html?${params.toString()}`
  }

  // Generate subscription management URL
  generateManagementUrl(subscriptionId) {
    return `${PADDLE_CHECKOUT_URL}/subscription/${subscriptionId}/manage`
  }
}

export const paddle = new PaddleService()

// Predefined plans (you'll need to update these with your actual Paddle plan IDs)
export const PADDLE_PLANS = {
  BASIC_MONTHLY: {
    id: 'your_basic_monthly_plan_id',
    name: 'Basic Monthly',
    price: 9.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3'
    ]
  },
  BASIC_YEARLY: {
    id: 'your_basic_yearly_plan_id',
    name: 'Basic Yearly',
    price: 99.99,
    currency: 'USD',
    billing_cycle: 'yearly',
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
      '2 months free'
    ]
  },
  PREMIUM_MONTHLY: {
    id: 'your_premium_monthly_plan_id',
    name: 'Premium Monthly',
    price: 19.99,
    currency: 'USD',
    billing_cycle: 'monthly',
    features: [
      'All Basic features',
      'Premium Feature 1',
      'Premium Feature 2',
      'Priority Support'
    ]
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
}

export default paddle