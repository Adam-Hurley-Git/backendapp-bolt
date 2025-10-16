import { redirect } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function load({ locals }) {
  const session = await locals.getSession()

  console.log('Admin page load - Session:', session ? 'exists' : 'null', session?.user?.email)

  // Redirect to login if not authenticated
  if (!session) {
    throw redirect(303, '/auth/login')
  }

  // Check if user is admin
  let profile = null
  try {
    profile = await db.getProfile(session.user.id)
    console.log('Admin page load - Profile:', profile?.email, 'is_admin:', profile?.is_admin)
  } catch (error) {
    console.error('Admin page load - Error getting profile:', error.message)
    // Profile doesn't exist, redirect to dashboard
    throw redirect(303, '/dashboard')
  }

  if (!profile?.is_admin) {
    console.log('Admin page load - User is not admin, redirecting to dashboard')
    // Redirect non-admin users to dashboard
    throw redirect(303, '/dashboard')
  }

  console.log('Admin page load - User is admin, loading page')

  // Return session for the page to use
  return {
    session,
    user: session.user,
    isAdmin: true
  }
}
