import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingFormData } from '@/types'

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
    const body = await req.json()
    const { formData }: { formData: Partial<BookingFormData> } = body

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

    // Check if booking can be modified
    const serviceDate = new Date(`${booking.service_date}T${booking.service_time}`)
    const now = new Date()
    const hoursUntilService = (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (booking.status === 'cancelled') {
      return NextResponse.json({ message: 'Cannot modify cancelled booking' }, { status: 400 })
    }

    if (booking.status === 'completed') {
      return NextResponse.json({ message: 'Cannot modify completed booking' }, { status: 400 })
    }

    if (booking.status === 'in_progress') {
      return NextResponse.json({ message: 'Cannot modify booking in progress' }, { status: 400 })
    }

    if (hoursUntilService < 24) {
      return NextResponse.json({ 
        message: 'Cannot modify booking less than 24 hours before service' 
      }, { status: 400 })
    }

    let totalAmount = booking.total_price
    let addressId = booking.address_id

    // Handle service modifications
    if (formData.services) {
      // Delete existing booking services
      await supabase
        .from('booking_services')
        .delete()
        .eq('booking_id', bookingId)

      // Calculate new total and create new services
      totalAmount = 0
      const serviceItems = []

      for (const serviceData of formData.services) {
        const { data: service, error: serviceError } = await supabase
          .from('service_items')
          .select('*')
          .eq('id', serviceData.service_item_id)
          .single()

        if (serviceError || !service) {
          return NextResponse.json({ message: 'Invalid service selected' }, { status: 400 })
        }

        const serviceTotal = service.base_price * serviceData.quantity
        totalAmount += serviceTotal

        serviceItems.push({
          booking_id: bookingId,
          service_item_id: serviceData.service_item_id,
          quantity: serviceData.quantity,
          unit_price: service.base_price,
          total_price: serviceTotal
        })
      }

      // Insert new booking services
      if (serviceItems.length > 0) {
        const { error: servicesError } = await supabase
          .from('booking_services')
          .insert(serviceItems)

        if (servicesError) {
          console.error('Booking services update error:', servicesError)
          return NextResponse.json({ message: 'Failed to update services' }, { status: 500 })
        }
      }
    }

    // Handle extras modifications
    if (formData.extras) {
      // Delete existing booking extras
      await supabase
        .from('booking_extras')
        .delete()
        .eq('booking_id', bookingId)

      // Calculate extras total and create new extras
      const extraItems = []

      for (const extraData of formData.extras) {
        const { data: extra, error: extraError } = await supabase
          .from('service_extras')
          .select('*')
          .eq('id', extraData.service_extra_id)
          .single()

        if (extraError || !extra) {
          return NextResponse.json({ message: 'Invalid extra selected' }, { status: 400 })
        }

        const extraTotal = extra.price * extraData.quantity
        totalAmount += extraTotal

        extraItems.push({
          booking_id: bookingId,
          service_extra_id: extraData.service_extra_id,
          quantity: extraData.quantity,
          unit_price: extra.price,
          total_price: extraTotal
        })
      }

      // Insert new booking extras
      if (extraItems.length > 0) {
        const { error: extrasError } = await supabase
          .from('booking_extras')
          .insert(extraItems)

        if (extrasError) {
          console.error('Booking extras update error:', extrasError)
          return NextResponse.json({ message: 'Failed to update extras' }, { status: 500 })
        }
      }
    }

    // Handle address modifications
    if (formData.new_address) {
      // Create new address
      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          type: formData.new_address.type,
          name: formData.new_address.name,
          address_line_1: formData.new_address.address_line_1,
          address_line_2: formData.new_address.address_line_2,
          city: formData.new_address.city,
          state: formData.new_address.state,
          postal_code: formData.new_address.postal_code,
          country: formData.new_address.country,
          is_default: false
        })
        .select()
        .single()

      if (addressError || !newAddress) {
        return NextResponse.json({ message: 'Failed to create address' }, { status: 500 })
      }

      addressId = newAddress.id
    } else if (formData.address_id) {
      addressId = formData.address_id
    }

    // Update booking
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (formData.service_date) updateData.service_date = formData.service_date
    if (formData.service_time) updateData.service_time = formData.service_time
    if (formData.notes !== undefined) updateData.notes = formData.notes
    if (addressId) updateData.address_id = addressId
    if (totalAmount !== booking.total_price) updateData.total_price = totalAmount

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json({ message: 'Failed to update booking' }, { status: 500 })
    }

    // Update payment amount if it changed
    if (totalAmount !== booking.total_price) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .single()

      if (payment) {
        await supabase
          .from('payments')
          .update({ 
            amount: totalAmount * 100, // Convert to kobo
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Booking updated successfully',
      total_amount: totalAmount
    })

  } catch (error) {
    console.error('Booking modification error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
