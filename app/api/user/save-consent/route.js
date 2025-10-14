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

    const {
      termsAccepted,
      privacyAccepted,
      refundPolicyAccepted,
      immediateAccessAccepted,
      recurringPaymentAccepted,
      consentTimestamp
    } = await request.json()

    // Validate required fields
    if (!termsAccepted || !privacyAccepted || !refundPolicyAccepted || !recurringPaymentAccepted) {
      return NextResponse.json(
        { error: 'Missing required consent fields' },
        { status: 400 }
      )
    }

    // Update user profile with consent data
    const { data, error } = await db.supabaseAdmin
      .from('profiles')
      .update({
        terms_consent_accepted: termsAccepted,
        terms_consent_timestamp: consentTimestamp,
        privacy_consent_accepted: privacyAccepted,
        privacy_consent_timestamp: consentTimestamp,
        refund_policy_consent_accepted: refundPolicyAccepted,
        refund_policy_consent_timestamp: consentTimestamp,
        immediate_access_consent_accepted: immediateAccessAccepted,
        immediate_access_consent_timestamp: immediateAccessAccepted ? consentTimestamp : null,
        recurring_payment_consent_accepted: recurringPaymentAccepted,
        recurring_payment_consent_timestamp: consentTimestamp,
        trial_started_at: consentTimestamp,
        updated_at: consentTimestamp
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error saving consent data:', error)
      throw new Error(`Failed to save consent: ${error.message}`)
    }

    console.log('Consent data saved successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Consent data saved successfully',
      data
    })
  } catch (error) {
    console.error('Failed to save consent:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
