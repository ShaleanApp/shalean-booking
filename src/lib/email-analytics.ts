import { createSupabaseServer } from '@/lib/supabase/server';

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  failureRate: number;
  byType: {
    [key: string]: {
      sent: number;
      delivered: number;
      failed: number;
      deliveryRate: number;
    };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    status: string;
    sentAt: string;
    customerEmail: string;
    bookingId?: string;
  }>;
}

export async function getEmailAnalytics(
  startDate?: Date,
  endDate?: Date,
  userId?: string
): Promise<EmailStats | null> {
  try {
    const supabase = await createSupabaseServer();
    
    // Set default date range to last 30 days if not provided
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || new Date();
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('channel', 'email')
      .gte('created_at', defaultStartDate.toISOString())
      .lte('created_at', defaultEndDate.toISOString());
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: notifications, error } = await query;
    
    if (error) {
      console.error('Error fetching email analytics:', error);
      return null;
    }
    
    if (!notifications || notifications.length === 0) {
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        failureRate: 0,
        byType: {},
        recentActivity: []
      };
    }
    
    // Calculate overall stats
    const totalSent = notifications.filter(n => n.status === 'sent').length;
    const totalDelivered = notifications.filter(n => n.status === 'delivered').length;
    const totalFailed = notifications.filter(n => n.status === 'failed').length;
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;
    
    // Calculate stats by type
    const byType: { [key: string]: any } = {};
    const types = [...new Set(notifications.map(n => n.type))];
    
    types.forEach(type => {
      const typeNotifications = notifications.filter(n => n.type === type);
      const typeSent = typeNotifications.filter(n => n.status === 'sent').length;
      const typeDelivered = typeNotifications.filter(n => n.status === 'delivered').length;
      const typeFailed = typeNotifications.filter(n => n.status === 'failed').length;
      const typeDeliveryRate = typeSent > 0 ? (typeDelivered / typeSent) * 100 : 0;
      
      byType[type] = {
        sent: typeSent,
        delivered: typeDelivered,
        failed: typeFailed,
        deliveryRate: typeDeliveryRate
      };
    });
    
    // Get recent activity (last 10 notifications)
    const recentActivity = notifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(n => ({
        id: n.id,
        type: n.type,
        status: n.status,
        sentAt: n.sent_at || n.created_at,
        customerEmail: n.payload?.customerEmail || 'Unknown',
        bookingId: n.payload?.bookingId
      }));
    
    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      byType,
      recentActivity
    };
  } catch (error) {
    console.error('Error in getEmailAnalytics:', error);
    return null;
  }
}

export async function getEmailDeliveryStatus(messageId: string): Promise<{
  status: 'sent' | 'delivered' | 'failed' | 'unknown';
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
} | null> {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .select('status, delivered_at, failed_at, error_message')
      .eq('payload->messageId', messageId)
      .single();
    
    if (error || !notification) {
      return { status: 'unknown' };
    }
    
    return {
      status: notification.status as 'sent' | 'delivered' | 'failed',
      deliveredAt: notification.delivered_at,
      failedAt: notification.failed_at,
      errorMessage: notification.error_message
    };
  } catch (error) {
    console.error('Error in getEmailDeliveryStatus:', error);
    return null;
  }
}

export async function retryFailedEmails(): Promise<{
  success: boolean;
  retried: number;
  errors: string[];
}> {
  try {
    const supabase = await createSupabaseServer();
    
    // Get failed emails from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: failedEmails, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('channel', 'email')
      .eq('status', 'failed')
      .gte('created_at', yesterday.toISOString());
    
    if (error || !failedEmails || failedEmails.length === 0) {
      return { success: true, retried: 0, errors: [] };
    }
    
    const errors: string[] = [];
    let retried = 0;
    
    // Retry each failed email
    for (const email of failedEmails) {
      try {
        // Import email functions dynamically to avoid circular dependencies
        const { sendBookingConfirmation, sendBookingReminder, sendBookingStatusUpdate } = await import('@/lib/email');
        
        let result;
        
        switch (email.type) {
          case 'booking_confirmation':
            result = await sendBookingConfirmation(email.payload);
            break;
          case 'booking_reminder':
            result = await sendBookingReminder(email.payload);
            break;
          case 'booking_status_update':
            result = await sendBookingStatusUpdate(email.payload);
            break;
          default:
            errors.push(`Unknown email type: ${email.type}`);
            continue;
        }
        
        // Update notification status to sent
        await supabase
          .from('notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', email.id);
        
        retried++;
      } catch (retryError) {
        errors.push(`Failed to retry email ${email.id}: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`);
      }
    }
    
    return { success: true, retried, errors };
  } catch (error) {
    console.error('Error in retryFailedEmails:', error);
    return { success: false, retried: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}
