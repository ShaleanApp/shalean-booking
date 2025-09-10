#!/usr/bin/env node

const { Resend } = require('resend');

// Get API key from environment or command line argument
const apiKey = process.env.RESEND_API_KEY || process.argv[2];

const resend = new Resend(apiKey);

// Test booking confirmation email template
async function testBookingConfirmation() {
  try {
    console.log('Testing booking confirmation email template...');

    const html = `
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
          <p>Dear John Doe,</p>
          
          <p>Thank you for choosing Shalean Cleaning Services! Your booking has been confirmed and we're excited to provide you with exceptional cleaning service.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">TEST-123</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">Standard House Cleaning</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">December 15, 2024</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">10:00 AM</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">123 Main Street, Lagos, Lagos 100001</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value">Confirmed</span>
            </div>
          </div>
          
          <div class="total">
            <div>Total Amount</div>
            <div class="total-amount">₦15,000</div>
          </div>
          
          <p>We'll send you a reminder 24 hours before your scheduled service. If you need to make any changes or have questions, please contact us.</p>
          
          <div style="text-align: center;">
            <a href="http://localhost:3000/dashboard" class="button">View My Bookings</a>
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

    const { data, error } = await resend.emails.send({
      from: 'Shalean Cleaning Services <onboarding@resend.dev>',
      to: ['info@shalean.com'],
      subject: 'Test: Booking Confirmation - TEST-123',
      html: html,
    });

    if (error) {
      console.error('❌ Error sending booking confirmation test email:', error);
    } else {
      console.log('✅ Booking confirmation email sent successfully!');
      console.log('Message ID:', data?.id);
    }
  } catch (error) {
    console.error('❌ Error in testBookingConfirmation:', error);
  }
}

// Test booking reminder email template
async function testBookingReminder() {
  try {
    console.log('Testing booking reminder email template...');

    const html = `
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
          <p>Dear John Doe,</p>
          
          <div class="reminder-box">
            <h3>🔔 Reminder</h3>
            <p>Your cleaning service is scheduled for tomorrow! We're looking forward to providing you with exceptional service.</p>
          </div>
          
          <div class="booking-details">
            <h3>Service Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">TEST-123</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">Standard House Cleaning</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">December 15, 2024</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">10:00 AM</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">123 Main Street, Lagos, Lagos 100001</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Assigned Cleaner:</span>
              <span class="detail-value">Sarah Johnson</span>
            </div>
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

    const { data, error } = await resend.emails.send({
      from: 'Shalean Cleaning Services <onboarding@resend.dev>',
      to: ['info@shalean.com'],
      subject: 'Test: Service Reminder - Tomorrow at 10:00 AM',
      html: html,
    });

    if (error) {
      console.error('❌ Error sending booking reminder test email:', error);
    } else {
      console.log('✅ Booking reminder email sent successfully!');
      console.log('Message ID:', data?.id);
    }
  } catch (error) {
    console.error('❌ Error in testBookingReminder:', error);
  }
}

async function runTests() {
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found');
    console.log('Usage: node scripts/test-email-templates.js your_api_key_here');
    return;
  }

  console.log('🧪 Testing Email Templates...\n');
  
  await testBookingConfirmation();
  console.log('');
  await testBookingReminder();
  
  console.log('\n✅ All email template tests completed!');
}

runTests();
