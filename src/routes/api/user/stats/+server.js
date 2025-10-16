import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function GET({ locals }) {
  try {
    // Check authentication
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.data.session.user.id

    // Get user profile
    const profile = await db.getProfile(userId)

    // Get feature usage stats
    const usageData = await db.getFeatureUsageStats(userId)

    // Calculate stats
    const dayColoringCount = usageData?.filter(u => u.feature_name === 'dayColoring').length || 0
    const taskColoringCount = usageData?.filter(u => u.feature_name === 'taskColoring').length || 0
    const timeBlockingCount = usageData?.filter(u => u.feature_name === 'timeBlocking').length || 0

    // Estimate hours saved (rough calculation: 5 min per organized day)
    const totalInteractions = dayColoringCount + taskColoringCount + timeBlockingCount
    const hoursEstimated = Math.round((totalInteractions * 5) / 60 * 10) / 10 || 2

    return json({
      daysOrganized: dayColoringCount,
      tasksColored: taskColoringCount,
      timeBlocksCreated: timeBlockingCount,
      hoursEstimated,
      onboardingCompleted: profile?.onboarding_completed || false
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
