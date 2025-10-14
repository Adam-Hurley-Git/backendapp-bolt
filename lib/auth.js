import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single shared client instance
let sharedClient = null

function getClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    const { createClient } = require('@supabase/supabase-js')
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  // Client-side: use shared client
  if (!sharedClient) {
    sharedClient = createClientComponentClient()
  }
  return sharedClient
}

export const auth = {
  // Get the shared client
  getClient() {
    return getClient()
  },

  // Sign up with email
  async signUp(email, password, userData = {}) {
    const client = getClient()
    const { data, error } = await client.auth.signUp({
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
        // Don't fail the signup if profile creation fails
      }
    }

    return data
  },

  // Sign in with email
  async signIn(email, password) {
    const client = getClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign in with Google
  async signInWithGoogle(redirectTo = null) {
    const client = getClient()
    const { data, error } = await client.auth.signInWithOAuth({
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
    const client = getClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const client = getClient()
    const { data: { user }, error } = await client.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  async getCurrentSession() {
    const client = getClient()
    const { data: { session }, error } = await client.auth.getSession()
    if (error) throw error
    return session
  },

  // Reset password
  async resetPassword(email) {
    const client = getClient()
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return data
  },

  // Update password
  async updatePassword(newPassword) {
    const client = getClient()
    const { data, error } = await client.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return data
  },

  // Update user metadata
  async updateUser(updates) {
    const client = getClient()
    const { data, error } = await client.auth.updateUser(updates)

    if (error) throw error
    return data
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    const client = getClient()
    return client.auth.onAuthStateChange(callback)
  }
}

// Auth context helper for React (import React hooks in your component)
export const useAuthListener = () => {
  // This hook should be used in components that import React hooks
  // const [user, setUser] = useState(null)
  // const [loading, setLoading] = useState(true)
  //
  // useEffect(() => {
  //   auth.getCurrentSession().then(session => {
  //     setUser(session?.user || null)
  //     setLoading(false)
  //   })
  //
  //   const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
  //     setUser(session?.user || null)
  //     setLoading(false)
  //   })
  //
  //   return () => subscription?.unsubscribe()
  // }, [])
  //
  // return { user, loading }
}