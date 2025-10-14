import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log('Admin API: Session check', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionError: sessionError?.message
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using service role (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('Admin API: Profile check', {
      profile,
      profileError: profileError?.message,
      isAdmin: profile?.is_admin
    })

    if (!profile?.is_admin) {
      return NextResponse.json({
        error: 'Forbidden',
        debug: { profile, profileError: profileError?.message }
      }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''
    const filter = url.searchParams.get('filter') || 'all'
    const offset = (page - 1) * limit

    // Use service role to get all profiles (bypasses RLS)
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data: profiles, error: profilesError, count } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (profilesError) throw profilesError

    // Try to get subscriptions for these users separately
    let users = profiles || []

    if (users.length > 0) {
      const userIds = users.map(user => user.id)

      // Try to get subscriptions, but don't fail if table doesn't exist
      try {
        const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .in('user_id', userIds)

        if (subscriptionsError) {
          console.log('Subscriptions query failed, proceeding without subscriptions:', subscriptionsError)
        }

        // Attach subscriptions to users
        users = users.map(user => ({
          ...user,
          subscriptions: subscriptions?.filter(sub => sub.user_id === user.id) || []
        }))
      } catch (subscriptionError) {
        console.log('Subscriptions table not found, proceeding without subscriptions:', subscriptionError)
        // Add empty subscriptions array to all users
        users = users.map(user => ({
          ...user,
          subscriptions: []
        }))
      }

      // Apply status filter after joining
      if (filter !== 'all') {
        if (filter === 'active') {
          users = users.filter(user => user.subscriptions.some(sub => sub.status === 'active'))
        } else if (filter === 'inactive') {
          users = users.filter(user => user.subscriptions.length === 0)
        } else if (filter === 'canceled') {
          users = users.filter(user => user.subscriptions.some(sub => sub.status === 'canceled'))
        }
      }
    } else {
      // No users found, ensure empty array
      users = []
    }


    const totalPages = Math.ceil(count / limit)

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count,
        limit
      }
    })
  } catch (error) {
    console.error('Failed to get users:', error)
    console.error('Error details:', error.message, error.stack)
    console.error('SQL Error code:', error.code)
    console.error('SQL Error hint:', error.hint)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      code: error.code,
      hint: error.hint
    }, { status: 500 })
  }
}