import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { paddle } from '../../../../lib/paddle'

export async function POST(request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    // Verify user owns this subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('paddle_subscription_id', subscriptionId)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Generate management URL
    const managementUrl = paddle.generateManagementUrl(subscriptionId)

    return NextResponse.json({
      success: true,
      data: { managementUrl }
    })
  } catch (error) {
    console.error('Failed to get management URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}