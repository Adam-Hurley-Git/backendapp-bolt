import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function GET({ locals }) {
  try {
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await db.getSubscription(session.data.session.user.id)

    return json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Failed to get subscription:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
