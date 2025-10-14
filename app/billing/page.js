'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'
import Link from 'next/link'

export default function BillingPage() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  // TEMPORARY: Subscription preview states for UI testing
  const [previewMode, setPreviewMode] = useState('real')

  const mockSubscriptions = {
    active: {
      plan_name: 'Pro Plan',
      status: 'active',
      unit_price: '29.99',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      license_key: 'EP-PRO-ABC123-DEF456-GHI789',
      paddle_subscription_id: 'sub_123456'
    },
    trial: {
      plan_name: 'Pro Plan',
      status: 'trialing',
      unit_price: '0.00',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billed_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      license_key: 'EP-TRIAL-XYZ123-ABC456-DEF789',
      paddle_subscription_id: 'sub_trial_123'
    },
    expired: {
      plan_name: 'Pro Plan',
      status: 'canceled',
      unit_price: '29.99',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billed_at: null,
      license_key: 'EP-EXP-JKL123-MNO456-PQR789',
      paddle_subscription_id: null
    }
  }

  const mockPaymentHistory = {
    active: [
      {
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: '29.99',
        currency: 'USD',
        status: 'completed',
        invoice_url: 'https://example.com/invoice1'
      },
      {
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: '29.99',
        currency: 'USD',
        status: 'completed',
        invoice_url: 'https://example.com/invoice2'
      }
    ],
    trial: [],
    expired: [
      {
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        amount: '29.99',
        currency: 'USD',
        status: 'completed',
        invoice_url: 'https://example.com/invoice3'
      }
    ]
  }

  // Override subscription and payment history based on preview mode
  const displaySubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode]
  const displayPaymentHistory = previewMode === 'real' ? paymentHistory : (mockPaymentHistory[previewMode] || [])

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const session = await auth.getCurrentSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }

        setUser(session.user)

        // Load subscription and payment history
        const [subscriptionRes, paymentsRes] = await Promise.all([
          fetch('/api/user/subscription'),
          fetch('/api/user/payments')
        ])

        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json()
          setSubscription(subscriptionData.data)
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          setPaymentHistory(paymentsData.data || [])
        }
      } catch (error) {
        console.error('Failed to load billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBillingData()
  }, [router])

  const handleUpdatePaymentMethod = useCallback(async () => {
    const currentSubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode]
    if (!currentSubscription?.paddle_subscription_id) {
      alert('No active subscription found')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/paddle/update-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.paddle_subscription_id
        })
      })

      const { data } = await response.json()

      if (data?.updateUrl) {
        window.open(data.updateUrl, '_blank')
      } else {
        throw new Error('Failed to get update URL')
      }
    } catch (error) {
      console.error('Failed to update payment method:', error)
      alert('Failed to open payment method update. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }, [previewMode, subscription, mockSubscriptions])

  const handleManageSubscription = useCallback(async () => {
    const currentSubscription = previewMode === 'real' ? subscription : mockSubscriptions[previewMode]
    if (!currentSubscription?.paddle_subscription_id) {
      alert('No active subscription found')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/paddle/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.paddle_subscription_id
        })
      })

      const { data } = await response.json()

      if (data?.managementUrl) {
        window.open(data.managementUrl, '_blank')
      } else {
        throw new Error('Failed to get management URL')
      }
    } catch (error) {
      console.error('Failed to open subscription management:', error)
      alert('Failed to open subscription management. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }, [previewMode, subscription, mockSubscriptions])

  const handleChangePlan = useCallback(() => {
    router.push('/pricing?change=true')
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold">Billing & Subscription</h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {(previewMode === 'none' ? null : displaySubscription) ? (
            <div className="space-y-8">
              {/* Current Subscription */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold">Current Subscription</h2>
                </div>
                <div className="card-body">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">{displaySubscription.plan_name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span>${displaySubscription.unit_price} {displaySubscription.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Billing Cycle:</span>
                          <span className="capitalize">{displaySubscription.billing_cycle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`status-badge status-${displaySubscription.status}`}>
                            {displaySubscription.status.charAt(0).toUpperCase() + displaySubscription.status.slice(1)}
                          </span>
                        </div>
                        {displaySubscription.next_billed_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Billing:</span>
                            <span>{new Date(displaySubscription.next_billed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleManageSubscription}
                        disabled={actionLoading}
                        className="w-full btn btn-primary"
                      >
                        {actionLoading ? 'Loading...' : 'Manage Subscription'}
                      </button>
                      <button
                        onClick={handleUpdatePaymentMethod}
                        disabled={actionLoading}
                        className="w-full btn btn-secondary"
                      >
                        Update Payment Method
                      </button>
                      <button
                        onClick={handleChangePlan}
                        className="w-full btn btn-secondary"
                      >
                        Change Plan
                      </button>
                      <Link href="/billing/cancel" className="block w-full text-center btn btn-secondary text-red-600">
                        Cancel Subscription
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold">Billing Information</h2>
                </div>
                <div className="card-body">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Billing Email</h4>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                    {displaySubscription.license_key && (
                      <div>
                        <h4 className="font-medium mb-2">License Key</h4>
                        <div className="flex">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded-l text-sm font-mono">
                            {displaySubscription.license_key}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(displaySubscription.license_key)}
                            className="px-3 py-2 bg-gray-200 rounded-r hover:bg-gray-300 text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold">Payment History</h2>
                </div>
                <div className="card-body">
                  {displayPaymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Invoice
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {displayPaymentHistory.map((payment, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${payment.amount} {payment.currency}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`status-badge status-${payment.status}`}>
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {payment.invoice_url ? (
                                  <a
                                    href={payment.invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700"
                                  >
                                    View Invoice
                                  </a>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                      <p className="text-gray-600">Your payment history will appear here once you have made payments.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Active Subscription</h2>
                <p className="text-gray-600 mb-6">
                  You don't have an active subscription. Choose a plan to get started.
                </p>
                <Link href="/pricing" className="btn btn-primary">
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}