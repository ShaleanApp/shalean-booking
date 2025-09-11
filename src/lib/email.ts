import { Resend } from 'resend';

// Get from email from environment or use default
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Shalean Cleaning Services <onboarding@resend.dev>';

// Lazy-initialize Resend client
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Email sending will be skipped.');
    return null;
  }
  return new Resend(apiKey);
}

// Email templates
export interface BookingConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalAmount: number;
  paymentStatus: string;
}

export interface BookingReminderEmailData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  cleanerName?: string;
}

export interface BookingStatusUpdateEmailData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  status: string;
  statusMessage: string;
  cleanerName?: string;
}

// Email sending functions
export async function sendBookingConfirmation(data: BookingConfirmationEmailData) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log('Email sending skipped: RESEND_API_KEY not configured');
      return { 
        success: true, 
        skipped: true,
        messageId: null,
        emailData: {
          to: data.customerEmail,
          subject: `Booking Confirmation - ${data.bookingId}`,
          sentAt: new Date().toISOString()
        }
      };
    }

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.customerEmail],
      subject: `Booking Confirmation - ${data.bookingId}`,
      html: generateBookingConfirmationHTML(data),
    });

    if (error) {
      console.error('Error sending booking confirmation email:', error);
      throw new Error(`Failed to send booking confirmation: ${error.message}`);
    }

    console.log('Booking confirmation email sent successfully:', emailData);
    return { 
      success: true, 
      messageId: emailData?.id,
      emailData: {
        to: data.customerEmail,
        subject: `Booking Confirmation - ${data.bookingId}`,
        sentAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in sendBookingConfirmation:', error);
    throw error;
  }
}

export async function sendBookingReminder(data: BookingReminderEmailData) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log('Email sending skipped: RESEND_API_KEY not configured');
      return { 
        success: true, 
        skipped: true,
        messageId: null,
        emailData: {
          to: data.customerEmail,
          subject: `Reminder: Your cleaning service is scheduled for ${data.scheduledDate}`,
          sentAt: new Date().toISOString()
        }
      };
    }

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.customerEmail],
      subject: `Reminder: Your cleaning service is scheduled for ${data.scheduledDate}`,
      html: generateBookingReminderHTML(data),
    });

    if (error) {
      console.error('Error sending booking reminder email:', error);
      throw new Error(`Failed to send booking reminder: ${error.message}`);
    }

    console.log('Booking reminder email sent successfully:', emailData);
    return { 
      success: true, 
      messageId: emailData?.id,
      emailData: {
        to: data.customerEmail,
        subject: `Reminder: Your cleaning service is scheduled for ${data.scheduledDate}`,
        sentAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in sendBookingReminder:', error);
    throw error;
  }
}

export async function sendBookingStatusUpdate(data: BookingStatusUpdateEmailData) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log('Email sending skipped: RESEND_API_KEY not configured');
      return { 
        success: true, 
        skipped: true,
        messageId: null,
        emailData: {
          to: data.customerEmail,
          subject: `Booking Update - ${data.bookingId}`,
          sentAt: new Date().toISOString()
        }
      };
    }

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.customerEmail],
      subject: `Booking Update - ${data.bookingId}`,
      html: generateBookingStatusUpdateHTML(data),
    });

    if (error) {
      console.error('Error sending booking status update email:', error);
      throw new Error(`Failed to send booking status update: ${error.message}`);
    }

    console.log('Booking status update email sent successfully:', emailData);
    return { 
      success: true, 
      messageId: emailData?.id,
      emailData: {
        to: data.customerEmail,
        subject: `Booking Update - ${data.bookingId}`,
        sentAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in sendBookingStatusUpdate:', error);
    throw error;
  }
}

