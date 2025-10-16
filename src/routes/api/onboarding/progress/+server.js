import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function POST({ request, locals }) {
  try {
    // Check authentication using server-side client
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.data.session.user.id
    const body = await request.json()
    const { step, painPoint, featuresViewed } = body

    // Create onboarding progress entry
    const progressData = {
      user_id: userId,
      step_completed: step,
      completed_at: new Date().toISOString()
    }

    // Add pain point if provided
    if (painPoint) {
      progressData.pain_point_selected = painPoint

      // Also update the profile with pain point
      await db.updateProfile(userId, {
        pain_point: painPoint
      })
    }

    // Add features viewed if provided
    if (featuresViewed) {
      progressData.features_used = featuresViewed
    }

    // Insert progress record
    const progressResult = await db.saveOnboardingProgress(
      userId,
      step,
      painPoint,
      featuresViewed
    )

    return json({
      success: true,
      message: 'Progress saved',
      data: progressResult
    })
  } catch (error) {
    console.error('Error saving onboarding progress:', error)
    return json(
      { error: 'Failed to save progress', details: error.message },
      { status: 500 }
    )
  }
}
