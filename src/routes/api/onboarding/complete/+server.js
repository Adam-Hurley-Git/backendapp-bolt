import { json } from '@sveltejs/kit'
import { db } from '$lib/server/supabase.js'

export async function POST({ locals }) {
  try {
    // Check authentication using server-side client
    const session = await locals.supabase.auth.getSession()

    if (!session?.data?.session) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.data.session.user.id

    // Mark onboarding as completed in profile
    const profileResult = await db.updateProfile(userId, {
      onboarding_completed: true
    })

    // Record completion in progress table
    const progressResult = await db.saveOnboardingProgress(
      userId,
      'complete',
      null,
      null
    )

    return json({
      success: true,
      message: 'Onboarding completed',
      data: {
        profile: profileResult,
        progress: progressResult
      }
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return json(
      { error: 'Failed to complete onboarding', details: error.message },
      { status: 500 }
    )
  }
}
