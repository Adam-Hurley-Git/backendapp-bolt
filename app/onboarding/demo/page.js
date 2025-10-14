'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '../../../lib/auth'
import Image from 'next/image'

export default function DemoPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const painPoint = searchParams.get('painPoint') || 'overwhelming'

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

  const features = [
    {
      id: 'dayColoring',
      title: 'Day Coloring',
      subtitle: 'See your week at a glance',
      description: 'Color-code each weekday with custom colors. Instantly identify patterns and scan your calendar 3x faster.',
      benefit: '⚡ Instant visual clarity',
      gradient: 'from-blue-500 to-purple-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    },
    {
      id: 'taskColoring',
      title: 'Task Coloring',
      subtitle: 'Never miss what matters',
      description: 'Assign colors to tasks by priority. Urgent items stand out immediately—nothing gets buried.',
      benefit: '🎯 Priority at a glance',
      gradient: 'from-red-500 to-orange-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'timeBlocking',
      title: 'Time Blocking',
      subtitle: 'Protect your focus time',
      description: 'Create visual time blocks to see available focus periods and protect deep work sessions.',
      benefit: '🧘 Control your schedule',
      gradient: 'from-green-500 to-teal-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  const handleTryFeature = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'demo',
          featuresViewed: features.map(f => f.id)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Demo progress API error:', errorData)
        throw new Error(errorData.details || 'Failed to save progress')
      }

      const result = await response.json()
      console.log('Demo progress saved successfully:', result)

      router.push('/onboarding/complete')
    } catch (error) {
      console.error('Failed to save progress:', error)
      router.push('/onboarding/complete')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="spinner spinner-lg text-primary-600"></div>
      </div>
    )
  }

  const currentFeature = features[currentStep]
  const progress = ((currentStep + 1) / features.length) * 50 + 50 // 50-100%

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div className="h-full bg-gradient-to-r from-primary-500 to-brand-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding/personalize')}
            className="mb-3 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Feature Demo */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} opacity-5`}></div>

            <div className="relative px-6 py-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${currentFeature.gradient} rounded-2xl mb-4 shadow-xl`}>
                  <div className="text-white scale-75">
                    {currentFeature.icon}
                  </div>
                </div>
                <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
                  {currentFeature.title}
                </h1>
                <p className="text-lg text-slate-600 mb-2 font-medium">
                  {currentFeature.subtitle}
                </p>
                <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                  {currentFeature.description}
                </p>
              </div>

              {/* Visual Demo */}
              <div className="mb-6">
                {currentStep === 1 || currentStep === 2 ? (
                  /* Task Coloring & Time Blocking - Side by side within single container */
                  <div className="bg-white rounded-xl p-4 shadow-2xl border-2 border-primary-300">
                    <div className="flex gap-6 justify-center items-start">
                      {currentStep === 1 ? (
                        <>
                          {/* Before - Standard blue tasks */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-3">Before</p>
                            <div className="space-y-2 min-w-[180px]">
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs text-blue-900">Team Meeting</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs text-blue-900">Review Docs</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs text-blue-900">Send Email</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs text-blue-900">Call Client</span>
                          </div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-32 bg-slate-300 self-center"></div>

                          {/* After - Priority colored tasks */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-primary-600 text-center uppercase tracking-wide mb-3">After ✨</p>
                            <div className="space-y-2 min-w-[180px]">
                          <div className="h-8 bg-red-100 rounded border-l-4 border-red-500 px-2 flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs font-semibold text-red-900">Team Meeting</span>
                          </div>
                          <div className="h-8 bg-amber-100 rounded border-l-4 border-amber-500 px-2 flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs font-semibold text-amber-900">Review Docs</span>
                          </div>
                          <div className="h-8 bg-green-100 rounded border-l-4 border-green-500 px-2 flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs font-semibold text-green-900">Send Email</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" opacity="0.3"/>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-xs font-semibold text-blue-900">Call Client</span>
                          </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Before - Plain calendar grid */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-3">Before</p>
                            <div className="space-y-1 min-w-[200px]">
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">9:00 AM</span>
                                <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                              </div>
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">10:00 AM</span>
                                <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                              </div>
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">11:00 AM</span>
                                <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                              </div>
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">12:00 PM</span>
                                <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                              </div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-36 bg-slate-300 self-center"></div>

                          {/* After - Time blocks with labels */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-primary-600 text-center uppercase tracking-wide mb-3">After ✨</p>
                            <div className="space-y-1 min-w-[200px]">
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">9:00 AM</span>
                                <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded px-2 flex items-center shadow-md">
                                  <span className="text-xs font-bold text-purple-700">🎯 Deep Work</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">10:00 AM</span>
                                <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded px-2 flex items-center shadow-md">
                                  <span className="text-xs font-bold text-purple-700">🎯 Deep Work</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">11:00 AM</span>
                                <div className="flex-1 h-6 bg-gradient-to-r from-teal-200 to-teal-300 border-2 border-teal-400 rounded px-2 flex items-center shadow-md">
                                  <span className="text-xs font-bold text-teal-700">💬 Meetings</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                <span className="text-xs text-slate-400 font-mono">12:00 PM</span>
                                <div className="flex-1 h-6 bg-gradient-to-r from-amber-200 to-amber-300 border-2 border-amber-400 rounded px-2 flex items-center shadow-md">
                                  <span className="text-xs font-bold text-amber-700">🍽️ Lunch Break</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Day Coloring & Time Blocking - Original layout */
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide">Before</p>
                      <div className="bg-white rounded-xl p-4 min-h-[140px] shadow-lg border-2 border-slate-200">
                        <div className="flex gap-2 justify-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Mon</span>
                            <div className="w-12 h-20 bg-slate-50 rounded-lg shadow-sm border-2 border-slate-300"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Tue</span>
                            <div className="w-12 h-20 bg-slate-50 rounded-lg shadow-sm border-2 border-slate-300"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Wed</span>
                            <div className="w-12 h-20 bg-slate-50 rounded-lg shadow-sm border-2 border-slate-300"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Thu</span>
                            <div className="w-12 h-20 bg-slate-50 rounded-lg shadow-sm border-2 border-slate-300"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Fri</span>
                            <div className="w-12 h-20 bg-slate-50 rounded-lg shadow-sm border-2 border-slate-300"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-primary-600 text-center uppercase tracking-wide">After ✨</p>
                      <div className="bg-white rounded-xl p-4 min-h-[140px] shadow-2xl border-2 border-primary-300">
                        <div className="flex gap-2 justify-center">
                          {currentStep === 0 ? (
                            <>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-blue-600">Mon</span>
                                <div className="w-12 h-20 bg-gradient-to-b from-blue-200 to-blue-300 rounded-lg shadow-lg border-2 border-blue-400"></div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-purple-600">Tue</span>
                                <div className="w-12 h-20 bg-gradient-to-b from-purple-200 to-purple-300 rounded-lg shadow-lg border-2 border-purple-400"></div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-pink-600">Wed</span>
                                <div className="w-12 h-20 bg-gradient-to-b from-pink-200 to-pink-300 rounded-lg shadow-lg border-2 border-pink-400"></div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-green-600">Thu</span>
                                <div className="w-12 h-20 bg-gradient-to-b from-green-200 to-green-300 rounded-lg shadow-lg border-2 border-green-400"></div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-amber-600">Fri</span>
                                <div className="w-12 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-lg shadow-lg border-2 border-amber-400"></div>
                              </div>
                            </>
                          ) : (
                            <div className="flex gap-6 w-full justify-center items-start">
                              {/* Before - Plain calendar grid */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-3">Before</p>
                                <div className="space-y-1 min-w-[200px]">
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">9:00 AM</span>
                                    <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                                  </div>
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">10:00 AM</span>
                                    <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                                  </div>
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">11:00 AM</span>
                                    <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                                  </div>
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">12:00 PM</span>
                                    <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="w-px h-32 bg-slate-300 self-center"></div>

                              {/* After - Time blocks with labels */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-primary-600 text-center uppercase tracking-wide mb-3">After ✨</p>
                                <div className="space-y-1 min-w-[200px]">
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">9:00 AM</span>
                                    <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded px-2 flex items-center shadow-md">
                                      <span className="text-xs font-bold text-purple-700">🎯 Deep Work</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">10:00 AM</span>
                                    <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded px-2 flex items-center shadow-md">
                                      <span className="text-xs font-bold text-purple-700">🎯 Deep Work</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">11:00 AM</span>
                                    <div className="flex-1 h-6 bg-gradient-to-r from-teal-200 to-teal-300 border-2 border-teal-400 rounded px-2 flex items-center shadow-md">
                                      <span className="text-xs font-bold text-teal-700">💬 Meetings</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                                    <span className="text-xs text-slate-400 font-mono">12:00 PM</span>
                                    <div className="flex-1 h-6 bg-gradient-to-r from-amber-200 to-amber-300 border-2 border-amber-400 rounded px-2 flex items-center shadow-md">
                                      <span className="text-xs font-bold text-amber-700">🍽️ Lunch Break</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary-500'
                        : index < currentStep
                        ? 'w-2 bg-primary-300'
                        : 'w-2 bg-slate-300'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={handleTryFeature}
                  className="btn btn-primary btn-xl group"
                >
                  {currentStep < features.length - 1 ? 'Next Feature' : "I'm Ready!"}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleComplete}
              className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
            >
              Skip demo and explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
