import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { db } from '../../../../lib/supabase'

export async function POST(request) {
  try {
    // Check authentication using server-side client
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
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
    const { data: progressResult, error: progressError } = await db.supabaseAdmin
      .from('onboarding_progress')
      .insert(progressData)
      .select()

    if (progressError) {
      console.error('Error inserting progress:', progressError)
      throw new Error(`Failed to insert progress: ${progressError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved',
      data: progressResult
    })
  } catch (error) {
    console.error('Error saving onboarding progress:', error)
    return NextResponse.json(
      { error: 'Failed to save progress', details: error.message },
      { status: 500 }
    )
  }
}
