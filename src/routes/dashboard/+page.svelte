<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';
  import { db } from '$lib/supabase.js';
  import UserBadge from '$lib/components/UserBadge.svelte';

  let profile = null;
  let subscription = null;
  let loading = true;
  let stats = {
    totalUsage: 0,
    monthlyUsage: 0,
    extensionStatus: 'active'
  };

  // TEMPORARY: Subscription preview states for UI testing
  let previewMode = 'real';

  const mockSubscriptions = {
    active: {
      plan_name: 'Pro Plan',
      status: 'active',
      price: '29.99',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 5000,
      license_key: 'EP-PRO-ABC123-DEF456-GHI789'
    },
    trial: {
      plan_name: 'Pro Plan',
      status: 'trialing',
      price: '0.00',
      next_billing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      next_payment_amount: '29.99',
      usage_limit: 1000,
      license_key: 'EP-TRIAL-XYZ123-ABC456-DEF789'
    },
    expired: {
      plan_name: 'Pro Plan',
      status: 'canceled',
      price: '29.99',
      next_billing_date: null,
      canceled_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 0,
      license_key: 'EP-EXP-JKL123-MNO456-PQR789'
    },
  };

  // Override subscription based on preview mode
  $: displaySubscription = previewMode === 'real' ? subscription : (previewMode === 'none' ? null : mockSubscriptions[previewMode]);

  $: subscriptionStatus = (() => {
    const sub = displaySubscription;
    if (!sub) return 'No active subscription';
    if (sub.status === 'active') return 'Active Subscription';
    if (sub.status === 'trialing') {
      const trialDays = Math.ceil((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
      return `Free Trial (${trialDays} days remaining)`;
    }
    if (sub.status === 'canceled' && sub.canceled_date) {
      return `Canceled on ${new Date(sub.canceled_date).toLocaleDateString()}`;
    }
    return 'Subscription Inactive';
  })();

  onMount(() => {
    const unsubscribe = authStore.subscribe(async ($authStore) => {
      const { user, loading: authLoading } = $authStore;

      console.log('Dashboard: Auth state -', { authLoading, user: user?.email || 'No user' });

      // Redirect to login if not authenticated
      if (!authLoading && !user) {
        console.log('Dashboard: No user found, redirecting to login');
        goto('/auth/login');
        return;
      }

      // Load dashboard data if user is authenticated
      if (user && !authLoading) {
        try {
          loading = true;

          // Load user profile
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            profile = profileData.data;
          }

          // Load subscription data
          try {
            const subscriptionData = await db.getSubscription(user.id);
            if (subscriptionData) {
              subscription = subscriptionData;
            }
          } catch (error) {
            console.log('No subscription found:', error);
          }

          // Mock usage stats - replace with real API calls
          stats = {
            totalUsage: 1247,
            monthlyUsage: 89,
            extensionStatus: 'active'
          };

        } catch (error) {
          console.error('Failed to load dashboard data:', error);
        } finally {
          loading = false;
        }
      }
    });

    return unsubscribe;
  });
</script>

{#if $authStore.loading || loading}
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="spinner spinner-lg text-primary-600"></div>
  </div>
{:else if !$authStore.user}
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
              <a href="/dashboard" class="nav-link nav-link-active">Dashboard</a>
              <a href="/billing" class="nav-link">Billing</a>
              <a href="/profile" class="nav-link">Settings</a>
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
        <h1 class="text-3xl font-display font-bold text-slate-900 mb-2">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p class="text-lg text-slate-600">
          Manage your CalendarExtension - ColorKit subscription and view your usage statistics
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Subscription Info -->
        <div class="lg:col-span-2">
          <div class="card card-elevated mb-6">
            <div class="card-header">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-display font-semibold text-slate-900">Subscription Details</h3>
                <div class="flex items-center gap-3">
                  <!-- TEMPORARY: UI Preview Dropdown -->
                  <select
                    bind:value={previewMode}
                    class="text-xs px-2 py-1 border border-orange-300 bg-orange-50 text-orange-700 rounded font-medium"
                  >
                    <option value="real">Real Data</option>
                    <option value="active">Active Sub</option>
                    <option value="trial">Trial Sub</option>
                    <option value="expired">Expired Sub</option>
                    <option value="none">No Sub</option>
                  </select>
                  <a href="/billing" class="btn btn-outline btn-sm">
                    Manage Billing
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div class="card-body">
              {#if displaySubscription}
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <h4 class="text-base font-semibold text-slate-900 mb-1">{displaySubscription.plan_name || 'Pro Plan'}</h4>
                      <p class="text-sm text-slate-600">
                        {subscriptionStatus}
                      </p>
                    </div>
                    <div class="text-right">
                      {#if displaySubscription.status === 'trialing'}
                        <p class="text-2xl font-display font-bold text-success-600">
                          FREE TRIAL
                        </p>
                        <p class="text-xs text-slate-500">
                          Trial ends: {displaySubscription.next_billing_date ? new Date(displaySubscription.next_billing_date).toLocaleDateString() : 'N/A'}
                        </p>
                        <p class="text-xs text-orange-600 font-medium mt-1">
                          Next payment: ${displaySubscription.next_payment_amount || '29.99'}/month
                        </p>
                      {:else if displaySubscription.status === 'canceled'}
                        <p class="text-2xl font-display font-bold text-danger-600">
                          SUBSCRIPTION CANCELED
                        </p>
                        <p class="text-xs text-slate-500">
                          Canceled: {displaySubscription.canceled_date ? new Date(displaySubscription.canceled_date).toLocaleDateString() : 'N/A'}
                        </p>
                        <p class="text-xs text-slate-400 mt-1">
                          Was: ${displaySubscription.price || '29.99'}/month
                        </p>
                      {:else}
                        <p class="text-2xl font-display font-bold text-slate-900">
                          ${displaySubscription.price || '29.99'}<span class="text-sm font-normal text-slate-500">/month</span>
                        </p>
                        <p class="text-xs text-slate-500">
                          Next billing: {displaySubscription.next_billing_date ? new Date(displaySubscription.next_billing_date).toLocaleDateString() : 'N/A'}
                        </p>
                      {/if}
                    </div>
                  </div>

                  <!-- Thank you message for active and trial subscriptions -->
                  {#if displaySubscription.status === 'active' || displaySubscription.status === 'trialing'}
                    <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-blue-900">Thank you for your support!</p>
                          <p class="text-xs text-blue-700">I appreciate you choosing CalendarExtension - ColorKit</p>
                        </div>
                      </div>
                    </div>
                  {/if}

                  <div class="p-4 border border-slate-200 rounded-xl">
                    <p class="text-sm font-medium text-slate-600 mb-1">License Key</p>
                    <p class="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {displaySubscription.license_key || profile?.license_key || 'Not generated'}
                    </p>
                  </div>
                </div>
              {:else}
                <div class="text-center py-8">
                  <div class="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-slate-900 mb-2">No Active Subscription</h4>
                  <p class="text-slate-600 mb-6">Upgrade to unlock all features and start boosting your productivity</p>
                  <a href="/pricing" class="btn btn-primary">
                    Choose a Plan
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-6">
          <div class="card card-elevated">
            <div class="card-header">
              <h3 class="text-lg font-display font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div class="card-body">
              <div class="space-y-3">
                <a href="/profile" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">Update Profile</p>
                    <p class="text-xs text-slate-500">Manage your account settings</p>
                  </div>
                </a>

                <a href="/billing" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">Billing History</p>
                    <p class="text-xs text-slate-500">View invoices and payments</p>
                  </div>
                </a>

                <a href="/support" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">Get Support</p>
                    <p class="text-xs text-slate-500">Contact our support team</p>
                  </div>
                </a>

                {#if displaySubscription && (displaySubscription.status === 'active' || displaySubscription.status === 'trialing')}
                  <a href="/billing/cancel" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-900">Cancel Subscription</p>
                      <p class="text-xs text-slate-500">End your subscription</p>
                    </div>
                  </a>
                {/if}
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="card card-elevated">
            <div class="card-header">
              <h3 class="text-lg font-display font-semibold text-slate-900">System Status</h3>
            </div>
            <div class="card-body">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">API Services</span>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span class="text-xs text-success-600">Operational</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Chrome Extension</span>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span class="text-xs text-success-600">Connected</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Billing System</span>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span class="text-xs text-success-600">Active</span>
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
