import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Get users from auth.users table using service role
    // Note: This uses admin API, not SQL queries
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit
    })

    if (authError) throw authError

    let users = authUsers?.users || []

    // Filter by search if provided
    if (search) {
      users = users.filter(user =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.user_metadata?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Get profiles for these auth users (if they exist)
    if (users.length > 0) {
      const userIds = users.map(user => user.id)
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('id', userIds)

      // Get subscriptions
      const { data: subscriptions } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .in('user_id', userIds)

      // Merge auth user data with profile and subscription data
      users = users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id) || {}
        const userSubscriptions = subscriptions?.filter(s => s.user_id === authUser.id) || []

        return {
          // Auth user data
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at,
          last_sign_in_at: authUser.last_sign_in_at,
          email_confirmed_at: authUser.email_confirmed_at,
          phone: authUser.phone,

          // User metadata
          avatar_url: authUser.user_metadata?.avatar_url,
          full_name: authUser.user_metadata?.full_name || profile.full_name,

          // Profile data (if exists)
          ...profile,

          // Subscription data
          subscriptions: userSubscriptions
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((authUsers?.total || 0) / limit),
        totalCount: authUsers?.total || 0,
        limit
      },
      source: 'auth.users'
    })

  } catch (error) {
    console.error('Failed to get auth users:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}