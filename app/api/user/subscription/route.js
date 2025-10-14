import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { db } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await db.getSubscription(session.user.id)

    return NextResponse.json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Failed to get subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}