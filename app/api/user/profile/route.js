import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { db } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.getProfile(session.user.id)

    // Get full auth user data including created_at
    const authUser = await db.getAuthUser(session.user.id)

    // Include user creation date from auth user
    const profileWithUserData = {
      ...profile,
      user_created_at: authUser.created_at
    }

    return NextResponse.json({
      success: true,
      data: profileWithUserData
    })
  } catch (error) {
    console.error('Failed to get profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Only allow certain fields to be updated
    // Note: bio, website, location, phone require database migration (see database/add-profile-fields.sql)
    const allowedFields = ['full_name', 'avatar_url', 'extension_version']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    const updatedProfile = await db.updateProfile(session.user.id, filteredUpdates)

    // Get full auth user data including created_at (same as GET request)
    const authUser = await db.getAuthUser(session.user.id)

    // Include user creation date in the response
    const updatedProfileWithUserData = {
      ...updatedProfile,
      user_created_at: authUser.created_at
    }

    return NextResponse.json({
      success: true,
      data: updatedProfileWithUserData
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}