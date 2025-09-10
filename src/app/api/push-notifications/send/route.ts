import { createAdminClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@shaleancleaning.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json()

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and notification' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'No push subscriptions found for user' },
        { status: 404 }
      )
    }

    // Prepare push notification payload
    const payload: PushNotificationPayload = {
      title: notification.title || 'Shalean Cleaning Services',
      body: notification.body || 'You have a new notification',
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      tag: notification.tag || 'shalean-notification',
      requireInteraction: notification.requireInteraction || true,
      data: notification.data || {},
      actions: notification.actions || [
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

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
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

// Test endpoint for sending push notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const test = searchParams.get('test') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const testNotification = {
      title: 'Test Push Notification',
      body: 'This is a test push notification from Shalean Cleaning Services',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'test-notification',
      requireInteraction: true,
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    }

    const response = await fetch(`${request.nextUrl.origin}/api/push-notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification: testNotification
      })
    })

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error testing push notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

