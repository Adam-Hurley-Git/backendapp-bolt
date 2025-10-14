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

    // Mark onboarding as completed in profile
    const profileResult = await db.updateProfile(userId, {
      onboarding_completed: true
    })

    // Record completion in progress table
    const { data: progressResult, error: progressError } = await db.supabaseAdmin
      .from('onboarding_progress')
      .insert({
        user_id: userId,
        step_completed: 'complete',
        completed_at: new Date().toISOString()
      })
      .select()

    if (progressError) {
      console.error('Error marking onboarding complete:', progressError)
      throw new Error(`Failed to mark complete: ${progressError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed',
      data: {
        profile: profileResult,
        progress: progressResult
      }
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding', details: error.message },
      { status: 500 }
    )
  }
}
