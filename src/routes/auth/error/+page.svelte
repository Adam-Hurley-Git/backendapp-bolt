<script>
  import { page } from '$app/stores'

  $: message = $page.url.searchParams.get('message') || 'An authentication error occurred'
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-danger-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
      <div class="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 class="text-3xl font-display font-bold text-slate-900 mb-4">
        Authentication Error
      </h2>

      <p class="text-lg text-slate-600 mb-8 leading-relaxed">
        {decodeURIComponent(message)}
      </p>
    </div>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="card card-elevated bg-white/80 backdrop-blur-sm border-white/20 shadow-elevated">
      <div class="card-body text-center">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">What can you do?</h3>

        <div class="space-y-3 mb-6">
          <div class="flex items-start gap-3 text-left">
            <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-sm text-slate-600">Try signing in again with a different method</p>
          </div>

          <div class="flex items-start gap-3 text-left">
            <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-sm text-slate-600">Clear your browser cookies and try again</p>
          </div>

          <div class="flex items-start gap-3 text-left">
            <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <p class="text-sm text-slate-600">Contact support if the problem persists</p>
          </div>
        </div>

        <div class="space-y-3">
          <a href="/auth/login" class="w-full btn btn-primary">
            Try Again
          </a>

          <a href="/" class="w-full btn btn-outline">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
