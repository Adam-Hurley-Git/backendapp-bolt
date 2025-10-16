import { createBrowserClient } from '@supabase/ssr'
import { browser } from '$app/environment'

// Get environment variables with fallbacks
const getEnvVar = (key) => {
  if (browser && typeof window !== 'undefined') {
    // In browser, try window.env or import.meta.env
    return window?.env?.[key] || import.meta.env?.[key] || '';
  }
  return '';
};

const PUBLIC_SUPABASE_URL = getEnvVar('PUBLIC_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
const PUBLIC_SUPABASE_ANON_KEY = getEnvVar('PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

// Client-side Supabase client using SSR-compatible browser client
// This ensures cookies are used for session storage, which syncs with the server
export const supabase = browser && PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY
  ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
  : null

// Database helpers
export const db = {
  // Profiles
  async createProfile(userData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatesWithTimestamp)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Subscriptions
  async getSubscription(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
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

    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert(progressData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getOnboardingProgress(userId) {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Feature usage tracking
  async trackFeatureUsage(userId, featureName, actionType, metadata = null) {
    const { data, error } = await supabase
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

  // Paywall interactions
  async trackPaywallInteraction(userId, interactionType, planSelected = null, metadata = null) {
    const { data, error } = await supabase
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
