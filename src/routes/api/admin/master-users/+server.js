import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'
import { dev } from '$app/environment'

export async function GET({ locals, url }) {
  try {
    const session = await locals.supabase.auth.getSession()

    console.log('Master Users API: Session check', {
      hasSession: !!session?.data?.session,
      userId: session?.data?.session?.user?.id,
      userEmail: session?.data?.session?.user?.email
    })

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using service role (bypasses RLS)
    const profile = await db.getProfile(session.data.session.user.id)

    console.log('Master Users API: Profile check', {
      profile,
      isAdmin: profile?.is_admin
    })

    if (!profile?.is_admin) {
      return json({
        error: 'Forbidden',
        debug: { profile }
      }, { status: 403 })
    }

    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''
    const filter = url.searchParams.get('filter') || 'all'

    console.log('Master Users API: Fetching users with params', { page, limit, search, filter })

    // Step 1: Get all auth users (this is the master list)
    let allAuthUsers = []
    let authPage = 1
    let hasMore = true

    // Get all auth users (paginated to handle large datasets)
    while (hasMore && allAuthUsers.length < 10000) { // Safety limit
      const { data: authData, error: authError } = await db.supabaseAdmin.auth.admin.listUsers({
        page: authPage,
        perPage: 1000
      })

      if (authError) {
        console.error('Auth users fetch error:', authError)
        break
      }

      allAuthUsers = allAuthUsers.concat(authData.users || [])
      hasMore = (authData.users?.length || 0) === 1000
      authPage++
    }

    console.log(`Master Users API: Found ${allAuthUsers.length} total auth users`)

    // Step 2: Apply search filter early to reduce data processing
    let filteredAuthUsers = allAuthUsers
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAuthUsers = allAuthUsers.filter(user =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.user_metadata?.full_name?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(search)
      )
    }

    console.log(`Master Users API: After search filter: ${filteredAuthUsers.length} users`)

    // Step 3: Get profile data for all users (in batches)
    const userIds = filteredAuthUsers.map(user => user.id)
    let profiles = []
    let subscriptions = []
    let onboardingProgress = []

    if (userIds.length > 0) {
      // Get profiles in batches of 1000
      for (let i = 0; i < userIds.length; i += 1000) {
        const batch = userIds.slice(i, i + 1000)
        const { data: profileBatch } = await db.supabaseAdmin
          .from('profiles')
          .select('*')
          .in('id', batch)

        profiles = profiles.concat(profileBatch || [])
      }

      // Get subscriptions in batches of 1000
      for (let i = 0; i < userIds.length; i += 1000) {
        const batch = userIds.slice(i, i + 1000)
        const { data: subscriptionBatch } = await db.supabaseAdmin
          .from('subscriptions')
          .select('*')
          .in('user_id', batch)

        subscriptions = subscriptions.concat(subscriptionBatch || [])
      }

      // Get onboarding progress in batches of 1000
      for (let i = 0; i < userIds.length; i += 1000) {
        const batch = userIds.slice(i, i + 1000)
        const { data: onboardingBatch } = await db.supabaseAdmin
          .from('onboarding_progress')
          .select('*')
          .in('user_id', batch)

        onboardingProgress = onboardingProgress.concat(onboardingBatch || [])
      }
    }

    console.log(`Master Users API: Found ${profiles.length} profiles, ${subscriptions.length} subscriptions, and ${onboardingProgress.length} onboarding records`)

    // Step 4: Merge all data sources into master user objects
    let masterUsers = filteredAuthUsers.map(authUser => {
      const userProfile = profiles.find(p => p.id === authUser.id)
      const userSubscriptions = subscriptions.filter(s => s.user_id === authUser.id)
      const userOnboarding = onboardingProgress.filter(o => o.user_id === authUser.id)

      return {
        // Auth user data (primary source)
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
        phone: authUser.phone,
        confirmed_at: authUser.confirmed_at,
        email_change_sent_at: authUser.email_change_sent_at,
        recovery_sent_at: authUser.recovery_sent_at,

        // User metadata from auth
        raw_user_meta_data: authUser.raw_user_meta_data,
        user_metadata: authUser.user_metadata,
        app_metadata: authUser.app_metadata,

        // Profile data (if exists) - overrides auth data when available
        full_name: userProfile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        avatar_url: userProfile?.avatar_url || authUser.user_metadata?.avatar_url,
        is_admin: userProfile?.is_admin || false,

        // Profile-specific data
        profile_created_at: userProfile?.created_at,
        profile_updated_at: userProfile?.updated_at,
        notes: userProfile?.notes,
        tags: userProfile?.tags,

        // Profile status
        has_profile: !!userProfile,
        profile_source: userProfile ? 'profiles_table' : 'auth_only',

        // Subscription data
        subscriptions: userSubscriptions,

        // Computed fields
        subscription_status: userSubscriptions.length > 0 ? userSubscriptions[0].status : null,
        subscription_count: userSubscriptions.length,
        is_paying: userSubscriptions.some(sub => sub.status === 'active'),

        // Analytics
        total_logins: userProfile?.total_logins || 0,
        last_activity: userProfile?.last_activity || authUser.last_sign_in_at,
        registration_source: userProfile?.registration_source || 'unknown',

        // Onboarding & Consent data from profile
        onboarding_completed: userProfile?.onboarding_completed || false,
        pain_point: userProfile?.pain_point || null,
        onboarding_progress: userOnboarding,

        // Consent data
        terms_consent_accepted: userProfile?.terms_consent_accepted || false,
        terms_consent_timestamp: userProfile?.terms_consent_timestamp || null,
        privacy_consent_accepted: userProfile?.privacy_consent_accepted || false,
        privacy_consent_timestamp: userProfile?.privacy_consent_timestamp || null,
        refund_policy_consent_accepted: userProfile?.refund_policy_consent_accepted || false,
        refund_policy_consent_timestamp: userProfile?.refund_policy_consent_timestamp || null,
        immediate_access_consent_accepted: userProfile?.immediate_access_consent_accepted || false,
        immediate_access_consent_timestamp: userProfile?.immediate_access_consent_timestamp || null,
        recurring_payment_consent_accepted: userProfile?.recurring_payment_consent_accepted || false,
        recurring_payment_consent_timestamp: userProfile?.recurring_payment_consent_timestamp || null,
        trial_started_at: userProfile?.trial_started_at || null
      }
    })

    // Step 5: Apply status filter
    if (filter !== 'all') {
      if (filter === 'active') {
        masterUsers = masterUsers.filter(user => user.subscriptions.some(sub => sub.status === 'active'))
      } else if (filter === 'inactive') {
        masterUsers = masterUsers.filter(user => user.subscriptions.length === 0)
      } else if (filter === 'canceled') {
        masterUsers = masterUsers.filter(user => user.subscriptions.some(sub => sub.status === 'canceled'))
      } else if (filter === 'no_profile') {
        masterUsers = masterUsers.filter(user => !user.has_profile)
      }
    }

    console.log(`Master Users API: After status filter: ${masterUsers.length} users`)

    // Step 6: Sort by most recent activity
    masterUsers.sort((a, b) => {
      const aDate = new Date(a.last_activity || a.updated_at || a.created_at)
      const bDate = new Date(b.last_activity || b.updated_at || b.created_at)
      return bDate - aDate
    })

    // Step 7: Apply pagination
    const totalUsers = masterUsers.length
    const totalPages = Math.ceil(totalUsers / limit)
    const offset = (page - 1) * limit
    const paginatedUsers = masterUsers.slice(offset, offset + limit)

    console.log(`Master Users API: Returning ${paginatedUsers.length} users (page ${page}/${totalPages})`)

    return json({
      success: true,
      data: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalUsers,
        limit
      },
      stats: {
        totalAuthUsers: allAuthUsers.length,
        totalProfiles: profiles.length,
        totalSubscriptions: subscriptions.length,
        usersWithProfiles: profiles.length,
        usersWithoutProfiles: allAuthUsers.length - profiles.length
      },
      source: 'master_combined'
    })

  } catch (error) {
    console.error('Master Users API error:', error)
    console.error('Error details:', error.message, error.stack)
    return json({
      error: 'Internal server error',
      details: error.message,
      stack: dev ? error.stack : undefined
    }, { status: 500 })
  }
}
