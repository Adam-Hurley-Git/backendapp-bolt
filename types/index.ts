export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  is_admin: boolean
  extension_version?: string
  last_login?: string
}

export interface Subscription {
  id: string
  user_id: string
  paddle_subscription_id?: string
  paddle_checkout_id?: string
  paddle_transaction_id?: string
  status: 'pending' | 'active' | 'canceled' | 'expired' | 'past_due'
  plan_id: string
  plan_name: string
  billing_cycle?: 'monthly' | 'yearly'
  unit_price?: number
  currency: string
  quantity: number
  next_billed_at?: string
  last_payment_at?: string
  trial_end_at?: string
  canceled_at?: string
  created_at: string
  updated_at: string
  license_key?: string
  paddle_data?: any
}

export interface PaymentAttempt {
  id: string
  user_id: string
  email: string
  plan_id: string
  amount?: number
  currency: string
  status: 'initiated' | 'completed' | 'failed' | 'abandoned'
  paddle_checkout_id?: string
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface WebhookEvent {
  id: string
  event_type: string
  paddle_event_id?: string
  processed: boolean
  data: any
  created_at: string
  processed_at?: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: string
  target_user_id?: string
  description?: string
  metadata?: any
  created_at: string
}

export interface PaddleCheckoutData {
  checkout_id: string
  customer_email: string
  product_id: string
  passthrough?: string
  prices: string[]
  customer_country?: string
  customer_postcode?: string
  marketing_consent?: boolean
}

export interface PaddleProduct {
  id: string
  name: string
  description: string
  type: 'standard' | 'custom'
  tax_category: string
  image_url?: string
  custom_data?: any
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface PaddlePrice {
  id: string
  product_id: string
  description?: string
  name?: string
  type: 'standard' | 'custom'
  billing_cycle?: {
    interval: 'day' | 'week' | 'month' | 'year'
    frequency: number
  }
  trial_period?: {
    interval: 'day' | 'week' | 'month' | 'year'
    frequency: number
  }
  tax_mode: 'account_setting' | 'external' | 'internal'
  unit_price: {
    amount: string
    currency_code: string
  }
  unit_price_overrides?: Array<{
    country_codes: string[]
    unit_price: {
      amount: string
      currency_code: string
    }
  }>
  quantity?: {
    minimum: number
    maximum: number
  }
  status: 'active' | 'archived'
  custom_data?: any
  import_meta?: any
  created_at: string
  updated_at: string
}

export interface UserWithSubscription extends Profile {
  subscriptions: Subscription[]
  payment_attempts: PaymentAttempt[]
}