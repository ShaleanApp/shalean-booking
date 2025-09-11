import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Dynamic import for web-push to avoid server-side bundling issues
let webpush: any = null;

async function getWebPush() {
  if (!webpush) {
    const webPushModule = await import('web-push');
    webpush = webPushModule.default;
    
    // Configure web-push
    webpush.setVapidDetails(
      'mailto:admin@shaleancleaning.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  }
  return webpush;
}

// Critical notification types that should trigger push notifications
const CRITICAL_NOTIFICATION_TYPES = [
  'booking_confirmed',
  'booking_cancelled',
  'cleaner_assigned',
  'new_booking_assigned',
  'payment_successful',
  'payment_failed'
]

export async function POST(request: NextRequest) {
  try {
    const { userId, notificationType, payload } = await request.json()

    if (!userId || !notificationType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and notificationType' },
        { status: 400 }
      )
    }

    // Check if this is a critical notification type
    if (!CRITICAL_NOTIFICATION_TYPES.includes(notificationType)) {
      return NextResponse.json({
        success: true,
        message: 'Non-critical notification, skipping push notification'
      })
    }

    const supabase = createAdminClient()

    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('Error fetching push subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch push subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No push subscriptions found for user'
      })
    }

    // Prepare push notification payload based on notification type
    let pushPayload = {
      title: 'Shalean Cleaning Services',
      body: 'You have a new notification',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'shalean-notification',
      requireInteraction: true,
      data: {
        type: notificationType,
        payload: payload || {},
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }

    // Customize message based on notification type
    switch (notificationType) {
      case 'booking_confirmed':
        pushPayload.title = 'Booking Confirmed! 🎉'
        pushPayload.body = `Your cleaning service is confirmed for ${payload?.service_date || 'the scheduled date'}.`
        break
      case 'booking_cancelled':
        pushPayload.title = 'Booking Cancelled'
        pushPayload.body = `Your cleaning service has been cancelled.`
        break
      case 'cleaner_assigned':
        pushPayload.title = 'Cleaner Assigned'
        pushPayload.body = `A professional cleaner has been assigned to your booking.`
        break
      case 'new_booking_assigned':
        pushPayload.title = 'New Assignment! 📋'
        pushPayload.body = `You have been assigned to a new cleaning job.`
        break
      case 'payment_successful':
        pushPayload.title = 'Payment Successful! 💳'
        pushPayload.body = `Your payment of $${payload?.amount || '0'} has been processed successfully.`
        break
      case 'payment_failed':
        pushPayload.title = 'Payment Failed'
        pushPayload.body = `There was an issue processing your payment. Please try again.`
        break
    }

    // Get web-push instance
    const webpushInstance = await getWebPush();

    // Send push notifications to all user's devices
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key
            }
          }

          await webpushInstance.sendNotification(
            pushSubscription,
            JSON.stringify(pushPayload)
          )

          return { success: true, subscriptionId: subscription.id }
        } catch (error) {
          console.error('Error sending push notification:', error)
          return { success: false, subscriptionId: subscription.id, error }
        }
      })
    )

    // Count successful and failed sends
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length

    return NextResponse.json({
      success: true,
      message: `Push notifications sent to ${successful} devices`,
      results: {
        total: subscriptions.length,
        successful,
        failed
      }
    })

  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
