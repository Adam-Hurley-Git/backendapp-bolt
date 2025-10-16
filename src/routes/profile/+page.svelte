<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';
  import { auth } from '$lib/auth.js';
  import UserBadge from '$lib/components/UserBadge.svelte';

  let user = null;
  let profile = null;
  let loading = true;
  let saving = false;
  let message = null;
  let formData = {
    full_name: '',
    avatar_url: '',
    bio: '',
    website: '',
    location: '',
    phone: ''
  };

  onMount(() => {
    const unsubscribe = authStore.subscribe(async ($authStore) => {
      const { user: authUser, loading: authLoading } = $authStore;

      // Redirect to login if not authenticated
      if (!authLoading && !authUser) {
        goto('/auth/login');
        return;
      }

      // Load user data if authenticated
      if (authUser && !authLoading) {
        try {
          loading = true;
          user = authUser;

          // Load user profile
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.data) {
              profile = profileData.data;
              formData = {
                full_name: profileData.data.full_name || '',
                avatar_url: profileData.data.avatar_url || '',
                bio: profileData.data.bio || '',
                website: profileData.data.website || '',
                location: profileData.data.location || '',
                phone: profileData.data.phone || ''
              };
            }
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          loading = false;
        }
      }
    });

    return unsubscribe;
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    formData = {
      ...formData,
      [name]: value
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    saving = true;
    message = null;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        profile = updatedProfile.data;
        message = { type: 'success', text: 'Profile updated successfully!' };
      } else {
        const error = await response.json();
        message = { type: 'error', text: error.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      message = { type: 'error', text: 'An error occurred while updating your profile' };
    } finally {
      saving = false;
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE'
      });

      if (response.ok) {
        await authStore.signOut();
        goto('/');
      } else {
        const error = await response.json();
        message = { type: 'error', text: error.message || 'Failed to delete account' };
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      message = { type: 'error', text: 'An error occurred while deleting your account' };
    }
  }

  $: displayInitial = (formData.full_name || user?.email || 'U').charAt(0).toUpperCase();
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="spinner spinner-lg text-primary-600"></div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div class="container-wide">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <a href="/" class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span class="text-lg font-display font-bold text-slate-900">CalendarExtension</span>
            </a>
          </div>

          <div class="flex items-center gap-6">
            <nav class="hidden md:flex items-center gap-6">
              <a href="/dashboard" class="nav-link">Dashboard</a>
              <a href="/billing" class="nav-link">Billing</a>
              <a href="/profile" class="nav-link nav-link-active">Settings</a>
              <a href="/support" class="nav-link">Support</a>
            </nav>
            <UserBadge />
          </div>
        </div>
      </div>
    </nav>

    <div class="container-wide section-padding-sm">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <a href="/dashboard" class="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Back to dashboard">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 class="text-3xl font-display font-bold text-slate-900">Profile Settings</h1>
            <p class="text-lg text-slate-600 mt-1">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <div class="max-w-4xl">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Profile Form -->
          <div class="lg:col-span-2">
            <form on:submit={handleSubmit} class="space-y-6">
              <!-- Basic Information -->
              <div class="card card-elevated">
                <div class="card-header">
                  <h3 class="text-lg font-display font-semibold text-slate-900">Basic Information</h3>
                </div>
                <div class="card-body space-y-6">
                  <!-- Avatar Section -->
                  <div>
                    <label class="label">Profile Picture</label>
                    <div class="flex items-center gap-6">
                      <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full text-2xl font-semibold">
                        {#if formData.avatar_url}
                          <img
                            src={formData.avatar_url}
                            alt="Profile"
                            class="w-20 h-20 rounded-full object-cover"
                          />
                        {:else}
                          {displayInitial}
                        {/if}
                      </div>
                      <div class="flex-1">
                        <input
                          type="url"
                          name="avatar_url"
                          value={formData.avatar_url}
                          on:input={handleInputChange}
                          class="input"
                          placeholder="https://example.com/avatar.jpg"
                        />
                        <p class="text-xs text-slate-500 mt-1">
                          Enter a URL to your profile picture
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label for="full_name" class="label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        on:input={handleInputChange}
                        class="input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label for="email" class="label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        class="input bg-slate-100 text-slate-600 cursor-not-allowed"
                      />
                      <p class="text-xs text-slate-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div>
                    <label for="bio" class="label">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      on:input={handleInputChange}
                      rows={3}
                      class="input resize-none"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label for="website" class="label">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        on:input={handleInputChange}
                        class="input"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label for="location" class="label">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        on:input={handleInputChange}
                        class="input"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="phone" class="label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      on:input={handleInputChange}
                      class="input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if saving}
                    <div class="spinner spinner-sm mr-2"></div>
                    Saving...
                  {:else}
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>

            <!-- Message Display -->
            {#if message}
              <div class={`mt-6 p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-success-50 border-success-200 text-success-800'
                  : 'bg-danger-50 border-danger-200 text-danger-800'
              }`}>
                <div class="flex items-center">
                  {#if message.type === 'success'}
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M5 13l4 4L19 7" />
                    </svg>
                  {:else}
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  {/if}
                  {message.text}
                </div>
              </div>
            {/if}
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Account Info -->
            <div class="card card-elevated">
              <div class="card-header">
                <h3 class="text-lg font-display font-semibold text-slate-900">Account Info</h3>
              </div>
              <div class="card-body">
                <div class="space-y-4">
                  <div>
                    <p class="text-sm font-medium text-slate-600">Account ID</p>
                    <p class="text-xs font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded mt-1">
                      {user?.id || 'Loading...'}
                    </p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-slate-600">Member Since</p>
                    <p class="text-sm text-slate-900 mt-1">
                      {#if profile?.user_created_at}
                        {new Date(profile.user_created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      {:else}
                        N/A
                      {/if}
                    </p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-slate-600">Last Updated</p>
                    <p class="text-sm text-slate-900 mt-1">
                      {#if profile?.updated_at}
                        {new Date(profile.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      {:else}
                        N/A
                      {/if}
                    </p>
                  </div>

                  {#if profile?.is_admin}
                    <div>
                      <div class="badge badge-primary">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Account
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Security -->
            <div class="card card-elevated">
              <div class="card-header">
                <h3 class="text-lg font-display font-semibold text-slate-900">Security</h3>
              </div>
              <div class="card-body">
                <div class="space-y-3">
                  <!-- Only show change password for email/password users, not OAuth users -->
                  {#if user?.app_metadata?.provider === 'email'}
                    <a href="/profile/change-password" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2m-2 4V3a2 2 0 00-2-2H9a2 2 0 00-2 2v8.5m4.5-1.206a11.955 11.955 0 00-4.5 2.706m0-5V3a2 2 0 012-2h1.5a2 2 0 012 2v8.5M12 7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-900">Change Password</p>
                        <p class="text-xs text-slate-500">Update your account password</p>
                      </div>
                    </a>
                  {/if}

                  <!-- Show auth provider info for OAuth users -->
                  {#if user?.app_metadata?.provider !== 'email'}
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-900">
                          Authenticated via {user?.app_metadata?.provider === 'google' ? 'Google' : user?.app_metadata?.provider}
                        </p>
                        <p class="text-xs text-slate-500">Password managed by your provider</p>
                      </div>
                    </div>
                  {/if}

                  <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-900">Two-Factor Auth</p>
                      <p class="text-xs text-slate-500">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="card border-danger-200">
              <div class="card-header border-danger-200">
                <h3 class="text-lg font-display font-semibold text-danger-900">Danger Zone</h3>
              </div>
              <div class="card-body">
                <div class="space-y-4">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-900 mb-1">Delete Account</h4>
                    <p class="text-sm text-slate-600 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      on:click={handleDeleteAccount}
                      class="btn btn-danger btn-sm"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
