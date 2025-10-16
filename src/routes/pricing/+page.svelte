<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.js';
  import { auth } from '$lib/auth.js';
  import { PADDLE_PLANS } from '$lib/paddle.js';

  let selectedPlan = null;
  let billingCycle = 'yearly';
  let termsAccepted = false;
  let privacyAccepted = false;
  let marketingAccepted = false;
  let loading = false;
  let authLoading = true;

  $: plans = Object.entries(PADDLE_PLANS).filter(([key, plan]) =>
    plan.billing_cycle === billingCycle
  );

  onMount(() => {
    const checkAuth = async () => {
      try {
        const session = await auth.getCurrentSession();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        authLoading = false;
      }
    };

    checkAuth();
  });

  function handlePlanSelect(planKey, plan) {
    selectedPlan = { key: planKey, ...plan };
  }

  async function handleSignInWithGoogle() {
    loading = true;
    try {
      await auth.signInWithGoogle(`/pricing?plan=${selectedPlan?.key}`);
    } catch (error) {
      console.error('Google sign-in failed:', error);
      alert('Sign-in failed. Please try again.');
    } finally {
      loading = false;
    }
  }

  async function handleProceedToPayment() {
    if (!selectedPlan || !termsAccepted || !privacyAccepted) {
      alert('Please select a plan and accept the required policies.');
      return;
    }

    loading = true;
    try {
      // Create payment attempt record
      const response = await fetch('/api/payments/create-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          email: $authStore.user?.email,
          termsAccepted,
          privacyAccepted,
          marketingAccepted
        })
      });

      const { data } = await response.json();

      if (data?.checkoutUrl) {
        // Redirect to Paddle checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to proceed to payment. Please try again.');
    } finally {
      loading = false;
    }
  }
</script>

