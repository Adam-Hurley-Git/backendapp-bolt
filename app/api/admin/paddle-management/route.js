import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { paddle } from '../../../../lib/paddle'
import { db } from '../../../../lib/supabase'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    // Generate management URL
    const managementUrl = paddle.generateManagementUrl(subscriptionId)

    // Log admin action
    await db.logAdminAction(
      session.user.id,
      'open_paddle_management',
      null,
      `Opened Paddle management for subscription ${subscriptionId}`,
      { subscriptionId }
    )

    return NextResponse.json({
      success: true,
      data: { managementUrl }
    })
  } catch (error) {
    console.error('Failed to get Paddle management URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}