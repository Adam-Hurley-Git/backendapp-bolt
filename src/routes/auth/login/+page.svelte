<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth'
  import { auth } from '$lib/auth'

  let email = ''
  let password = ''
  let loading = false
  let error = ''

  $: user = $authStore.user
  $: authLoading = $authStore.loading

  onMount(() => {
    // Redirect to dashboard if already authenticated
    if (!authLoading && user) {
      goto('/dashboard')
    }
  })

  // Reactive statement to redirect when auth state changes
  $: if (!authLoading && user) {
    goto('/dashboard')
  }

  async function handleEmailLogin(e) {
    e.preventDefault()
    loading = true
    error = ''

    try {
      const { data, error: signInError } = await auth.signIn(email, password)
      if (signInError) throw signInError

      console.log('Email login successful:', data.user?.email)
      // The auth context will handle the redirect automatically
    } catch (err) {
      console.error('Email login error:', err)
      error = err.message || 'Failed to sign in'
    } finally {
      loading = false
    }
  }

  async function handleGoogleLogin() {
    loading = true
    error = ''

    try {
      console.log('Initiating Google login...')
      await auth.signInWithGoogle()
      console.log('Google login initiated successfully')
    } catch (err) {
      console.error('Google login error:', err)
      error = 'Failed to sign in with Google'
      loading = false
    }
  }
</script>

{#if authLoading}
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="spinner spinner-lg text-primary-600"></div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center mb-8">
        <a href="/" class="inline-flex items-center group">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mr-3 shadow-elevated group-hover:shadow-high transition-all duration-300">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-2xl font-display font-bold text-slate-900">CalendarExtension</span>
        </a>
      </div>
      <div class="text-center">
        <h2 class="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-4">
          Welcome back
        </h2>
        <p class="text-lg text-slate-600 leading-relaxed">
          Sign in to access your dashboard and manage your extension settings
        </p>
        <p class="mt-2 text-sm text-slate-500">
          New to CalendarExtension?{' '}
          <a href="/pricing" class="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2">
            Start your free trial
          </a>
        </p>
      </div>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card card-elevated bg-white/80 backdrop-blur-sm border-white/20 shadow-elevated">
        <div class="card-body">
          <form class="space-y-6" on:submit={handleEmailLogin}>
            <div>
              <label for="email" class="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                bind:value={email}
                class="input focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label for="password" class="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                bind:value={password}
                class="input focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your password"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm">
                <a href="/auth/forgot-password" class="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2">
                  Forgot your password?
                </a>
              </div>
            </div>

            {#if error}
              <div class="rounded-xl bg-danger-50 border border-danger-200 p-4">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-danger-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm text-danger-800">{error}</div>
                </div>
              </div>
            {/if}

            <div>
              <button
                type="submit"
                disabled={loading}
                class="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-smooth hover:shadow-elevated transition-all duration-200"
              >
                {#if loading}
                  <div class="flex items-center justify-center">
                    <div class="spinner spinner-sm mr-2 text-white"></div>
                    Signing in...
                  </div>
                {:else}
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign in to your account
                {/if}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                on:click={handleGoogleLogin}
                disabled={loading}
                class="w-full btn btn-outline btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xs hover:shadow-smooth transition-all duration-200"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-200 text-center">
            <p class="text-sm text-slate-600">
              New to CalendarExtension?{' '}
              <a href="/pricing" class="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2">
                Start your free trial
              </a>
            </p>
            <p class="mt-2 text-xs text-slate-500">
              By continuing, you agree to our{' '}
              <a href="/terms" class="text-slate-600 hover:text-slate-900 underline underline-offset-2">Terms</a> and{' '}
              <a href="/privacy" class="text-slate-600 hover:text-slate-900 underline underline-offset-2">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
