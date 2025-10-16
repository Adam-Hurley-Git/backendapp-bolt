import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function GET({ locals }) {
  try {
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using service role (bypasses RLS)
    const profile = await db.getProfile(session.data.session.user.id)

    if (!profile?.is_admin) {
      return json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users using service role
    const { count: totalUsers } = await db.supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active subscriptions using service role
    const { count: activeSubscriptions } = await db.supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get monthly revenue (approximate) using service role
    const { data: revenueData } = await db.supabaseAdmin
      .from('subscriptions')
      .select('unit_price')
      .eq('status', 'active')
      .eq('billing_cycle', 'monthly')

    const monthlyRevenue = revenueData?.reduce((sum, sub) => sum + (sub.unit_price || 0), 0) || 0

    // Get failed payments count (last 30 days) using service role
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: failedPayments } = await db.supabaseAdmin
      .from('payment_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', thirtyDaysAgo.toISOString())

    return json({
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
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
