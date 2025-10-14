'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'

export default function OnboardingPage() {
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
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div className="h-full bg-gradient-to-r from-primary-500 to-brand-600 transition-all duration-500" style={{ width: '25%' }}></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto w-full">
          {/* Welcome Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-brand-50 opacity-60"></div>

            <div className="relative px-6 py-8 sm:px-10 sm:py-10">
              <div className="text-center space-y-6">
                {/* Icon with Pulse Effect */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-brand-600 rounded-2xl shadow-xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-brand-600 rounded-2xl animate-pulse opacity-75"></div>
                  <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Heading */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                    Welcome to <span className="bg-gradient-to-r from-primary-600 to-brand-600 bg-clip-text text-transparent">CalendarExtension</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                    Transform your calendar into a <span className="font-semibold text-slate-900">visual productivity tool</span> in 60 seconds
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        <rect x="7" y="11" width="3" height="3" fill="currentColor" opacity="0.3" rx="0.5"/>
                        <rect x="11" y="11" width="3" height="3" fill="currentColor" opacity="0.5" rx="0.5"/>
                        <rect x="15" y="11" width="3" height="3" fill="currentColor" opacity="0.7" rx="0.5"/>
                        <rect x="7" y="15" width="3" height="3" fill="currentColor" opacity="0.4" rx="0.5"/>
                        <rect x="11" y="15" width="3" height="3" fill="currentColor" opacity="0.6" rx="0.5"/>
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-1 text-sm">Day Coloring</h3>
                    <p className="text-xs text-slate-600">Color-code weekdays for visual clarity</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-1 text-sm">Task Coloring</h3>
                    <p className="text-xs text-slate-600">Prioritize tasks by importance</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-1 text-sm">Time Blocking</h3>
                    <p className="text-xs text-slate-600">Protect focus time visually</p>
                  </div>
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    onClick={() => router.push('/onboarding/personalize')}
                    className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl"
                  >
                    Let's Get Started
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-6 text-sm border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Instant Setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">7-Day Free Trial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
