import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function GET({ locals }) {
  try {
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.data.session.user.id
    const profile = await db.getProfile(userId)

    // Get full auth user data including created_at
    const authUser = await db.getAuthUser(userId)

    // Include user creation date from auth user
    const profileWithUserData = {
      ...profile,
      user_created_at: authUser.created_at
    }

    return json({
      success: true,
      data: profileWithUserData
    })
  } catch (error) {
    console.error('Failed to get profile:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT({ request, locals }) {
  try {
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.data.session.user.id
    const updates = await request.json()

    // Only allow certain fields to be updated
    // Note: bio, website, location, phone require database migration (see database/add-profile-fields.sql)
    const allowedFields = ['full_name', 'avatar_url', 'extension_version', 'bio', 'website', 'location', 'phone']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    const updatedProfile = await db.updateProfile(userId, filteredUpdates)

    // Get full auth user data including created_at (same as GET request)
    const authUser = await db.getAuthUser(userId)

    // Include user creation date in the response
    const updatedProfileWithUserData = {
      ...updatedProfile,
      user_created_at: authUser.created_at
    }

    return json({
      success: true,
      data: updatedProfileWithUserData
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE({ locals }) {
  try {
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.data.session.user.id

    // Delete user profile and account
    await db.deleteUser(userId)

    // Sign out the user
    await locals.supabase.auth.signOut()

    return json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete account:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
