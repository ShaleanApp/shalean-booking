import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Get the booking to verify ownership and status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    // Check if booking can be cancelled
    const serviceDate = new Date(`${booking.service_date}T${booking.service_time}`)
    const now = new Date()
    const hoursUntilService = (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (booking.status === 'cancelled') {
      return NextResponse.json({ message: 'Booking is already cancelled' }, { status: 400 })
    }

    if (booking.status === 'completed') {
      return NextResponse.json({ message: 'Cannot cancel completed booking' }, { status: 400 })
    }

    if (booking.status === 'in_progress') {
      return NextResponse.json({ message: 'Cannot cancel booking in progress' }, { status: 400 })
    }

    if (hoursUntilService < 24) {
      return NextResponse.json({ 
        message: 'Cannot cancel booking less than 24 hours before service' 
      }, { status: 400 })
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error cancelling booking:', updateError)
      return NextResponse.json({ message: 'Failed to cancel booking' }, { status: 500 })
    }

    // Update payment status if exists
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (payment && payment.status === 'completed') {
      // In a real implementation, you would initiate a refund process here
      // For now, we'll just update the payment status
      await supabase
        .from('payments')
        .update({ 
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Booking cancelled successfully'
    })

  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
