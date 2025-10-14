import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using service role (bypasses RLS)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users using service role
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active subscriptions using service role
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get monthly revenue (approximate) using service role
    const { data: revenueData } = await supabaseAdmin
      .from('subscriptions')
      .select('unit_price')
      .eq('status', 'active')
      .eq('billing_cycle', 'monthly')

    const monthlyRevenue = revenueData?.reduce((sum, sub) => sum + (sub.unit_price || 0), 0) || 0

    // Get failed payments count (last 30 days) using service role
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: failedPayments } = await supabaseAdmin
      .from('payment_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', thirtyDaysAgo.toISOString())

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        failedPayments: failedPayments || 0
      }
    })
  } catch (error) {
    console.error('Failed to get stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}