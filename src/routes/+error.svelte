<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full text-center">
    <div class="mb-8">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-danger-100 rounded-full mb-4">
        <svg class="w-10 h-10 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 class="text-4xl font-display font-bold text-slate-900 mb-2">
        {$page.status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
      </h1>
      <p class="text-lg text-slate-600 mb-8">
        {#if $page.status === 404}
          The page you're looking for doesn't exist or has been moved.
        {:else}
          We encountered an unexpected error. Please try again.
        {/if}
      </p>
    </div>

    <div class="space-y-3">
      <a href="/" class="btn btn-primary w-full">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Go Home
      </a>
      <button on:click={() => history.back()} class="btn btn-outline w-full">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Go Back
      </button>
    </div>

    {#if $page.error?.message}
      <div class="mt-8 p-4 bg-slate-100 rounded-xl">
        <p class="text-sm text-slate-600 font-mono">{$page.error.message}</p>
      </div>
    {/if}
  </div>
</div>
