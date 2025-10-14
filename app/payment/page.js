'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'

export default function PaymentPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [immediateAccessAccepted, setImmediateAccessAccepted] = useState(false)
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false)
  const [recurringPaymentAccepted, setRecurringPaymentAccepted] = useState(false)
  const [acceptAll, setAcceptAll] = useState(false)
  const [processing, setProcessing] = useState(false)
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

  const handleAcceptAll = (checked) => {
    setAcceptAll(checked)
    setTermsAccepted(checked)
    setPrivacyAccepted(checked)
    setImmediateAccessAccepted(checked)
    setRefundPolicyAccepted(checked)
    setRecurringPaymentAccepted(checked)
  }

  const handleIndividualCheckbox = (type, checked) => {
    if (type === 'terms') setTermsAccepted(checked)
    if (type === 'privacy') setPrivacyAccepted(checked)
    if (type === 'immediate') setImmediateAccessAccepted(checked)
    if (type === 'refund') setRefundPolicyAccepted(checked)
    if (type === 'recurring') setRecurringPaymentAccepted(checked)

    // If any required checkbox is unchecked, uncheck accept all
    if (!checked && (type === 'terms' || type === 'privacy' || type === 'refund' || type === 'recurring')) {
      setAcceptAll(false)
    } else {
      // If all required checkboxes are now checked, check accept all
      const allRequiredChecked = (type === 'terms' ? checked : termsAccepted) &&
                                 (type === 'privacy' ? checked : privacyAccepted) &&
                                 (type === 'refund' ? checked : refundPolicyAccepted) &&
                                 (type === 'recurring' ? checked : recurringPaymentAccepted)
      setAcceptAll(allRequiredChecked)
    }
  }

  const handlePayment = async () => {
    if (!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted) {
      alert('Please accept all required terms and conditions to continue')
      return
    }

    setProcessing(true)

    try {
      // Save consent data to database
      const consentTimestamp = new Date().toISOString()

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
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Consent API error:', errorData)
        throw new Error(errorData.details || 'Failed to save consent data')
      }

      const result = await response.json()
      console.log('Consent saved successfully:', result)

      // Redirect to payment website with plan info
      const paymentUrl = `https://calendarextension.com/checkout?plan=annual&email=${encodeURIComponent(user?.email || '')}`
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Error saving consent:', error)
      alert('Failed to save consent data. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="spinner spinner-lg text-primary-600"></div>
      </div>
    )
  }

  const features = [
    'Unlimited color customization',
    'Priority task coloring',
    'Custom time blocking',
    'All future features',
    'Priority support',
    'Cancel anytime'
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
              Unlock Your Full Calendar Potential
            </h1>
            <p className="text-base text-slate-600">
              Start customizing your calendar experience today
            </p>
          </div>

          {/* Plan Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-primary-300 mb-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg mb-3">
                7-Day Free Trial
              </div>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-bold text-success-600">$0.00</span>
                <span className="text-xl text-slate-600">today</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Start your <span className="font-semibold text-success-700">7-day free trial</span> now
              </p>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-700 mb-1">
                  <span className="font-bold text-slate-900">After trial:</span> $2.92/month
                </p>
                <p className="text-xs text-slate-600">
                  Billed annually at $34.99/year • Cancel anytime during trial
                </p>
                <p className="text-xs text-slate-500 mt-2 italic">
                  * Price excludes applicable taxes
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-slate-200 mb-4">
            <div className="space-y-3">
              {/* Accept All Checkbox */}
              <div className="border-b border-slate-200 pb-4 mb-4 bg-gradient-to-r from-primary-50 to-slate-50 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptAll}
                    onChange={(e) => handleAcceptAll(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-primary-400 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-base font-bold text-primary-800 group-hover:text-primary-900">
                    Accept All Terms and Conditions to Start
                  </span>
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => handleIndividualCheckbox('terms', e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">
                  I agree to the{' '}
                  <a
                    href="https://calendarextension.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Terms of Service
                  </a>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={refundPolicyAccepted}
                  onChange={(e) => handleIndividualCheckbox('refund', e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">
                  I agree to the{' '}
                  <a
                    href="https://calendarextension.com/refund"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Refund Policy
                  </a>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => handleIndividualCheckbox('privacy', e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">
                  I agree to the{' '}
                  <a
                    href="https://calendarextension.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={recurringPaymentAccepted}
                  onChange={(e) => handleIndividualCheckbox('recurring', e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900">
                  I agree to recurring payment subscriptions after the trial period ends
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={immediateAccessAccepted}
                  onChange={(e) => handleIndividualCheckbox('immediate', e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer flex-shrink-0 mt-0.5"
                />
                <span className="text-xs text-slate-700 group-hover:text-slate-900 leading-relaxed">
                  I request immediate access to ColorKit and consent to immediate performance. I understand I will lose my 14-day right to withdraw once access begins
                </span>
              </label>
            </div>
          </div>

          {/* Payment Button */}
          <div className="text-center mb-4">
            <button
              onClick={handlePayment}
              disabled={!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted || processing}
              className={`btn btn-primary btn-xl group w-full ${
                (!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted || processing) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processing ? (
                <>
                  <div className="spinner spinner-sm"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Start Free Trial
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            {(!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted) && (
              <p className="text-xs text-red-600 mt-1">
                Please accept all required terms to continue
              </p>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">SSL Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span className="font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
