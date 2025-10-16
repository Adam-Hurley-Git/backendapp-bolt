<script>
  import { onMount } from 'svelte'
  import { auth } from '$lib/auth'
  import UserBadge from '$lib/components/UserBadge.svelte'

  let user = null
  let loading = true

  onMount(async () => {
    try {
      console.log('HomePage: Checking auth...')
      const session = await auth.getCurrentSession()
      console.log('HomePage: Session result:', session?.user?.email || 'No session')
      if (session?.user) {
        user = session.user
      }
    } catch (error) {
      console.error('HomePage: Auth check failed:', error)
    } finally {
      loading = false
    }
  })
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="spinner spinner-lg text-primary-600"></div>
  </div>
{:else}
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/50">
      <div class="container-wide">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-brand-600 rounded-2xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-xl font-display font-bold text-slate-900">CalendarExtension</span>
          </div>

          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="nav-link">Features</a>
            <a href="#pricing" class="nav-link">Pricing</a>
            <a href="#about" class="nav-link">About</a>
            <UserBadge />
          </div>

          <!-- Mobile menu button -->
          <button class="md:hidden p-2 rounded-lg hover:bg-slate-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white section-padding">
      <div class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      <div class="container-wide relative">
        <div class="max-w-4xl mx-auto text-center">
          <div class="mb-8">
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200">
              <span class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
              Now available for Chrome
            </span>
          </div>

          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-slate-900 tracking-tight mb-6 animate-fade-in-up">
            Transform Your
            <span class="block gradient-text">Browsing Experience</span>
          </h1>

          <p class="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
            Boost productivity with intelligent automation, seamless workflow integration,
            and enterprise-grade security. Join thousands of professionals who trust our Chrome extension.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up">
            <a href="/pricing" class="btn btn-primary btn-xl group">
              Start Free Trial
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button class="btn btn-outline btn-xl group">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M9 20H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2M9 20v-2a2 2 0 012-2h2a2 2 0 012 2v2M9 20h6" />
              </svg>
              Watch Demo
            </button>
          </div>

          <!-- Trust Indicators -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
              </svg>
              4.9/5 Rating
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              50K+ Active Users
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z"/>
              </svg>
              Enterprise Security
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-gentle"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-brand-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-gentle"></div>
      <div class="absolute -bottom-32 left-1/2 w-72 h-72 bg-success-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-gentle"></div>
    </section>

    <!-- Quick Start Cards -->
    <section class="section-padding-sm bg-white">
      <div class="container-wide">
        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-8">
            <div class="card card-interactive card-elevated group">
              <div class="card-body">
                <div class="flex items-start gap-4">
                  <div class="feature-icon flex-shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">New to CalendarExtension - ColorKit?</h3>
                    <p class="text-slate-600 mb-6 leading-relaxed">
                      Join 50,000+ professionals who boost their productivity daily. Start your 14-day free trial.
                    </p>
                    <a href="/pricing" class="btn btn-primary group">
                      Start Free Trial
                      <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card-interactive group">
              <div class="card-body">
                <div class="flex items-start gap-4">
                  <div class="feature-icon flex-shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">Existing Customer?</h3>
                    <p class="text-slate-600 mb-6 leading-relaxed">
                      Access your dashboard to manage billing, view usage analytics, and explore new features.
                    </p>
                    <a href="/auth/login" class="btn btn-outline group">
                      Access Dashboard
                      <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="section-padding bg-slate-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-6">
            Built for Modern Professionals
          </h2>
          <p class="text-xl text-slate-600 leading-relaxed">
            Everything you need to supercharge your browsing workflow, increase productivity,
            and maintain security across all your web activities.
          </p>
        </div>

        <div class="feature-grid">
          <div class="feature-card group">
            <div class="feature-icon mb-6 group-hover:from-primary-200 group-hover:to-primary-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">Lightning Performance</h3>
            <p class="text-slate-600 leading-relaxed">
              Ultra-fast execution with minimal memory footprint. Built with modern web technologies for optimal speed.
            </p>
          </div>

          <div class="feature-card group">
            <div class="feature-icon mb-6 group-hover:from-primary-200 group-hover:to-primary-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">Enterprise Security</h3>
            <p class="text-slate-600 leading-relaxed">
              Bank-level encryption, zero data collection, and complete privacy protection for your sensitive information.
            </p>
          </div>

          <div class="feature-card group">
            <div class="feature-icon mb-6 group-hover:from-primary-200 group-hover:to-primary-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">Smart Automation</h3>
            <p class="text-slate-600 leading-relaxed">
              Intelligent workflows that adapt to your habits, automating repetitive tasks and boosting productivity.
            </p>
          </div>

          <div class="feature-card group">
            <div class="feature-icon mb-6 group-hover:from-primary-200 group-hover:to-primary-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">Advanced Analytics</h3>
            <p class="text-slate-600 leading-relaxed">
              Detailed insights into your browsing patterns, productivity metrics, and optimization recommendations.
            </p>
          </div>

          <div class="feature-card group">
            <div class="feature-icon mb-6 group-hover:from-primary-200 group-hover:to-primary-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">Cross-Platform Sync</h3>
            <p class="text-slate-600 leading-relaxed">
              Seamless synchronization across all your devices and browsers with cloud-based configuration management.
            </p>
          </div>

          <div class="feature-card group">
            <div class="feature-icon mb-6 group-hover:from-primary-200 group-hover:to-primary-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-semibold text-slate-900 mb-3">24/7 Support</h3>
            <p class="text-slate-600 leading-relaxed">
              Premium customer support with dedicated account management and priority response times.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section-padding bg-slate-900 text-white">
      <div class="container-wide">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl sm:text-5xl font-display font-bold mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p class="text-xl text-slate-300 mb-10 leading-relaxed">
            Join thousands of professionals who have already revolutionized their browsing experience.
            Start your free trial today – no credit card required.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/pricing" class="btn btn-primary btn-xl">
              Start Free Trial
            </a>
            <a href="/auth/login" class="btn btn-outline btn-xl border-slate-600 text-slate-300 hover:bg-slate-800">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-950 text-slate-400 section-padding-sm">
      <div class="container-wide">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div class="md:col-span-1">
            <div class="flex items-center gap-3 mb-4">
              <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-brand-600 rounded-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span class="text-lg font-display font-bold text-white">CalendarExtension</span>
            </div>
            <p class="text-sm leading-relaxed">
              The professional Chrome extension for modern workflows. Boost productivity,
              enhance security, and streamline your browsing experience.
            </p>
          </div>

          <div>
            <h3 class="text-white font-semibold mb-4">Product</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
              <li><a href="/pricing" class="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/changelog" class="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="/roadmap" class="hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-white font-semibold mb-4">Support</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/docs" class="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/help" class="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" class="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="/status" class="hover:text-white transition-colors">Status Page</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-white font-semibold mb-4">Legal</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" class="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="/gdpr" class="hover:text-white transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm">&copy; 2024 CalendarExtension - ColorKit. All rights reserved.</p>
          <div class="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://twitter.com" class="hover:text-white transition-colors" aria-label="Twitter">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" class="hover:text-white transition-colors" aria-label="LinkedIn">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
{/if}
