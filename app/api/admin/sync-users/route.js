import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '../../../../lib/supabase'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Starting user sync...')

    // Get all auth users
    let page = 1
    let allAuthUsers = []
    let hasMore = true

    while (hasMore) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 1000
      })

      if (authError) throw authError

      allAuthUsers = allAuthUsers.concat(authData.users)
      hasMore = authData.users.length === 1000
      page++
    }

    console.log(`Found ${allAuthUsers.length} auth users`)

    // Get existing profiles
    const { data: existingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id')

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || [])

    // Find auth users without profiles
    const usersNeedingProfiles = allAuthUsers.filter(user => !existingProfileIds.has(user.id))

    console.log(`${usersNeedingProfiles.length} users need profiles`)

    if (usersNeedingProfiles.length > 0) {
      // Create profile records for users without them
      const newProfiles = usersNeedingProfiles.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        avatar_url: user.user_metadata?.avatar_url || null,
        phone: user.phone || null,
        is_admin: false,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      }))

      // Insert in batches of 100
      let inserted = 0
      for (let i = 0; i < newProfiles.length; i += 100) {
        const batch = newProfiles.slice(i, i + 100)
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert(batch)

        if (insertError) {
          console.error('Batch insert error:', insertError)
          // Continue with next batch
        } else {
          inserted += batch.length
        }
      }

      console.log(`Successfully created ${inserted} profile records`)
    }

    return NextResponse.json({
      success: true,
      message: 'User sync completed',
      stats: {
        totalAuthUsers: allAuthUsers.length,
        existingProfiles: existingProfiles?.length || 0,
        newProfilesCreated: usersNeedingProfiles.length
      }
    })

  } catch (error) {
    console.error('Sync users error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}