'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../../lib/auth'

export default function CompletePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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

        // Mark onboarding as complete
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Complete onboarding API error:', errorData)
        } else {
          const result = await response.json()
          console.log('Onboarding completed successfully:', result)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="spinner spinner-lg text-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar - Complete! */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div className="h-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-500" style={{ width: '100%' }}></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full">
          {/* Success Card */}
          <div className="card card-elevated animate-fade-in-up">
            <div className="card-body text-center space-y-6">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-full animate-scale-in">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-slate-900">
                  You're All Set! 🎉
                </h1>
                <p className="text-lg text-slate-600">
                  Your calendar is now supercharged
                </p>
              </div>

              {/* Welcome Box */}
              <div className="bg-gradient-to-br from-primary-50 to-brand-50 rounded-xl p-4 border border-primary-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <p className="text-base font-semibold text-slate-900">Welcome to CalendarExtension!</p>
                </div>
                <p className="text-sm text-slate-700 mb-1">
                  Your calendar is ready to use
                </p>
                <p className="text-xs text-slate-600">
                  Start customizing your experience
                </p>
              </div>

              {/* What's Next */}
              <div className="text-left space-y-3 max-w-lg mx-auto">
                <h3 className="font-display font-semibold text-base text-slate-900 text-center">
                  What You Can Do Now:
                </h3>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Customize Colors</p>
                    <p className="text-xs text-slate-600">Pick your weekday scheme</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Color Tasks</p>
                    <p className="text-xs text-slate-600">Assign task priorities</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Block Time</p>
                    <p className="text-xs text-slate-600">Protect focus periods</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => router.push('/payment')}
                  className="btn btn-primary btn-xl group w-full sm:w-auto"
                >
                  Start Customizing
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Trust Indicator */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  🔒 Your data is secure • ✨ Free to start
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 card">
            <div className="card-body">
              <h3 className="font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pro Tip
              </h3>
              <p className="text-slate-600">
                Visit your <button onClick={() => router.push('/dashboard')} className="text-primary-600 hover:text-primary-700 font-medium">dashboard</button> to
                customize colors, manage your settings, and explore all available features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
