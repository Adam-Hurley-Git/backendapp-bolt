'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [dataSource, setDataSource] = useState('master') // 'profiles', 'auth', or 'master'
  const [syncing, setSyncing] = useState(false)
  const [dataStats, setDataStats] = useState(null)
  const [saveIndicator, setSaveIndicator] = useState('')

  // Default column configuration
  const defaultColumns = {
    user: true,
    subscription: true,
    status: true,
    license_key: true,
    actions: true,
    // Additional columns (hidden by default)
    user_id: false,
    created_at: false,
    updated_at: false,
    avatar_url: false,
    phone: false,
    last_sign_in: false,
    email_confirmed: false,
    // Subscription details
    subscription_id: false,
    plan_id: false,
    billing_cycle: false,
    unit_price: false,
    currency: false,
    next_billing_date: false,
    started_at: false,
    canceled_at: false,
    paused_at: false,
    // Paddle specific
    paddle_customer_id: false,
    paddle_subscription_id: false,
    paddle_transaction_id: false,
    // Payment info
    payment_method: false,
    last_payment_date: false,
    next_retry_date: false,
    failed_payment_count: false,
    // Usage/Analytics
    total_logins: false,
    last_activity: false,
    registration_source: false,
    // Admin fields
    notes: false,
    tags: false,
    is_admin: false,

    // Master view specific columns
    has_profile: false,
    profile_source: false,
    subscription_count: false,
    email_confirmed: false,

    // Onboarding fields
    onboarding_completed: false,
    pain_point: false,
    trial_started_at: false,

    // Consent fields
    terms_consent: false,
    privacy_consent: false,
    refund_consent: false,
    immediate_access_consent: false,
    recurring_payment_consent: false
  }

  const [visibleColumns, setVisibleColumns] = useState(defaultColumns)
  const router = useRouter()

  // LocalStorage keys
  const COLUMN_PREFERENCES_KEY = 'admin_column_preferences'
  const DATA_SOURCE_KEY = 'admin_data_source'

  // Load preferences from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load column preferences
        const savedColumns = localStorage.getItem(COLUMN_PREFERENCES_KEY)
        if (savedColumns) {
          const parsedColumns = JSON.parse(savedColumns)
          // Merge with default columns to ensure new columns are included
          const mergedColumns = { ...defaultColumns, ...parsedColumns }
          setVisibleColumns(mergedColumns)
          console.log('Loaded column preferences from localStorage:', mergedColumns)
        }

        // Load data source preference
        const savedDataSource = localStorage.getItem(DATA_SOURCE_KEY)
        if (savedDataSource && ['master', 'profiles', 'auth'].includes(savedDataSource)) {
          setDataSource(savedDataSource)
          console.log('Loaded data source preference from localStorage:', savedDataSource)
        }
      } catch (error) {
        console.error('Error loading preferences from localStorage:', error)
      }
    }
  }, [])

  // Save preferences to localStorage whenever they change
  const saveColumnPreferences = (newColumns) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COLUMN_PREFERENCES_KEY, JSON.stringify(newColumns))
        console.log('Saved column preferences to localStorage:', newColumns)
        showSaveIndicator('Columns saved!')
      } catch (error) {
        console.error('Error saving column preferences to localStorage:', error)
        showSaveIndicator('Save failed!', 'error')
      }
    }
  }

  const saveDataSourcePreference = (newDataSource) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DATA_SOURCE_KEY, newDataSource)
        console.log('Saved data source preference to localStorage:', newDataSource)
        showSaveIndicator('Data source saved!')
      } catch (error) {
        console.error('Error saving data source preference to localStorage:', error)
        showSaveIndicator('Save failed!', 'error')
      }
    }
  }

  const showSaveIndicator = (message, type = 'success') => {
    setSaveIndicator({ message, type })
    setTimeout(() => setSaveIndicator(''), 2000)
  }

  // Column definitions with labels and categories
  const columnDefinitions = {
    // Core columns
    user: { label: 'User', category: 'Core', width: 'w-64' },
    subscription: { label: 'Subscription', category: 'Core', width: 'w-48' },
    status: { label: 'Status', category: 'Core', width: 'w-32' },
    license_key: { label: 'License Key', category: 'Core', width: 'w-48' },
    actions: { label: 'Actions', category: 'Core', width: 'w-32' },

    // User Details
    user_id: { label: 'User ID', category: 'User Details', width: 'w-32' },
    created_at: { label: 'Created Date', category: 'User Details', width: 'w-40' },
    updated_at: { label: 'Updated Date', category: 'User Details', width: 'w-40' },
    avatar_url: { label: 'Avatar', category: 'User Details', width: 'w-20' },
    phone: { label: 'Phone', category: 'User Details', width: 'w-32' },
    last_sign_in: { label: 'Last Sign In', category: 'User Details', width: 'w-40' },
    email_confirmed: { label: 'Email Confirmed', category: 'User Details', width: 'w-32' },

    // Subscription Details
    subscription_id: { label: 'Sub ID', category: 'Subscription', width: 'w-32' },
    plan_id: { label: 'Plan ID', category: 'Subscription', width: 'w-32' },
    billing_cycle: { label: 'Billing Cycle', category: 'Subscription', width: 'w-32' },
    unit_price: { label: 'Price', category: 'Subscription', width: 'w-24' },
    currency: { label: 'Currency', category: 'Subscription', width: 'w-20' },
    next_billing_date: { label: 'Next Billing', category: 'Subscription', width: 'w-40' },
    started_at: { label: 'Started At', category: 'Subscription', width: 'w-40' },
    canceled_at: { label: 'Canceled At', category: 'Subscription', width: 'w-40' },
    paused_at: { label: 'Paused At', category: 'Subscription', width: 'w-40' },

    // Paddle Integration
    paddle_customer_id: { label: 'Paddle Customer', category: 'Paddle', width: 'w-32' },
    paddle_subscription_id: { label: 'Paddle Sub ID', category: 'Paddle', width: 'w-32' },
    paddle_transaction_id: { label: 'Paddle Transaction', category: 'Paddle', width: 'w-32' },

    // Payment Information
    payment_method: { label: 'Payment Method', category: 'Payments', width: 'w-32' },
    last_payment_date: { label: 'Last Payment', category: 'Payments', width: 'w-40' },
    next_retry_date: { label: 'Next Retry', category: 'Payments', width: 'w-40' },
    failed_payment_count: { label: 'Failed Payments', category: 'Payments', width: 'w-32' },

    // Analytics & Usage
    total_logins: { label: 'Total Logins', category: 'Analytics', width: 'w-24' },
    last_activity: { label: 'Last Activity', category: 'Analytics', width: 'w-40' },
    registration_source: { label: 'Registration Source', category: 'Analytics', width: 'w-40' },

    // Admin Fields
    notes: { label: 'Notes', category: 'Admin', width: 'w-48' },
    tags: { label: 'Tags', category: 'Admin', width: 'w-32' },
    is_admin: { label: 'Is Admin', category: 'Admin', width: 'w-24' },

    // Master View Fields
    has_profile: { label: 'Has Profile', category: 'Master View', width: 'w-24' },
    profile_source: { label: 'Data Source', category: 'Master View', width: 'w-32' },
    subscription_count: { label: 'Sub Count', category: 'Master View', width: 'w-24' },
    email_confirmed: { label: 'Email Verified', category: 'Master View', width: 'w-32' },

    // Onboarding & Trial
    onboarding_completed: { label: 'Onboarding Done', category: 'Onboarding', width: 'w-32' },
    pain_point: { label: 'Pain Point', category: 'Onboarding', width: 'w-40' },
    trial_started_at: { label: 'Trial Started', category: 'Onboarding', width: 'w-40' },

    // Consent Tracking
    terms_consent: { label: 'Terms Consent', category: 'Consent', width: 'w-32' },
    privacy_consent: { label: 'Privacy Consent', category: 'Consent', width: 'w-32' },
    refund_consent: { label: 'Refund Consent', category: 'Consent', width: 'w-32' },
    immediate_access_consent: { label: 'Immediate Access', category: 'Consent', width: 'w-32' },
    recurring_payment_consent: { label: 'Recurring Payment', category: 'Consent', width: 'w-32' }
  }

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => {
      const newColumns = {
        ...prev,
        [columnKey]: !prev[columnKey]
      }
      saveColumnPreferences(newColumns)
      return newColumns
    })
  }

  const getColumnCategories = () => {
    const categories = {}
    Object.entries(columnDefinitions).forEach(([key, def]) => {
      if (!categories[def.category]) {
        categories[def.category] = []
      }
      categories[def.category].push(key)
    })
    return categories
  }

  const renderCellData = (user, columnKey) => {
    const subscription = user.subscriptions?.[0]

    switch (columnKey) {
      case 'user':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                {user.avatar_url ? (
                  <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                ) : (
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {user.full_name || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        )

      case 'subscription':
        return subscription ? (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {subscription.plan_name}
            </div>
            <div className="text-sm text-gray-500">
              ${subscription.unit_price} / {subscription.billing_cycle}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No subscription</span>
        )

      case 'status':
        return subscription ? (
          <span className={`status-badge status-${subscription.status}`}>
            {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
          </span>
        ) : (
          <span className="status-badge status-expired">None</span>
        )

      case 'license_key':
        return subscription?.license_key ? (
          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {subscription.license_key}
          </code>
        ) : (
          <span className="text-gray-400">N/A</span>
        )

      case 'actions':
        return (
          <div className="text-sm space-x-2">
            <Link
              href={`/admin/users/${user.id}`}
              className="text-primary-600 hover:text-primary-900"
            >
              View
            </Link>
            {subscription?.paddle_subscription_id && (
              <button
                onClick={() => handleOpenPaddleManagement(subscription.paddle_subscription_id)}
                className="text-blue-600 hover:text-blue-900"
              >
                Paddle
              </button>
            )}
          </div>
        )

      // User Details
      case 'user_id':
        return <span className="text-xs font-mono">{user.id?.slice(-8)}</span>
      case 'created_at':
        return user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
      case 'updated_at':
        return user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'
      case 'avatar_url':
        return user.avatar_url ? (
          <img className="h-8 w-8 rounded-full" src={user.avatar_url} alt="" />
        ) : (
          <span className="text-gray-400">None</span>
        )
      case 'phone':
        return user.phone || <span className="text-gray-400">N/A</span>
      case 'last_sign_in':
        return user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'
      case 'email_confirmed':
        return user.email_confirmed_at ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-red-600">✗</span>
        )

      // Subscription Details
      case 'subscription_id':
        return subscription?.id ? (
          <span className="text-xs font-mono">{subscription.id.slice(-8)}</span>
        ) : 'N/A'
      case 'plan_id':
        return subscription?.plan_id || 'N/A'
      case 'billing_cycle':
        return subscription?.billing_cycle || 'N/A'
      case 'unit_price':
        return subscription?.unit_price ? `$${subscription.unit_price}` : 'N/A'
      case 'currency':
        return subscription?.currency || 'N/A'
      case 'next_billing_date':
        return subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'N/A'
      case 'started_at':
        return subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString() : 'N/A'
      case 'canceled_at':
        return subscription?.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString() : 'N/A'
      case 'paused_at':
        return subscription?.paused_at ? new Date(subscription.paused_at).toLocaleDateString() : 'N/A'

      // Paddle Integration
      case 'paddle_customer_id':
        return subscription?.paddle_customer_id || 'N/A'
      case 'paddle_subscription_id':
        return subscription?.paddle_subscription_id || 'N/A'
      case 'paddle_transaction_id':
        return subscription?.paddle_transaction_id || 'N/A'

      // Payment Information
      case 'payment_method':
        return subscription?.payment_method || 'N/A'
      case 'last_payment_date':
        return subscription?.last_payment_date ? new Date(subscription.last_payment_date).toLocaleDateString() : 'N/A'
      case 'next_retry_date':
        return subscription?.next_retry_date ? new Date(subscription.next_retry_date).toLocaleDateString() : 'N/A'
      case 'failed_payment_count':
        return subscription?.failed_payment_count || 0

      // Analytics & Usage
      case 'total_logins':
        return user.total_logins || 0
      case 'last_activity':
        return user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'N/A'
      case 'registration_source':
        return user.registration_source || 'N/A'

      // Admin Fields
      case 'notes':
        return user.notes || <span className="text-gray-400">None</span>
      case 'tags':
        return user.tags ? (
          <div className="flex flex-wrap gap-1">
            {user.tags.split(',').map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {tag.trim()}
              </span>
            ))}
          </div>
        ) : <span className="text-gray-400">None</span>
      case 'is_admin':
        return user.is_admin ? (
          <span className="text-green-600 font-semibold">Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        )

      // Master View Specific Fields
      case 'has_profile':
        return user.has_profile ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-red-600">✗</span>
        )

      case 'profile_source':
        if (user.profile_source === 'profiles_table') {
          return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Profile</span>
        } else if (user.profile_source === 'auth_only') {
          return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Auth Only</span>
        } else {
          return <span className="text-gray-400">Unknown</span>
        }

      case 'subscription_count':
        return user.subscription_count || 0

      case 'email_confirmed':
        return user.email_confirmed_at ? (
          <div>
            <span className="text-green-600">✓</span>
            <div className="text-xs text-gray-500">{new Date(user.email_confirmed_at).toLocaleDateString()}</div>
          </div>
        ) : (
          <span className="text-red-600">✗</span>
        )

      // Onboarding & Trial
      case 'onboarding_completed':
        return user.onboarding_completed ? (
          <span className="text-green-600 font-semibold">✓ Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        )

      case 'pain_point':
        if (!user.pain_point) return <span className="text-gray-400">N/A</span>
        const painPointLabels = {
          'time-management': 'Time Management',
          'focus': 'Focus & Productivity',
          'organization': 'Organization',
          'other': 'Other'
        }
        return (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
            {painPointLabels[user.pain_point] || user.pain_point}
          </span>
        )

      case 'trial_started_at':
        return user.trial_started_at ? (
          <div>
            <div className="text-sm">{new Date(user.trial_started_at).toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{new Date(user.trial_started_at).toLocaleTimeString()}</div>
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        )

      // Consent Tracking
      case 'terms_consent':
        return user.terms_consent_accepted ? (
          <div>
            <span className="text-green-600">✓</span>
            {user.terms_consent_timestamp && (
              <div className="text-xs text-gray-500">{new Date(user.terms_consent_timestamp).toLocaleDateString()}</div>
            )}
          </div>
        ) : (
          <span className="text-red-600">✗</span>
        )

      case 'privacy_consent':
        return user.privacy_consent_accepted ? (
          <div>
            <span className="text-green-600">✓</span>
            {user.privacy_consent_timestamp && (
              <div className="text-xs text-gray-500">{new Date(user.privacy_consent_timestamp).toLocaleDateString()}</div>
            )}
          </div>
        ) : (
          <span className="text-red-600">✗</span>
        )

      case 'refund_consent':
        return user.refund_policy_consent_accepted ? (
          <div>
            <span className="text-green-600">✓</span>
            {user.refund_policy_consent_timestamp && (
              <div className="text-xs text-gray-500">{new Date(user.refund_policy_consent_timestamp).toLocaleDateString()}</div>
            )}
          </div>
        ) : (
          <span className="text-red-600">✗</span>
        )

      case 'immediate_access_consent':
        return user.immediate_access_consent_accepted ? (
          <div>
            <span className="text-green-600">✓</span>
            {user.immediate_access_consent_timestamp && (
              <div className="text-xs text-gray-500">{new Date(user.immediate_access_consent_timestamp).toLocaleDateString()}</div>
            )}
          </div>
        ) : (
          <span className="text-red-600">✗</span>
        )

      case 'recurring_payment_consent':
        return user.recurring_payment_consent_accepted ? (
          <div>
            <span className="text-green-600">✓</span>
            {user.recurring_payment_consent_timestamp && (
              <div className="text-xs text-gray-500">{new Date(user.recurring_payment_consent_timestamp).toLocaleDateString()}</div>
            )}
          </div>
        ) : (
          <span className="text-red-600">✗</span>
        )

      default:
        return user[columnKey] || 'N/A'
    }
  }

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const session = await auth.getCurrentSession()
        if (!session?.user) {
          router.push('/auth/login')
          return
        }

        setUser(session.user)

        // Load admin data
        let usersEndpoint
        if (dataSource === 'auth') {
          usersEndpoint = `/api/admin/auth-users?page=${currentPage}&search=${searchTerm}&filter=${filter}`
        } else if (dataSource === 'profiles') {
          usersEndpoint = `/api/admin/users?page=${currentPage}&search=${searchTerm}&filter=${filter}`
        } else {
          usersEndpoint = `/api/admin/master-users?page=${currentPage}&search=${searchTerm}&filter=${filter}`
        }

        const [usersRes, statsRes] = await Promise.all([
          fetch(usersEndpoint),
          fetch('/api/admin/stats')
        ])

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          console.log('Users API Response:', usersData)
          setUsers(usersData.data || [])
          setTotalPages(usersData.pagination?.totalPages || 1)
          setDataStats(usersData.stats || null)
          setError(null)
        } else {
          const errorText = await usersRes.text()
          console.error('Users API Error:', errorText)
          setError(`Failed to load users: ${errorText}`)
          setUsers([])
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.data || {})
        }
      } catch (error) {
        console.error('Failed to load admin data:', error)
        setError(`Failed to load admin data: ${error.message}`)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [router, currentPage, searchTerm, filter, dataSource])

  const handleSyncUsers = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/admin/sync-users', { method: 'POST' })
      const result = await response.json()

      if (response.ok) {
        alert(`Sync completed! Created ${result.stats.newProfilesCreated} new profiles from ${result.stats.totalAuthUsers} auth users.`)
        // Reload data after sync
        window.location.reload()
      } else {
        alert(`Sync failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Sync failed: Network error')
    } finally {
      setSyncing(false)
    }
  }

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  const handleOpenPaddleManagement = async (subscriptionId) => {
    try {
      const response = await fetch('/api/admin/paddle-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      const { data } = await response.json()

      if (data?.managementUrl) {
        window.open(data.managementUrl, '_blank')
      } else {
        alert('Failed to get management URL')
      }
    } catch (error) {
      console.error('Failed to open Paddle management:', error)
      alert('Failed to open Paddle management')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first')
      return
    }

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)
    if (!confirmed) return

    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers
        })
      })

      if (response.ok) {
        alert(`${action} completed successfully`)
        setSelectedUsers([])
        // Reload data
        window.location.reload()
      } else {
        alert('Action failed')
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Action failed')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && user.subscriptions?.some(sub => sub.status === 'active')
    if (filter === 'inactive') return matchesSearch && (!user.subscriptions || user.subscriptions.length === 0)
    if (filter === 'canceled') return matchesSearch && user.subscriptions?.some(sub => sub.status === 'canceled')

    return matchesSearch
  })

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
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Admin: {user?.email}</span>
              <Link href="/dashboard" className="btn btn-secondary">
                User View
              </Link>
              <button
                onClick={() => auth.signOut().then(() => router.push('/'))}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats.activeSubscriptions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${stats.monthlyRevenue || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                  <p className="text-2xl font-bold">{stats.failedPayments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold mb-4 md:mb-0">User Management</h2>

              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                />

                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Subscriptions</option>
                  <option value="inactive">No Subscriptions</option>
                  <option value="canceled">Canceled Subscriptions</option>
                  {dataSource === 'master' && <option value="no_profile">Missing Profiles</option>}
                </select>

                {/* Data Source Toggle */}
                <select
                  value={dataSource}
                  onChange={(e) => {
                    const newDataSource = e.target.value
                    setDataSource(newDataSource)
                    saveDataSourcePreference(newDataSource)
                  }}
                  className="input"
                  title="Choose data source"
                >
                  <option value="master">🎯 Master List (Combined)</option>
                  <option value="profiles">📊 Profiles Table Only</option>
                  <option value="auth">🔐 Auth Users Only</option>
                </select>

                {/* Sync Button */}
                <button
                  onClick={handleSyncUsers}
                  disabled={syncing}
                  className="btn btn-primary flex items-center space-x-2"
                  title="Sync all Auth users to Profiles table"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{syncing ? 'Syncing...' : 'Sync Users'}</span>
                </button>

                {/* Column Configuration */}
                <button
                  onClick={() => setShowColumnConfig(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  <span>Columns</span>
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="btn btn-danger"
                >
                  Suspend ({selectedUsers.length})
                </button>
                <button
                  onClick={() => handleBulkAction('reactivate')}
                  className="btn btn-success"
                >
                  Reactivate ({selectedUsers.length})
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="btn btn-secondary"
                >
                  Export ({selectedUsers.length})
                </button>
              </div>
            )}

            {/* Data Source Stats Panel */}
            {dataStats && dataSource === 'master' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                  </svg>
                  <h4 className="text-sm font-medium text-blue-900">Master Data Source Stats</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{dataStats.totalAuthUsers}</div>
                    <div className="text-blue-700">Auth Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{dataStats.usersWithProfiles}</div>
                    <div className="text-green-700">With Profiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{dataStats.usersWithoutProfiles}</div>
                    <div className="text-orange-700">Missing Profiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{dataStats.totalSubscriptions}</div>
                    <div className="text-purple-700">Subscriptions</div>
                  </div>
                </div>
                {dataStats.usersWithoutProfiles > 0 && (
                  <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-800">
                    ⚠️ {dataStats.usersWithoutProfiles} users don't have profile records.
                    <button
                      onClick={handleSyncUsers}
                      className="ml-2 text-orange-900 underline hover:no-underline"
                      disabled={syncing}
                    >
                      {syncing ? 'Syncing...' : 'Sync now'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card-body p-0">
            {error ? (
              <div className="px-6 py-8 text-center">
                <div className="text-red-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      {Object.entries(visibleColumns)
                        .filter(([key, visible]) => visible)
                        .map(([columnKey]) => (
                          <th
                            key={columnKey}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnDefinitions[columnKey]?.width || 'w-32'}`}
                          >
                            {columnDefinitions[columnKey]?.label || columnKey}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                          <p className="text-gray-600">
                            {searchTerm || filter !== 'all'
                              ? 'No users match your current filters. Try adjusting your search or filter settings.'
                              : 'No users have been created yet.'}
                          </p>
                          {(searchTerm || filter !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchTerm('')
                                setFilter('all')
                              }}
                              className="btn btn-secondary mt-4"
                            >
                              Clear Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserSelect(user.id)}
                            />
                          </td>
                          {Object.entries(visibleColumns)
                            .filter(([key, visible]) => visible)
                            .map(([columnKey]) => (
                              <td
                                key={columnKey}
                                className={`px-6 py-4 ${
                                  ['user', 'subscription', 'actions', 'notes', 'tags'].includes(columnKey)
                                    ? ''
                                    : 'whitespace-nowrap'
                                }`}
                              >
                                {renderCellData(user, columnKey)}
                              </td>
                            ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column Configuration Modal */}
        {showColumnConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Configure Columns</h3>
                  {saveIndicator && (
                    <p className={`text-sm mt-1 ${saveIndicator.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                      ✓ {saveIndicator.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowColumnConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>{Object.values(visibleColumns).filter(Boolean).length}</strong> of {Object.keys(columnDefinitions).length} columns visible
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(getColumnCategories()).map(([category, columns]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-gray-900 border-b pb-2">{category}</h4>
                      <div className="space-y-2">
                        {columns.map(columnKey => (
                          <label key={columnKey} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={visibleColumns[columnKey]}
                              onChange={() => handleColumnToggle(columnKey)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {columnDefinitions[columnKey].label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const allColumns = Object.keys(columnDefinitions).reduce((acc, key) => {
                        acc[key] = true
                        return acc
                      }, {})
                      setVisibleColumns(allColumns)
                      saveColumnPreferences(allColumns)
                    }}
                    className="btn btn-secondary"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      const coreColumns = Object.keys(columnDefinitions).reduce((acc, key) => {
                        acc[key] = columnDefinitions[key].category === 'Core'
                        return acc
                      }, {})
                      setVisibleColumns(coreColumns)
                      saveColumnPreferences(coreColumns)
                    }}
                    className="btn btn-secondary"
                  >
                    Core Only
                  </button>
                  <button
                    onClick={() => {
                      setVisibleColumns(defaultColumns)
                      saveColumnPreferences(defaultColumns)
                    }}
                    className="btn btn-secondary"
                  >
                    Reset Default
                  </button>
                </div>
                <button
                  onClick={() => setShowColumnConfig(false)}
                  className="btn btn-primary"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}