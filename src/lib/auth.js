import { supabase } from './supabase'
import { browser } from '$app/environment'

export const auth = {
  // Get the shared client
  getClient() {
    return supabase
  },

  // Sign up with email
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    if (error) throw error

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

  // Sign in with email
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign in with Google
  async signInWithGoogle(redirectTo = null) {
    if (!browser) return

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Reset password
  async resetPassword(email) {
    if (!browser) return

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return data
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return data
  },

  // Update user metadata
  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates)

    if (error) throw error
    return data
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
