'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../../lib/auth'

export default function PersonalizePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [featureSuggestion, setFeatureSuggestion] = useState('')
  const router = useRouter()

  const painPoints = [
    {
      id: 'visualClarity',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      title: 'My calendar days blend together',
      description: 'Need visual organization to see weekly patterns at a glance',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'taskPriority',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: 'Important tasks get buried',
      description: 'Need a way to color-code and prioritize critical to-dos',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'timeProtection',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Need to block time for deep work",
      description: 'Want visual time blocks to protect focus periods',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'allThree',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      title: 'Want complete calendar control',
      description: 'Need day colors, task priorities, and time blocking together',
      gradient: 'from-purple-500 to-pink-500'
    }
  ]

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

  const handleContinue = async () => {
    if (!selected) return

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
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Onboarding progress API error:', errorData)
        throw new Error(errorData.details || 'Failed to save progress')
      }

      const result = await response.json()
      console.log('Progress saved successfully:', result)

      // Route to demo page with pain point context
      router.push(`/onboarding/demo?painPoint=${selected}`)
    } catch (error) {
      console.error('Failed to save progress:', error)
      // Continue anyway
      router.push(`/onboarding/demo?painPoint=${selected}`)
    }
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
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div className="h-full bg-gradient-to-r from-primary-500 to-brand-600 transition-all duration-500" style={{ width: '50%' }}></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding')}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Main Content */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">
              What's your biggest calendar challenge?
            </h1>
            <p className="text-lg text-slate-600">
              We'll personalize your experience
            </p>
          </div>

          {/* Pain Point Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {painPoints.map((point) => (
              <button
                key={point.id}
                onClick={() => setSelected(point.id)}
                className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                  selected === point.id
                    ? 'ring-2 ring-offset-2 ring-primary-500 shadow-xl scale-[1.02]'
                    : 'bg-white border border-slate-200 hover:border-primary-300 hover:shadow-lg'
                }`}
              >
                {/* Gradient Background (when selected) */}
                {selected === point.id && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${point.gradient} opacity-5`}></div>
                )}

                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    selected === point.id
                      ? `bg-gradient-to-br ${point.gradient} text-white shadow-lg`
                      : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 group-hover:from-primary-50 group-hover:to-brand-50 group-hover:text-primary-600'
                  }`}>
                    <div className="scale-75">
                      {point.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-display font-bold text-base mb-1 transition-colors ${
                      selected === point.id ? 'text-slate-900' : 'text-slate-800 group-hover:text-slate-900'
                    }`}>
                      {point.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {point.description}
                    </p>
                  </div>

                  {/* Checkmark */}
                  {selected === point.id && (
                    <div className="flex-shrink-0 animate-scale-in">
                      <div className={`w-6 h-6 bg-gradient-to-br ${point.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feature Suggestion Input */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-slate-900 text-base mb-1">
                    Got a feature idea? <span className="text-slate-500 font-normal text-sm">(Optional)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Share any Google Calendar feature or change you'd like to see - we're always building based on your feedback!
                  </p>
                  <textarea
                    value={featureSuggestion}
                    onChange={(e) => setFeatureSuggestion(e.target.value)}
                    placeholder="e.g., I wish I could sync my calendar with..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all resize-none text-slate-800 placeholder-slate-400"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500">
                      Help us build what you need
                    </p>
                    <p className="text-xs text-slate-400">
                      {featureSuggestion.length}/500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="btn btn-primary btn-xl group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
