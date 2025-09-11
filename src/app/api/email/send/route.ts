export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation, sendBookingReminder, sendBookingStatusUpdate } from '@/lib/email';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { type, bookingId, customerEmail } = await request.json();

    if (!type || !bookingId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: type, bookingId, customerEmail' },
        { status: 400 }
      );
    }

    // Get booking details from database
    const supabase = await createSupabaseServer();
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_customer_id_fkey(full_name, email),
        addresses!bookings_address_id_fkey(street, suburb, city, postal_code),
        booking_services(
          service_items(name, base_price),
          quantity
        ),
        booking_extras(
          extras(name, price),
          quantity
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Format booking data for email
    const scheduledDate = new Date(booking.scheduled_at);
    const address = `${booking.addresses.street}, ${booking.addresses.suburb}, ${booking.addresses.city} ${booking.addresses.postal_code}`;
    
    // Calculate total amount
    let totalAmount = 0;
    booking.booking_services.forEach((item: any) => {
      totalAmount += item.service_items.base_price * item.quantity;
    });
    booking.booking_extras.forEach((extra: any) => {
      totalAmount += extra.extras.price * extra.quantity;
    });

    const emailData = {
      customerName: booking.profiles.full_name,
      customerEmail: booking.profiles.email,
      bookingId: booking.id,
      serviceName: booking.booking_services[0]?.service_items.name || 'Cleaning Service',
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
      address,
      totalAmount,
      paymentStatus: booking.payment_status || 'pending',
    };

    let result;

    switch (type) {
      case 'confirmation':
        result = await sendBookingConfirmation(emailData);
        break;
      
      case 'reminder':
        result = await sendBookingReminder(emailData);
        break;
      
      case 'status_update':
        const { status, statusMessage, cleanerName } = await request.json();
        result = await sendBookingStatusUpdate({
          ...emailData,
          status: status || booking.status,
          statusMessage: statusMessage || `Your booking status has been updated to ${booking.status}`,
          cleanerName,
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Must be: confirmation, reminder, or status_update' },
          { status: 400 }
        );
    }

    // Log email sent to notifications table
    await supabase
      .from('notifications')
      .insert({
        user_id: booking.customer_id,
        channel: 'email',
        type: `booking_${type}`,
        payload: {
          booking_id: bookingId,
          email_type: type,
          message_id: result.messageId,
        },
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
