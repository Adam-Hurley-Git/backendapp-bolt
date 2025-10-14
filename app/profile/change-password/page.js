'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../../lib/auth'
import Link from 'next/link'
import UserBadge from '../../../components/UserBadge'
import { supabase } from '../../../lib/supabase'

export default function ChangePasswordPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = await auth.getCurrentSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }

        setUser(session.user)

        // Redirect OAuth users back to profile - they can't change password
        if (session.user?.app_metadata?.provider !== 'email') {
          router.push('/profile')
          return
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }

  const validateForm = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return false
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' })
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    setMessage(null)

    try {
      // Use Supabase auth to update password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Password updated successfully!' })

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

    } catch (error) {
      console.error('Failed to update password:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update password. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/billing" className="nav-link">Billing</Link>
                <Link href="/profile" className="nav-link nav-link-active">Settings</Link>
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
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Change Password</h1>
              <p className="text-lg text-slate-600 mt-1">
                Update your account password
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="card card-elevated">
            <div className="card-header">
              <h3 className="text-lg font-display font-semibold text-slate-900">Update Password</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter your new password"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Confirm your new password"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Link href="/profile" className="btn btn-secondary">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="spinner spinner-sm mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>

              {/* Message Display */}
              {message && (
                <div className={`mt-6 p-4 rounded-xl border ${
                  message.type === 'success'
                    ? 'bg-success-50 border-success-200 text-success-800'
                    : 'bg-danger-50 border-danger-200 text-danger-800'
                }`}>
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {message.text}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="card mt-6 border-blue-200 bg-blue-50">
            <div className="card-body">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Security Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use a strong, unique password that you don't use elsewhere</li>
                    <li>• Consider using a password manager to generate and store secure passwords</li>
                    <li>• After changing your password, you may need to sign in again on other devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}