import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { paddle } from '../../../../lib/paddle'

export async function GET(request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!subscription?.paddle_subscription_id) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Get payment history from Paddle
    const payments = await paddle.getPayments(subscription.paddle_subscription_id)

    return NextResponse.json({
      success: true,
      data: payments.response || []
    })
  } catch (error) {
    console.error('Failed to get payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}