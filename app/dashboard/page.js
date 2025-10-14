'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const UserBadge = dynamic(() => import('../../components/UserBadge'), {
  ssr: false,
  loading: () => <div className="skeleton-avatar"></div>
})

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsage: 0,
    monthlyUsage: 0,
    extensionStatus: 'active'
  })

  // TEMPORARY: Subscription preview states for UI testing
  const [previewMode, setPreviewMode] = useState('real')

  const mockSubscriptions = {
    active: {
      plan_name: 'Pro Plan',
      status: 'active',
      price: '29.99',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 5000,
      license_key: 'EP-PRO-ABC123-DEF456-GHI789'
    },
    trial: {
      plan_name: 'Pro Plan',
      status: 'trialing',
      price: '0.00',
      next_billing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      next_payment_amount: '29.99',
      usage_limit: 1000,
      license_key: 'EP-TRIAL-XYZ123-ABC456-DEF789'
    },
    expired: {
      plan_name: 'Pro Plan',
      status: 'canceled',
      price: '29.99',
      next_billing_date: null,
      canceled_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 0,
      license_key: 'EP-EXP-JKL123-MNO456-PQR789'
    },
  }

  // Override subscription based on preview mode
  const displaySubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode]
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard: Auth state -', { authLoading, user: user?.email || 'No user' })

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      console.log('Dashboard: No user found, redirecting to login')
      router.push('/auth/login')
      return
    }

    // Load dashboard data if user is authenticated
    if (user) {
      const loadDashboardData = async () => {
        try {
          setLoading(true)

          // Load user profile
          const profileRes = await fetch('/api/user/profile')
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            setProfile(profileData.data)
          }

          // Load subscription data
          try {
            const subscriptionData = await db.getSubscription(user.id)
            if (subscriptionData) {
              setSubscription(subscriptionData)
            }
          } catch (error) {
            console.log('No subscription found:', error)
          }

          // Mock usage stats - replace with real API calls
          setStats({
            totalUsage: 1247,
            monthlyUsage: 89,
            extensionStatus: 'active'
          })

        } catch (error) {
          console.error('Failed to load dashboard data:', error)
        } finally {
          setLoading(false)
        }
      }

      loadDashboardData()
    }
  }, [user, authLoading, router])

  const subscriptionStatus = useMemo(() => {
    const sub = displaySubscription
    if (!sub) return 'No active subscription'
    if (sub.status === 'active') return 'Active Subscription'
    if (sub.status === 'trialing') {
      const trialDays = Math.ceil((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24))
      return `Free Trial (${trialDays} days remaining)`
    }
    if (sub.status === 'canceled' && sub.canceled_date) {
      return `Canceled on ${new Date(sub.canceled_date).toLocaleDateString()}`
    }
    return 'Subscription Inactive'
  }, [displaySubscription])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner spinner-lg text-primary-600"></div>
      </div>
    )
  }

  // If not loading and no user, the useEffect will handle the redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner spinner-lg text-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-display font-bold text-slate-900">CalendarExtension</span>
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="nav-link nav-link-active">Dashboard</Link>
                <Link href="/billing" className="nav-link">Billing</Link>
                <Link href="/profile" className="nav-link">Settings</Link>
                <Link href="/support" className="nav-link">Support</Link>
              </nav>
              <UserBadge />
            </div>
          </div>
        </div>
      </nav>

      <div className="container-wide section-padding-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-lg text-slate-600">
            Manage your CalendarExtension - ColorKit subscription and view your usage statistics
          </p>
        </div>


        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscription Info */}
          <div className="lg:col-span-2">
            <div className="card card-elevated mb-6">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-semibold text-slate-900">Subscription Details</h3>
                  <div className="flex items-center gap-3">
                    {/* TEMPORARY: UI Preview Dropdown */}
                    <select
                      value={previewMode}
                      onChange={(e) => setPreviewMode(e.target.value)}
                      className="text-xs px-2 py-1 border border-orange-300 bg-orange-50 text-orange-700 rounded font-medium"
                    >
                      <option value="real">Real Data</option>
                      <option value="active">Active Sub</option>
                      <option value="trial">Trial Sub</option>
                      <option value="expired">Expired Sub</option>
                      <option value="none">No Sub</option>
                    </select>
                    <Link href="/billing" className="btn btn-outline btn-sm">
                      Manage Billing
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {(previewMode === 'none' ? null : displaySubscription) ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900 mb-1">{displaySubscription.plan_name || 'Pro Plan'}</h4>
                        <p className="text-sm text-slate-600">
                          {subscriptionStatus}
                        </p>
                      </div>
                      <div className="text-right">
                        {displaySubscription.status === 'trialing' ? (
                          <>
                            <p className="text-2xl font-display font-bold text-success-600">
                              FREE TRIAL
                            </p>
                            <p className="text-xs text-slate-500">
                              Trial ends: {displaySubscription.next_billing_date ? new Date(displaySubscription.next_billing_date).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              Next payment: ${displaySubscription.next_payment_amount || '29.99'}/month
                            </p>
                          </>
                        ) : displaySubscription.status === 'canceled' ? (
                          <>
                            <p className="text-2xl font-display font-bold text-danger-600">
                              SUBSCRIPTION CANCELED
                            </p>
                            <p className="text-xs text-slate-500">
                              Canceled: {displaySubscription.canceled_date ? new Date(displaySubscription.canceled_date).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Was: ${displaySubscription.price || '29.99'}/month
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-display font-bold text-slate-900">
                              ${displaySubscription.price || '29.99'}<span className="text-sm font-normal text-slate-500">/month</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              Next billing: {displaySubscription.next_billing_date ? new Date(displaySubscription.next_billing_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Thank you message for active and trial subscriptions */}
                    {(displaySubscription.status === 'active' || displaySubscription.status === 'trialing') && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Thank you for your support!</p>
                            <p className="text-xs text-blue-700">I appreciate you choosing CalendarExtension - ColorKit</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 border border-slate-200 rounded-xl">
                      <p className="text-sm font-medium text-slate-600 mb-1">License Key</p>
                      <p className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {displaySubscription.license_key || profile?.license_key || 'Not generated'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">No Active Subscription</h4>
                    <p className="text-slate-600 mb-6">Upgrade to unlock all features and start boosting your productivity</p>
                    <Link href="/pricing" className="btn btn-primary">
                      Choose a Plan
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card card-elevated">
              <div className="card-header">
                <h3 className="text-lg font-display font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Update Profile</p>
                      <p className="text-xs text-slate-500">Manage your account settings</p>
                    </div>
                  </Link>

                  <Link href="/billing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Billing History</p>
                      <p className="text-xs text-slate-500">View invoices and payments</p>
                    </div>
                  </Link>

                  <Link href="/support" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Get Support</p>
                      <p className="text-xs text-slate-500">Contact our support team</p>
                    </div>
                  </Link>

                  {displaySubscription && (displaySubscription.status === 'active' || displaySubscription.status === 'trialing') && (
                    <Link href="/billing/cancel" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Cancel Subscription</p>
                        <p className="text-xs text-slate-500">End your subscription</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card card-elevated">
              <div className="card-header">
                <h3 className="text-lg font-display font-semibold text-slate-900">System Status</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">API Services</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-xs text-success-600">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Chrome Extension</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-xs text-success-600">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Billing System</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-xs text-success-600">Active</span>
                    </div>
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