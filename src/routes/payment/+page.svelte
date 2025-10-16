<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';
  import { auth } from '$lib/auth.js';

  let loading = true;
  let termsAccepted = false;
  let privacyAccepted = false;
  let immediateAccessAccepted = false;
  let refundPolicyAccepted = false;
  let recurringPaymentAccepted = false;
  let acceptAll = false;
  let processing = false;

  onMount(() => {
    const checkAuth = async () => {
      try {
        const session = await auth.getCurrentSession();
        if (!session?.user) {
          goto('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        goto('/auth/login');
      } finally {
        loading = false;
      }
    };

    checkAuth();
  });

  function handleAcceptAll(checked) {
    acceptAll = checked;
    termsAccepted = checked;
    privacyAccepted = checked;
    immediateAccessAccepted = checked;
    refundPolicyAccepted = checked;
    recurringPaymentAccepted = checked;
  }

  function handleIndividualCheckbox(type, checked) {
    if (type === 'terms') termsAccepted = checked;
    if (type === 'privacy') privacyAccepted = checked;
    if (type === 'immediate') immediateAccessAccepted = checked;
    if (type === 'refund') refundPolicyAccepted = checked;
    if (type === 'recurring') recurringPaymentAccepted = checked;

    // If any required checkbox is unchecked, uncheck accept all
    if (!checked && (type === 'terms' || type === 'privacy' || type === 'refund' || type === 'recurring')) {
      acceptAll = false;
    } else {
      // If all required checkboxes are now checked, check accept all
      const allRequiredChecked = (type === 'terms' ? checked : termsAccepted) &&
                                 (type === 'privacy' ? checked : privacyAccepted) &&
                                 (type === 'refund' ? checked : refundPolicyAccepted) &&
                                 (type === 'recurring' ? checked : recurringPaymentAccepted);
      acceptAll = allRequiredChecked;
    }
  }

  async function handlePayment() {
    if (!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted) {
      alert('Please accept all required terms and conditions to continue');
      return;
    }

    processing = true;

    try {
      // Save consent data to database
      const consentTimestamp = new Date().toISOString();

      const response = await fetch('/api/user/save-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termsAccepted,
          privacyAccepted,
          refundPolicyAccepted,
          immediateAccessAccepted,
          recurringPaymentAccepted,
          consentTimestamp,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Consent API error:', errorData);
        throw new Error(errorData.details || 'Failed to save consent data');
      }

      const result = await response.json();
      console.log('Consent saved successfully:', result);

      // Redirect to payment website with plan info
      const paymentUrl = `https://calendarextension.com/checkout?plan=annual&email=${encodeURIComponent($authStore.user?.email || '')}`;
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Error saving consent:', error);
      alert('Failed to save consent data. Please try again.');
      processing = false;
    }
  }

  const features = [
    'Unlimited color customization',
    'Priority task coloring',
    'Custom time blocking',
    'All future features',
    'Priority support',
    'Cancel anytime'
  ];
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="spinner spinner-lg text-primary-600"></div>
  </div>
{:else}
  <div class="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
    <div class="container mx-auto px-4 h-full flex items-center justify-center">
      <div class="max-w-3xl mx-auto w-full">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-display font-bold text-slate-900 mb-2">
            Unlock Your Full Calendar Potential
          </h1>
          <p class="text-base text-slate-600">
            Start customizing your calendar experience today
          </p>
        </div>

        <!-- Plan Card -->
        <div class="bg-white rounded-2xl p-6 shadow-xl border-2 border-primary-300 mb-6">
          <div class="text-center mb-4">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg mb-3">
              7-Day Free Trial
            </div>
            <div class="flex items-baseline justify-center gap-1 mb-2">
              <span class="text-5xl font-bold text-success-600">$0.00</span>
              <span class="text-xl text-slate-600">today</span>
            </div>
            <p class="text-sm text-slate-600 mb-2">
              Start your <span class="font-semibold text-success-700">7-day free trial</span> now
            </p>
            <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
              <p class="text-xs text-slate-700 mb-1">
                <span class="font-bold text-slate-900">After trial:</span> $2.92/month
              </p>
              <p class="text-xs text-slate-600">
                Billed annually at $34.99/year • Cancel anytime during trial
              </p>
              <p class="text-xs text-slate-500 mt-2 italic">
                * Price excludes applicable taxes
              </p>
            </div>
          </div>

          <!-- Features -->
          <div class="border-t border-slate-200 pt-4">
            <div class="grid grid-cols-2 gap-2 mb-4">
              {#each features as feature}
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-xs text-slate-700">{feature}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="bg-white rounded-xl p-4 shadow-lg border-2 border-slate-200 mb-4">
          <div class="space-y-3">
            <!-- Accept All Checkbox -->
            <div class="border-b border-slate-200 pb-4 mb-4 bg-gradient-to-r from-primary-50 to-slate-50 rounded-lg p-4">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  bind:checked={acceptAll}
                  on:change={(e) => handleAcceptAll(e.target.checked)}
                  class="w-5 h-5 rounded border-2 border-primary-400 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <span class="text-base font-bold text-primary-800 group-hover:text-primary-900">
                  Accept All Terms and Conditions to Start
                </span>
              </label>
            </div>

            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={termsAccepted}
                on:change={(e) => handleIndividualCheckbox('terms', e.target.checked)}
                class="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span class="text-xs text-slate-700 group-hover:text-slate-900">
                I agree to the{' '}
                <a
                  href="https://calendarextension.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  Terms of Service
                </a>
              </span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={refundPolicyAccepted}
                on:change={(e) => handleIndividualCheckbox('refund', e.target.checked)}
                class="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span class="text-xs text-slate-700 group-hover:text-slate-900">
                I agree to the{' '}
                <a
                  href="https://calendarextension.com/refund"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  Refund Policy
                </a>
              </span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={privacyAccepted}
                on:change={(e) => handleIndividualCheckbox('privacy', e.target.checked)}
                class="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span class="text-xs text-slate-700 group-hover:text-slate-900">
                I agree to the{' '}
                <a
                  href="https://calendarextension.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={recurringPaymentAccepted}
                on:change={(e) => handleIndividualCheckbox('recurring', e.target.checked)}
                class="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span class="text-xs text-slate-700 group-hover:text-slate-900">
                I agree to recurring payment subscriptions after the trial period ends
              </span>
            </label>

            <label class="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={immediateAccessAccepted}
                on:change={(e) => handleIndividualCheckbox('immediate', e.target.checked)}
                class="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer flex-shrink-0 mt-0.5"
              />
              <span class="text-xs text-slate-700 group-hover:text-slate-900 leading-relaxed">
                I request immediate access to ColorKit and consent to immediate performance. I understand I will lose my 14-day right to withdraw once access begins
              </span>
            </label>
          </div>
        </div>

        <!-- Payment Button -->
        <div class="text-center mb-4">
          <button
            on:click={handlePayment}
            disabled={!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted || processing}
            class={`btn btn-primary btn-xl group w-full ${
              (!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted || processing) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {#if processing}
              <div class="spinner spinner-sm"></div>
              Processing...
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Start Free Trial
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            {/if}
          </button>
          {#if (!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted)}
            <p class="text-xs text-red-600 mt-1">
              Please accept all required terms to continue
            </p>
          {/if}
        </div>

        <!-- Trust Indicators -->
        <div class="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="font-medium">SSL Secure</span>
          </div>
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="font-medium">Cancel Anytime</span>
          </div>
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span class="font-medium">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
