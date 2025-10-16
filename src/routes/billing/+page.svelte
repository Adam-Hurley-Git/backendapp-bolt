<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';

  let subscription = null;
  let paymentHistory = [];
  let loading = true;
  let actionLoading = false;

  // TEMPORARY: Subscription preview states for UI testing
  let previewMode = 'real';

  const mockSubscriptions = {
    active: {
      plan_name: 'Pro Plan',
      status: 'active',
      unit_price: '29.99',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      license_key: 'EP-PRO-ABC123-DEF456-GHI789',
      paddle_subscription_id: 'sub_123456'
    },
    trial: {
      plan_name: 'Pro Plan',
      status: 'trialing',
      unit_price: '0.00',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billed_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      license_key: 'EP-TRIAL-XYZ123-ABC456-DEF789',
      paddle_subscription_id: 'sub_trial_123'
    },
    expired: {
      plan_name: 'Pro Plan',
      status: 'canceled',
      unit_price: '29.99',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billed_at: null,
      license_key: 'EP-EXP-JKL123-MNO456-PQR789',
      paddle_subscription_id: null
    }
  };

  const mockPaymentHistory = {
    active: [
      {
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: '29.99',
        currency: 'USD',
        status: 'completed',
        invoice_url: 'https://example.com/invoice1'
      },
      {
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: '29.99',
        currency: 'USD',
        status: 'completed',
        invoice_url: 'https://example.com/invoice2'
      }
    ],
    trial: [],
    expired: [
      {
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        amount: '29.99',
        currency: 'USD',
        status: 'completed',
        invoice_url: 'https://example.com/invoice3'
      }
    ]
  };

  // Override subscription and payment history based on preview mode
  $: displaySubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode];
  $: displayPaymentHistory = previewMode === 'real' ? paymentHistory : (mockPaymentHistory[previewMode] || []);

  onMount(async () => {
    const unsubscribe = authStore.subscribe(async ($authStore) => {
      const { user, loading: authLoading } = $authStore;

      if (!authLoading && !user) {
        goto('/auth/login');
        return;
      }

      if (user && !authLoading) {
        try {
          loading = true;

          // Load subscription and payment history
          const [subscriptionRes, paymentsRes] = await Promise.all([
            fetch('/api/user/subscription'),
            fetch('/api/user/payments')
          ]);

          if (subscriptionRes.ok) {
            const subscriptionData = await subscriptionRes.json();
            subscription = subscriptionData.data;
          }

          if (paymentsRes.ok) {
            const paymentsData = await paymentsRes.json();
            paymentHistory = paymentsData.data || [];
          }
        } catch (error) {
          console.error('Failed to load billing data:', error);
        } finally {
          loading = false;
        }
      }
    });

    return unsubscribe;
  });

  async function handleUpdatePaymentMethod() {
    const currentSubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode];
    if (!currentSubscription?.paddle_subscription_id) {
      alert('No active subscription found');
      return;
    }

    actionLoading = true;
    try {
      const response = await fetch('/api/paddle/update-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.paddle_subscription_id
        })
      });

      const { data } = await response.json();

      if (data?.updateUrl) {
        window.open(data.updateUrl, '_blank');
      } else {
        throw new Error('Failed to get update URL');
      }
    } catch (error) {
      console.error('Failed to update payment method:', error);
      alert('Failed to open payment method update. Please try again.');
    } finally {
      actionLoading = false;
    }
  }

  async function handleManageSubscription() {
    const currentSubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode];
    if (!currentSubscription?.paddle_subscription_id) {
      alert('No active subscription found');
      return;
    }

    actionLoading = true;
    try {
      const response = await fetch('/api/paddle/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.paddle_subscription_id
        })
      });

      const { data } = await response.json();

      if (data?.managementUrl) {
        window.open(data.managementUrl, '_blank');
      } else {
        throw new Error('Failed to get management URL');
      }
    } catch (error) {
      console.error('Failed to open subscription management:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      actionLoading = false;
    }
  }

  function handleChangePlan() {
    goto('/pricing?change=true');
  }

  function copyLicenseKey() {
    if (displaySubscription?.license_key) {
      navigator.clipboard.writeText(displaySubscription.license_key);
    }
  }
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="loading-spinner h-8 w-8"></div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <a href="/dashboard" class="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 class="text-xl font-semibold">Billing & Subscription</h1>
          </div>
          <div class="flex items-center space-x-4">
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
            <span class="text-gray-600">{$authStore.user?.email}</span>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        {#if previewMode === 'none' ? false : displaySubscription}
          <div class="space-y-8">
            <!-- Current Subscription -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Current Subscription</h2>
              </div>
              <div class="card-body">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 class="text-lg font-medium mb-4">{displaySubscription.plan_name}</h3>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Price:</span>
                        <span>${displaySubscription.unit_price} {displaySubscription.currency}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Billing Cycle:</span>
                        <span class="capitalize">{displaySubscription.billing_cycle}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Status:</span>
                        <span class="status-badge status-{displaySubscription.status}">
                          {displaySubscription.status.charAt(0).toUpperCase() + displaySubscription.status.slice(1)}
                        </span>
                      </div>
                      {#if displaySubscription.next_billed_at}
                        <div class="flex justify-between">
                          <span class="text-gray-600">Next Billing:</span>
                          <span>{new Date(displaySubscription.next_billed_at).toLocaleDateString()}</span>
                        </div>
                      {/if}
                    </div>
                  </div>

                  <div class="space-y-3">
                    <button
                      on:click={handleManageSubscription}
                      disabled={actionLoading}
                      class="w-full btn btn-primary"
                    >
                      {actionLoading ? 'Loading...' : 'Manage Subscription'}
                    </button>
                    <button
                      on:click={handleUpdatePaymentMethod}
                      disabled={actionLoading}
                      class="w-full btn btn-secondary"
                    >
                      Update Payment Method
                    </button>
                    <button
                      on:click={handleChangePlan}
                      class="w-full btn btn-secondary"
                    >
                      Change Plan
                    </button>
                    <a href="/billing/cancel" class="block w-full text-center btn btn-secondary text-red-600">
                      Cancel Subscription
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Billing Information -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Billing Information</h2>
              </div>
              <div class="card-body">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="font-medium mb-2">Billing Email</h4>
                    <p class="text-gray-600">{$authStore.user?.email}</p>
                  </div>
                  {#if displaySubscription.license_key}
                    <div>
                      <h4 class="font-medium mb-2">License Key</h4>
                      <div class="flex">
                        <code class="flex-1 px-3 py-2 bg-gray-100 rounded-l text-sm font-mono">
                          {displaySubscription.license_key}
                        </code>
                        <button
                          on:click={copyLicenseKey}
                          class="px-3 py-2 bg-gray-200 rounded-r hover:bg-gray-300 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Payment History -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Payment History</h2>
              </div>
              <div class="card-body">
                {#if displayPaymentHistory.length > 0}
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        {#each displayPaymentHistory as payment, index}
                          <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${payment.amount} {payment.currency}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span class="status-badge status-{payment.status}">
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                              {#if payment.invoice_url}
                                <a
                                  href={payment.invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="text-primary-600 hover:text-primary-700"
                                >
                                  View Invoice
                                </a>
                              {:else}
                                <span class="text-gray-400">N/A</span>
                              {/if}
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {:else}
                  <div class="text-center py-8">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                    <p class="text-gray-600">Your payment history will appear here once you have made payments.</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <div class="card">
            <div class="card-body text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">No Active Subscription</h2>
              <p class="text-gray-600 mb-6">
                You don't have an active subscription. Choose a plan to get started.
              </p>
              <a href="/pricing" class="btn btn-primary">
                View Plans
              </a>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
