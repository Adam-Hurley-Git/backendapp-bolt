import { createBrowserClient } from '@supabase/ssr';
import { browser } from '$app/environment';

const SUPABASE_URL = 'https://mopgxvxiiuxhwmhwvkmb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcGd4dnhpaXV4aHdtaHd2a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjIxNTAsImV4cCI6MjA3NjE5ODE1MH0.j2he26S2IHeBBaWVS-CiR1c__cR6sJcMuT9IYZfPfAM';

export const supabase = browser ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export const db = {
  async createProfile(userData) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(userData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  },

  async getProfile(userId) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  },

  async updateProfile(userId, updates) {
    if (!supabase) return null;
    try {
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('profiles')
        .update(updatesWithTimestamp)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  },

  async getSubscription(userId) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') return null;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  },

  async saveOnboardingProgress(userId, step, painPoint = null, featuresViewed = null) {
    if (!supabase) return null;
    try {
      const progressData = {
        user_id: userId,
        step_completed: step,
        completed_at: new Date().toISOString()
      };
      if (painPoint) progressData.pain_point_selected = painPoint;
      if (featuresViewed) progressData.features_used = featuresViewed;

      const { data, error } = await supabase
        .from('onboarding_progress')
        .insert(progressData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  },

  async getOnboardingProgress(userId) {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Database operation failed:', error);
      return [];
    }
  },

  async trackFeatureUsage(userId, featureName, actionType, metadata = null) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('feature_usage')
        .insert({
          user_id: userId,
          feature_name: featureName,
          action_type: actionType,
          metadata
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  },

  async trackPaywallInteraction(userId, interactionType, planSelected = null, metadata = null) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('paywall_interactions')
        .insert({
          user_id: userId,
          interaction_type: interactionType,
          plan_selected: planSelected,
          metadata
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Database operation failed:', error);
      return null;
    }
  }
};
