'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'
import { PADDLE_PLANS } from '../../lib/paddle'
import Link from 'next/link'

export default function PricingPage() {
  const [user, setUser] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billingCycle, setBillingCycle] = useState('yearly')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await auth.getCurrentSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  const plans = Object.entries(PADDLE_PLANS).filter(([key, plan]) =>
    plan.billing_cycle === billingCycle
  )

  const handlePlanSelect = (planKey, plan) => {
    setSelectedPlan({ key: planKey, ...plan })
  }

  const handleSignInWithGoogle = async () => {
    setLoading(true)
    try {
      await auth.signInWithGoogle(`/pricing?plan=${selectedPlan?.key}`)
    } catch (error) {
      console.error('Google sign-in failed:', error)
      alert('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan || !termsAccepted || !privacyAccepted) {
      alert('Please select a plan and accept the required policies.')
      return
    }

    setLoading(true)
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
          email: user?.email,
          termsAccepted,
          privacyAccepted,
          marketingAccepted
        })
      })

      const { data } = await response.json()

      if (data?.checkoutUrl) {
        // Redirect to Paddle checkout
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Failed to proceed to payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="feature-icon mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <Link href="/" className="text-xl font-display font-bold text-neutral-900">Chrome Extension</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/#features" className="nav-link">Features</Link>
              <Link href="/pricing" className="nav-link-active">Pricing</Link>
              <Link href="/auth/login" className="nav-link">Sign In</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="hero-section py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Start your free trial today and experience the full power of our Chrome extension.
              Upgrade anytime to unlock premium features.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-white rounded-2xl p-2 shadow-soft border border-neutral-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full font-semibold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {plans.map(([planKey, plan]) => (
              <div
                key={planKey}
                className={`pricing-card cursor-pointer ${
                  selectedPlan?.key === planKey ? 'pricing-card-featured' : ''
                } ${planKey.includes('PREMIUM') ? 'pricing-card-featured' : ''}`}
                onClick={() => handlePlanSelect(planKey, plan)}
              >
                {planKey.includes('PREMIUM') && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-display font-bold mb-2 text-neutral-900">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-display font-bold text-neutral-900">${plan.price}</span>
                    <span className="text-lg text-neutral-500 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-sm text-secondary-600 font-medium">
                      Save ${(plan.price * 2).toFixed(0)} per year
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-secondary-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <svg className="w-3 h-3 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-neutral-700 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <button
                    onClick={() => handlePlanSelect(planKey, plan)}
                    className={`w-full ${
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
            ))}
          </div>

          {/* Authentication and Policy Section */}
          {selectedPlan && (
            <div className="max-w-2xl mx-auto">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold">Complete Your Purchase</h2>
                </div>
                <div className="card-body">
                  {!user ? (
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-4">Sign in to continue</h3>
                      <p className="text-gray-600 mb-6">
                        You'll need to sign in before proceeding to payment.
                      </p>
                      <button
                        onClick={handleSignInWithGoogle}
                        disabled={loading}
                        className="btn btn-primary flex items-center justify-center mx-auto"
                      >
                        {loading ? (
                          <div className="loading-spinner mr-2"></div>
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                        )}
                        Continue with Google
                      </button>
                      <div className="mt-4">
                        <Link href="/auth/login" className="text-primary-600 hover:text-primary-700">
                          Or sign in with email
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <p className="text-green-600 mb-2">✓ Signed in as {user.email}</p>
                        <p className="text-gray-600">Selected: {selectedPlan.name} - ${selectedPlan.price}</p>
                      </div>

                      {/* Policy Checkboxes */}
                      <div className="space-y-4 mb-6">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 mr-3"
                            required
                          />
                          <span className="text-sm">
                            I agree to the{' '}
                            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                              Terms of Service
                            </Link>{' '}
                            <span className="text-red-500">*</span>
                          </span>
                        </label>

                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={privacyAccepted}
                            onChange={(e) => setPrivacyAccepted(e.target.checked)}
                            className="mt-1 mr-3"
                            required
                          />
                          <span className="text-sm">
                            I agree to the{' '}
                            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                              Privacy Policy
                            </Link>{' '}
                            <span className="text-red-500">*</span>
                          </span>
                        </label>

                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={marketingAccepted}
                            onChange={(e) => setMarketingAccepted(e.target.checked)}
                            className="mt-1 mr-3"
                          />
                          <span className="text-sm">
                            I agree to receive marketing communications (optional)
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={handleProceedToPayment}
                        disabled={loading || !termsAccepted || !privacyAccepted}
                        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="loading-spinner mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          'Proceed to Payment'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}