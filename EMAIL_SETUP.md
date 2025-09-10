# Email Notification System Setup

This document provides instructions for setting up the email notification system for Shalean Cleaning Services.

## Overview

The email system uses Resend for sending transactional emails including:
- Booking confirmations
- Payment confirmations
- Booking reminders (24 hours before service)
- Status updates (when cleaner updates booking status)

## Setup Instructions

### 1. Resend Account Setup

1. Sign up for a Resend account at [resend.com](https://resend.com)
2. Verify your domain (e.g., `shalean-cleaning.com`)
3. Get your API key from the Resend dashboard
4. Configure SPF and DKIM records for your domain

### 2. Environment Configuration

Update your `.env.local` file with the following variables:

```bash
# Email Service Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@shalean-cleaning.com
```

### 3. Domain Verification

To send emails from your domain, you need to:

1. **Add SPF Record**: Add this TXT record to your domain's DNS:
   ```
   v=spf1 include:_spf.resend.com ~all
   ```

2. **Add DKIM Record**: Resend will provide DKIM records to add to your domain's DNS

3. **Verify Domain**: In the Resend dashboard, add your domain and verify it

### 4. Testing

Use the test page at `/test-email` to test email functionality:

1. Navigate to `http://localhost:3000/test-email`
2. Enter a test email address
3. Test different email types:
   - Booking confirmation
   - Booking reminder
   - Status update
   - Reminder cron job

### 5. Scheduled Reminders

To set up automated reminder emails, you can:

1. **Use Vercel Cron Jobs** (recommended for Vercel deployment):
   ```javascript
   // vercel.json
   {
     "crons": [
       {
         "path": "/api/email/reminders",
         "schedule": "0 9 * * *"
       }
     ]
   }
   ```

2. **Use external cron service** like cron-job.org:
   - URL: `https://your-domain.com/api/email/reminders`
   - Method: POST
   - Headers: `Authorization: Bearer your-secret-token`
   - Schedule: Daily at 9 AM

3. **Use GitHub Actions** (for development):
   ```yaml
   name: Send Reminder Emails
   on:
     schedule:
       - cron: '0 9 * * *'
   jobs:
     send-reminders:
       runs-on: ubuntu-latest
       steps:
         - name: Send reminders
           run: |
             curl -X POST https://your-domain.com/api/email/reminders \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
   ```

## Email Templates

The system includes three main email templates:

### 1. Booking Confirmation
- Sent when a booking is created
- Includes booking details, service information, and payment status
- Professional design with company branding

### 2. Booking Reminder
- Sent 24 hours before scheduled service
- Includes service details and what to expect
- Shows assigned cleaner if available

### 3. Status Update
- Sent when booking status changes
- Includes current status and relevant message
- Shows cleaner information when applicable

## API Endpoints

### Send Email
```
POST /api/email/send
Content-Type: application/json

{
  "type": "confirmation|reminder|status_update",
  "bookingId": "string",
  "customerEmail": "string"
}
```

### Send Reminder Emails (Cron)
```
POST /api/email/reminders
Authorization: Bearer your-secret-token
```

### Send Status Update
```
POST /api/email/status-update
Content-Type: application/json

{
  "bookingId": "string",
  "status": "string",
  "statusMessage": "string",
  "cleanerName": "string" (optional)
}
```

## Monitoring and Logging

All email sends are logged to the `notifications` table in Supabase with:
- User ID
- Channel (email)
- Type (booking_confirmation, booking_reminder, booking_status_update)
- Status (sent, failed)
- Timestamp
- Payload with email details

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check RESEND_API_KEY is correct
   - Verify domain is verified in Resend
   - Check SPF/DKIM records

2. **Emails going to spam**:
   - Ensure SPF and DKIM records are correct
   - Use a professional from address
   - Avoid spam trigger words

3. **Template rendering issues**:
   - Check HTML template syntax
   - Verify data being passed to templates
   - Test with different email clients

### Debug Mode

Set `NODE_ENV=development` to see detailed email logs in the console.

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Rate Limiting**: Resend has rate limits, monitor usage
3. **Input Validation**: All email inputs are validated before sending
4. **Authentication**: Status update emails require proper user permissions

## Cost Considerations

Resend pricing:
- Free tier: 3,000 emails/month
- Pro tier: $20/month for 50,000 emails
- Additional emails: $0.40 per 1,000 emails

Monitor your usage in the Resend dashboard to avoid unexpected charges.
