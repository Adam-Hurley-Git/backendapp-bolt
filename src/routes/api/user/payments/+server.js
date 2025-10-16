import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'
import { paddle } from '$lib/server/paddle.js'

export async function GET({ locals }) {
  try {
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const subscription = await db.getSubscription(session.data.session.user.id)

    if (!subscription?.paddle_subscription_id) {
      return json({
        success: true,
        data: []
      })
    }

    // Get payment history from Paddle
    const payments = await paddle.getPayments(subscription.paddle_subscription_id)

    return json({
      success: true,
      data: payments.response || []
    })
  } catch (error) {
    console.error('Failed to get payments:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
