<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';
  import { auth } from '$lib/auth.js';
  import UserBadge from '$lib/components/UserBadge.svelte';

  let user = null;
  let loading = true;
  let saving = false;
  let message = null;
  let formData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
        user = authUser;

        // Redirect OAuth users back to profile - they can't change password
        if (authUser?.app_metadata?.provider !== 'email') {
          goto('/profile');
          return;
        }

        loading = false;
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
    // Clear message when user starts typing
    if (message) message = null;
  }

  function validateForm() {
    if (!formData.newPassword || !formData.confirmPassword) {
      message = { type: 'error', text: 'Please fill in all fields' };
      return false;
    }

    if (formData.newPassword.length < 6) {
      message = { type: 'error', text: 'New password must be at least 6 characters long' };
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      message = { type: 'error', text: 'New passwords do not match' };
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    saving = true;
    message = null;

    try {
      // Use auth helper to update password
      await auth.updatePassword(formData.newPassword);

      message = { type: 'success', text: 'Password updated successfully!' };

      // Clear form
      formData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

    } catch (error) {
      console.error('Failed to update password:', error);
      message = {
        type: 'error',
        text: error.message || 'Failed to update password. Please try again.'
      };
    } finally {
      saving = false;
    }
  }
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
          <a href="/profile" class="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Back to profile">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 class="text-3xl font-display font-bold text-slate-900">Change Password</h1>
            <p class="text-lg text-slate-600 mt-1">
              Update your account password
            </p>
          </div>
        </div>
      </div>

      <div class="max-w-2xl">
        <div class="card card-elevated">
          <div class="card-header">
            <h3 class="text-lg font-display font-semibold text-slate-900">Update Password</h3>
          </div>
          <div class="card-body">
            <form on:submit={handleSubmit} class="space-y-6">
              <div>
                <label for="newPassword" class="label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  on:input={handleInputChange}
                  class="input"
                  placeholder="Enter your new password"
                  required
                />
                <p class="text-xs text-slate-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label for="confirmPassword" class="label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  on:input={handleInputChange}
                  class="input"
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              <div class="flex justify-end gap-3">
                <a href="/profile" class="btn btn-secondary">
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={saving}
                  class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if saving}
                    <div class="spinner spinner-sm mr-2"></div>
                    Updating...
                  {:else}
                    Update Password
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
        </div>

        <!-- Security Note -->
        <div class="card mt-6 border-blue-200 bg-blue-50">
          <div class="card-body">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 class="text-sm font-semibold text-blue-900 mb-1">Security Tips</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Use a strong, unique password that you don't use elsewhere</li>
                  <li>• Consider using a password manager to generate and store secure passwords</li>
                  <li>• After changing your password, you may need to sign in again on other devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