// HTML template generators
function generateBookingConfirmationHTML(data: BookingConfirmationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Shalean Cleaning Services</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1E88E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .total { background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .total-amount { font-size: 24px; font-weight: bold; color: #1E88E5; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shalean Cleaning Services</h1>
          <h2>Booking Confirmed!</h2>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          
          <p>Thank you for choosing Shalean Cleaning Services! Your booking has been confirmed and we're excited to provide you with exceptional cleaning service.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.scheduledDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.scheduledTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.address}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value">${data.paymentStatus}</span>
            </div>
          </div>
          
          <div class="total">
            <div>Total Amount</div>
            <div class="total-amount">₦${data.totalAmount.toLocaleString()}</div>
          </div>
          
          <p>We'll send you a reminder 24 hours before your scheduled service. If you need to make any changes or have questions, please contact us.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View My Bookings</a>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Shalean Cleaning Services!</p>
          <p>For support, contact us at support@shalean-cleaning.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBookingReminderHTML(data: BookingReminderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Reminder - Shalean Cleaning Services</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #AEEA00; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .reminder-box { background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #AEEA00; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shalean Cleaning Services</h1>
          <h2>Service Reminder</h2>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          
          <div class="reminder-box">
            <h3>🔔 Reminder</h3>
            <p>Your cleaning service is scheduled for tomorrow! We're looking forward to providing you with exceptional service.</p>
          </div>
          
          <div class="booking-details">
            <h3>Service Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.scheduledDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.scheduledTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.address}</span>
            </div>
            ${data.cleanerName ? `
            <div class="detail-row">
              <span class="detail-label">Assigned Cleaner:</span>
              <span class="detail-value">${data.cleanerName}</span>
            </div>
            ` : ''}
          </div>
          
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Our cleaner will arrive at the scheduled time</li>
            <li>Please ensure access to your property</li>
            <li>We'll send you a notification when our cleaner is on the way</li>
            <li>You'll receive another notification when the service is completed</li>
          </ul>
          
          <p>If you need to make any changes or have questions, please contact us as soon as possible.</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Shalean Cleaning Services!</p>
          <p>For support, contact us at support@shalean-cleaning.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBookingStatusUpdateHTML(data: BookingStatusUpdateEmailData): string {
  const statusColors = {
    'confirmed': '#1E88E5',
    'in_progress': '#AEEA00',
    'on_my_way': '#FF9800',
    'arrived': '#4CAF50',
    'completed': '#4CAF50',
    'cancelled': '#F44336'
  };

  const statusColor = statusColors[data.status as keyof typeof statusColors] || '#666';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Update - Shalean Cleaning Services</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .status-update { background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shalean Cleaning Services</h1>
          <h2>Booking Status Update</h2>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          
          <div class="status-update">
            <h3>📋 Status Update</h3>
            <p><strong>New Status:</strong> ${data.status.replace('_', ' ').toUpperCase()}</p>
            <p>${data.statusMessage}</p>
          </div>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.scheduledDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.scheduledTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.address}</span>
            </div>
            ${data.cleanerName ? `
            <div class="detail-row">
              <span class="detail-label">Assigned Cleaner:</span>
              <span class="detail-value">${data.cleanerName}</span>
            </div>
            ` : ''}
          </div>
          
          <p>Thank you for choosing Shalean Cleaning Services. We appreciate your business!</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Shalean Cleaning Services!</p>
          <p>For support, contact us at support@shalean-cleaning.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

// Utility function to format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Utility function to format time
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Email delivery tracking functions
export async function trackEmailDelivery(
  userId: string,
  type: string,
  status: 'sent' | 'delivered' | 'failed',
  payload: any,
  messageId?: string,
  errorMessage?: string
) {
  try {
    const { createSupabaseServer } = await import('@/lib/supabase/server');
    const supabase = await createSupabaseServer();
    
    const notificationData = {
      user_id: userId,
      channel: 'email',
      type,
      status,
      payload: {
        ...payload,
        messageId,
        trackedAt: new Date().toISOString()
      },
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      failed_at: status === 'failed' ? new Date().toISOString() : null,
      error_message: errorMessage || null,
    };

    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);

    if (error) {
      console.error('Error tracking email delivery:', error);
    } else {
      console.log(`Email delivery tracked: ${type} - ${status}`);
    }
  } catch (error) {
    console.error('Error in trackEmailDelivery:', error);
  }
}

// Enhanced email sending with tracking
export async function sendBookingConfirmationWithTracking(data: BookingConfirmationEmailData, userId: string) {
  try {
    const result = await sendBookingConfirmation(data);
    
    // Only track if email was actually sent (not skipped)
    if (!result.skipped) {
      // Track successful send
      await trackEmailDelivery(
        userId,
        'booking_confirmation',
        'sent',
        {
          bookingId: data.bookingId,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          serviceName: data.serviceName,
          scheduledDate: data.scheduledDate,
          totalAmount: data.totalAmount
        },
        result.messageId || undefined
      );
    }
    
    return result;
  } catch (error) {
    // Track failed send
    await trackEmailDelivery(
      userId,
      'booking_confirmation',
      'failed',
      {
        bookingId: data.bookingId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        serviceName: data.serviceName,
        scheduledDate: data.scheduledDate,
        totalAmount: data.totalAmount
      },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    throw error;
  }
}

export async function sendBookingReminderWithTracking(data: BookingReminderEmailData, userId: string) {
  try {
    const result = await sendBookingReminder(data);
    
    // Only track if email was actually sent (not skipped)
    if (!result.skipped) {
      // Track successful send
      await trackEmailDelivery(
        userId,
        'booking_reminder',
        'sent',
        {
          bookingId: data.bookingId,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          serviceName: data.serviceName,
          scheduledDate: data.scheduledDate,
          cleanerName: data.cleanerName
        },
        result.messageId || undefined
      );
    }
    
    return result;
  } catch (error) {
    // Track failed send
    await trackEmailDelivery(
      userId,
      'booking_reminder',
      'failed',
      {
        bookingId: data.bookingId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        serviceName: data.serviceName,
        scheduledDate: data.scheduledDate,
        cleanerName: data.cleanerName
      },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    throw error;
  }
}

export async function sendBookingStatusUpdateWithTracking(data: BookingStatusUpdateEmailData, userId: string) {
  try {
    const result = await sendBookingStatusUpdate(data);
    
    // Only track if email was actually sent (not skipped)
    if (!result.skipped) {
      // Track successful send
      await trackEmailDelivery(
        userId,
        'booking_status_update',
        'sent',
        {
          bookingId: data.bookingId,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          serviceName: data.serviceName,
          scheduledDate: data.scheduledDate,
          status: data.status,
          statusMessage: data.statusMessage,
          cleanerName: data.cleanerName
        },
        result.messageId || undefined
      );
    }
    
    return result;
  } catch (error) {
    // Track failed send
    await trackEmailDelivery(
      userId,
      'booking_status_update',
      'failed',
      {
        bookingId: data.bookingId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        serviceName: data.serviceName,
        scheduledDate: data.scheduledDate,
        status: data.status,
        statusMessage: data.statusMessage,
        cleanerName: data.cleanerName
      },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    throw error;
  }
}
