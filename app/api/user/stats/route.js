import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    // Check authentication
    const session = await auth.getCurrentSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user profile
    const profile = await db.getProfile(userId)

    // Get feature usage stats
    const { data: usageData } = await db.supabaseAdmin
      .from('feature_usage')
      .select('feature_name, action_type')
      .eq('user_id', userId)

    // Calculate stats
    const dayColoringCount = usageData?.filter(u => u.feature_name === 'dayColoring').length || 0
    const taskColoringCount = usageData?.filter(u => u.feature_name === 'taskColoring').length || 0
    const timeBlockingCount = usageData?.filter(u => u.feature_name === 'timeBlocking').length || 0

    // Estimate hours saved (rough calculation: 5 min per organized day)
    const totalInteractions = dayColoringCount + taskColoringCount + timeBlockingCount
    const hoursEstimated = Math.round((totalInteractions * 5) / 60 * 10) / 10 || 2

    return NextResponse.json({
      daysOrganized: dayColoringCount,
      tasksColored: taskColoringCount,
      timeBlocksCreated: timeBlockingCount,
      hoursEstimated,
      onboardingCompleted: profile?.onboarding_completed || false
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
