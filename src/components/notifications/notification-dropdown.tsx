'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { useRealtimeNotificationsWithToast } from '@/hooks/useRealtimeNotificationsWithToast'

interface Notification {
  id: string
  user_id: string
  channel: string
  type: string
  status: string
  payload: any
  sent_at: string | null
  delivered_at: string | null
  failed_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  read: boolean
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  
  const { user } = useRealtimeNotificationsWithToast()
  const supabase = createClient()

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setMarkingAsRead(null)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      setMarkingAllAsRead(true)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  // Get notification display info
  const getNotificationDisplayInfo = (notification: Notification) => {
    const { type, payload } = notification
    
    switch (type) {
      case 'booking_confirmed':
        return {
          title: 'Booking Confirmed! 🎉',
          description: `Your cleaning service is confirmed for ${payload?.service_date || 'the scheduled date'}.`,
          variant: 'success' as const
        }
      case 'booking_started':
        return {
          title: 'Service Started',
          description: `Your cleaning service has begun at ${payload?.service_time || 'the scheduled time'}.`,
          variant: 'default' as const
        }
      case 'booking_completed':
        return {
          title: 'Service Completed! ✅',
          description: `Your cleaning service has been completed successfully.`,
          variant: 'success' as const
        }
      case 'booking_cancelled':
        return {
          title: 'Booking Cancelled',
          description: `Your cleaning service has been cancelled.`,
          variant: 'destructive' as const
        }
      case 'cleaner_assigned':
        return {
          title: 'Cleaner Assigned',
          description: `A professional cleaner has been assigned to your booking.`,
          variant: 'default' as const
        }
      case 'new_booking_assigned':
        return {
          title: 'New Assignment! 📋',
          description: `You have been assigned to a new cleaning job.`,
          variant: 'default' as const
        }
      case 'payment_successful':
        return {
          title: 'Payment Successful! 💳',
          description: `Your payment of $${payload?.amount || '0'} has been processed successfully.`,
          variant: 'success' as const
        }
      case 'payment_failed':
        return {
          title: 'Payment Failed',
          description: `There was an issue processing your payment. Please try again.`,
          variant: 'destructive' as const
        }
      case 'payment_refunded':
        return {
          title: 'Payment Refunded',
          description: `Your payment has been refunded successfully.`,
          variant: 'warning' as const
        }
      default:
        return {
          title: 'New Notification',
          description: `You have a new ${type.replace('_', ' ')} notification.`,
          variant: 'default' as const
        }
    }
  }

  // Get variant color classes
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
      case 'destructive':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
    }
  }

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={markingAllAsRead}
              className="text-xs"
            >
              {markingAllAsRead ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const displayInfo = getNotificationDisplayInfo(notification)
                const variantClasses = getVariantClasses(displayInfo.variant)
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 ${variantClasses} ${
                      !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                    } hover:bg-opacity-100 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {displayInfo.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {displayInfo.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          disabled={markingAsRead === notification.id}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          {markingAsRead === notification.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

