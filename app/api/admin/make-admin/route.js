import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '../../../../../lib/supabase'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Making user admin:', session.user.email)

    // First, check if user already has a profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    let result

    if (existingProfile) {
      // Update existing profile to make admin
      result = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', session.user.id)
        .select()
        .single()
    } else {
      // Create new profile with admin privileges
      result = await supabaseAdmin
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email,
          is_admin: true
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Failed to make user admin:', result.error)
      return NextResponse.json({
        error: 'Failed to update user',
        details: result.error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${session.user.email} is now an admin`,
      profile: result.data
    })

  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}