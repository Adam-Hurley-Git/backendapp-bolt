import { supabase } from './supabase'
import { browser } from '$app/environment'

export const auth = {
  getClient() {
    return supabase;
  },

  async signUp(email, password, userData = {}) {
    if (!supabase) throw new Error('Database not available');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;

    // Create profile record if signup was successful and user was created
    if (data.user && !error) {
      try {
        // Call our profile creation API
        await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            fullName: userData.full_name || data.user.email?.split('@')[0] || 'Unknown User',
            avatarUrl: userData.avatar_url || null
          })
        })
      } catch (profileError) {
        console.error('Failed to create profile:', profileError)
      }
    }

    return data
  },

  async signIn(email, password) {
    if (!supabase) throw new Error('Database not available');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogle(redirectTo = null) {
    if (!browser || !supabase) return;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    if (!supabase) return null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.warn('Get user failed:', error);
      return null;
    }
  },

  async getCurrentSession() {
    if (!supabase) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.warn('Get session failed:', error);
      return null;
    }
  },

  async resetPassword(email) {
    if (!browser || !supabase) return;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return data
  },

  async updatePassword(newPassword) {
    if (!supabase) throw new Error('Database not available');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  async updateUser(updates) {
    if (!supabase) throw new Error('Database not available');
    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  }
};
