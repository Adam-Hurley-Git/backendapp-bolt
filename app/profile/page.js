'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'
import Link from 'next/link'
import UserBadge from '../../components/UserBadge'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
    website: '',
    location: '',
    phone: ''
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

        // Load user profile
        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.data) {
            setProfile(profileData.data)
            setFormData({
              full_name: profileData.data.full_name || '',
              avatar_url: profileData.data.avatar_url || '',
              bio: profileData.data.bio || '',
              website: profileData.data.website || '',
              location: profileData.data.location || '',
              phone: profileData.data.phone || ''
            })
          }
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile.data)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE'
      })

      if (response.ok) {
        await auth.signOut()
        router.push('/')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to delete account' })
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      setMessage({ type: 'error', text: 'An error occurred while deleting your account' })
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
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Profile Settings</h1>
              <p className="text-lg text-slate-600 mt-1">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="card card-elevated">
                  <div className="card-header">
                    <h3 className="text-lg font-display font-semibold text-slate-900">Basic Information</h3>
                  </div>
                  <div className="card-body space-y-6">
                    {/* Avatar Section */}
                    <div>
                      <label className="label">Profile Picture</label>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full text-2xl font-semibold">
                          {formData.avatar_url ? (
                            <img
                              src={formData.avatar_url}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            (formData.full_name || user?.email || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="url"
                            name="avatar_url"
                            value={formData.avatar_url}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="https://example.com/avatar.jpg"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Enter a URL to your profile picture
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="full_name" className="label">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="input bg-slate-100 text-slate-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="label">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="input resize-none"
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="website" className="label">
                          Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="label">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="spinner spinner-sm mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="card card-elevated">
                <div className="card-header">
                  <h3 className="text-lg font-display font-semibold text-slate-900">Account Info</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Account ID</label>
                      <p className="text-xs font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded mt-1">
                        {user?.id || 'Loading...'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Member Since</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {profile?.user_created_at
                          ? new Date(profile.user_created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Last Updated</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {profile?.updated_at
                          ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>

                    {profile?.is_admin && (
                      <div>
                        <div className="badge badge-primary">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Admin Account
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="card card-elevated">
                <div className="card-header">
                  <h3 className="text-lg font-display font-semibold text-slate-900">Security</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {/* Only show change password for email/password users, not OAuth users */}
                    {user?.app_metadata?.provider === 'email' && (
                      <Link href="/profile/change-password" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2m-2 4V3a2 2 0 00-2-2H9a2 2 0 00-2 2v8.5m4.5-1.206a11.955 11.955 0 00-4.5 2.706m0-5V3a2 2 0 012-2h1.5a2 2 0 012 2v8.5M12 7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Change Password</p>
                          <p className="text-xs text-slate-500">Update your account password</p>
                        </div>
                      </Link>
                    )}

                    {/* Show auth provider info for OAuth users */}
                    {user?.app_metadata?.provider !== 'email' && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Authenticated via {user?.app_metadata?.provider === 'google' ? 'Google' : user?.app_metadata?.provider}
                          </p>
                          <p className="text-xs text-slate-500">Password managed by your provider</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Two-Factor Auth</p>
                        <p className="text-xs text-slate-500">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card border-danger-200">
                <div className="card-header border-danger-200">
                  <h3 className="text-lg font-display font-semibold text-danger-900">Danger Zone</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">Delete Account</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="btn btn-danger btn-sm"
                      >
                        Delete Account
                      </button>
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