{#if authLoading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="loading-spinner h-8 w-8"></div>
  </div>
{:else}
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-neutral-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="feature-icon mr-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <a href="/" class="text-xl font-display font-bold text-neutral-900">Chrome Extension</a>
          </div>
          <nav class="hidden md:flex space-x-8">
            <a href="/#features" class="nav-link">Features</a>
            <a href="/pricing" class="nav-link-active">Pricing</a>
            <a href="/auth/login" class="nav-link">Sign In</a>
          </nav>
        </div>
      </div>
    </header>

    <div class="hero-section py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h1 class="text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
            Choose Your <span class="gradient-text">Perfect Plan</span>
          </h1>
          <p class="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Start your free trial today and experience the full power of our Chrome extension.
            Upgrade anytime to unlock premium features.
          </p>
        </div>

        <!-- Billing Cycle Toggle -->
        <div class="flex justify-center mb-16">
          <div class="bg-white rounded-2xl p-2 shadow-soft border border-neutral-200">
            <button
              on:click={() => billingCycle = 'monthly'}
              class={`px-8 py-3 rounded-xl font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Monthly
            </button>
            <button
              on:click={() => billingCycle = 'yearly'}
              class={`px-8 py-3 rounded-xl font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Yearly
              <span class="ml-2 text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full font-semibold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <!-- Plans Grid -->
        <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {#each plans as [planKey, plan]}
            <div
              class={`pricing-card cursor-pointer ${
                selectedPlan?.key === planKey ? 'pricing-card-featured' : ''
              } ${planKey.includes('PREMIUM') ? 'pricing-card-featured' : ''}`}
              on:click={() => handlePlanSelect(planKey, plan)}
              on:keydown={(e) => e.key === 'Enter' && handlePlanSelect(planKey, plan)}
              role="button"
              tabindex="0"
            >
              {#if planKey.includes('PREMIUM')}
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span class="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              {/if}

              <div class="text-center mb-8">
                <h3 class="text-2xl font-display font-bold mb-2 text-neutral-900">{plan.name}</h3>
                <div class="mb-4">
                  <span class="text-5xl font-display font-bold text-neutral-900">${plan.price}</span>
                  <span class="text-lg text-neutral-500 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {#if billingCycle === 'yearly'}
                  <div class="text-sm text-secondary-600 font-medium">
                    Save ${(plan.price * 2).toFixed(0)} per year
                  </div>
                {/if}
              </div>

              <ul class="space-y-4 mb-8">
                {#each plan.features as feature}
                  <li class="flex items-start">
                    <div class="flex-shrink-0 w-5 h-5 bg-secondary-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                      <svg class="w-3 h-3 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-neutral-700 leading-relaxed">{feature}</span>
                  </li>
                {/each}
              </ul>

              <div class="mt-auto">
                <button
                  on:click={() => handlePlanSelect(planKey, plan)}
                  class={`w-full ${
                    selectedPlan?.key === planKey
                      ? 'btn btn-primary'
                      : planKey.includes('PREMIUM')
                      ? 'btn btn-primary'
                      : 'btn btn-secondary'
                  }`}
                >
                  {selectedPlan?.key === planKey ? '✓ Selected' : 'Choose Plan'}
                </button>
              </div>
            </div>
          {/each}
        </div>

        <!-- Authentication and Policy Section -->
        {#if selectedPlan}
          <div class="max-w-2xl mx-auto">
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Complete Your Purchase</h2>
              </div>
              <div class="card-body">
                {#if !$authStore.user}
                  <div class="text-center">
                    <h3 class="text-lg font-medium mb-4">Sign in to continue</h3>
                    <p class="text-gray-600 mb-6">
                      You'll need to sign in before proceeding to payment.
                    </p>
                    <button
                      on:click={handleSignInWithGoogle}
                      disabled={loading}
                      class="btn btn-primary flex items-center justify-center mx-auto"
                    >
                      {#if loading}
                        <div class="loading-spinner mr-2"></div>
                      {:else}
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
                      {/if}
                      Continue with Google
                    </button>
                    <div class="mt-4">
                      <a href="/auth/login" class="text-primary-600 hover:text-primary-700">
                        Or sign in with email
                      </a>
                    </div>
                  </div>
                {:else}
                  <div>
                    <div class="mb-6">
                      <p class="text-green-600 mb-2">✓ Signed in as {$authStore.user.email}</p>
                      <p class="text-gray-600">Selected: {selectedPlan.name} - ${selectedPlan.price}</p>
                    </div>

                    <!-- Policy Checkboxes -->
                    <div class="space-y-4 mb-6">
                      <label class="flex items-start">
                        <input
                          type="checkbox"
                          bind:checked={termsAccepted}
                          class="mt-1 mr-3"
                          required
                        />
                        <span class="text-sm">
                          I agree to the{' '}
                          <a href="/terms" class="text-primary-600 hover:text-primary-700">
                            Terms of Service
                          </a>{' '}
                          <span class="text-red-500">*</span>
                        </span>
                      </label>

                      <label class="flex items-start">
                        <input
                          type="checkbox"
                          bind:checked={privacyAccepted}
                          class="mt-1 mr-3"
                          required
                        />
                        <span class="text-sm">
                          I agree to the{' '}
                          <a href="/privacy" class="text-primary-600 hover:text-primary-700">
                            Privacy Policy
                          </a>{' '}
                          <span class="text-red-500">*</span>
                        </span>
                      </label>

                      <label class="flex items-start">
                        <input
                          type="checkbox"
                          bind:checked={marketingAccepted}
                          class="mt-1 mr-3"
                        />
                        <span class="text-sm">
                          I agree to receive marketing communications (optional)
                        </span>
                      </label>
                    </div>

                    <button
                      on:click={handleProceedToPayment}
                      disabled={loading || !termsAccepted || !privacyAccepted}
                      class="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {#if loading}
                        <div class="flex items-center justify-center">
                          <div class="loading-spinner mr-2"></div>
                          Processing...
                        </div>
                      {:else}
                        Proceed to Payment
                      {/if}
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
