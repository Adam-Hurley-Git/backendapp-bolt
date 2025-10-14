import { NextResponse } from 'next/server'
import { db } from '../../../../lib/supabase'
import { paddle } from '../../../../lib/paddle'
import { generateLicenseKey } from '../../../../utils/licenseGenerator'

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paddle-signature')

    // Verify webhook signature
    if (!paddle.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)

    // Log webhook event
    await db.createWebhookEvent({
      event_type: data.alert_name || data.event_type,
      paddle_event_id: data.alert_id || data.id,
      data: data
    })

    // Handle different webhook events
    switch (data.alert_name || data.event_type) {
      case 'subscription_created':
        await handleSubscriptionCreated(data)
        break

      case 'subscription_updated':
        await handleSubscriptionUpdated(data)
        break

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data)
        break

      case 'subscription_payment_succeeded':
        await handlePaymentSucceeded(data)
        break

      case 'subscription_payment_failed':
        await handlePaymentFailed(data)
        break

      case 'subscription_payment_refunded':
        await handlePaymentRefunded(data)
        break

      default:
        console.log(`Unhandled webhook event: ${data.alert_name || data.event_type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(data) {
  try {
    const { subscription_id, user_email, subscription_plan_id, status, next_bill_date, update_url, cancel_url, passthrough } = data

    // Parse passthrough data if available
    const metadata = passthrough ? JSON.parse(passthrough) : {}

    // Find user by email or create if doesn't exist
    let profile = await db.supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', user_email)
      .single()

    if (profile.error && profile.error.code === 'PGRST116') {
      // User doesn't exist, create one
      const { data: newUser, error: createError } = await db.supabaseAdmin.auth.admin.createUser({
        email: user_email,
        email_confirm: true
      })

      if (createError) {
        console.error('Failed to create user:', createError)
        return
      }

      profile = { data: newUser.user }
    }

    if (profile.error) {
      console.error('Failed to find/create user:', profile.error)
      return
    }

    // Generate license key
    const licenseKey = generateLicenseKey()

    // Create subscription record
    await db.createSubscription({
      user_id: profile.data.id,
      paddle_subscription_id: subscription_id,
      status: status === 'active' ? 'active' : 'pending',
      plan_id: subscription_plan_id,
      plan_name: metadata.planName || 'Unknown Plan',
      billing_cycle: metadata.billingCycle || 'monthly',
      unit_price: data.unit_price || 0,
      currency: data.currency || 'USD',
      quantity: data.quantity || 1,
      next_billed_at: next_bill_date ? new Date(next_bill_date).toISOString() : null,
      license_key: licenseKey,
      paddle_data: data
    })

    console.log(`Subscription created for user ${user_email}: ${subscription_id}`)
  } catch (error) {
    console.error('Failed to handle subscription created:', error)
  }
}

async function handleSubscriptionUpdated(data) {
  try {
    const { subscription_id, status, next_bill_date, cancelled_at } = data

    const subscription = await db.getSubscriptionByPaddleId(subscription_id)
    if (!subscription) {
      console.error(`Subscription not found: ${subscription_id}`)
      return
    }

    // Update subscription
    await db.updateSubscription(subscription.id, {
      status: status,
      next_billed_at: next_bill_date ? new Date(next_bill_date).toISOString() : null,
      canceled_at: cancelled_at ? new Date(cancelled_at).toISOString() : null,
      paddle_data: data
    })

    console.log(`Subscription updated: ${subscription_id}`)
  } catch (error) {
    console.error('Failed to handle subscription updated:', error)
  }
}

async function handleSubscriptionCancelled(data) {
  try {
    const { subscription_id, cancellation_effective_date } = data

    const subscription = await db.getSubscriptionByPaddleId(subscription_id)
    if (!subscription) {
      console.error(`Subscription not found: ${subscription_id}`)
      return
    }

    // Update subscription status
    await db.updateSubscription(subscription.id, {
      status: 'canceled',
      canceled_at: cancellation_effective_date
        ? new Date(cancellation_effective_date).toISOString()
        : new Date().toISOString(),
      paddle_data: data
    })

    console.log(`Subscription cancelled: ${subscription_id}`)
  } catch (error) {
    console.error('Failed to handle subscription cancelled:', error)
  }
}

async function handlePaymentSucceeded(data) {
  try {
    const { subscription_id, next_bill_date, amount, currency, receipt_url } = data

    const subscription = await db.getSubscriptionByPaddleId(subscription_id)
    if (!subscription) {
      console.error(`Subscription not found: ${subscription_id}`)
      return
    }

    // Update subscription with payment info
    await db.updateSubscription(subscription.id, {
      status: 'active',
      last_payment_at: new Date().toISOString(),
      next_billed_at: next_bill_date ? new Date(next_bill_date).toISOString() : null,
      paddle_data: { ...subscription.paddle_data, last_payment: data }
    })

    // Update any pending payment attempts
    const { data: attempts } = await db.supabaseAdmin
      .from('payment_attempts')
      .select('*')
      .eq('user_id', subscription.user_id)
      .eq('status', 'initiated')
      .order('created_at', { ascending: false })
      .limit(1)

    if (attempts && attempts.length > 0) {
      await db.updatePaymentAttempt(attempts[0].id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      })
    }

    console.log(`Payment succeeded for subscription: ${subscription_id}`)
  } catch (error) {
    console.error('Failed to handle payment succeeded:', error)
  }
}

async function handlePaymentFailed(data) {
  try {
    const { subscription_id, amount, currency, next_retry_date } = data

    const subscription = await db.getSubscriptionByPaddleId(subscription_id)
    if (!subscription) {
      console.error(`Subscription not found: ${subscription_id}`)
      return
    }

    // Update subscription status
    await db.updateSubscription(subscription.id, {
      status: 'past_due',
      paddle_data: { ...subscription.paddle_data, payment_failure: data }
    })

    // Update payment attempts
    const { data: attempts } = await db.supabaseAdmin
      .from('payment_attempts')
      .select('*')
      .eq('user_id', subscription.user_id)
      .eq('status', 'initiated')
      .order('created_at', { ascending: false })
      .limit(1)

    if (attempts && attempts.length > 0) {
      await db.updatePaymentAttempt(attempts[0].id, {
        status: 'failed',
        error_message: data.next_retry_date ? 'Payment failed, will retry' : 'Payment failed',
        completed_at: new Date().toISOString()
      })
    }

    console.log(`Payment failed for subscription: ${subscription_id}`)
  } catch (error) {
    console.error('Failed to handle payment failed:', error)
  }
}

async function handlePaymentRefunded(data) {
  try {
    const { subscription_id, amount, currency, refund_reason } = data

    const subscription = await db.getSubscriptionByPaddleId(subscription_id)
    if (!subscription) {
      console.error(`Subscription not found: ${subscription_id}`)
      return
    }

    // Update subscription with refund info
    await db.updateSubscription(subscription.id, {
      paddle_data: { ...subscription.paddle_data, refund: data }
    })

    console.log(`Payment refunded for subscription: ${subscription_id}`)
  } catch (error) {
    console.error('Failed to handle payment refunded:', error)
  }
}