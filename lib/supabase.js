import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database helpers
export const db = {
  supabaseAdmin, // Expose supabaseAdmin for direct use in API routes
  // Profiles
  async createProfile(userData) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProfile(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    // Explicitly set updated_at to ensure it's updated
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updatesWithTimestamp)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Subscriptions
  async createSubscription(subscriptionData) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSubscription(userId) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateSubscription(subscriptionId, updates) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSubscriptionByPaddleId(paddleSubscriptionId) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('paddle_subscription_id', paddleSubscriptionId)
      .single()

    if (error) throw error
    return data
  },

  // Payment attempts
  async createPaymentAttempt(attemptData) {
    const { data, error } = await supabaseAdmin
      .from('payment_attempts')
      .insert(attemptData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updatePaymentAttempt(attemptId, updates) {
    const { data, error } = await supabaseAdmin
      .from('payment_attempts')
      .update(updates)
      .eq('id', attemptId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Webhook events
  async createWebhookEvent(eventData) {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markWebhookProcessed(eventId) {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Admin functions
  async getAllUsers(limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        subscriptions (*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  },

  async getUserWithSubscription(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        subscriptions (*),
        payment_attempts (*)
      `)
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async logAdminAction(adminId, actionType, targetUserId, description, metadata) {
    const { data, error } = await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        target_user_id: targetUserId,
        description,
        metadata
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Auth user data
  async getAuthUser(userId) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (error) throw error
    return data.user
  },

  // Onboarding functions
  async saveOnboardingProgress(userId, step, painPoint = null, featuresViewed = null) {
    const progressData = {
      user_id: userId,
      step_completed: step,
      completed_at: new Date().toISOString()
    }

    if (painPoint) {
      progressData.pain_point_selected = painPoint
    }

    if (featuresViewed) {
      progressData.features_used = featuresViewed
    }

    const { data, error } = await supabaseAdmin
      .from('onboarding_progress')
      .insert(progressData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getOnboardingProgress(userId) {
    const { data, error } = await supabaseAdmin
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Feature usage tracking
  async trackFeatureUsage(userId, featureName, actionType, metadata = null) {
    const { data, error } = await supabaseAdmin
      .from('feature_usage')
      .insert({
        user_id: userId,
        feature_name: featureName,
        action_type: actionType,
        metadata
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getFeatureUsageStats(userId) {
    const { data, error } = await supabaseAdmin
      .from('feature_usage')
      .select('feature_name, action_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Paywall interactions
  async trackPaywallInteraction(userId, interactionType, planSelected = null, metadata = null) {
    const { data, error } = await supabaseAdmin
      .from('paywall_interactions')
      .insert({
        user_id: userId,
        interaction_type: interactionType,
        plan_selected: planSelected,
        metadata
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}