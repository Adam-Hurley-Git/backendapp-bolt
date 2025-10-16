<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  export let data; // Receive data from +page.server.js

  let user = data.user;
  let users = [];
  let stats = {};
  let loading = true;
  let error = null;
  let selectedUsers = [];
  let searchTerm = '';
  let filter = 'all';
  let currentPage = 1;
  let totalPages = 1;
  let showColumnConfig = false;
  let dataSource = 'master'; // 'profiles', 'auth', or 'master'
  let syncing = false;
  let dataStats = null;
  let saveIndicator = '';

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
  };

  let visibleColumns = { ...defaultColumns };

  // LocalStorage keys
  const COLUMN_PREFERENCES_KEY = 'admin_column_preferences';
  const DATA_SOURCE_KEY = 'admin_data_source';

  // Load preferences from localStorage on component mount
  onMount(() => {
    if (browser) {
      try {
        // Load column preferences
        const savedColumns = localStorage.getItem(COLUMN_PREFERENCES_KEY);
        if (savedColumns) {
          const parsedColumns = JSON.parse(savedColumns);
          // Merge with default columns to ensure new columns are included
          const mergedColumns = { ...defaultColumns, ...parsedColumns };
          visibleColumns = mergedColumns;
          console.log('Loaded column preferences from localStorage:', mergedColumns);
        }

        // Load data source preference
        const savedDataSource = localStorage.getItem(DATA_SOURCE_KEY);
        if (savedDataSource && ['master', 'profiles', 'auth'].includes(savedDataSource)) {
          dataSource = savedDataSource;
          console.log('Loaded data source preference from localStorage:', savedDataSource);
        }
      } catch (error) {
        console.error('Error loading preferences from localStorage:', error);
      }
    }
  });

  // Save preferences to localStorage whenever they change
  const saveColumnPreferences = (newColumns) => {
    if (browser) {
      try {
        localStorage.setItem(COLUMN_PREFERENCES_KEY, JSON.stringify(newColumns));
        console.log('Saved column preferences to localStorage:', newColumns);
        showSaveIndicator('Columns saved!');
      } catch (error) {
        console.error('Error saving column preferences to localStorage:', error);
        showSaveIndicator('Save failed!', 'error');
      }
    }
  };

  const saveDataSourcePreference = (newDataSource) => {
    if (browser) {
      try {
        localStorage.setItem(DATA_SOURCE_KEY, newDataSource);
        console.log('Saved data source preference to localStorage:', newDataSource);
        showSaveIndicator('Data source saved!');
      } catch (error) {
        console.error('Error saving data source preference to localStorage:', error);
        showSaveIndicator('Save failed!', 'error');
      }
    }
  };

  const showSaveIndicatorMessage = (message, type = 'success') => {
    saveIndicator = { message, type };
    setTimeout(() => {
      saveIndicator = '';
    }, 2000);
  };

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
  };

  const handleColumnToggle = (columnKey) => {
    visibleColumns = {
      ...visibleColumns,
      [columnKey]: !visibleColumns[columnKey]
    };
    saveColumnPreferences(visibleColumns);
  };

  const getColumnCategories = () => {
    const categories = {};
    Object.entries(columnDefinitions).forEach(([key, def]) => {
      if (!categories[def.category]) {
        categories[def.category] = [];
      }
      categories[def.category].push(key);
    });
    return categories;
  };

  const renderCellData = (user, columnKey) => {
    const subscription = user.subscriptions?.[0];

    switch (columnKey) {
      case 'user':
        return { type: 'user', user };
      case 'subscription':
        return { type: 'subscription', subscription };
      case 'status':
        return { type: 'status', subscription };
      case 'license_key':
        return { type: 'license_key', subscription };
      case 'actions':
        return { type: 'actions', user, subscription };

      // User Details
      case 'user_id':
        return { type: 'text', value: user.id?.slice(-8), mono: true };
      case 'created_at':
        return { type: 'date', value: user.created_at };
      case 'updated_at':
        return { type: 'date', value: user.updated_at };
      case 'avatar_url':
        return { type: 'avatar', value: user.avatar_url };
      case 'phone':
        return { type: 'text', value: user.phone };
      case 'last_sign_in':
        return { type: 'date', value: user.last_sign_in_at };
      case 'email_confirmed':
        return { type: 'boolean', value: user.email_confirmed_at };

      // Subscription Details
      case 'subscription_id':
        return { type: 'text', value: subscription?.id?.slice(-8), mono: true };
      case 'plan_id':
        return { type: 'text', value: subscription?.plan_id };
      case 'billing_cycle':
        return { type: 'text', value: subscription?.billing_cycle };
      case 'unit_price':
        return { type: 'price', value: subscription?.unit_price };
      case 'currency':
        return { type: 'text', value: subscription?.currency };
      case 'next_billing_date':
        return { type: 'date', value: subscription?.next_billing_date };
      case 'started_at':
        return { type: 'date', value: subscription?.started_at };
      case 'canceled_at':
        return { type: 'date', value: subscription?.canceled_at };
      case 'paused_at':
        return { type: 'date', value: subscription?.paused_at };

      // Paddle Integration
      case 'paddle_customer_id':
        return { type: 'text', value: subscription?.paddle_customer_id };
      case 'paddle_subscription_id':
        return { type: 'text', value: subscription?.paddle_subscription_id };
      case 'paddle_transaction_id':
        return { type: 'text', value: subscription?.paddle_transaction_id };

      // Payment Information
      case 'payment_method':
        return { type: 'text', value: subscription?.payment_method };
      case 'last_payment_date':
        return { type: 'date', value: subscription?.last_payment_date };
      case 'next_retry_date':
        return { type: 'date', value: subscription?.next_retry_date };
      case 'failed_payment_count':
        return { type: 'number', value: subscription?.failed_payment_count || 0 };

      // Analytics & Usage
      case 'total_logins':
        return { type: 'number', value: user.total_logins || 0 };
      case 'last_activity':
        return { type: 'date', value: user.last_activity };
      case 'registration_source':
        return { type: 'text', value: user.registration_source };

      // Admin Fields
      case 'notes':
        return { type: 'text', value: user.notes };
      case 'tags':
        return { type: 'tags', value: user.tags };
      case 'is_admin':
        return { type: 'admin_badge', value: user.is_admin };

      // Master View Specific Fields
      case 'has_profile':
        return { type: 'boolean', value: user.has_profile };
      case 'profile_source':
        return { type: 'profile_source', value: user.profile_source };
      case 'subscription_count':
        return { type: 'number', value: user.subscription_count || 0 };

      // Onboarding & Trial
      case 'onboarding_completed':
        return { type: 'boolean', value: user.onboarding_completed };
      case 'pain_point':
        return { type: 'pain_point', value: user.pain_point };
      case 'trial_started_at':
        return { type: 'datetime', value: user.trial_started_at };

      // Consent Tracking
      case 'terms_consent':
        return { type: 'consent', accepted: user.terms_consent_accepted, timestamp: user.terms_consent_timestamp };
      case 'privacy_consent':
        return { type: 'consent', accepted: user.privacy_consent_accepted, timestamp: user.privacy_consent_timestamp };
      case 'refund_consent':
        return { type: 'consent', accepted: user.refund_policy_consent_accepted, timestamp: user.refund_policy_consent_timestamp };
      case 'immediate_access_consent':
        return { type: 'consent', accepted: user.immediate_access_consent_accepted, timestamp: user.immediate_access_consent_timestamp };
      case 'recurring_payment_consent':
        return { type: 'consent', accepted: user.recurring_payment_consent_accepted, timestamp: user.recurring_payment_consent_timestamp };

      default:
        return { type: 'text', value: user[columnKey] };
    }
  };

  // Load admin data
  const loadAdminData = async () => {
    try {
      // User is already authenticated via +page.server.js
      // Load admin data
      let usersEndpoint;
      if (dataSource === 'auth') {
        usersEndpoint = `/api/admin/auth-users?page=${currentPage}&search=${searchTerm}&filter=${filter}`;
      } else if (dataSource === 'profiles') {
        usersEndpoint = `/api/admin/users?page=${currentPage}&search=${searchTerm}&filter=${filter}`;
      } else {
        usersEndpoint = `/api/admin/master-users?page=${currentPage}&search=${searchTerm}&filter=${filter}`;
      }

      const [usersRes, statsRes] = await Promise.all([
        fetch(usersEndpoint, { credentials: 'include' }),
        fetch('/api/admin/stats', { credentials: 'include' })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users API Response:', usersData);
        users = usersData.data || [];
        totalPages = usersData.pagination?.totalPages || 1;
        dataStats = usersData.stats || null;
        error = null;
      } else {
        const errorText = await usersRes.text();
        console.error('Users API Error:', errorText);
        error = `Failed to load users: ${errorText}`;
        users = [];
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        stats = statsData.data || {};
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      error = `Failed to load admin data: ${err.message}`;
      users = [];
    } finally {
      loading = false;
    }
  };

  // Watch for changes to trigger reload (only in browser)
  $: if (browser) {
    currentPage, searchTerm, filter, dataSource;
    loadAdminData();
  }

  onMount(() => {
    loadAdminData();
  });

  const handleSyncUsers = async () => {
    syncing = true;
    try {
      const response = await fetch('/api/admin/sync-users', { method: 'POST', credentials: 'include' });
      const result = await response.json();

      if (response.ok) {
        alert(`Sync completed! Created ${result.stats.newProfilesCreated} new profiles from ${result.stats.totalAuthUsers} auth users.`);
        // Reload data after sync
        if (browser) {
          window.location.reload();
        }
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('Sync failed: Network error');
    } finally {
      syncing = false;
    }
  };

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      selectedUsers = selectedUsers.filter(id => id !== userId);
    } else {
      selectedUsers = [...selectedUsers, userId];
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      selectedUsers = [];
    } else {
      selectedUsers = users.map(user => user.id);
    }
  };

  const handleOpenPaddleManagement = async (subscriptionId) => {
    try {
      const response = await fetch('/api/admin/paddle-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ subscriptionId })
      });

      const { data } = await response.json();

      if (data?.managementUrl) {
        window.open(data.managementUrl, '_blank');
      } else {
        alert('Failed to get management URL');
      }
    } catch (err) {
      console.error('Failed to open Paddle management:', err);
      alert('Failed to open Paddle management');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          userIds: selectedUsers
        })
      });

      if (response.ok) {
        alert(`${action} completed successfully`);
        selectedUsers = [];
        // Reload data
        if (browser) {
          window.location.reload();
        }
      } else {
        alert('Action failed');
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
      alert('Action failed');
    }
  };

  // Reactive filtered users
  $: filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && u.subscriptions?.some(sub => sub.status === 'active');
    if (filter === 'inactive') return matchesSearch && (!u.subscriptions || u.subscriptions.length === 0);
    if (filter === 'canceled') return matchesSearch && u.subscriptions?.some(sub => sub.status === 'canceled');

    return matchesSearch;
  });

  const handleSignOut = async () => {
    await auth.signOut();
    goto('/');
  };

  const handleDataSourceChange = (newSource) => {
    dataSource = newSource;
    saveDataSourcePreference(newSource);
  };
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="loading-spinner h-8 w-8"></div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-600">Admin: {user?.email}</span>
            <a href="/dashboard" class="btn btn-secondary">
              User View
            </a>
            <button
              on:click={handleSignOut}
              class="btn btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <!-- Stats Grid -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Total Users</p>
                <p class="text-2xl font-bold">{stats.totalUsers || 0}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p class="text-2xl font-bold">{stats.activeSubscriptions || 0}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p class="text-2xl font-bold">${stats.monthlyRevenue || 0}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Failed Payments</p>
                <p class="text-2xl font-bold">{stats.failedPayments || 0}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Source Stats (if available) -->
      {#if dataStats}
        <div class="card mb-6">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold mb-1">Data Source: {dataSource.toUpperCase()}</h3>
                <p class="text-sm text-gray-600">
                  Showing {dataStats.totalCount || 0} records
                  {#if dataStats.profilesCount !== undefined}
                    ({dataStats.profilesCount} with profiles, {dataStats.authOnlyCount} auth only)
                  {/if}
                </p>
              </div>
              <button
                on:click={handleSyncUsers}
                disabled={syncing}
                class="btn btn-primary"
              >
                {syncing ? 'Syncing...' : 'Sync Auth → Profiles'}
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Filters and Search -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Data Source Toggle -->
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700">Data Source:</label>
              <div class="flex gap-2">
                <button
                  on:click={() => handleDataSourceChange('master')}
                  class={dataSource === 'master' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  Master
                </button>
                <button
                  on:click={() => handleDataSourceChange('profiles')}
                  class={dataSource === 'profiles' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  Profiles
                </button>
                <button
                  on:click={() => handleDataSourceChange('auth')}
                  class={dataSource === 'auth' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  Auth
                </button>
              </div>
            </div>

            <!-- Search -->
            <div class="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                bind:value={searchTerm}
                class="input w-full"
              />
            </div>

            <!-- Filter -->
            <select bind:value={filter} class="input">
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="canceled">Canceled</option>
            </select>

            <!-- Column Configuration -->
            <button
              on:click={() => showColumnConfig = !showColumnConfig}
              class="btn btn-secondary"
            >
              Configure Columns
            </button>
          </div>

          <!-- Column Configuration Panel -->
          {#if showColumnConfig}
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-semibold">Column Configuration</h4>
                {#if saveIndicator}
                  <span class={saveIndicator.type === 'error' ? 'text-red-600' : 'text-green-600'}>
                    {saveIndicator.message}
                  </span>
                {/if}
              </div>

              {#each Object.entries(getColumnCategories()) as [category, columns]}
                <div class="mb-4">
                  <h5 class="text-sm font-semibold text-gray-700 mb-2">{category}</h5>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {#each columns as columnKey}
                      <label class="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns[columnKey]}
                          on:change={() => handleColumnToggle(columnKey)}
                          class="form-checkbox"
                        />
                        <span class="text-sm">{columnDefinitions[columnKey].label}</span>
                      </label>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Bulk Actions -->
      {#if selectedUsers.length > 0}
        <div class="card mb-6">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div class="flex gap-2">
                <button
                  on:click={() => handleBulkAction('export')}
                  class="btn btn-secondary btn-sm"
                >
                  Export
                </button>
                <button
                  on:click={() => handleBulkAction('email')}
                  class="btn btn-secondary btn-sm"
                >
                  Email
                </button>
                <button
                  on:click={() => selectedUsers = []}
                  class="btn btn-secondary btn-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Error Display -->
      {#if error}
        <div class="card mb-6 bg-red-50 border-red-200">
          <div class="card-body">
            <p class="text-red-800">{error}</p>
          </div>
        </div>
      {/if}

      <!-- Users Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    on:change={handleSelectAll}
                    checked={selectedUsers.length === users.length && users.length > 0}
                    class="form-checkbox"
                  />
                </th>
                {#each Object.entries(visibleColumns) as [columnKey, isVisible]}
                  {#if isVisible}
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {columnDefinitions[columnKey]?.label || columnKey}
                    </th>
                  {/if}
                {/each}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each filteredUsers as userItem (userItem.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(userItem.id)}
                      on:change={() => handleUserSelect(userItem.id)}
                      class="form-checkbox"
                    />
                  </td>
                  {#each Object.entries(visibleColumns) as [columnKey, isVisible]}
                    {#if isVisible}
                      {@const cellData = renderCellData(userItem, columnKey)}
                      <td class="px-6 py-4 whitespace-nowrap {columnDefinitions[columnKey]?.width || ''}">
                        {#if cellData.type === 'user'}
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                              <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                {#if cellData.user.avatar_url}
                                  <img class="h-10 w-10 rounded-full" src={cellData.user.avatar_url} alt="" />
                                {:else}
                                  <span class="text-sm font-medium text-gray-700">
                                    {cellData.user.email?.charAt(0).toUpperCase()}
                                  </span>
                                {/if}
                              </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">
                                {cellData.user.full_name || 'N/A'}
                              </div>
                              <div class="text-sm text-gray-500">{cellData.user.email}</div>
                            </div>
                          </div>
                        {:else if cellData.type === 'subscription'}
                          {#if cellData.subscription}
                            <div>
                              <div class="text-sm font-medium text-gray-900">
                                {cellData.subscription.plan_name}
                              </div>
                              <div class="text-sm text-gray-500">
                                ${cellData.subscription.unit_price} / {cellData.subscription.billing_cycle}
                              </div>
                            </div>
                          {:else}
                            <span class="text-gray-400">No subscription</span>
                          {/if}
                        {:else if cellData.type === 'status'}
                          {#if cellData.subscription}
                            <span class="status-badge status-{cellData.subscription.status}">
                              {cellData.subscription.status?.charAt(0).toUpperCase() + cellData.subscription.status?.slice(1)}
                            </span>
                          {:else}
                            <span class="status-badge status-expired">None</span>
                          {/if}
                        {:else if cellData.type === 'license_key'}
                          {#if cellData.subscription?.license_key}
                            <code class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {cellData.subscription.license_key}
                            </code>
                          {:else}
                            <span class="text-gray-400">N/A</span>
                          {/if}
                        {:else if cellData.type === 'actions'}
                          <div class="text-sm space-x-2">
                            <a
                              href="/admin/users/{cellData.user.id}"
                              class="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </a>
                            {#if cellData.subscription?.paddle_subscription_id}
                              <button
                                on:click={() => handleOpenPaddleManagement(cellData.subscription.paddle_subscription_id)}
                                class="text-blue-600 hover:text-blue-900"
                              >
                                Paddle
                              </button>
                            {/if}
                          </div>
                        {:else if cellData.type === 'date'}
                          {cellData.value ? new Date(cellData.value).toLocaleDateString() : 'N/A'}
                        {:else if cellData.type === 'datetime'}
                          {#if cellData.value}
                            <div>
                              <div class="text-sm">{new Date(cellData.value).toLocaleDateString()}</div>
                              <div class="text-xs text-gray-500">{new Date(cellData.value).toLocaleTimeString()}</div>
                            </div>
                          {:else}
                            <span class="text-gray-400">N/A</span>
                          {/if}
                        {:else if cellData.type === 'boolean'}
                          {#if cellData.value}
                            <span class="text-green-600">✓</span>
                          {:else}
                            <span class="text-red-600">✗</span>
                          {/if}
                        {:else if cellData.type === 'price'}
                          {cellData.value ? `$${cellData.value}` : 'N/A'}
                        {:else if cellData.type === 'number'}
                          {cellData.value}
                        {:else if cellData.type === 'avatar'}
                          {#if cellData.value}
                            <img class="h-8 w-8 rounded-full" src={cellData.value} alt="" />
                          {:else}
                            <span class="text-gray-400">None</span>
                          {/if}
                        {:else if cellData.type === 'tags'}
                          {#if cellData.value}
                            <div class="flex flex-wrap gap-1">
                              {#each cellData.value.split(',') as tag}
                                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {tag.trim()}
                                </span>
                              {/each}
                            </div>
                          {:else}
                            <span class="text-gray-400">None</span>
                          {/if}
                        {:else if cellData.type === 'admin_badge'}
                          {#if cellData.value}
                            <span class="text-green-600 font-semibold">Yes</span>
                          {:else}
                            <span class="text-gray-400">No</span>
                          {/if}
                        {:else if cellData.type === 'profile_source'}
                          {#if cellData.value === 'profiles_table'}
                            <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Profile</span>
                          {:else if cellData.value === 'auth_only'}
                            <span class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Auth Only</span>
                          {:else}
                            <span class="text-gray-400">Unknown</span>
                          {/if}
                        {:else if cellData.type === 'pain_point'}
                          {#if cellData.value}
                            {@const painPointLabels = {
                              'time-management': 'Time Management',
                              'focus': 'Focus & Productivity',
                              'organization': 'Organization',
                              'other': 'Other'
                            }}
                            <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {painPointLabels[cellData.value] || cellData.value}
                            </span>
                          {:else}
                            <span class="text-gray-400">N/A</span>
                          {/if}
                        {:else if cellData.type === 'consent'}
                          {#if cellData.accepted}
                            <div>
                              <span class="text-green-600">✓</span>
                              {#if cellData.timestamp}
                                <div class="text-xs text-gray-500">{new Date(cellData.timestamp).toLocaleDateString()}</div>
                              {/if}
                            </div>
                          {:else}
                            <span class="text-red-600">✗</span>
                          {/if}
                        {:else if cellData.mono}
                          <span class="text-xs font-mono">{cellData.value || 'N/A'}</span>
                        {:else}
                          {cellData.value || 'N/A'}
                        {/if}
                      </td>
                    {/if}
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>

          {#if filteredUsers.length === 0}
            <div class="text-center py-8">
              <p class="text-gray-500">No users found</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="mt-6 flex justify-center gap-2">
          <button
            on:click={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="btn btn-secondary"
          >
            Previous
          </button>
          <span class="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            disabled={currentPage === totalPages}
            class="btn btn-secondary"
          >
            Next
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .status-badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .status-active {
    @apply bg-green-100 text-green-800;
  }

  .status-trialing {
    @apply bg-blue-100 text-blue-800;
  }

  .status-canceled {
    @apply bg-red-100 text-red-800;
  }

  .status-paused {
    @apply bg-yellow-100 text-yellow-800;
  }

  .status-expired {
    @apply bg-gray-100 text-gray-800;
  }

  .loading-spinner {
    @apply border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin;
  }
</style>
