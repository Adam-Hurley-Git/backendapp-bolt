<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth'

  let profile = null
  let isOpen = false
  let dropdownRef

  $: user = $authStore.user
  $: loading = $authStore.loading

  onMount(async () => {
    const loadProfile = async () => {
      if (user) {
        try {
          const profileRes = await fetch('/api/user/profile')
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            profile = profileData.data
          }
        } catch (error) {
          console.error('UserBadge: Failed to load profile:', error)
        }
      } else {
        profile = null
      }
    }

    loadProfile()

    const handleClickOutside = (event) => {
      if (dropdownRef && !dropdownRef.contains(event.target)) {
        isOpen = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  $: if (user) {
    loadUserProfile()
  }

  async function loadUserProfile() {
    try {
      const profileRes = await fetch('/api/user/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        profile = profileData.data
      }
    } catch (error) {
      console.error('UserBadge: Failed to load profile:', error)
    }
  }

  async function handleSignOut() {
    try {
      await authStore.signOut()
      isOpen = false
      goto('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  function getInitials(name, email) {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email ? email[0].toUpperCase() : 'U'
  }

  $: displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'
  $: initials = getInitials(profile?.full_name, user?.email)

  function closeDropdown() {
    isOpen = false
  }
</script>

{#if loading}
  <div class="flex items-center gap-3">
    <div class="skeleton-avatar"></div>
  </div>
{:else if !user}
  <div class="flex items-center gap-3">
    <a href="/auth/login" class="btn btn-ghost">
      Sign In
    </a>
    <a href="/pricing" class="btn btn-primary">
      Get Started
    </a>
  </div>
{:else}
  <div class="relative" bind:this={dropdownRef}>
    <button
      on:click={() => isOpen = !isOpen}
      class="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full text-sm font-semibold">
          {#if profile?.avatar_url}
            <img
              src={profile.avatar_url}
              alt={displayName}
              class="w-8 h-8 rounded-full object-cover"
            />
          {:else}
            {initials}
          {/if}
        </div>
        <div class="hidden md:block text-left">
          <div class="text-sm font-medium text-slate-900 truncate max-w-32">
            {displayName}
          </div>
          <div class="text-xs text-slate-500 truncate max-w-32">
            {user.email}
          </div>
        </div>
      </div>
      <svg
        class="w-4 h-4 text-slate-400 transition-transform {isOpen ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if isOpen}
      <div class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-200 py-2 z-50 animate-scale-in">
        <!-- User Info -->
        <div class="px-4 py-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full text-lg font-semibold">
              {#if profile?.avatar_url}
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  class="w-12 h-12 rounded-full object-cover"
                />
              {:else}
                {initials}
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-900 truncate">
                {displayName}
              </div>
              <div class="text-sm text-slate-500 truncate">
                {user.email}
              </div>
              {#if profile?.is_admin}
                <div class="badge badge-primary mt-1">
                  Admin
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="py-2">
          <a
            href="/dashboard"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            on:click={closeDropdown}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>

          <a
            href="/profile"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            on:click={closeDropdown}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </a>

          <a
            href="/billing"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            on:click={closeDropdown}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Billing & Plans
          </a>

          {#if profile?.is_admin}
            <a
              href="/admin"
              class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              on:click={closeDropdown}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Panel
            </a>
          {/if}
        </div>

        <!-- Divider -->
        <div class="border-t border-slate-100 my-2"></div>

        <!-- Action Items -->
        <div class="py-2">
          <a
            href="/support"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            on:click={closeDropdown}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Help & Support
          </a>

          <button
            on:click={handleSignOut}
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors w-full text-left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}
