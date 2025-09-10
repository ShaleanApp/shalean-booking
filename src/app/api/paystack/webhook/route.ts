import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { sendBookingStatusUpdate } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY!
    
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY not configured')
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 })
    }

    // 1. Verify Webhook Signature
    const signature = req.headers.get('x-paystack-signature')
    if (!signature) {
      console.error('No Paystack signature found in headers')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await req.text()
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

    if (hash !== signature) {
      console.error('Paystack signature mismatch')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse Webhook Payload
    let event
    try {
      event = JSON.parse(rawBody)
    } catch (error) {
      console.error('Error parsing webhook body:', error)
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
    }

    const { event: eventType, data } = event
    const transactionReference = data.reference
    const paystackTransactionId = data.id

    console.log(`Received Paystack webhook: ${eventType} for reference: ${transactionReference}`)

    // 3. Initialize Supabase client
    const supabase = await createClient()

    // 4. Implement Idempotency
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('paystack_reference', paystackTransactionId)
      .single()

    if (existingPayment && existingPayment.status === 'completed') {
      console.warn(`Webhook for transaction ID ${paystackTransactionId} already processed successfully. Skipping.`)
      return NextResponse.json({ message: 'Webhook already processed' }, { status: 200 })
    }

    // 5. Handle Specific Events
    switch (eventType) {
      case 'charge.success':
        console.log(`Payment successful for reference: ${transactionReference}`)

        // Update payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .upsert(
            {
              reference: transactionReference,
              amount: data.amount, // in kobo
              currency: data.currency || 'NGN',
              status: 'completed',
              payment_method: 'card',
              transaction_id: data.id,
              paystack_reference: paystackTransactionId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'reference',
              ignoreDuplicates: false,
            }
          )

        if (paymentError) {
          console.error('Error updating payment status in Supabase:', paymentError)
          return NextResponse.json({ message: 'Database update failed' }, { status: 500 })
        }

        // Update booking status
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.metadata?.booking_id)

        if (bookingError) {
          console.error('Error updating booking status:', bookingError)
          // Don't return error here as payment is already recorded
        }

        // Send confirmation email
        try {
          const bookingId = data.metadata?.booking_id
          if (bookingId) {
            // Get booking details for email
            const { data: booking, error: bookingFetchError } = await supabase
              .from('bookings')
              .select(`
                *,
                profiles!bookings_customer_id_fkey(full_name, email),
                addresses!bookings_address_id_fkey(street, suburb, city, postal_code),
                booking_services(
                  service_items(name, base_price),
                  quantity
                )
              `)
              .eq('id', bookingId)
              .single()

            if (!bookingFetchError && booking?.profiles?.email) {
              const scheduledDate = new Date(booking.service_date)
              const address = `${booking.addresses.street}, ${booking.addresses.suburb}, ${booking.addresses.city} ${booking.addresses.postal_code}`
              
              await sendBookingStatusUpdate({
                customerName: booking.profiles.full_name || 'Customer',
                bookingId: booking.id,
                serviceName: booking.booking_services[0]?.service_items.name || 'Cleaning Service',
                scheduledDate: scheduledDate.toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
                scheduledTime: booking.service_time,
                address,
                status: 'confirmed',
                statusMessage: 'Your payment has been confirmed and your booking is now confirmed! We\'ll send you a reminder 24 hours before your scheduled service.'
              })
            }
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
          // Don't fail the webhook if email fails
        }

        console.log(`Payment ${transactionReference} successfully recorded and reconciled`)
        break

      case 'charge.failed':
        console.log(`Payment failed for reference: ${transactionReference}. Reason: ${data.gateway_response}`)
        
        const { error: failError } = await supabase
          .from('payments')
          .upsert(
            {
              reference: transactionReference,
              amount: data.amount,
              currency: data.currency || 'NGN',
              status: 'failed',
              payment_method: 'card',
              transaction_id: data.id,
              paystack_reference: paystackTransactionId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'reference',
              ignoreDuplicates: false,
            }
          )

        if (failError) {
          console.error('Error updating failed payment status in Supabase:', failError)
          return NextResponse.json({ message: 'Database update failed' }, { status: 500 })
        }
        break

      default:
        console.log(`Unhandled Paystack event type: ${eventType}`)
        break
    }

    return NextResponse.json({ message: 'Webhook received and processed' }, { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
