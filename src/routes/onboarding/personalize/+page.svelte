<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';
  import { auth } from '$lib/auth.js';

  let loading = true;
  let selected = null;
  let featureSuggestion = '';

  const painPoints = [
    {
      id: 'visualClarity',
      icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>`,
      title: 'My calendar days blend together',
      description: 'Need visual organization to see weekly patterns at a glance',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'taskPriority',
      icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>`,
      title: 'Important tasks get buried',
      description: 'Need a way to color-code and prioritize critical to-dos',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'timeProtection',
      icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`,
      title: "Need to block time for deep work",
      description: 'Want visual time blocks to protect focus periods',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'allThree',
      icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>`,
      title: 'Want complete calendar control',
      description: 'Need day colors, task priorities, and time blocking together',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  onMount(async () => {
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
  });

  async function handleContinue() {
    if (!selected) return;

    try {
      // Save the pain point selection and feature suggestion
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'personalize',
          painPoint: selected,
          featureSuggestion: featureSuggestion.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Onboarding progress API error:', errorData);
        throw new Error(errorData.details || 'Failed to save progress');
      }

      const result = await response.json();
      console.log('Progress saved successfully:', result);

      // Route to demo page with pain point context
      goto(`/onboarding/demo?painPoint=${selected}`);
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Continue anyway
      goto(`/onboarding/demo?painPoint=${selected}`);
    }
  }
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="spinner spinner-lg text-primary-600"></div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
      <div class="h-full bg-gradient-to-r from-primary-500 to-brand-600 transition-all duration-500" style="width: 50%;"></div>
    </div>

    <div class="container mx-auto px-4 h-screen flex flex-col justify-center">
      <div class="max-w-4xl mx-auto w-full">
        <!-- Back Button -->
        <button
          on:click={() => goto('/onboarding')}
          class="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <!-- Main Content -->
        <div class="text-center mb-6">
          <h1 class="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">
            What's your biggest calendar challenge?
          </h1>
          <p class="text-lg text-slate-600">
            We'll personalize your experience
          </p>
        </div>

        <!-- Pain Point Cards -->
        <div class="grid sm:grid-cols-2 gap-4 mb-6">
          {#each painPoints as point}
            <button
              on:click={() => selected = point.id}
              class={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                selected === point.id
                  ? 'ring-2 ring-offset-2 ring-primary-500 shadow-xl scale-[1.02]'
                  : 'bg-white border border-slate-200 hover:border-primary-300 hover:shadow-lg'
              }`}
            >
              <!-- Gradient Background (when selected) -->
              {#if selected === point.id}
                <div class={`absolute inset-0 bg-gradient-to-br ${point.gradient} opacity-5`}></div>
              {/if}

              <div class="relative flex items-start gap-3">
                <!-- Icon -->
                <div class={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  selected === point.id
                    ? `bg-gradient-to-br ${point.gradient} text-white shadow-lg`
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 group-hover:from-primary-50 group-hover:to-brand-50 group-hover:text-primary-600'
                }`}>
                  <div class="scale-75">
                    {@html point.icon}
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class={`font-display font-bold text-base mb-1 transition-colors ${
                    selected === point.id ? 'text-slate-900' : 'text-slate-800 group-hover:text-slate-900'
                  }`}>
                    {point.title}
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    {point.description}
                  </p>
                </div>

                <!-- Checkmark -->
                {#if selected === point.id}
                  <div class="flex-shrink-0 animate-scale-in">
                    <div class={`w-6 h-6 bg-gradient-to-br ${point.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                {/if}
              </div>
            </button>
          {/each}
        </div>

        <!-- Feature Suggestion Input -->
        <div class="mb-6">
          <div class="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-lg">
            <div class="flex items-start gap-3 mb-3">
              <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-display font-bold text-slate-900 text-base mb-1">
                  Got a feature idea? <span class="text-slate-500 font-normal text-sm">(Optional)</span>
                </h3>
                <p class="text-xs text-slate-600 mb-3">
                  Share any Google Calendar feature or change you'd like to see - we're always building based on your feedback!
                </p>
                <textarea
                  bind:value={featureSuggestion}
                  placeholder="e.g., I wish I could sync my calendar with..."
                  rows={3}
                  maxlength={500}
                  class="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all resize-none text-slate-800 placeholder-slate-400"
                ></textarea>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-xs text-slate-500">
                    Help us build what you need
                  </p>
                  <p class="text-xs text-slate-400">
                    {featureSuggestion.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue Button -->
        <div class="text-center">
          <button
            on:click={handleContinue}
            disabled={!selected}
            class="btn btn-primary btn-xl group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
