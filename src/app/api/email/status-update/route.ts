export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { sendStatusUpdateEmail } from '@/lib/email-scheduler';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, status, statusMessage, cleanerName } = await request.json();

    if (!bookingId || !status || !statusMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, status, statusMessage' },
        { status: 400 }
      );
    }

    // Verify the user has permission to update this booking
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or assigned cleaner for this booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_assignments(
          cleaner_id,
          cleaners(
            profile_id,
            profiles!cleaners_profile_id_fkey(user_id)
          )
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is admin or assigned cleaner
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isAssignedCleaner = booking.booking_assignments?.some(
      (assignment: any) => assignment.cleaners?.profiles?.user_id === user.id
    );

    if (!isAdmin && !isAssignedCleaner) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await sendStatusUpdateEmail(bookingId, status, statusMessage, cleanerName);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status update email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending status update email:', error);
    return NextResponse.json(
      { error: 'Failed to send status update email' },
      { status: 500 }
    );
  }
}
