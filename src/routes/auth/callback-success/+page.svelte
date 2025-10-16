<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { auth } from '$lib/auth'

  onMount(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...')

        // Wait a bit for the URL hash to be processed by Supabase
        await new Promise(resolve => setTimeout(resolve, 500))

        const session = await auth.getCurrentSession()
        console.log('Session check result:', session?.user?.email || 'No session')

        if (session?.user) {
          console.log('Authentication successful, redirecting to dashboard')
          goto('/dashboard')
        } else {
          console.log('No session found, redirecting to login')
          goto('/auth/login')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        goto('/auth/login')
      }
    }

    // Small delay to ensure URL fragment is processed
    const timer = setTimeout(handleAuthCallback, 100)

    return () => clearTimeout(timer)
  })
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50">
  <div class="text-center">
    <div class="spinner spinner-lg text-primary-600 mx-auto mb-4"></div>
    <p class="text-slate-600">Completing sign in...</p>
  </div>
</div>
