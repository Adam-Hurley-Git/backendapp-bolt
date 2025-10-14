import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { db } from '../../../../lib/supabase'
import { paddle } from '../../../../lib/paddle'

export async function POST(request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, planName, amount, currency, email, termsAccepted, privacyAccepted, marketingAccepted } = await request.json()

    if (!planId || !termsAccepted || !privacyAccepted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create payment attempt record
    const paymentAttempt = await db.createPaymentAttempt({
      user_id: session.user.id,
      email: email || session.user.email,
      plan_id: planId,
      amount: amount,
      currency: currency || 'USD',
      status: 'initiated'
    })

    // Generate Paddle checkout URL
    const checkoutUrl = paddle.generateCheckoutUrl(planId, session.user.email, {
      userId: session.user.id,
      paymentAttemptId: paymentAttempt.id,
      planName,
      termsAccepted,
      privacyAccepted,
      marketingAccepted
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentAttemptId: paymentAttempt.id,
        checkoutUrl
      }
    })
  } catch (error) {
    console.error('Failed to create payment attempt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}