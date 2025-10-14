'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'
import Link from 'next/link'

export default function PaywallPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('yearly')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await auth.getCurrentSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }
        setUser(session.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleUpgrade = () => {
    // Navigate to pricing page with selected plan
    router.push(`/pricing?plan=${selectedPlan}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="spinner spinner-lg text-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">

          {/* Main Paywall */}
          <div className="card card-elevated animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-body">
              {/* Header */}
              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-4">
                  Unlock Your Full Productivity Potential
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Upgrade to premium to access all powerful features
                </p>
              </div>

              {/* Benefits */}
              <div className="mb-10">
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-6 text-center">
                  Premium Benefits
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Unlimited Day Coloring</h4>
                        <p className="text-sm text-slate-600">7 weekday colors with full opacity control and custom palettes</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Advanced Task Coloring</h4>
                        <p className="text-sm text-slate-600">Unlimited task colors with priority tagging system</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Time Blocking Pro</h4>
                        <p className="text-sm text-slate-600">Recurring blocks, focus mode, and weekly templates</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Custom Color Schemes</h4>
                        <p className="text-sm text-slate-600">Pre-made palettes and save your own combinations</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Priority Support</h4>
                        <p className="text-sm text-slate-600">Email support with 24-hour response time</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Early Feature Access</h4>
                        <p className="text-sm text-slate-600">Be the first to try new features and updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="mb-10">
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-6 text-center">
                  Choose Your Plan
                </h3>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Monthly Plan */}
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`card card-interactive text-left p-6 transition-all ${
                      selectedPlan === 'monthly'
                        ? 'ring-2 ring-primary-500 border-primary-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-display font-bold text-slate-900 mb-1">Monthly</h4>
                        <p className="text-sm text-slate-600">Billed monthly</p>
                      </div>
                      {selectedPlan === 'monthly' && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-display font-bold text-slate-900">$4.99</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All premium features
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cancel anytime
                      </li>
                    </ul>
                  </button>

                  {/* Yearly Plan */}
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`card card-interactive text-left p-6 transition-all relative ${
                      selectedPlan === 'yearly'
                        ? 'ring-2 ring-primary-500 border-primary-200'
                        : ''
                    }`}
                  >
                    <div className="absolute -top-3 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-500 text-white">
                        SAVE 33%
                      </span>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-display font-bold text-slate-900 mb-1">Yearly</h4>
                        <p className="text-sm text-slate-600">Billed annually</p>
                      </div>
                      {selectedPlan === 'yearly' && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-display font-bold text-slate-900">$39.99</span>
                      <span className="text-slate-600">/year</span>
                      <p className="text-sm text-success-600 font-medium mt-1">Just $3.33/month</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All premium features
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save $20 per year
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Best value
                      </li>
                    </ul>
                  </button>
                </div>
              </div>

              {/* Why Upgrade Section */}
              <div className="bg-slate-50 rounded-2xl p-8 mb-10">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-6 text-center">
                  Why Upgrade Now?
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💰</div>
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Incredible ROI</p>
                      <p className="text-sm text-slate-600">Save 2+ hours weekly (worth $50+/week at $25/hour)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Never Miss Deadlines</p>
                      <p className="text-sm text-slate-600">Visual priority system keeps critical tasks visible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🧘</div>
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Reduce Calendar Stress</p>
                      <p className="text-sm text-slate-600">Clear visual organization brings peace of mind</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Join 50,000+ Users</p>
                      <p className="text-sm text-slate-600">Trusted by professionals worldwide</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mb-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">
                      "This extension literally changed how I work. My calendar went from chaos to clarity. Best $4 I spend each month."
                    </p>
                    <p className="text-sm font-medium text-slate-900">— Jennifer L., Marketing Consultant</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">
                      "Color-coding my tasks by priority has been a game changer. I never miss important deadlines anymore. Highly recommend!"
                    </p>
                    <p className="text-sm font-medium text-slate-900">— Michael T., Product Manager</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center mb-6">
                <button
                  onClick={handleUpgrade}
                  className="btn btn-primary btn-xl group w-full sm:w-auto"
                >
                  Upgrade to Premium
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Payment via Paddle
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cancel Anytime
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  30-Day Money-Back Guarantee
                </div>
              </div>

              {/* Free Version Option */}
              <div className="text-center pt-6">
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                  Continue with Limited Free Version
                </Link>
                <p className="text-xs text-slate-500 mt-2">
                  (Basic day coloring only, no task coloring or time blocking)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
