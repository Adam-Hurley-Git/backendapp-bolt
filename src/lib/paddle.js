// Paddle plans configuration
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
