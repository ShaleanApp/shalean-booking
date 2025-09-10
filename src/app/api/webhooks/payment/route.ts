import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Webhook secret for verification (should be set in environment variables)
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { event, data } = payload

    // Handle different payment events
    switch (event) {
      case 'payment.completed':
        await handlePaymentCompleted(data)
        break
      case 'payment.failed':
        await handlePaymentFailed(data)
        break
      case 'payment.refunded':
        await handlePaymentRefunded(data)
        break
      case 'payment.chargeback':
        await handlePaymentChargeback(data)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) {
    return false
  }

  // Simple signature verification (in production, use proper HMAC verification)
  // This is a placeholder - implement proper signature verification based on your payment provider
  const expectedSignature = `sha256=${WEBHOOK_SECRET}`
  return signature === expectedSignature
}

async function handlePaymentCompleted(data: any) {
  const supabase = createClient()
  
  try {
    const { payment_id, amount, currency, reference } = data

    // Update payment status to completed
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        confirmed_at: new Date().toISOString(),
        paystack_reference: reference
      })
      .eq('id', payment_id)

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    // Update related booking status if needed
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', data.booking_id)

    if (bookingError) {
      console.error('Error updating booking status:', bookingError)
    }

    console.log(`Payment ${payment_id} completed successfully`)
  } catch (error) {
    console.error('Error handling payment completion:', error)
  }
}

async function handlePaymentFailed(data: any) {
  const supabase = createClient()
  
  try {
    const { payment_id, reason } = data

    // Update payment status to failed
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: reason
      })
      .eq('id', payment_id)

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    // Update related booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'pending' })
      .eq('id', data.booking_id)

    if (bookingError) {
      console.error('Error updating booking status:', bookingError)
    }

    console.log(`Payment ${payment_id} failed: ${reason}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentRefunded(data: any) {
  const supabase = createClient()
  
  try {
    const { payment_id, refund_amount, refund_reason } = data

    // Update payment status to refunded
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount: refund_amount,
        refund_reason: refund_reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', payment_id)

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    // Update related booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', data.booking_id)

    if (bookingError) {
      console.error('Error updating booking status:', bookingError)
    }

    console.log(`Payment ${payment_id} refunded: ${refund_amount}`)
  } catch (error) {
    console.error('Error handling payment refund:', error)
  }
}

async function handlePaymentChargeback(data: any) {
  const supabase = createClient()
  
  try {
    const { payment_id, chargeback_reason } = data

    // Update payment status to failed (chargeback)
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: `Chargeback: ${chargeback_reason}`,
        chargeback_at: new Date().toISOString()
      })
      .eq('id', payment_id)

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    // Update related booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', data.booking_id)

    if (bookingError) {
      console.error('Error updating booking status:', bookingError)
    }

    console.log(`Payment ${payment_id} chargeback: ${chargeback_reason}`)
  } catch (error) {
    console.error('Error handling payment chargeback:', error)
  }
}
