import { writable } from 'svelte/store'
import { auth } from '$lib/auth'
import { browser } from '$app/environment'

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    loading: true
  })

  let authSubscription = null

  return {
    subscribe,
    initialize: async () => {
      if (!browser) return

      try {
        console.log('AuthStore: Getting initial session...')
        const session = await auth.getCurrentSession()
        console.log('AuthStore: Initial session result:', session?.user?.email || 'No session')

        set({
          user: session?.user || null,
          loading: false
        })

        // Listen for auth changes
        const { data } = auth.onAuthStateChange(async (event, session) => {
          console.log('AuthStore: Auth state changed:', event, session?.user?.email || 'No user')

          if (event === 'SIGNED_IN' && session?.user) {
            set({ user: session.user, loading: false })
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, loading: false })
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            update(state => ({ ...state, user: session.user }))
          }
        })

        authSubscription = data.subscription
      } catch (error) {
        console.error('AuthStore: Error initializing:', error)
        set({ user: null, loading: false })
      }
    },
    signOut: async () => {
      try {
        await auth.signOut()
        set({ user: null, loading: false })
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },
    cleanup: () => {
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }
}

export const authStore = createAuthStore()
