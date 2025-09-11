import { createSupabaseServer } from '@/lib/supabase/server';
import { sendBookingReminder, sendBookingStatusUpdate } from '@/lib/email';

// Function to send reminder emails for bookings scheduled for tomorrow
export async function sendReminderEmails() {
  try {
    const supabase = await createSupabaseServer();
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];
    
    // Get all confirmed bookings for tomorrow
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_customer_id_fkey(full_name, email),
        addresses!bookings_address_id_fkey(street, suburb, city, postal_code),
        booking_services(
          service_items(name, base_price),
          quantity
        ),
        booking_assignments(
          cleaners(
            profiles!cleaners_profile_id_fkey(full_name)
          )
        )
      `)
      .eq('status', 'confirmed')
      .eq('service_date', tomorrowDateString);

    if (error) {
      console.error('Error fetching bookings for reminders:', error);
      return;
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for reminder emails');
      return;
    }

    console.log(`Found ${bookings.length} bookings for reminder emails`);

    // Send reminder emails
    for (const booking of bookings) {
      try {
        if (booking.profiles?.email) {
          const scheduledDate = new Date(booking.service_date);
          const address = `${booking.addresses.street}, ${booking.addresses.suburb}, ${booking.addresses.city} ${booking.addresses.postal_code}`;
          const cleanerName = booking.booking_assignments?.[0]?.cleaners?.profiles?.full_name;

          await sendBookingReminder({
            customerName: booking.profiles.full_name || 'Customer',
            customerEmail: booking.profiles.email,
            bookingId: booking.id,
            serviceName: booking.booking_services[0]?.service_items.name || 'Cleaning Service',
            scheduledDate: scheduledDate.toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            scheduledTime: booking.service_time,
            address,
            cleanerName,
          });

          // Log the reminder sent
          await supabase
            .from('notifications')
            .insert({
              user_id: booking.customer_id,
              channel: 'email',
              type: 'booking_reminder',
              payload: {
                booking_id: booking.id,
                reminder_date: tomorrowDateString,
              },
              status: 'sent',
              sent_at: new Date().toISOString(),
            });

          console.log(`Reminder email sent for booking ${booking.id}`);
        }
      } catch (emailError) {
        console.error(`Error sending reminder email for booking ${booking.id}:`, emailError);
      }
    }

    console.log('Reminder email process completed');
  } catch (error) {
    console.error('Error in sendReminderEmails:', error);
  }
}

// Function to send status update emails when cleaner updates booking status
export async function sendStatusUpdateEmail(bookingId: string, status: string, statusMessage: string, cleanerName?: string) {
  try {
    const supabase = await createSupabaseServer();
    
    // Get booking details
    const { data: booking, error } = await supabase
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
      .single();

    if (error || !booking) {
      console.error('Error fetching booking for status update email:', error);
      return;
    }

    if (booking.profiles?.email) {
      const scheduledDate = new Date(booking.service_date);
      const address = `${booking.addresses.street}, ${booking.addresses.suburb}, ${booking.addresses.city} ${booking.addresses.postal_code}`;

      await sendBookingStatusUpdate({
        customerName: booking.profiles.full_name || 'Customer',
        customerEmail: booking.profiles.email,
        bookingId: booking.id,
        serviceName: booking.booking_services[0]?.service_items.name || 'Cleaning Service',
        scheduledDate: scheduledDate.toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        scheduledTime: booking.service_time,
        address,
        status,
        statusMessage,
        cleanerName,
      });

      // Log the status update sent
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.customer_id,
          channel: 'email',
          type: 'booking_status_update',
          payload: {
            booking_id: bookingId,
            status,
            status_message: statusMessage,
            cleaner_name: cleanerName,
          },
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

      console.log(`Status update email sent for booking ${bookingId}`);
    }
  } catch (error) {
    console.error('Error in sendStatusUpdateEmail:', error);
  }
}

// Function to get email delivery statistics
export async function getEmailStats() {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: stats, error } = await supabase
      .from('notifications')
      .select('type, status, sent_at')
      .eq('channel', 'email')
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (error) {
      console.error('Error fetching email stats:', error);
      return null;
    }

    const statsByType = stats.reduce((acc, notification) => {
      const type = notification.type;
      if (!acc[type]) {
        acc[type] = { sent: 0, failed: 0, total: 0 };
      }
      acc[type].total++;
      if (notification.status === 'sent') {
        acc[type].sent++;
      } else {
        acc[type].failed++;
      }
      return acc;
    }, {} as Record<string, { sent: number; failed: number; total: number }>);

    return statsByType;
  } catch (error) {
    console.error('Error in getEmailStats:', error);
    return null;
  }
}
