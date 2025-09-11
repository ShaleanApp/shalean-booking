import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePaymentReference, nairaToKobo } from '@/lib/payment'
import { BookingFormData } from '@/types'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { formData, isGuest = false }: { formData: BookingFormData, isGuest?: boolean } = body

    // Validate required fields
    if (!formData.services || formData.services.length === 0) {
      return NextResponse.json({ message: 'No services selected' }, { status: 400 })
    }

    if (!formData.service_date || !formData.service_time) {
      return NextResponse.json({ message: 'Service date and time required' }, { status: 400 })
    }

    if (!formData.address_id && !formData.new_address) {
      return NextResponse.json({ message: 'Service address required' }, { status: 400 })
    }

    // Calculate total amount
    let totalAmount = 0
    const serviceItems = []
    const extraItems = []

    // Get service details and calculate totals
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
        service_item_id: serviceData.service_item_id,
        quantity: serviceData.quantity,
        unit_price: service.base_price,
        total_price: serviceTotal
      })
    }

    // Get extras details and calculate totals
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
        service_extra_id: extraData.service_extra_id,
        quantity: extraData.quantity,
        unit_price: extra.price,
        total_price: extraTotal
      })
    }

    // Handle address
    let addressId = formData.address_id
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
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        status: 'pending',
        service_date: formData.service_date,
        service_time: formData.service_time,
        duration_hours: 2, // Default duration, could be calculated from services
        total_price: totalAmount,
        notes: formData.notes,
        address_id: addressId
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({ message: 'Failed to create booking' }, { status: 500 })
    }

    // Create booking services
    const { error: servicesError } = await supabase
      .from('booking_services')
      .insert(
        serviceItems.map(item => ({
          booking_id: booking.id,
          ...item
        }))
      )

    if (servicesError) {
      console.error('Booking services creation error:', servicesError)
      return NextResponse.json({ message: 'Failed to create booking services' }, { status: 500 })
    }

    // Create booking extras
    if (extraItems.length > 0) {
      const { error: extrasError } = await supabase
        .from('booking_extras')
        .insert(
          extraItems.map(item => ({
            booking_id: booking.id,
            ...item
          }))
        )

      if (extrasError) {
        console.error('Booking extras creation error:', extrasError)
        return NextResponse.json({ message: 'Failed to create booking extras' }, { status: 500 })
      }
    }

    // Generate payment reference
    const paymentReference = generatePaymentReference()

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        amount: nairaToKobo(totalAmount),
        currency: 'NGN',
        status: 'pending',
        payment_method: 'card',
        transaction_id: paymentReference,
        paystack_reference: paymentReference
      })

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ message: 'Failed to create payment record' }, { status: 500 })
    }

    // Send booking confirmation email
    try {
      // Get customer profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single()

      // Get address for email
      const { data: address } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single()

      if (profile?.email) {
        const scheduledDate = new Date(`${formData.service_date}T${formData.service_time}`)
        const addressString = `${address?.address_line_1}, ${address?.city}, ${address?.state} ${address?.postal_code}`
        
        await sendBookingConfirmation({
          customerName: profile.full_name || 'Customer',
          customerEmail: profile.email,
          bookingId: booking.id,
          serviceName: serviceItems[0]?.service_item_id ? 'Cleaning Service' : 'Multiple Services',
          scheduledDate: scheduledDate.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          scheduledTime: scheduledDate.toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          address: addressString,
          totalAmount,
          paymentStatus: 'pending'
        })
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the booking creation if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        total_amount: totalAmount,
        payment_reference: paymentReference
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
